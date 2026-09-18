// 답장 보내는 중 (/reply-sending/:id)
// 2026-09-18 src/pages/Letter/LetterFlowScreens.tsx 에서 옮겼다(코드 그대로).
import { useEffect, useState } from "react";
import { navigateBack, navigateTo } from "../../utils/navigation";
import { getCurrentUserId, getLetterById, sendReply } from "../../data/letters";
import { clearReplyDraft, getReplyDraft } from "../../data/letterDraft";
import { resolveDeliveryIssues } from "../../data/deliveryIssues";
import { canSubmitReply, reviewReplySafety } from "../../data/safety";
import { ListenEntryLoadingState } from "../../components/letter/ListenEntryLoadingState";
import { ROUTES, routeTo } from "../../routes/paths";
// CSS Modules: 기존 전역 class 이름은 그대로 두고 모듈 class 를 함께 붙인다.
import flow from "../../components/letter/LetterFlow.module.css";

export function ReplySendingScreen({ letterId }: { letterId?: string }) {
  const currentUserId = getCurrentUserId();
  /* 보내는 중과 실패는 성격이 다른 화면이라 나눠 둔다.
     예전에는 로딩 화면의 문구만 갈아끼웠는데, 그러면 점 물결은 계속 돌아
     '진행 중'이라 말하면서 글은 '실패했다'고 하는 모순이 생겼다.
     게다가 다시 시도할 버튼이 없어 헤더의 ← 말고는 빠져나갈 길이 없었다. */
  const [phase, setPhase] = useState<"sending" | "failed">("sending");
  // 다시 보내기를 누르면 이 값을 올려 아래 effect 를 처음부터 다시 돌린다.
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!letterId) return;
    const timer = window.setTimeout(() => {
      const letter = getLetterById(letterId);
      const draft = getReplyDraft(letterId, currentUserId);
      if (!letter || !draft?.content.trim()) {
        navigateTo(routeTo.writeReply(letterId));
        return;
      }
      const review = reviewReplySafety(draft.content, draft.id);
      if (!canSubmitReply(review)) {
        // 높은 위험(high_risk)도 다듬기 요청과 같게 답장 쓰기로 돌려보낸다.
        navigateTo(routeTo.writeReply(letterId));
        return;
      }
      const result = sendReply(letterId, currentUserId, draft.content);
      if (!result.ok) {
        setPhase("failed");
        return;
      }
      resolveDeliveryIssues("reply-send", letterId, currentUserId);
      clearReplyDraft(letterId, currentUserId);
      navigateTo(routeTo.replySent(letterId));
      // 편지 로딩·계정 삭제와 같은 1700ms. 점 물결(720ms 주기 + 셋째 점 240ms 지연)이
      // 두 번 완성되는 길이라 애니메이션이 잘리지 않는다.
    }, 1700);
    return () => window.clearTimeout(timer);
  }, [currentUserId, letterId, attempt]);

  const retry = () => {
    setPhase("sending");
    setAttempt((value) => value + 1);
  };

  return (
    <main
      className={`mobile-prototype listen-entry-screen reply-sending-transition ${flow["reply-sending-transition"]}`}
    >
      {/* 뒤로가기는 쓰던 답장으로 돌아간다. 예전에는 편지 id 없이 "/write-reply" 였는데,
        그 경로는 시안 확인용 표본 편지를 띄우는 자리라 내가 쓰던 답장이 아니라
        엉뚱한 편지가 열렸다. id 가 없는 경우에만 편지함으로 보낸다. */}
      <header className="flow-header listen-entry-topbar">
        {phase === "sending" ? (
          <span aria-hidden="true" />
        ) : (
          <button
            type="button"
            onClick={() =>
              navigateBack(
                letterId ? routeTo.writeReply(letterId) : ROUTES.mailbox,
              )
            }
            aria-label="이전으로 돌아가기"
          >
            <span aria-hidden="true">←</span>
          </button>
        )}
        <strong>답장 보내기</strong>
        <span aria-hidden="true" />
      </header>
      <div className="listen-entry-scroll">
        {phase === "failed" ? (
          <section className="flow-message" role="alert">
            <h1>답장을 보내지 못했어요</h1>
            <p>잠시 후 다시 시도해주세요.</p>
            <button
              className="flow-primary-button"
              type="button"
              onClick={retry}
            >
              다시 보내기
            </button>
          </section>
        ) : (
          <ListenEntryLoadingState message="답장을 보내고 있어요" />
        )}
      </div>
    </main>
  );
}
