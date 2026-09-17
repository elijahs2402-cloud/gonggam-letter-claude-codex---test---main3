import { getCurrentUserId } from "./letters";

export type DeliveryIssue = {
  id: string;
  userId: string;
  kind: "letter-send" | "reply-send";
  letterId?: string;
  createdAt: string;
  resolvedAt?: string;
};
const KEY = "gonggam_delivery_issues_v1";

function read(): DeliveryIssue[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is DeliveryIssue =>
      Boolean(
        item &&
        typeof item === "object" &&
        typeof (item as DeliveryIssue).id === "string" &&
        typeof (item as DeliveryIssue).userId === "string" &&
        ((item as DeliveryIssue).kind === "letter-send" ||
          (item as DeliveryIssue).kind === "reply-send"),
      ),
    );
  } catch {
    return [];
  }
}
function write(items: DeliveryIssue[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
    return true;
  } catch {
    return false;
  }
}
export function getOpenDeliveryIssues(userId = getCurrentUserId()) {
  return read()
    .filter((item) => item.userId === userId && !item.resolvedAt)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export function recordDeliveryIssue(
  kind: DeliveryIssue["kind"],
  letterId?: string,
  userId = getCurrentUserId(),
) {
  const prior = getOpenDeliveryIssues(userId).find(
    (item) => item.kind === kind && item.letterId === letterId,
  );
  if (prior) return prior;
  const issue = {
    id: `delivery-${crypto.randomUUID?.() ?? Date.now()}`,
    userId,
    kind,
    letterId,
    createdAt: new Date().toISOString(),
  };
  return write([issue, ...read()]) ? issue : undefined;
}
export function resolveDeliveryIssues(
  kind: DeliveryIssue["kind"],
  letterId?: string,
  userId = getCurrentUserId(),
) {
  const now = new Date().toISOString();
  return write(
    read().map((item) =>
      item.userId === userId &&
      item.kind === kind &&
      item.letterId === letterId &&
      !item.resolvedAt
        ? { ...item, resolvedAt: now }
        : item,
    ),
  );
}
