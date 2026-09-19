// notifications.ts 의 데이터 모양(타입). 2026-09-19 src/data/notifications.ts 에서 옮겼다(내용 그대로).

/** Prototype-only in-app notification store. Replace with server + push APIs in production. */
export type MockNotificationType =
  | "reply_arrived"
  | "letter_assigned"
  | "reply_reminder"
  | "report_received"
  | "report_resolved";

export type MockNotification = {
  id: string;
  userId: string;
  type: MockNotificationType;
  title: string;
  message: string;
  targetType?: "letter" | "reply" | "report";
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
  updatedAt: string;
};
