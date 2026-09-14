const FAILURE_KEY = "gonggam_draft_dev_failures_v1";
const LETTER_DRAFTS_KEY = "gonggam_letter_drafts_v1";
const REPLY_DRAFTS_KEY = "gonggam_reply_drafts_v1";
export type DraftDevFailure =
  "letter-save" | "reply-save" | "letter-submit" | "reply-submit";
const isDevelopment =
  typeof window !== "undefined" &&
  /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);

export function setDraftDevFailure(kind: DraftDevFailure, enabled: boolean) {
  if (!isDevelopment) return;
  try {
    const current = JSON.parse(
      window.sessionStorage.getItem(FAILURE_KEY) ?? "{}",
    ) as Record<string, boolean>;
    current[kind] = enabled;
    window.sessionStorage.setItem(FAILURE_KEY, JSON.stringify(current));
  } catch {
    /* development helper only */
  }
}

export function shouldFailDraftOperation(kind: DraftDevFailure) {
  if (!isDevelopment) return false;
  try {
    return Boolean(
      (
        JSON.parse(
          window.sessionStorage.getItem(FAILURE_KEY) ?? "{}",
        ) as Record<string, boolean>
      )[kind],
    );
  } catch {
    return false;
  }
}

export function writeCorruptedDraftForDevelopment(kind: "letter" | "reply") {
  if (!isDevelopment) return;
  window.localStorage.setItem(
    kind === "letter" ? LETTER_DRAFTS_KEY : REPLY_DRAFTS_KEY,
    "{corrupted",
  );
}
