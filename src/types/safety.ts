// safety.ts 의 데이터 모양(타입). 2026-09-19 src/data/safety.ts 에서 옮겼다(내용 그대로).

export type SafetySeverity = "none" | "notice" | "warning" | "high_risk";

export type SafetyCategory =
  | "personal_information"
  | "external_contact"
  | "meeting_request"
  | "harassment"
  | "hate"
  | "sexual_content"
  | "threat"
  | "self_harm_risk"
  | "suicide_risk"
  | "abuse_risk"
  | "violence_risk"
  | "illegal_activity"
  | "other";

export type SafetyStatus =
  | "not_checked"
  | "clear"
  | "needs_revision"
  | "high_risk"
  | "under_review"
  | "blocked";

export type ModerationStatus =
  "not_required" | "pending" | "reviewing" | "approved" | "rejected";

export type SafetyMatch = {
  category: SafetyCategory;
  severity: SafetySeverity;
  matchedText?: string;
  startIndex?: number;
  endIndex?: number;
  message: string;
};

export type SafetyReviewResult = {
  id: string;
  targetType: "letter" | "reply";
  targetId: string;
  checkedAt: string;
  severity: SafetySeverity;
  categories: SafetyCategory[];
  matches: SafetyMatch[];
  status: Exclude<SafetyStatus, "not_checked">;
  engine: "local_rules" | "remote_service" | "manual";
  version: string;
};
