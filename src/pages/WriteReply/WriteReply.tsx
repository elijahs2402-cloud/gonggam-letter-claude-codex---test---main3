// 답장 쓰기 (/write-reply/:id) — 입력 폼 · 원문 보기 시트 포함
// 2026-09-18 src/pages/Letter/LetterFlowScreens.tsx 에서 옮겼다(코드 그대로).
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  navigateBack,
  navigateTo,
  setPageTimeout,
} from "../../utils/navigation";
import {
  getCurrentUserId,
  getLetterById,
  saveLetter,
  transitionLetterStatus,
} from "../../data/letters";
import type { Letter } from "../../types/letters";
import {
  deleteReplyDraft,
  getReplyDraft,
  updateReplyDraft,
} from "../../data/letterDraft";
import { seedSampleLetters } from "../../data/sampleLetters";
import { useDraftAutosave } from "../../hooks/draftGuards";
import { getLetterReturn } from "../../data/letterReturns";
import { formatDateTime } from "../../utils/datetime";
import {
  RETURNED_LETTER_BODY,
  RETURNED_LETTER_TITLE,
} from "../../constants/copy";
import { getListenEntryPath } from "../../data/waitingLetters";
import { assetUrl } from "../../utils/basePath";
import { ROUTES, routeTo } from "../../routes/paths";
import { FocusShell } from "../../components/letter/FocusShell";
import { MissingLetterScreen } from "../../components/letter/MissingLetterScreen";
import { DraftExitDialog } from "../../components/letter/DraftExitDialog";
// CSS Modules: 기존 전역 class 이름은 그대로 두고 모듈 class 를 함께 붙인다.
import flow from "../../components/letter/LetterFlow.module.css";
import { LETTER_MIN_LENGTH } from "../../constants/limits";
import { LETTER_MIN_LENGTH_NOTICE } from "../../constants/copy";

// 애니메이션 종료 신호가 오지 않는 환경을 대비한 예비 시간(원문 보기 시트 닫기).
const SHEET_CLOSE_FALLBACK_MS = 900;

export function WriteReplyScreen({ letterId }: { letterId?: string }) {
  const currentUserId = getCurrentUserId();
  if (letterId?.startsWith("sample-waiting-letter-")) seedSampleLetters();
  let letter = letterId ? getLetterById(letterId) : undefined;
  // This first-meeting prototype is entered directly from the read screen.
  // Restore its reply-ready state even when a prior prototype session left no stored fixture.
  if (
    letterId === "sample-waiting-letter-one" &&
    (!letter ||
      letter.assignedReaderId !== currentUserId ||
      !["assigned", "read", "waiting_for_reply"].includes(letter.status))
  ) {
    const now = new Date().toISOString();
    letter = saveLetter({
      id: "sample-waiting-letter-one",
      senderId: letter?.senderId ?? "sample-sender-dawn",
      anonymousName: letter?.anonymousName ?? "새벽의 편지",
      content:
        letter?.content ??
        "요즘은 누구에게도 쉽게 말하지 못한 마음이 있어요. 그냥 누군가가 끝까지 읽어준다면 조금 괜찮아질 것 같아요.",
      createdAt: letter?.createdAt ?? now,
      updatedAt: now,
      retryCount: letter?.retryCount ?? 0,
      ...letter,
      status: "assigned",
      assignedReaderId: currentUserId,
      assignedAt: now,
      lastStatusChangedAt: now,
    });
  }
  if (letter?.status === "withdrawn")
    return (
      <FocusShell title="답장 쓰기" fallback={ROUTES.home}>
        <section className="flow-message">
          <h1>
            편지의 주인이
            <br />
            편지를 거두었어요
          </h1>
          <p>더 이상 답장을 쓸 수 없어요.</p>
          <button
            className="flow-primary-button"
            type="button"
            onClick={() => navigateTo(getListenEntryPath(getCurrentUserId()))}
          >
            다른 편지 만나기
          </button>
        </section>
      </FocusShell>
    );
  if (letter && getLetterReturn(letter.id, currentUserId))
    return (
      <FocusShell title="답장 쓰기" fallback={ROUTES.home}>
        <section className="flow-message">
          <h1>{RETURNED_LETTER_TITLE}</h1>
          <p>{RETURNED_LETTER_BODY}</p>
          <button
            className="flow-primary-button"
            type="button"
            onClick={() => navigateTo(getListenEntryPath(getCurrentUserId()))}
          >
            다른 편지 만나기
          </button>
          <button
            className="flow-text-button"
            type="button"
            onClick={() => navigateTo(ROUTES.home)}
          >
            홈으로 돌아가기
          </button>
        </section>
      </FocusShell>
    );
  if (
    !letter ||
    letter.assignedReaderId !== currentUserId ||
    !["assigned", "read", "waiting_for_reply"].includes(letter.status)
  )
    return <MissingLetterScreen fallback={ROUTES.home} />;
  return <WriteReplyForm letter={letter} currentUserId={currentUserId} />;
}

