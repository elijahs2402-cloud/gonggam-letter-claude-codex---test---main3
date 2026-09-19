// deliveryIssues.ts 의 데이터 모양(타입). 2026-09-19 src/data/deliveryIssues.ts 에서 옮겼다(내용 그대로).

export type DeliveryIssue = {
  id: string;
  userId: string;
  kind: "letter-send" | "reply-send";
  letterId?: string;
  createdAt: string;
  resolvedAt?: string;
};
