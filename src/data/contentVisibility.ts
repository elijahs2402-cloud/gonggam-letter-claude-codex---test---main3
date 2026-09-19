import type { HiddenContent } from "../types/contentVisibility";
const KEY = "gonggam_hidden_content_v1";
const read = (): HiddenContent[] => {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(value)
      ? value.filter((item): item is HiddenContent =>
          Boolean(
            item &&
            typeof item === "object" &&
            typeof (item as HiddenContent).userId === "string" &&
            typeof (item as HiddenContent).targetId === "string",
          ),
        )
      : [];
  } catch {
    return [];
  }
};
const write = (items: HiddenContent[]) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
    return true;
  } catch {
    return false;
  }
};
export const isContentHidden = (
  userId: string,
  targetType: HiddenContent["targetType"],
  targetId: string,
) =>
  read().some(
    (item) =>
      item.userId === userId &&
      item.targetType === targetType &&
      item.targetId === targetId,
  );
export const hideContent = (
  userId: string,
  targetType: HiddenContent["targetType"],
  targetId: string,
) =>
  isContentHidden(userId, targetType, targetId) ||
  write([
    { userId, targetType, targetId, createdAt: new Date().toISOString() },
    ...read(),
  ]);
export const revealContent = (
  userId: string,
  targetType: HiddenContent["targetType"],
  targetId: string,
) =>
  write(
    read().filter(
      (item) =>
        item.userId !== userId ||
        item.targetType !== targetType ||
        item.targetId !== targetId,
    ),
  );
export const hiddenContentStorageKey = KEY;