// Hook 은 조건에 따라 호출하면 안 되므로, 위의 편지 확인·조기 반환과 Hook 을 쓰는 본문을 나눴다.
function WriteReplyForm({
  letter,
  currentUserId,
}: {
  letter: Letter;
  currentUserId: string;
}) {
  const initial = useMemo(
    () => getReplyDraft(letter.id, currentUserId),
    [letter.id, currentUserId],
  );
  const [content, setContent] = useState(initial?.content ?? "");
  const [notice, setNotice] = useState("");
  const [showExit, setShowExit] = useState(false);
  const [showSource, setShowSource] = useState(false);
  const [isSavingReplyAndLeaving, setIsSavingReplyAndLeaving] = useState(false);
  const [replyWriteState, setReplyWriteState] = useState<
    "empty" | "writing" | "saved" | "error"
  >(initial?.content.trim() ? "writing" : "empty");
  const replyContentInputRef = useRef<HTMLTextAreaElement>(null);
  const replyCharacterCountRef = useRef<HTMLElement>(null);
  const meaningfulReplyLength = content.replace(/\s/g, "").length;
  useEffect(() => {
    if (letter.status === "assigned")
      transitionLetterStatus(letter.id, "waiting_for_reply", currentUserId, {
        waitingForReplyAt: new Date().toISOString(),
      });
  }, [letter.id, letter.status, currentUserId]);
  useLayoutEffect(() => {
    const input = replyContentInputRef.current;
    if (!input) return;
    const scroll = input.closest<HTMLElement>(".letter-flow-scroll");
    const previousScrollTop = scroll?.scrollTop;
    // 편지 쓰기와 같은 이유로, 재는 동안만 늘어남을 끈다.
    // 켜둔 채로 재면 scrollHeight 에 '남는 공간을 채워 늘어난 높이'가 섞여 들어와,
    // 한 번 커진 뒤에는 화면이 줄어도(회전·키보드) 편지지가 안 줄어든다.
    // 남는 공간을 채우는 일은 CSS 의 flex 가 맡는다.
    const previousFlexGrow = input.style.flexGrow;
    input.style.flexGrow = "0";
    input.style.height = "auto";
    const nextHeight = Math.max(260, input.scrollHeight);
    input.style.height = `${nextHeight}px`;
    input.style.flexGrow = previousFlexGrow;
    if (scroll && previousScrollTop !== undefined)
      scroll.scrollTop = previousScrollTop;
  }, [content]);
  const { saveNow, cancel: cancelAutosave } = useDraftAutosave(
    { content },
    (value) =>
      Boolean(
        updateReplyDraft(letter.id, currentUserId, {
          ...value,
          stage: "writing",
          letterStatusAtSave: letter.status,
        }),
      ),
  );
  function saveReplyNow() {
    const saved = saveNow();
    setReplyWriteState(saved ? "saved" : "error");
    return saved;
  }
  function next() {
    if (meaningfulReplyLength < LETTER_MIN_LENGTH) {
      setNotice(LETTER_MIN_LENGTH_NOTICE);
      return;
    }
    const draft = updateReplyDraft(letter.id, currentUserId, {
      content,
      stage: "review",
      letterStatusAtSave: letter.status,
    });
    if (!draft) {
      setNotice(
        "임시 저장하지 못했어요. 작성한 내용은 현재 화면에 남아 있어요.",
      );
      return;
    }
    // 방금 '검토' 단계로 저장했다. 화면을 떠날 때 자동저장이 '작성 중'으로
    // 되돌려 쓰지 않도록 끈다.
    cancelAutosave();
    navigateTo(routeTo.replyReview(letter.id));
  }
  // 뒤로가기는 되돌아가는 것이지, 새 화면을 밀어 넣는 것이 아니다.
  //
  // 예전에는 초안이 비었을 때 navigateTo(`/assigned-letter/:id`) 로 편지 읽기
  // 화면을 '앞으로' 밀어 넣었다. 그런데 그 화면의 뒤로가기는 history.back() 이라
  // 다시 이 화면으로 돌아오고, 여기서 또 밀어 넣어 —
  // 답장 쓰기 → 편지 읽기 → 답장 쓰기 → … 가 끝없이 반복됐다.
  // 히스토리를 되감으면 온 길 그대로 나가므로 순환이 생기지 않는다.
  const leave = () => {
    if (content.trim()) setShowExit(true);
    else navigateBack(ROUTES.home);
  };
  const replyActions = (
    <div
      className={`flow-fixed-action flow-fixed-action--split reply-flow-fixed-action ${flow["reply-flow-fixed-action"]}`}
    >
      <button
        type="button"
        className="flow-secondary-button"
        onClick={() => {
          if (!saveReplyNow())
            setNotice(
              "임시 저장하지 못했어요. 작성한 내용은 현재 화면에 남아 있어요.",
            );
        }}
      >
        임시 저장
      </button>
      <button
        type="button"
        className="flow-primary-button"
        onClick={next}
        disabled={meaningfulReplyLength < LETTER_MIN_LENGTH}
      >
        보내기 전 미리보기
      </button>
    </div>
  );
  return (
    <FocusShell
      title="답장 쓰기"
      onBack={leave}
      className={`write-letter-screen--figma ${flow["write-letter-screen--figma"]} reply-compose-screen--figma ${flow["reply-compose-screen--figma"]}`}
      headerAction={
        <button
          className="reply-read-letter-button"
          type="button"
          onClick={() => setShowSource(true)}
          aria-haspopup="dialog"
          aria-expanded={showSource}
        >
          <span>원문 보기</span>
        </button>
      }
      action={replyActions}
    >
      <section className={`reply-compose-intro ${flow["reply-compose-intro"]}`}>
        <h1>
          <strong>{letter.anonymousName}</strong>님에게
          <br />
          마음을 전해주세요
        </h1>
        <p>읽는 동안 떠오른 말이면 충분해요.</p>
        <img
          src={assetUrl("/assets/write-letter-object-reframed.webp")}
          alt="펜과 편지지, 잉크병"
        />
      </section>
      <aside
        className={`reply-compose-guidance ${flow["reply-compose-guidance"]}`}
      >
        <strong>
          ✻ <span>마음을 전하기 전에</span>
        </strong>
        <p>
          상대방을 판단하거나 해결책을 서두르기보다,
          <br />
          편지를 읽으며 느낀 마음을 천천히 전해주세요.
        </p>
      </aside>
      <section className="reply-compose-paper">
        <div
          className={`letter-compose-field-heading ${flow["letter-compose-field-heading"]}`}
        >
          <label className="reply-compose-recipient" htmlFor="reply-content">
            {letter.anonymousName}님에게
          </label>
          <small
            className={`letter-write-state ${flow["letter-write-state"]} is-${replyWriteState}`}
            role="status"
          >
            {replyWriteState === "saved"
              ? "임시 저장 완료"
              : replyWriteState === "error"
                ? "저장하지 못했어요"
                : replyWriteState === "writing"
                  ? "작성 중"
                  : "작성 전"}
          </small>
        </div>
        <p
          className={`flow-notice flow-notice--reply ${flow["flow-notice--reply"]}`}
          role="status"
        >
          {notice}
        </p>
        <div
          className={`reply-compose-writing ${flow["reply-compose-writing"]}`}
        >
          <textarea
            ref={replyContentInputRef}
            id="reply-content"
            aria-label="답장 내용"
            value={content}
            onChange={(event) => {
              const nextContent = event.target.value;
              setContent(nextContent);
              setNotice("");
              setReplyWriteState(nextContent.trim() ? "writing" : "empty");
            }}
            placeholder={LETTER_MIN_LENGTH_NOTICE}
            rows={1}
          />
          <small ref={replyCharacterCountRef}>
            글자 수 {meaningfulReplyLength}자
          </small>
        </div>
      </section>
      {showSource && (
        <ReplySourceSheet
          letter={letter}
          onClose={() => setShowSource(false)}
        />
      )}
      {showExit && (
        <DraftExitDialog
          kind="reply"
          isSaving={isSavingReplyAndLeaving}
          onContinue={() => setShowExit(false)}
          onSaveAndLeave={() => {
            if (isSavingReplyAndLeaving) return;
            setIsSavingReplyAndLeaving(true);
            setPageTimeout(() => {
              if (!saveReplyNow()) {
                setNotice(
                  "임시 저장하지 못했어요. 작성한 내용은 현재 화면에 남아 있어요.",
                );
                setIsSavingReplyAndLeaving(false);
                return;
              }
              window.sessionStorage.setItem(
                "gonggam-letter:draft-saved-toast",
                "reply-saved",
              );
              window.localStorage.setItem(
                "gonggam-letter:draft-saved-toast-pending",
                "reply-saved",
              );
              navigateTo(`${ROUTES.home}?toast=reply-saved`);
            }, 640);
          }}
          onDiscardAndLeave={() => {
            cancelAutosave();
            deleteReplyDraft(letter.id, currentUserId);
            navigateTo(ROUTES.home);
          }}
        />
      )}
    </FocusShell>
  );
}

