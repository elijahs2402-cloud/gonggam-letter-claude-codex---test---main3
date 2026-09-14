import { getCurrentUserId, type LetterStatus } from "./letters";
import { shouldFailDraftOperation } from "../utils/draftDevTools";

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

const LETTER_DRAFTS_KEY = "gonggam_letter_drafts_v1";
const REPLY_DRAFTS_KEY = "gonggam_reply_drafts_v1";
const LEGACY_LETTER_DRAFT_KEY = "gonggam_letter_draft_v1";

function makeId(prefix: string) {
  const value =
    typeof crypto?.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${value}`;
}

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function asObject(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function isStage(value: unknown): value is DraftStage {
  return value === "writing" || value === "review";
}

function normalizeLetterDraft(
  value: unknown,
  fallbackUserId?: string,
): LetterDraft | undefined {
  const data = asObject(value);
  if (!data || typeof data.content !== "string") return undefined;
  const now = new Date().toISOString();
  const userId =
    typeof data.userId === "string" && data.userId
      ? data.userId
      : fallbackUserId;
  if (!userId) return undefined;
  return {
    id:
      typeof data.id === "string" && data.id ? data.id : makeId("letter-draft"),
    userId,
    content: data.content,
    anonymousName:
      typeof data.anonymousName === "string" ? data.anonymousName : "",
    createdAt: typeof data.createdAt === "string" ? data.createdAt : now,
    updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : now,
    stage: isStage(data.stage) ? data.stage : "writing",
    source: "new-letter",
    lastSafetyReviewId:
      typeof data.lastSafetyReviewId === "string"
        ? data.lastSafetyReviewId
        : undefined,
    lastSafetyStatus:
      typeof data.lastSafetyStatus === "string"
        ? data.lastSafetyStatus
        : undefined,
    lastSafetyCheckedAt:
      typeof data.lastSafetyCheckedAt === "string"
        ? data.lastSafetyCheckedAt
        : undefined,
  };
}

function normalizeReplyDraft(value: unknown): ReplyDraft | undefined {
  const data = asObject(value);
  if (
    !data ||
    typeof data.content !== "string" ||
    typeof data.letterId !== "string" ||
    typeof data.writerId !== "string"
  )
    return undefined;
  const now = new Date().toISOString();
  return {
    id:
      typeof data.id === "string" && data.id ? data.id : makeId("reply-draft"),
    letterId: data.letterId,
    writerId: data.writerId,
    content: data.content,
    createdAt: typeof data.createdAt === "string" ? data.createdAt : now,
    updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : now,
    stage: isStage(data.stage) ? data.stage : "writing",
    letterStatusAtSave:
      typeof data.letterStatusAtSave === "string"
        ? (data.letterStatusAtSave as LetterStatus)
        : undefined,
    lastSafetyReviewId:
      typeof data.lastSafetyReviewId === "string"
        ? data.lastSafetyReviewId
        : undefined,
    lastSafetyStatus:
      typeof data.lastSafetyStatus === "string"
        ? data.lastSafetyStatus
        : undefined,
    lastSafetyCheckedAt:
      typeof data.lastSafetyCheckedAt === "string"
        ? data.lastSafetyCheckedAt
        : undefined,
  };
}

export function safeParseDraftStorage<T>(
  key: string,
  normalize: (value: unknown) => T | undefined,
) {
  if (!canUseStorage()) return [] as T[];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [] as T[];
    const parsed: unknown = JSON.parse(raw);
    const values = Array.isArray(parsed) ? parsed : [parsed];
    return values.map(normalize).filter((value): value is T => Boolean(value));
  } catch {
    return [] as T[];
  }
}

function writeList<T>(key: string, values: T[]) {
  if (!canUseStorage()) return false;
  try {
    if (
      (key === LETTER_DRAFTS_KEY && shouldFailDraftOperation("letter-save")) ||
      (key === REPLY_DRAFTS_KEY && shouldFailDraftOperation("reply-save"))
    )
      throw new Error("development draft failure");
    window.localStorage.setItem(key, JSON.stringify(values));
    return true;
  } catch (error) {
    console.warn("Draft storage write failed", error);
    return false;
  }
}

function getLetterDrafts() {
  const userId = getCurrentUserId();
  const drafts = safeParseDraftStorage(LETTER_DRAFTS_KEY, (value) =>
    normalizeLetterDraft(value, userId),
  );
  if (drafts.length) return drafts;
  // One-time recovery of the 1B session draft, without changing legacy screens.
  try {
    const legacy = window.sessionStorage.getItem(LEGACY_LETTER_DRAFT_KEY);
    const recovered = legacy
      ? normalizeLetterDraft(JSON.parse(legacy), userId)
      : undefined;
    if (recovered) {
      writeList(LETTER_DRAFTS_KEY, [recovered]);
      return [recovered];
    }
  } catch {
    /* ignore unusable legacy data */
  }
  return drafts;
}

function getReplyDraftList() {
  return safeParseDraftStorage(REPLY_DRAFTS_KEY, normalizeReplyDraft);
}

export function getLetterDraft(userId = getCurrentUserId()) {
  return getLetterDrafts()
    .filter((draft) => draft.userId === userId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
}

export function saveLetterDraft(draft: LetterDraft) {
  const current = getLetterDrafts();
  const latest = current.find((item) => item.userId === draft.userId);
  if (latest && latest.updatedAt > draft.updatedAt) return false;
  return writeList(LETTER_DRAFTS_KEY, [
    draft,
    ...current.filter((item) => item.userId !== draft.userId),
  ]);
}

export function updateLetterDraft(
  userId: string,
  changes: Partial<
    Pick<
      LetterDraft,
      | "content"
      | "anonymousName"
      | "stage"
      | "lastSafetyReviewId"
      | "lastSafetyStatus"
      | "lastSafetyCheckedAt"
    >
  >,
) {
  const current = getLetterDraft(userId);
  const now = new Date().toISOString();
  const draft: LetterDraft = {
    id: current?.id ?? makeId("letter-draft"),
    userId,
    content: changes.content ?? current?.content ?? "",
    anonymousName: changes.anonymousName ?? current?.anonymousName ?? "",
    stage: changes.stage ?? current?.stage ?? "writing",
    lastSafetyReviewId:
      changes.lastSafetyReviewId ?? current?.lastSafetyReviewId,
    lastSafetyStatus: changes.lastSafetyStatus ?? current?.lastSafetyStatus,
    lastSafetyCheckedAt:
      changes.lastSafetyCheckedAt ?? current?.lastSafetyCheckedAt,
    source: "new-letter",
    createdAt: current?.createdAt ?? now,
    updatedAt: now,
  };
  return saveLetterDraft(draft) ? draft : undefined;
}

export function deleteLetterDraft(userId = getCurrentUserId()) {
  return writeList(
    LETTER_DRAFTS_KEY,
    getLetterDrafts().filter((draft) => draft.userId !== userId),
  );
}
export function hasMeaningfulLetterDraft(userId = getCurrentUserId()) {
  return Boolean(getLetterDraft(userId)?.content.trim());
}

export function getReplyDraft(letterId: string, writerId = getCurrentUserId()) {
  return getReplyDraftList()
    .filter(
      (draft) => draft.letterId === letterId && draft.writerId === writerId,
    )
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
}

export function saveReplyDraft(draft: ReplyDraft) {
  const current = getReplyDraftList();
  const latest = current.find(
    (item) =>
      item.letterId === draft.letterId && item.writerId === draft.writerId,
  );
  if (latest && latest.updatedAt > draft.updatedAt) return false;
  return writeList(REPLY_DRAFTS_KEY, [
    draft,
    ...current.filter(
      (item) =>
        item.letterId !== draft.letterId || item.writerId !== draft.writerId,
    ),
  ]);
}

export function updateReplyDraft(
  letterId: string,
  writerId: string,
  changes: Partial<
    Pick<
      ReplyDraft,
      | "content"
      | "stage"
      | "letterStatusAtSave"
      | "lastSafetyReviewId"
      | "lastSafetyStatus"
      | "lastSafetyCheckedAt"
    >
  >,
) {
  const current = getReplyDraft(letterId, writerId);
  const now = new Date().toISOString();
  const draft: ReplyDraft = {
    id: current?.id ?? makeId("reply-draft"),
    letterId,
    writerId,
    content: changes.content ?? current?.content ?? "",
    stage: changes.stage ?? current?.stage ?? "writing",
    letterStatusAtSave:
      changes.letterStatusAtSave ?? current?.letterStatusAtSave,
    lastSafetyReviewId:
      changes.lastSafetyReviewId ?? current?.lastSafetyReviewId,
    lastSafetyStatus: changes.lastSafetyStatus ?? current?.lastSafetyStatus,
    lastSafetyCheckedAt:
      changes.lastSafetyCheckedAt ?? current?.lastSafetyCheckedAt,
    createdAt: current?.createdAt ?? now,
    updatedAt: now,
  };
  return saveReplyDraft(draft) ? draft : undefined;
}

export function deleteReplyDraft(
  letterId: string,
  writerId = getCurrentUserId(),
) {
  return writeList(
    REPLY_DRAFTS_KEY,
    getReplyDraftList().filter(
      (draft) => draft.letterId !== letterId || draft.writerId !== writerId,
    ),
  );
}
export function getReplyDraftsByWriter(writerId = getCurrentUserId()) {
  return getReplyDraftList().filter((draft) => draft.writerId === writerId);
}
export function hasMeaningfulReplyDraft(
  letterId: string,
  writerId = getCurrentUserId(),
) {
  return Boolean(getReplyDraft(letterId, writerId)?.content.trim());
}
export function isDraftRecoverable(
  draft: LetterDraft | ReplyDraft | undefined,
) {
  return Boolean(draft?.content.trim());
}
export function clearInvalidDraft() {
  /* Draft normalization already omits unrecoverable records; keep storage untouched unless a future policy requires cleanup. */
}

// Compatibility names used by 1B flow. They now persist to localStorage.
export function clearLetterDraft() {
  return deleteLetterDraft();
}
export function clearReplyDraft(
  letterId: string,
  writerId = getCurrentUserId(),
) {
  return deleteReplyDraft(letterId, writerId);
}
export const draftStorageKeys = {
  letter: LETTER_DRAFTS_KEY,
  reply: REPLY_DRAFTS_KEY,
} as const;
