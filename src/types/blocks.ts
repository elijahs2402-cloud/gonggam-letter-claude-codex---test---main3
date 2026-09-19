// blocks.ts 의 데이터 모양(타입). 2026-09-19 src/data/blocks.ts 에서 옮겼다(내용 그대로).

export type UserBlock = {
  id: string;
  blockerUserId: string;
  blockedUserId: string;
  createdAt: string;
  source: "reply_report" | "letter_report" | "manual";
};
