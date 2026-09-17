import { useState } from "react";
import {
  createLetter,
  getCurrentUserId,
  getLetterById,
} from "../../data/letters";
import {
  clearLetterDraft,
  getLetterDraft,
  updateLetterDraft,
} from "../../data/letterDraft";
import { canSubmitLetter, reviewLetterSafety } from "../../data/safety";
import { navigateBack, navigateTo } from "../../utils/navigation";
import { resolveDeliveryIssues } from "../../data/deliveryIssues";

function Shell({
  title,
  children,
  fallback = "/home",
  action,
}: {
  title: string;
  children: React.ReactNode;
  fallback?: string;
  action?: React.ReactNode;
}) {
  return (
    <main className="mobile-prototype letter-flow-screen">
      <header className="flow-header">
        <button
          type="button"
          onClick={() => navigateBack(fallback)}
          aria-label="이전으로 돌아가기"
        >
          ←
        </button>
        <strong>{title}</strong>
        <span />
      </header>
      <div className="letter-flow-scroll">{children}</div>
      {action}
    </main>
  );
}

function ReviewNotice({
  content,
  matches,
  target,
}: {
  content: string;
  matches: ReturnType<typeof reviewLetterSafety>["matches"];
  target: "편지" | "답장";
}) {
  return (
    <section className="safety-review">
      <p className="safety-review-kicker">안전 검토</p>
      <h1>
        {target}를 전하기 전에
        <br />
        조금만 다듬어볼까요?
      </h1>
      <p>
        상처가 될 수 있는 표현이 있어요. 내용은 이 기기에 그대로 보관되어
        있어요.
      </p>
      <article className="flow-letter-paper">
        <blockquote>{content}</blockquote>
      </article>
      <ul>
        {matches.map((match, index) => (
          <li key={`${match.category}-${index}`}>
            <strong>{match.matchedText ?? "확인이 필요한 표현"}</strong>
            <span>{match.message}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function LetterSafetyReviewScreen() {
  const userId = getCurrentUserId();
  const draft = getLetterDraft(userId);
  const [error, setError] = useState("");
  if (!draft?.content.trim())
    return (
      <Shell title="편지 안전 검토" fallback="/write-letter">
        <section className="flow-message">
          <h1>검토할 편지가 없어요</h1>
          <p>편지를 작성한 뒤 다시 확인해주세요.</p>
          <button
            className="flow-primary-button"
            type="button"
            onClick={() => navigateTo("/write-letter")}
          >
            편지 쓰기
          </button>
        </section>
      </Shell>
    );
  const review = reviewLetterSafety(draft.content, draft.id);

  function send() {
    const latest = getLetterDraft(userId);
    if (!latest?.content.trim()) return;
    const latestReview = reviewLetterSafety(latest.content, latest.id);
    updateLetterDraft(userId, {
      lastSafetyReviewId: latestReview.id,
      lastSafetyStatus: latestReview.status,
      lastSafetyCheckedAt: latestReview.checkedAt,
    });
    if (!canSubmitLetter(latestReview)) {
      navigateTo("/letter-safety-review");
      return;
    }
    const letter = createLetter({
      senderId: userId,
      // 초안을 읽을 때 이름이 없으면 "" 로 채워지므로 실제 값은 달라지지 않는다.
      anonymousName: latest.anonymousName ?? "",
      content: latest.content,
      sourceDraftId: latest.id,
    });
    if (!getLetterById(letter.id)) {
      setError("편지를 보내지 못했어요. 작성한 내용은 그대로 보관되어 있어요.");
      return;
    }
    resolveDeliveryIssues("letter-send", undefined, userId);
    clearLetterDraft();
    navigateTo(`/letter-sent?id=${encodeURIComponent(letter.id)}`);
  }

  // 높은 위험(high_risk)도 다듬기 요청과 같은 화면을 보여준다
  // (발송 전 위험 안내 화면 /urgent-support 는 2026-09-15 삭제).
  if (review.status === "needs_revision" || review.status === "high_risk")
    return (
      <Shell
        title="편지 안전 검토"
        fallback="/letter-preview"
        action={
          <div className="flow-fixed-action flow-fixed-action--split">
            <button
              className="flow-secondary-button"
              type="button"
              onClick={() => navigateTo("/letter-preview")}
            >
              미리보기로
            </button>
            <button
              className="flow-primary-button"
              type="button"
              onClick={() => navigateTo("/write-letter")}
            >
              내용 수정하기
            </button>
          </div>
        }
      >
        <ReviewNotice
          content={draft.content}
          matches={review.matches}
          target="편지"
        />
      </Shell>
    );
  return (
    <Shell
      title="편지 안전 검토"
      fallback="/letter-preview"
      action={
        <div className="flow-fixed-action flow-fixed-action--split">
          <button
            className="flow-secondary-button"
            type="button"
            onClick={() => navigateTo("/write-letter")}
          >
            수정하기
          </button>
          <button className="flow-primary-button" type="button" onClick={send}>
            편지 보내기
          </button>
        </div>
      }
    >
      <section className="flow-message">
        <h1>
          편지를 안전하게
          <br />
          전할 수 있어요
        </h1>
        <p>보내기 전에 내용을 한 번 더 살펴봤어요.</p>
        <p className="flow-notice" role="status">
          {error}
        </p>
      </section>
    </Shell>
  );
}