/** 답장을 쓰다가 원문을 잠깐 들춰보는 전체화면 시트. 페이지를 떠나지 않으므로 초안이 유지된다. */
function ReplySourceSheet({
  letter,
  onClose,
}: {
  letter: Letter;
  onClose: () => void;
}) {
  // 시트가 열리면 초점을 시트 자체로 옮긴다. 예전에는 닫기 버튼에 옮겼는데,
  // 전역 규칙 button:focus-visible 이 금색 사각 테두리를 그려서 실기기에서
  // 열자마자 X 에 테두리가 생겼다. 대화상자를 여는 표준은 '컨테이너로 초점 이동'이다 —
  // 화면 읽기 프로그램은 aria-labelledby 로 제목을 읽어주고, 키보드 Tab 은
  // 시트 안에서 이어지며, 버튼이 눌린 것처럼 보이는 표시는 남지 않는다.
  const sheetRef = useRef<HTMLDivElement>(null);
  const [closing, setClosing] = useState(false);
  useEffect(() => {
    sheetRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setClosing(true);
    };
    window.addEventListener("keydown", onKey);
    // 시트가 떠 있는 동안 뒤 화면이 스크롤되지 않게 잠근다.
    const scroller = document.querySelector<HTMLElement>(".letter-flow-scroll");
    const previousOverflow = scroller?.style.overflow ?? "";
    if (scroller) scroller.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      if (scroller) scroller.style.overflow = previousOverflow;
    };
  }, []);
  // 닫을 때는 내려가는 모션이 끝난 뒤에 사라진다. 시간을 코드에 박아두면
  // CSS 에서 속도를 바꿨을 때 어긋나므로, 애니메이션 종료 신호를 그대로 받는다.
  // (신호가 오지 않는 환경을 대비해 넉넉한 예비 타이머를 함께 둔다.)
  useEffect(() => {
    if (!closing) return;
    const timer = window.setTimeout(onClose, SHEET_CLOSE_FALLBACK_MS);
    return () => window.clearTimeout(timer);
  }, [closing, onClose]);
  const sentAt = formatDateTime(letter.createdAt);
  return (
    <div
      className={`reply-source-backdrop ${flow["reply-source-backdrop"]}${closing ? ` is-closing ${flow["is-closing"]}` : ""}`}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) setClosing(true);
      }}
    >
      <div
        ref={sheetRef}
        tabIndex={-1}
        className={`reply-source-sheet ${flow["reply-source-sheet"]}${closing ? ` is-closing ${flow["is-closing"]}` : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reply-source-title"
        onAnimationEnd={(event) => {
          if (closing && event.target === event.currentTarget) onClose();
        }}
      >
        <button
          className={`reply-source-close ${flow["reply-source-close"]}`}
          type="button"
          onClick={() => setClosing(true)}
          aria-label="원문 닫기"
        >
          ×
        </button>
        <div className={`reply-source-header ${flow["reply-source-header"]}`}>
          <time dateTime={letter.createdAt}>{sentAt}</time>
          <h2 id="reply-source-title">
            <b>{letter.anonymousName}</b>님이 보낸 편지
          </h2>
        </div>
        <div className={`reply-source-body ${flow["reply-source-body"]}`}>
          <p>원문 확인</p>
          <article
            className={`reply-source-letter ${flow["reply-source-letter"]}`}
          >
            <p>{letter.content}</p>
          </article>
        </div>
      </div>
    </div>
  );
}
