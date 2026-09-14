export type UserBlock = {
  id: string;
  blockerUserId: string;
  blockedUserId: string;
  createdAt: string;
  source: "reply_report" | "letter_report" | "manual";
};
const KEY = "gonggam_blocks_v1";
const read = (): UserBlock[] => {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(value)
      ? value.filter((item): item is UserBlock =>
          Boolean(
            item &&
            typeof item === "object" &&
            typeof (item as UserBlock).blockerUserId === "string",
          ),
        )
      : [];
  } catch {
    return [];
  }
};
const write = (items: UserBlock[]) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
    return true;
  } catch {
    return false;
  }
};
export function blockUser(
  blockerUserId: string,
  blockedUserId: string,
  source: UserBlock["source"],
) {
  if (blockerUserId === blockedUserId) return undefined;
  const exists = read().find(
    (item) =>
      item.blockerUserId === blockerUserId &&
      item.blockedUserId === blockedUserId,
  );
  if (exists) return exists;
  const block = {
    id: `block-${crypto.randomUUID?.() ?? Date.now()}`,
    blockerUserId,
    blockedUserId,
    source,
    createdAt: new Date().toISOString(),
  };
  return write([block, ...read()]) ? block : undefined;
}
export function unblockUser(blockerUserId: string, blockedUserId: string) {
  return write(
    read().filter(
      (item) =>
        item.blockerUserId !== blockerUserId ||
        item.blockedUserId !== blockedUserId,
    ),
  );
}
export const isUserBlocked = (blockerUserId: string, targetId: string) =>
  read().some(
    (item) =>
      item.blockerUserId === blockerUserId && item.blockedUserId === targetId,
  );
export const getBlockedUsers = (userId: string) =>
  read().filter((item) => item.blockerUserId === userId);
