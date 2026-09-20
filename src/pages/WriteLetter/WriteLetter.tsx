// 편지 쓰기 (/write-letter)
// 2026-09-18 src/pages/Letter/LetterFlowScreens.tsx 에서 옮겼다(코드 그대로).
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { navigateTo, setPageTimeout } from "../../utils/navigation";
import { getCurrentUserId } from "../../data/letters";
import { getCurrentAnonymousName } from "../../data/mockAuth";
import {
  deleteLetterDraft,
  getLetterDraft,
  updateLetterDraft,
} from "../../data/letterDraft";
import { assetUrl } from "../../utils/basePath";
import { ROUTES } from "../../routes/paths";
import { FocusShell } from "../../components/letter/FocusShell";
import { DraftExitDialog } from "../../components/letter/DraftExitDialog";
// CSS Modules: 기존 전역 class 이름은 그대로 두고 모듈 class 를 함께 붙인다.
import flow from "../../components/letter/LetterFlow.module.css";
import { LETTER_MIN_LENGTH } from "../../constants/limits";
import { LETTER_MIN_LENGTH_NOTICE } from "../../constants/copy";

export function WriteLetterScreen() {
  const userId = getCurrentUserId();
  const initial = useMemo(() => getLetterDraft(userId), [userId]);
  const [content, setContent] = useState(initial?.content ?? "");
  const [anonymousName] = useState(
    initial?.anonymousName?.trim() || getCurrentAnonymousName(),
  );
  const [notice, setNotice] = useState("");
  const [showExit, setShowExit] = useState(false);
  const [isSavingAndLeaving, setIsSavingAndLeaving] = useState(false);
  const [writeState, setWriteState] = useState<
    "empty" | "writing" | "saved" | "error"
  >(initial?.content.trim() ? "writing" : "empty");
  const contentInputRef = useRef<HTMLTextAreaElement>(null);
  const characterCountRef = useRef<HTMLElement>(null);
  const meaningfulContentLength = content.replace(/\s/g, "").length;
  const writingStateLabel =
    writeState === "saved"
      ? "임시 저장 완료"
      : writeState === "error"
        ? "저장하지 못했어요"
        : writeState === "writing"
          ? "작성 중"
          : "작성 전";

  useLayoutEffect(() => {
    const input = contentInputRef.current;
    if (!input) return;
    // 편지지는 CSS flex 로 남는 공간만큼 늘어나 있다. 그 상태로 높이를 재면
    // '늘어난 높이'를 글 내용의 높이로 착각해 그대로 굳혀버린다.
    // 그러면 한 번 커진 뒤에는 화면이 줄어도(회전·키보드) 편지지가 안 줄어든다.
    // 재는 동안만 늘어남을 꺼서 항상 내용만큼의 높이를 얻는다.
    // 남는 공간을 채우는 일은 CSS 가 맡으므로 화면 크기 변화는 저절로 따라간다.
    const previousFlexGrow = input.style.flexGrow;
    input.style.flexGrow = "0";
    input.style.height = "auto";
    const nextHeight = Math.max(260, input.scrollHeight);
    input.style.height = `${nextHeight}px`;
    input.style.flexGrow = previousFlexGrow;
  }, [content]);

  function saveNow() {
    const saved = Boolean(
      updateLetterDraft(userId, { content, anonymousName, stage: "writing" }),
    );
    setWriteState(saved ? "saved" : "error");
    return saved;
  }

  function next() {
    if (meaningfulContentLength < LETTER_MIN_LENGTH) {
      setNotice(LETTER_MIN_LENGTH_NOTICE);
      return;
    }
    const draft = updateLetterDraft(userId, {
      content,
      anonymousName,
      stage: "review",
    });
    if (!draft) {
      setNotice(
        "임시 저장하지 못했어요. 작성한 내용은 현재 화면에 남아 있어요.",
      );
      return;
    }
    navigateTo(ROUTES.letterPreview);
  }

  const goHome = () => {
    if (content.trim()) {
      setShowExit(true);
      return;
    }
    navigateTo(ROUTES.home);
  };
  const action = (
    <div className="flow-fixed-action flow-fixed-action--split">
      <button
        className="flow-secondary-button"
        type="button"
        onClick={() => {
          if (!saveNow())
            setNotice(
              "임시 저장하지 못했어요. 작성한 내용은 현재 화면에 남아 있어요.",
            );
        }}
      >
        임시 저장
      </button>
      <button
        className="flow-primary-button"
        type="button"
        onClick={next}
        disabled={meaningfulContentLength < LETTER_MIN_LENGTH}
      >
        보내기 전 미리보기
      </button>
    </div>
  );
  return (
    <FocusShell
      title="편지 쓰기"
      onBack={goHome}
      className={`write-letter-screen--figma ${flow["write-letter-screen--figma"]}`}
      action={action}
    >
      <section
        className={`letter-compose-intro ${flow["letter-compose-intro"]}`}
      >
        <h1>
          나의 이야기를
          <br />
          들려주세요
        </h1>
        <p>정리되지 않아도, 한 문장도 괜찮아요.</p>
        <img
          src={assetUrl("/assets/write-letter-object-reframed.webp")}
          alt="펜과 편지지, 잉크병"
        />
      </section>
      <aside
        className={`letter-compose-guidance ${flow["letter-compose-guidance"]}`}
      >
        <strong>
          ✻ <span>마음을 보내기 전에</span>
        </strong>
        <p>
          이름, 연락처, 주소, 학교나 회사 이름처럼
          <br />
          나를 알아볼 수 있는 정보는 적지 말아주세요.
        </p>
      </aside>
      <section className="letter-compose-paper">
        <div
          className={`letter-compose-writing ${flow["letter-compose-writing"]}`}
        >
          <div
            className={`letter-compose-field-heading ${flow["letter-compose-field-heading"]}`}
          >
            <label htmlFor="letter-content">편지 내용</label>
            <small
              className={`letter-write-state ${flow["letter-write-state"]} is-${writeState}`}
              role="status"
            >
              {writingStateLabel}
            </small>
          </div>
          <p
            className={`flow-notice flow-notice--letter ${flow["flow-notice--letter"]}`}
            role="status"
          >
            {notice}
          </p>
          <textarea
            ref={contentInputRef}
            id="letter-content"
            value={content}
            onChange={(event) => {
              const nextContent = event.target.value;
              setContent(nextContent);
              setNotice("");
              setWriteState(nextContent.trim() ? "writing" : "empty");
            }}
            placeholder={LETTER_MIN_LENGTH_NOTICE}
            rows={1}
          />
          <small
            ref={characterCountRef}
            className={`letter-compose-character-count ${flow["letter-compose-character-count"]}`}
          >
            글자 수 {meaningfulContentLength}자
          </small>
        </div>
      </section>
      {showExit && (
        <DraftExitDialog
          kind="letter"
          isSaving={isSavingAndLeaving}
          onContinue={() => setShowExit(false)}
          onSaveAndLeave={() => {
            if (isSavingAndLeaving) return;
            setIsSavingAndLeaving(true);
            setPageTimeout(() => {
              if (!saveNow()) {
                setNotice(
                  "임시 저장하지 못했어요. 작성한 내용은 현재 화면에 남아 있어요.",
                );
                setIsSavingAndLeaving(false);
                return;
              }
              window.sessionStorage.setItem(
                "gonggam-letter:draft-saved-toast",
                "letter-saved",
              );
              window.localStorage.setItem(
                "gonggam-letter:draft-saved-toast-pending",
                "letter-saved",
              );
              navigateTo(`${ROUTES.home}?toast=letter-saved`);
            }, 640);
          }}
          onDiscardAndLeave={() => {
            deleteLetterDraft();
            navigateTo(ROUTES.home);
          }}
        />
      )}
    </FocusShell>
  );
}
