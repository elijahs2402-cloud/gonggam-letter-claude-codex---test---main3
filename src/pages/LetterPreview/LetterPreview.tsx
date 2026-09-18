// 편지 미리보기 (/letter-preview)
// 2026-09-18 src/pages/Letter/LetterFlowScreens.tsx 에서 옮겼다(코드 그대로).
import { useState } from "react";
import { navigateTo } from "../../utils/navigation";
import {
  createLetter,
  getCurrentUserId,
  getLetterById,
} from "../../data/letters";
import { getCurrentAnonymousName } from "../../data/mockAuth";
import {
  clearLetterDraft,
  getLetterDraft,
  updateLetterDraft,
} from "../../data/letterDraft";
import { shouldFailDraftOperation } from "../../utils/draftDevTools";
import {
  recordDeliveryIssue,
  resolveDeliveryIssues,
} from "../../data/deliveryIssues";
import { canSubmitLetter, reviewLetterSafety } from "../../data/safety";
import { formatDateTime } from "../../utils/datetime";
import { assetUrl } from "../../utils/basePath";
import { ROUTES, routeTo } from "../../routes/paths";
import { FocusShell } from "../../components/letter/FocusShell";
import {
  HighlightedPreviewContent,
  PreviewSafetyWarning,
} from "../../components/letter/PreviewSafety";
import { MissingLetterScreen } from "../../components/letter/MissingLetterScreen";
// CSS Modules: 기존 전역 class 이름은 그대로 두고 모듈 class 를 함께 붙인다.
import flow from "../Letter/LetterFlowScreens.module.css";

export function LetterPreviewScreen() {
  const userId = getCurrentUserId();
  const draft = getLetterDraft(userId);
  const [notice, setNotice] = useState("");
  if (!draft?.content.trim())
    return <MissingLetterScreen fallback={ROUTES.writeLetter} />;
  if (draft.stage !== "review") updateLetterDraft(userId, { stage: "review" });
  const review = reviewLetterSafety(draft.content, draft.id);
  const requiresRevision = review.status !== "clear";
  function submit() {
    if (shouldFailDraftOperation("letter-submit")) {
      recordDeliveryIssue("letter-send");
      setNotice(
        "편지를 보내지 못했어요. 작성한 내용은 그대로 보관되어 있어요.",
      );
      return;
    }
    const review = reviewLetterSafety(draft.content, draft.id);
    updateLetterDraft(userId, {
      lastSafetyReviewId: review.id,
      lastSafetyStatus: review.status,
      lastSafetyCheckedAt: review.checkedAt,
    });
    if (!canSubmitLetter(review)) {
      // 높은 위험(high_risk)도 다듬기 요청과 같게 안전 검토 화면으로 보낸다
      // (발송 전 위험 안내 화면 /urgent-support 는 2026-09-15 삭제).
      navigateTo(ROUTES.letterSafetyReview);
      return;
    }
    const letter = createLetter({
      senderId: userId,
      anonymousName: draft.anonymousName?.trim() || getCurrentAnonymousName(),
      content: draft.content,
      sourceDraftId: draft.id,
    });
    if (!getLetterById(letter.id)) {
      setNotice(
        "내용을 확인하지 못했어요. 작성한 내용은 그대로 보관되어 있어요.",
      );
      return;
    }
    resolveDeliveryIssues("letter-send", undefined, userId);
    clearLetterDraft();
    navigateTo(routeTo.letterSent(letter.id));
  }
  return (
    <FocusShell
      title="편지 미리보기"
      fallback={ROUTES.writeLetter}
      className={`letter-preview-screen ${flow["letter-preview-screen"]}`}
      action={
        <div className="flow-fixed-action flow-fixed-action--split">
          <button
            type="button"
            className="flow-secondary-button"
            onClick={() => {
              updateLetterDraft(userId, { stage: "writing" });
              navigateTo(ROUTES.writeLetter);
            }}
          >
            수정하기
          </button>
          <button
            type="button"
            className="flow-primary-button"
            onClick={submit}
            disabled={requiresRevision}
          >
            편지 보내기
          </button>
        </div>
      }
    >
      <section className={`flow-review ${flow["flow-review"]}`}>
        <h1>
          <strong>편지</strong>를 보내기 전에
          <br />
          살펴봐주세요
        </h1>
        <p className={`reply-review-intro ${flow["reply-review-intro"]}`}>
          서두르지 않아도 괜찮아요.
        </p>
        <img
          className={`reply-review-header-illustration ${flow["reply-review-header-illustration"]}`}
          src={assetUrl("/assets/reply-review-open-letter-glasses.webp")}
          alt=""
          aria-hidden="true"
        />
        <article
          className={`flow-letter-paper${requiresRevision ? ` flow-letter-paper--with-safety-warning ${flow["flow-letter-paper--with-safety-warning"]}` : ""}`}
        >
          {requiresRevision && <PreviewSafetyWarning />}
          <span
            className={`my-letter-waiting-quote ${flow["my-letter-waiting-quote"]} my-letter-waiting-quote--open ${flow["my-letter-waiting-quote--open"]}`}
            aria-hidden="true"
          >
            “
          </span>
          <blockquote>
            {requiresRevision ? (
              <HighlightedPreviewContent
                content={draft.content}
                matches={review.matches}
              />
            ) : (
              draft.content
            )}
          </blockquote>
          <span
            className={`my-letter-waiting-quote ${flow["my-letter-waiting-quote"]} my-letter-waiting-quote--close`}
            aria-hidden="true"
          >
            ”
          </span>
          <span className="letter-preview-signature">
            ─ {draft.anonymousName?.trim() || getCurrentAnonymousName()}
          </span>
          <small
            className={`reply-review-edited-at ${flow["reply-review-edited-at"]}`}
          >
            {formatDateTime(draft.updatedAt)}에 마지막으로 다듬었어요.
          </small>
        </article>
        <section
          className={`reply-review-guidance ${flow["reply-review-guidance"]}`}
          aria-label="보내기 전 점검"
        >
          <h2>보내기 전, 잠시 살펴봐주세요</h2>
          <ul className={`review-list ${flow["review-list"]}`}>
            <li>보내고 나면 내용을 고칠 수 없어요.</li>
            <li>부적절하거나 불법적인 내용은 없나요?</li>
            <li>개인정보나 연락처를 적지 않았나요?</li>
            <li>학교·회사처럼 나를 짐작하게 하는 내용은 없나요?</li>
          </ul>
        </section>
        <p className="flow-notice" role="status">
          {notice}
        </p>
        {notice && (
          <button
            className="flow-text-button"
            type="button"
            onClick={() => navigateTo(ROUTES.writeLetter)}
          >
            편지로 돌아가기
          </button>
        )}
      </section>
    </FocusShell>
  );
}
