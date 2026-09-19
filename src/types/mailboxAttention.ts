// mailboxAttention.ts 의 데이터 모양(타입). 2026-09-19 src/data/mailboxAttention.ts 에서 옮겼다(내용 그대로).
import type { Letter } from "./letters";
import type { DeliveryIssue } from "./deliveryIssues";

export type MailboxAttentionReason =
  | "safety-review"
  | "unread-replies"
  | "delivery-failure"
  | "assigned-letter"
  | "reply-draft"
  | "letter-draft";

export type MailboxAttention = {
  reasons: MailboxAttentionReason[];
  unreadReplies: Letter[];
  assignedLetters: Letter[];
  replyDraftLetterIds: string[];
  hasLetterDraft: boolean;
  safetyNeedsReview: boolean;
  deliveryIssues: DeliveryIssue[];
};
