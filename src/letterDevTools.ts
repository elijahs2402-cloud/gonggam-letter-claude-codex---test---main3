import {
  getLetterById,
  transitionLetterStatus,
  updateLetter,
  type LetterStatus,
} from "./letters";
const isDevelopment =
  typeof window !== "undefined" &&
  /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);

export function setSampleLetterStatusForDevelopment(
  letterId: string,
  status: LetterStatus,
) {
  if (!isDevelopment || !letterId.startsWith("sample-")) return undefined;
  const current = getLetterById(letterId);
  if (!current) return undefined;
  const now = new Date().toISOString();
  if (status === "assigned")
    return transitionLetterStatus(letterId, status, "dev-reader", {
      assignedReaderId: "dev-reader",
      assignedAt: now,
    });
  if (status === "waiting_for_reply")
    return transitionLetterStatus(letterId, status, "dev-reader", {
      assignedReaderId: "dev-reader",
      assignedAt: current.assignedAt ?? now,
      readAt: now,
      waitingForReplyAt: now,
    });
  return transitionLetterStatus(letterId, status, "dev-tool");
}

export function ageLetterForDelayTest(letterId: string) {
  if (!isDevelopment) return undefined;
  const letter = getLetterById(letterId);
  if (!letter) return undefined;
  const agedAt = new Date(Date.now() - 61_000).toISOString();
  return updateLetter(letterId, { lastStatusChangedAt: agedAt });
}
