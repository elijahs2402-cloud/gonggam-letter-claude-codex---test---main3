// contentVisibility.ts 의 데이터 모양(타입). 2026-09-19 src/data/contentVisibility.ts 에서 옮겼다(내용 그대로).

export type HiddenContent = {
  userId: string;
  targetType: "letter" | "reply";
  targetId: string;
  createdAt: string;
};
