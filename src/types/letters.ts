// letters.ts 의 데이터 모양(타입). 2026-09-19 src/data/letters.ts 에서 옮겼다(내용 그대로).

export type LetterStatus =
  | "submitted"
  | "waiting_for_reader"
  | "assigned"
  | "read"
  | "waiting_for_reply"
  | "replied"
  | "withdrawn";

export type LetterReply = {
  id: string;
  letterId: string;
  writerId: string;
  anonymousName?: string;
  content: string;
  createdAt: string;
  safetyStatus?: import("./safety").SafetyStatus;
  safetyReviewId?: string;
  moderationStatus?: import("./safety").ModerationStatus;
};

export type SealedSentence = {
  text: string;
  createdAt: string;
};

export type LetterStatusHistoryItem = {
  status: LetterStatus;
  changedAt: string;
  actorId?: string;
};

export type Letter = {
  id: string;
  senderId: string;
  anonymousName: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  status: LetterStatus;
  assignedReaderId?: string;
  assignedAt?: string;
  readAt?: string;
  waitingForReplyAt?: string;
  repliedAt?: string;
  withdrawnAt?: string;
  reply?: LetterReply;
  sealedSentence?: SealedSentence;
  retryCount: number;
  sourceDraftId?: string;
  lastRedistributedAt?: string;
  waitingExtendedAt?: string;
  replyOpenedAt?: string;
  statusHistory?: LetterStatusHistoryItem[];
  lastStatusChangedAt?: string;
  safetyStatus?: import("./safety").SafetyStatus;
  safetyReviewId?: string;
  moderationStatus?: import("./safety").ModerationStatus;
  returnCount?: number;
  lastReturnedAt?: string;
  lastReturnReason?: string;
  isPrototypeFixture?: boolean;
  prototypeScenario?: string;
  prototypeListScenario?: string;
  prototypeWaitingScenario?: string;
};

export type AssignLetterResult =
  | { ok: true; letter: Letter }
  | { ok: false; reason: "not-found" | "already-assigned" | "own-letter" };

export type SendReplyResult =
  | { ok: true; letter: Letter }
  | { ok: false; reason: "not-found" | "not-assigned" | "already-replied" };
