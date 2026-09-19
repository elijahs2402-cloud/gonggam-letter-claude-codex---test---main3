// mailboxStatus.ts 의 데이터 모양(타입). 2026-09-19 src/data/mailboxStatus.ts 에서 옮겼다(내용 그대로).

export type SentLetterDisplayKind =
  | "safety_review"
  | "moderation_review"
  | "restricted"
  | "send_failed"
  | "reply_arrived_unread"
  | "reply_opened"
  | "withdrawn"
  | "reply_writing"
  | "assigned"
  | "redistributed"
  | "waiting"
  | "sent"
  | "deleted";

export type SentLetterDisplayStatus = {
  kind: SentLetterDisplayKind;
  label: string;
  description: string;
  hasUnreadReply?: boolean;
  requiresAttention?: boolean;
  isRestricted?: boolean;
  isDeleted?: boolean;
  activityAt: string;
};
