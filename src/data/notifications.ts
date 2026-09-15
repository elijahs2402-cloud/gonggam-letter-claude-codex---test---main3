import { getCurrentUserId } from "./letters";

/** Prototype-only in-app notification store. Replace with server + push APIs in production. */
export type MockNotificationType =
  | "reply_arrived"
  | "letter_assigned"
  | "reply_reminder"
  | "report_received"
  | "report_resolved"
  | "service_notice";
export type MockNotification = {
  id: string;
  userId: string;
  type: MockNotificationType;
  title: string;
  message: string;
  targetType?: "letter" | "reply" | "report" | "notice";
  targetId?: string;
  targetRoute?: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
};
export type MockNotificationSettings = {
  userId: string;
  pushPermission: "not_requested" | "granted" | "denied";
  replyArrived: boolean;
  letterUpdates: boolean;
  replyReminders: boolean;
  safetyUpdates: boolean;
  serviceNotices: boolean;
  updatedAt: string;
};

const NOTIFICATIONS_KEY = "gonggam_mock_notifications_v1";
const SETTINGS_KEY = "gonggam_mock_notification_settings_v1";
const id = () =>
  `notice-${typeof crypto?.randomUUID === "function" ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`}`;
const storage = () =>
  typeof window !== "undefined" ? window.localStorage : undefined;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = storage()?.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  try {
    storage()?.setItem(key, JSON.stringify(value));
  } catch {
    /* local prototype storage may be unavailable */
  }
}

function valid(item: unknown): item is MockNotification {
  const notice = item as Partial<MockNotification>;
  return Boolean(
    notice &&
    typeof notice.id === "string" &&
    typeof notice.userId === "string" &&
    typeof notice.title === "string" &&
    typeof notice.message === "string" &&
    typeof notice.isRead === "boolean" &&
    typeof notice.createdAt === "string",
  );
}

export function getNotifications(userId = getCurrentUserId()) {
  return read<unknown[]>(NOTIFICATIONS_KEY, [])
    .filter(valid)
    .filter(
      (item) =>
        item.userId === userId &&
        (item as { type?: string }).type !== "letter_read",
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export function unreadNotificationCount(userId = getCurrentUserId()) {
  return getNotifications(userId).filter((item) => !item.isRead).length;
}
/** 알림 하나를 목록 맨 앞에 넣는다. 만들어진 알림은 언제나 '안 읽음'으로 시작한다. */
export function addNotification(
  input: Omit<MockNotification, "id" | "isRead" | "createdAt"> & {
    createdAt?: string;
  },
) {
  const notices = read<unknown[]>(NOTIFICATIONS_KEY, []).filter(valid);
  const notice: MockNotification = {
    ...input,
    id: id(),
    isRead: false,
    createdAt: input.createdAt ?? new Date().toISOString(),
  };
  write(NOTIFICATIONS_KEY, [notice, ...notices]);
  return notice;
}

/**
 * 같은 편지에 같은 종류의 알림이 이미 있는지 본다.
 *
 * 읽은 알림까지 함께 세는 것이 중요하다 — 읽었다고 다시 만들면
 * 앱을 열 때마다 같은 알림이 새로 쌓인다.
 */
export function hasNotificationFor(
  userId: string,
  type: MockNotificationType,
  targetId: string,
) {
  return read<unknown[]>(NOTIFICATIONS_KEY, [])
    .filter(valid)
    .some(
      (item) =>
        item.userId === userId &&
        item.type === type &&
        item.targetId === targetId,
    );
}

export function markNotificationRead(notificationId: string) {
  const notices = read<unknown[]>(NOTIFICATIONS_KEY, []).filter(valid);
  write(
    NOTIFICATIONS_KEY,
    notices.map((item) =>
      item.id === notificationId
        ? { ...item, isRead: true, readAt: new Date().toISOString() }
        : item,
    ),
  );
}
export function markAllNotificationsRead(userId = getCurrentUserId()) {
  const notices = read<unknown[]>(NOTIFICATIONS_KEY, []).filter(valid);
  write(
    NOTIFICATIONS_KEY,
    notices.map((item) =>
      item.userId === userId
        ? { ...item, isRead: true, readAt: new Date().toISOString() }
        : item,
    ),
  );
}

export function getNotificationSettings(
  userId = getCurrentUserId(),
): MockNotificationSettings {
  const values = read<MockNotificationSettings[]>(SETTINGS_KEY, []);
  const current = values.find((item) => item?.userId === userId);
  return (
    current ?? {
      userId,
      pushPermission: "not_requested",
      replyArrived: true,
      letterUpdates: true,
      replyReminders: true,
      safetyUpdates: true,
      serviceNotices: true,
      updatedAt: new Date().toISOString(),
    }
  );
}
export function updateNotificationSettings(
  changes: Partial<Omit<MockNotificationSettings, "userId" | "updatedAt">>,
  userId = getCurrentUserId(),
) {
  const current = getNotificationSettings(userId);
  const next = { ...current, ...changes, updatedAt: new Date().toISOString() };
  const all = read<MockNotificationSettings[]>(SETTINGS_KEY, []).filter(
    (item) => item?.userId !== userId,
  );
  write(SETTINGS_KEY, [next, ...all]);
  return next;
}
