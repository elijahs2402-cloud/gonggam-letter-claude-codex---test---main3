// letterReturns.ts 의 데이터 모양(타입). 2026-09-19 src/data/letterReturns.ts 에서 옮겼다(내용 그대로).

export type LetterReturnReason =
  | "no_time"
  | "difficult_to_reply"
  | "too_heavy"
  | "unsafe_or_uncomfortable"
  | "assigned_by_mistake"
  | "other";

export type MockLetterReturn = {
  id: string;
  letterId: string;
  readerId: string;
  reason?: LetterReturnReason;
  detail?: string;
  hadReplyDraft: boolean;
  replyDraftDeleted: boolean;
  status: "processing" | "completed" | "failed";
  createdAt: string;
  completedAt?: string;
};
