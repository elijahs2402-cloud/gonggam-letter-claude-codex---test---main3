// 답장 보내기 전 점검 (/reply-review/:id)
// 2026-09-18 src/pages/Letter/LetterFlowScreens.tsx 에서 옮겼다(코드 그대로).
import { useState } from "react";
import { navigateTo } from "../../utils/navigation";
import {
  getCurrentUserId,
  getLetterById,
  saveLetter,
} from "../../data/letters";
import { getReplyDraft, updateReplyDraft } from "../../data/letterDraft";
import { seedSampleLetters } from "../../data/sampleLetters";
import { shouldFailDraftOperation } from "../../utils/draftDevTools";
import { getLetterReturn } from "../../data/letterReturns";
import { recordDeliveryIssue } from "../../data/deliveryIssues";
import { reviewReplySafety } from "../../data/safety";
import {
  RETURNED_LETTER_BODY,
  RETURNED_LETTER_TITLE,
} from "../../constants/copy";
import { getListenEntryPath } from "../../data/waitingLetters";
import { assetUrl } from "../../utils/basePath";
import { ROUTES, routeTo } from "../../routes/paths";
import { FocusShell } from "../../components/letter/FocusShell";
import { formatDateWithYear } from "../../utils/letterDates";
import {
  HighlightedPreviewContent,
  PreviewSafetyWarning,
} from "../../components/letter/PreviewSafety";
import { MissingLetterScreen } from "../../components/letter/MissingLetterScreen";
// CSS Modules: 기존 전역 class 이름은 그대로 두고 모듈 class 를 함께 붙인다.
import flow from "../../components/letter/LetterFlow.module.css";

export function ReplyReviewScreen({ letterId }: { letterId?: string }) {
  const currentUserId = getCurrentUserId();
  if (letterId?.startsWith("sample-waiting-letter-")) seedSampleLetters();
  let letter = letterId ? getLetterById(letterId) : undefined;
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
      status: "waiting_for_reply",
      assignedReaderId: currentUserId,
      assignedAt: now,
      waitingForReplyAt: now,
      lastStatusChangedAt: now,
    });
  }
  const draft = letterId ? getReplyDraft(letterId, currentUserId) : undefined;
  const [notice, setNotice] = useState("");
  const [submitting] = useState(false);
  if (letter && getLetterReturn(letter.id, currentUserId))
    return (
      <FocusShell title="보내기 전 점검" fallback={ROUTES.home}>
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
        </section>
      </FocusShell>
    );
  if (
    !letter ||
    !draft?.content.trim() ||
    letter.assignedReaderId !== currentUserId ||
    !["assigned", "read", "waiting_for_reply"].includes(letter.status)
  )
    return <MissingLetterScreen fallback={ROUTES.home} />;
  if (draft.stage !== "review")
    updateReplyDraft(letter.id, currentUserId, {
      stage: "review",
      letterStatusAtSave: letter.status,
    });
  const review = reviewReplySafety(draft.content, draft.id);
  const requiresRevision = review.status !== "clear";
  // 아래 submit 은 함수 선언이라 위 가드의 '편지가 있다'는 판단이 전달되지 않는다.
  // 가드를 지난 편지를 상수로 받아 두고 그것을 쓴다.
  const readyLetter = letter;
  function submit() {
    if (submitting) return;
    if (shouldFailDraftOperation("reply-submit")) {
      recordDeliveryIssue("reply-send", readyLetter.id, currentUserId);
      setNotice(
        "답장을 보내지 못했어요. 작성한 내용은 그대로 보관되어 있어요.",
      );
      return;
    }
    navigateTo(routeTo.replySending(readyLetter.id));
  }
  return (
    <FocusShell
      title="답장 미리보기"
      fallback={routeTo.writeReply(letter.id)}
      className={`reply-review-screen ${flow["reply-review-screen"]}`}
      action={
        <div
          className={`flow-fixed-action flow-fixed-action--split reply-review-fixed-action ${flow["reply-review-fixed-action"]}`}
        >
          <button
            type="button"
            className="flow-secondary-button"
            onClick={() => {
              updateReplyDraft(letter.id, currentUserId, {
                stage: "writing",
                letterStatusAtSave: letter.status,
              });
              navigateTo(routeTo.writeReply(letter.id));
            }}
          >
            수정하기
          </button>
          <button
            type="button"
            className="flow-primary-button"
            onClick={submit}
            disabled={submitting || requiresRevision}
          >
            답장 보내기
          </button>
        </div>
      }
    >
      <section className={`flow-review ${flow["flow-review"]}`}>
        <h1>
          <strong>답장</strong>을 보내기 전에
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
          className={`flow-letter-paper reply-review-paper ${flow["reply-review-paper"]}`}
        >
          {requiresRevision && <PreviewSafetyWarning />}
          <p className="reply-compose-recipient">
            {letter.anonymousName}님에게
          </p>
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
          <small
            className={`reply-review-edited-at ${flow["reply-review-edited-at"]}`}
          >
            {formatDateWithYear(draft.updatedAt)}에 마지막으로 다듬었어요.
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
            <li>상대를 판단하거나 비난하지 않았나요?</li>
          </ul>
        </section>
        <p className="flow-notice" role="status">
          {notice}
        </p>
      </section>
    </FocusShell>
  );
}
