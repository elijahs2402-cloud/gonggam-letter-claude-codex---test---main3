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

const createId = () =>
  `safety-${typeof crypto?.randomUUID === "function" ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`}`;
const REVIEW_KEY = "gonggam_safety_reviews_v1";
function storeReview(review: SafetyReviewResult) {
  try {
    const previous: unknown = JSON.parse(
      localStorage.getItem(REVIEW_KEY) ?? "[]",
    );
    const list = Array.isArray(previous) ? previous : [];
    localStorage.setItem(
      REVIEW_KEY,
      JSON.stringify(
        [
          review,
          ...list.filter(
            (item) => (item as SafetyReviewResult).id !== review.id,
          ),
        ].slice(0, 100),
      ),
    );
  } catch {
    /* Local safety review storage is best-effort. */
  }
}
const rules: ReadonlyArray<{
  category: SafetyCategory;
  severity: SafetySeverity;
  pattern: RegExp;
  message: string;
}> = [
  // 지금은 욕설 표현만 걸러낸다(2026-09-15 결정). 걸리면 고친 뒤에만 보낼 수 있다.
  // 아래 단어는 자리 표시다 — 개발팀이 정한 욕설 목록으로 교체할 예정.
  // (자해·폭력 표현 규칙은 같은 날 지웠다. 그런 글을 어떻게 다룰지는 기획 정책으로 정한다.)
  {
    category: "harassment",
    severity: "warning",
    pattern: /(한심해|멍청해|네 탓이야|꺼져|죽어라|미친)/g,
    message: "상대를 상처 입힐 수 있는 표현이 포함되어 있을 수 있어요.",
  },
];

export function reviewSafety(
  content: string,
  targetType: "letter" | "reply",
  targetId: string,
): SafetyReviewResult {
  const matches: SafetyMatch[] = [];
  for (const rule of rules)
    for (const found of content.matchAll(rule.pattern))
      matches.push({
        category: rule.category,
        severity: rule.severity,
        matchedText: found[0],
        startIndex: found.index,
        endIndex: (found.index ?? 0) + found[0].length,
        message: rule.message,
      });
  const severity: SafetySeverity = matches.some(
    (match) => match.severity === "high_risk",
  )
    ? "high_risk"
    : matches.length
      ? "warning"
      : "none";
  // 타입을 적어 두지 않으면 status 가 그냥 string 으로 넓어져 storeReview 에 넘길 수 없다.
  const review: SafetyReviewResult = {
    id: createId(),
    targetType,
    targetId,
    checkedAt: new Date().toISOString(),
    severity,
    categories: [...new Set(matches.map((match) => match.category))],
    matches,
    status:
      severity === "high_risk"
        ? "high_risk"
        : matches.length
          ? "needs_revision"
          : "clear",
    engine: "local_rules" as const,
    version: "local-rules-v1",
  };
  storeReview(review);
  return review;
}

export const reviewLetterSafety = (content: string, targetId: string) =>
  reviewSafety(content, "letter", targetId);
export const reviewReplySafety = (content: string, targetId: string) =>
  reviewSafety(content, "reply", targetId);
export const canSubmitLetter = (review: SafetyReviewResult) =>
  review.status === "clear";
export const canSubmitReply = canSubmitLetter;
