// 편지 두고 가기 (/return-letter/:id)
// 2026-09-18 src/pages/Safety/SafetyActionScreens.tsx 에서 옮겼다(코드 그대로).
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { deleteReplyDraft, getReplyDraft } from "../../data/letterDraft";
import {
  getCurrentUserId,
  getLetterById,
  returnLetterToWaiting,
} from "../../data/letters";
import { getLetterReturn, saveLetterReturn } from "../../data/letterReturns";
import {
  getCurrentAppSearchParams,
  navigateTo,
  clearAppState,
  replaceAppState,
  setPageTimeout,
} from "../../utils/navigation";
import {
  RETURNED_LETTER_BODY,
  RETURNED_LETTER_TITLE,
} from "../../constants/copy";
import { getListenEntryPath } from "../../data/waitingLetters";
import { ListenEntryLoadingState } from "../../components/letter/ListenEntryLoadingState";
import { ROUTES, routeTo } from "../../routes/paths";
import { Shell } from "../../components/safety/Shell";
import { LetterReturnSheet } from "../../components/letter/LetterReturnSheet";

export function LetterReturnScreen({ letterId }: { letterId?: string }) {
  const readerId = getCurrentUserId();
  const letter = letterId ? getLetterById(letterId) : undefined;
  const draft = letterId ? getReplyDraft(letterId, readerId) : undefined;
  const hasDraft = Boolean(draft?.content.trim());
  // 편지 읽기 화면의 시트에서 이미 확인을 받고 왔다면(?start=1) 곧장 처리부터 시작한다.
  // 주소로 직접 들어온 경우에는 확인 시트부터 보여준다.
  const startNow = getCurrentAppSearchParams().get("start") === "1";
  // 두고 가기를 마치면 주소에 state=done 을 남긴다(2026-09-16).
  //
  // 그러지 않으면 화면이 다시 그려질 때 방금 한 일을 잊는다. 저장소에는 두고 간
  // 기록이 있으니 아래 가드가 걸려, '편지를 두고 왔어요'가 잠깐 떴다가
  // '이미 두고 온 편지예요'로 튀었다. 뒤로 돌아왔을 때도 마찬가지였다
  // (?start=1 이 남아 끝난 일을 다시 시작해 로딩까지 한 번 더 보였다).
  const isDone = getCurrentAppSearchParams().get("state") === "done";
  const alreadyReturned = Boolean(
    letterId && getLetterReturn(letterId, readerId),
  );
  const [phase, setPhase] = useState<
    "intro" | "processing" | "failed" | "complete"
  >(
    isDone ? "complete" : startNow && !alreadyReturned ? "processing" : "intro",
  );
  // 처리는 훅 규칙 때문에 가드보다 위에 정의해 둔다 — 아래 가드들이 먼저 return 해버리면
  // useEffect 가 조건부로 호출되어 버린다.
  const runReturn = () => {
    const current = letterId ? getLetterById(letterId) : undefined;
    if (!current) {
      setPhase("failed");
      return;
    }
    setPhase("processing");
    // 처리 중에 화면을 떠나면 두고 가기를 하지 않는다 — 떠난 뒤의 주소에
    // 완료 표시(?state=done)를 남기지 않기 위해서이기도 하다.
    setPageTimeout(() => {
      const latest = getLetterById(current.id);
      const returned = latest
        ? returnLetterToWaiting(current.id, readerId)
        : undefined;
      if (!returned) {
        setPhase("failed");
        return;
      }
      const now = new Date().toISOString();
      saveLetterReturn({
        id: `return-${crypto.randomUUID?.() ?? Date.now()}`,
        letterId: current.id,
        readerId,
        hadReplyDraft: hasDraft,
        replyDraftDeleted: hasDraft,
        status: "completed",
        createdAt: now,
        completedAt: now,
      });
      if (hasDraft) deleteReplyDraft(current.id, readerId);
      // 주소에 남겨 두면 화면이 다시 그려져도, 뒤로 돌아와도 이 화면이 그대로다.
      replaceAppState("done");
      setPhase("complete");
    }, 1400);
  };
  // StrictMode 는 개발 중 효과를 두 번 실행한다. 그대로 두면 두 번째 실행이
  // 이미 두고 온 편지를 다시 두려다 실패해 '이미 두고 온 편지예요'가 떴다.
  // 한 번만 돌게 문을 걸어둔다.
  // 화면이 처음 붙을 때 한 번만 확인한다. useEffectEvent 는 그때의 최신 값을 읽으면서도
  // effect 를 다시 돌리지 않는다(예전에는 의존성 목록을 비워 두어 lint 경고가 났다).
  const startedRef = useRef(false);
  const startOnOpen = useEffectEvent(() => {
    if (!startNow || alreadyReturned || startedRef.current) return;
    startedRef.current = true;
    runReturn();
  });
  useEffect(() => {
    startOnOpen();
  }, []);
  // 이 분기는 반드시 아래 가드보다 위에 있어야 한다.
  // runReturn 이 saveLetterReturn 까지 마치면 getLetterReturn 이 기록을 돌려주어
  // 가드가 먼저 걸리고, 완료 화면은 한 번도 보이지 않았다('이미 두고 온 편지예요'가 대신 떴다).
  if (phase === "complete")
    return (
      <Shell
        title="편지 두고 가기"
        fallback={ROUTES.home}
        showBackButton={false}
      >
        <section className="flow-message">
          <h1>편지를 두고 왔어요</h1>
          <p>이 편지는 다시 누군가를 기다려요.</p>
          <button
            className="flow-primary-button"
            type="button"
            onClick={() => {
              // 떠나면서 완료 표시를 지운다 — 뒤로 돌아오면 그때의 실제 상태
              // ('이미 두고 온 편지예요')가 보여야 한다.
              clearAppState();
              navigateTo(getListenEntryPath(getCurrentUserId()));
            }}
          >
            다른 편지 만나기
          </button>
          <button
            className="flow-text-button"
            type="button"
            onClick={() => {
              clearAppState();
              navigateTo(ROUTES.home);
            }}
          >
            홈으로 돌아가기
          </button>
        </section>
      </Shell>
    );
  // 완료 직전의 사이 화면.
  // 앱의 표준 로딩 표현(편지 만나기에서 쓰던 것)을 그대로 빌려 둘이 같은 모양으로 읽힌다.
  // 직접 짜지 않는 이유: 점은 .listen-entry-loading-mark 안에서만 8px 로 커지고
  // 그 밖에서는 버튼 속 크기 그대로라 전체 화면에서 너무 작게 나온다.
  if (phase === "processing")
    return (
      <Shell
        title="편지 두고 가기"
        fallback={ROUTES.home}
        showBackButton={false}
      >
        <ListenEntryLoadingState message="편지를 제자리에 두고 있어요" />
      </Shell>
    );
  if (
    !letter ||
    letter.assignedReaderId !== readerId ||
    !["assigned", "read", "waiting_for_reply"].includes(letter.status) ||
    getLetterReturn(letter.id, readerId)
  )
    return (
      <Shell
        title="편지 두고 가기"
        fallback={ROUTES.home}
        showBackButton={false}
      >
        <section className="flow-message">
          <h1>{RETURNED_LETTER_TITLE}</h1>
          <p>{RETURNED_LETTER_BODY}</p>
          <button
            className="flow-primary-button"
            type="button"
            onClick={() => {
              // 떠나면서 완료 표시를 지운다 — 뒤로 돌아오면 그때의 실제 상태
              // ('이미 두고 온 편지예요')가 보여야 한다.
              clearAppState();
              navigateTo(getListenEntryPath(getCurrentUserId()));
            }}
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
      </Shell>
    );
  if (phase === "failed")
    return (
      <Shell title="편지 두고 가기" fallback={routeTo.writeReply(letter.id)}>
        <section className="flow-message">
          <h1>편지를 두고 오지 못했어요</h1>
          <p>잠시 후 다시 시도해주세요.</p>
          <button
            className="flow-primary-button"
            type="button"
            onClick={runReturn}
          >
            다시 시도
          </button>
          <button
            className="flow-secondary-button"
            type="button"
            onClick={() => navigateTo(routeTo.writeReply(letter.id))}
          >
            답장으로 돌아가기
          </button>
          <button
            className="flow-text-button"
            type="button"
            onClick={() => navigateTo(ROUTES.home)}
          >
            홈으로 이동
          </button>
        </section>
      </Shell>
    );
  return (
    <LetterReturnSheet
      hasDraft={hasDraft}
      onCancel={() => navigateTo(routeTo.writeReply(letter.id))}
      onConfirm={runReturn}
    />
  );
}
