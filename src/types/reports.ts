// reports.ts 의 데이터 모양(타입). 2026-09-19 src/data/reports.ts 에서 옮겼다(내용 그대로).

export type ReportReason =
  | "judgment"
  | "harassment"
  | "hate"
  | "sexual"
  | "personal_information"
  | "meeting_request"
  | "threat"
  | "unsafe_advice"
  | "high_risk"
  | "abusive"
  | "spam"
  | "dangerous_or_illegal"
  | "self_harm_encouragement"
  | "irrelevant_or_insincere"
  | "other";

export type Report = {
  id: string;
  reporterId: string;
  targetType: "letter" | "reply" | "user";
  targetId: string;
  reason: ReportReason;
  detail?: string;
  createdAt: string;
  status: "submitted" | "reviewing" | "resolved" | "dismissed";
  hiddenByReporter: boolean;
  blockedUserId?: string;
};
