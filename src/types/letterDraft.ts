// letterDraft.ts 의 데이터 모양(타입). 2026-09-19 src/data/letterDraft.ts 에서 옮겼다(내용 그대로).
import type { LetterStatus } from "./letters";

export type DraftStage = "writing" | "review";

export type LetterDraft = {
  id: string;
  userId: string;
  content: string;
  anonymousName?: string;
  createdAt: string;
  updatedAt: string;
  stage: DraftStage;
  source: "new-letter";
  lastSafetyReviewId?: string;
  lastSafetyStatus?: string;
  lastSafetyCheckedAt?: string;
};

export type ReplyDraft = {
  id: string;
  letterId: string;
  writerId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  stage: DraftStage;
  letterStatusAtSave?: LetterStatus;
  lastSafetyReviewId?: string;
  lastSafetyStatus?: string;
  lastSafetyCheckedAt?: string;
};
