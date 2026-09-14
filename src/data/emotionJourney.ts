export const EMOTIONS = [
  "기뻐요",
  "편안해요",
  "기대돼요",
  "뿌듯해요",
  "속상해요",
  "불안해요",
  "화가 나요",
  "복잡해요",
  "잘 모르겠어요",
] as const;
export const EMOTION_TYPES = ["positive", "difficult", "uncertain"] as const;
export const EMOTION_CHANGES = [
  "조금 가벼워졌어요",
  "처음과 비슷해요",
  "아직 더 복잡해요",
  "이 마음이 더 선명해졌어요",
  "다른 마음도 함께 떠올랐어요",
  "조금 알 것 같아요",
  "아직 잘 모르겠어요",
] as const;

export type Emotion = (typeof EMOTIONS)[number];
export type EmotionType = (typeof EMOTION_TYPES)[number];
export type EmotionChange = (typeof EMOTION_CHANGES)[number];
export type EmotionVisibility = "private" | "anonymous";
export type WritingMode = "free" | "guided";
export type AnswerMode =
  "selection" | "selection-with-text" | "custom" | "skipped";

export const EMOTION_TYPE_BY_EMOTION: Record<Emotion, EmotionType> = {
  기뻐요: "positive",
  편안해요: "positive",
  기대돼요: "positive",
  뿌듯해요: "positive",
  속상해요: "difficult",
  불안해요: "difficult",
  "화가 나요": "difficult",
  복잡해요: "difficult",
  "잘 모르겠어요": "uncertain",
};

export type EmotionJourney = {
  id: string;
  createdAt: string;
  emotion: Emotion | null;
  emotionType: EmotionType | null;
  emotionIntensity: number | null;
  weightBefore: number | null;
  title: string;
  content: string;
  anonymousName: string;
  changeAfter: EmotionChange | null;
  visibility: EmotionVisibility | null;
  status: "draft" | "saved" | "sent";
  writingMode: WritingMode;
  situationCategoryId: string;
  situationCategoryText: string;
  situationDetailId: string;
  situationDetailText: string;
  situationCustomText: string;
  situationAnswerMode: AnswerMode;
  additionalEmotionIds: string[];
  additionalEmotionTexts: string[];
  customEmotionText: string;
  emotionAnswerMode: AnswerMode;
  question3OptionId: string;
  question3OptionText: string;
  question3CustomText: string;
  question3AnswerMode: AnswerMode;
  question4OptionIds: string[];
  question4OptionTexts: string[];
  question4CustomText: string;
  question4AnswerMode: AnswerMode;
  currentGuidedStep: number;
  /* Legacy aliases retained for records created before this flow. */
  eventText: string;
  selectedEmotions: string[];
  coreConcern: string;
  coreConcernText: string;
  selectedNeeds: string[];
  needText: string;
};
export type EmotionRecord = Omit<
  EmotionJourney,
  "emotion" | "changeAfter" | "visibility"
> & {
  emotion: Emotion;
  changeAfter: EmotionChange;
  visibility: EmotionVisibility;
};
const ACTIVE_KEY = "gonggam-letter.emotion-journey.v1";
const RECORDS_KEY = "gonggam-letter.emotion-records.v1";
const validMode = (value: unknown): AnswerMode =>
  ["selection", "selection-with-text", "custom", "skipped"].includes(
    String(value),
  )
    ? (value as AnswerMode)
    : "skipped";
const text = (value: unknown) => (typeof value === "string" ? value : "");
const strings = (value: unknown, max = 2) =>
  Array.isArray(value)
    ? value
        .filter((item): item is string => typeof item === "string")
        .slice(0, max)
    : [];
function makeId() {
  return typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `emotion-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
function isEmotion(value: unknown): value is Emotion {
  return (
    typeof value === "string" && (EMOTIONS as readonly string[]).includes(value)
  );
}
function isChange(value: unknown): value is EmotionChange {
  return (
    typeof value === "string" &&
    (EMOTION_CHANGES as readonly string[]).includes(value)
  );
}
function intensity(value: unknown) {
  return typeof value === "number" && value >= 1 && value <= 5 ? value : null;
}
function normalizeJourney(value: unknown): EmotionJourney | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Partial<EmotionJourney>;
  const emotion = isEmotion(raw.emotion) ? raw.emotion : null;
  const legacyIntensity = intensity(raw.weightBefore);
  const currentIntensity = intensity(raw.emotionIntensity) ?? legacyIntensity;
  const eventText = text(raw.eventText);
  const selectedEmotions = strings(raw.selectedEmotions);
  const coreConcern = text(raw.coreConcern);
  const selectedNeeds = strings(raw.selectedNeeds);
  return {
    id: text(raw.id) || makeId(),
    createdAt: text(raw.createdAt) || new Date().toISOString(),
    emotion,
    emotionType: emotion ? EMOTION_TYPE_BY_EMOTION[emotion] : null,
    emotionIntensity: currentIntensity,
    weightBefore: legacyIntensity,
    title: text(raw.title),
    content: text(raw.content),
    anonymousName: text(raw.anonymousName) || "새벽구름",
    changeAfter: isChange(raw.changeAfter) ? raw.changeAfter : null,
    visibility:
      raw.visibility === "private" || raw.visibility === "anonymous"
        ? raw.visibility
        : null,
    status:
      raw.status === "saved" || raw.status === "sent" ? raw.status : "draft",
    writingMode: raw.writingMode === "guided" ? "guided" : "free",
    situationCategoryId: text(raw.situationCategoryId),
    situationCategoryText: text(raw.situationCategoryText),
    situationDetailId: text(raw.situationDetailId),
    situationDetailText: text(raw.situationDetailText) || eventText,
    situationCustomText: text(raw.situationCustomText),
    situationAnswerMode: validMode(raw.situationAnswerMode),
    additionalEmotionIds: strings(raw.additionalEmotionIds),
    additionalEmotionTexts: strings(raw.additionalEmotionTexts).length
      ? strings(raw.additionalEmotionTexts)
      : selectedEmotions,
    customEmotionText: text(raw.customEmotionText),
    emotionAnswerMode: validMode(raw.emotionAnswerMode),
    question3OptionId: text(raw.question3OptionId),
    question3OptionText: text(raw.question3OptionText) || coreConcern,
    question3CustomText:
      text(raw.question3CustomText) || text(raw.coreConcernText),
    question3AnswerMode: validMode(raw.question3AnswerMode),
    question4OptionIds: strings(raw.question4OptionIds),
    question4OptionTexts: strings(raw.question4OptionTexts).length
      ? strings(raw.question4OptionTexts)
      : selectedNeeds,
    question4CustomText: text(raw.question4CustomText) || text(raw.needText),
    question4AnswerMode: validMode(raw.question4AnswerMode),
    currentGuidedStep:
      typeof raw.currentGuidedStep === "number" &&
      raw.currentGuidedStep >= 1 &&
      raw.currentGuidedStep <= 4
        ? raw.currentGuidedStep
        : 1,
    eventText,
    selectedEmotions,
    coreConcern,
    coreConcernText: text(raw.coreConcernText),
    selectedNeeds,
    needText: text(raw.needText),
  };
}
function readJson(key: string): unknown {
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}
function writeJson(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
}
export function createEmotionJourney(): EmotionJourney {
  const journey = normalizeJourney({
    id: makeId(),
    createdAt: new Date().toISOString(),
  })!;
  writeJson(ACTIVE_KEY, journey);
  return journey;
}
export function readEmotionJourney() {
  return typeof window === "undefined"
    ? null
    : normalizeJourney(readJson(ACTIVE_KEY));
}
export function ensureEmotionJourney() {
  return readEmotionJourney() ?? createEmotionJourney();
}
export function updateEmotionJourney(patch: Partial<EmotionJourney>) {
  const current = ensureEmotionJourney();
  const next =
    normalizeJourney({
      ...current,
      ...patch,
      emotionType: patch.emotion
        ? EMOTION_TYPE_BY_EMOTION[patch.emotion]
        : current.emotionType,
    }) ?? current;
  writeJson(ACTIVE_KEY, next);
  return next;
}
export function clearEmotionJourney() {
  try {
    window.localStorage.removeItem(ACTIVE_KEY);
  } catch {
    /* no-op */
  }
}
export function hasGuidedAnswer(journey: EmotionJourney | null) {
  return Boolean(
    journey?.situationDetailText ||
    journey?.situationCustomText ||
    journey?.additionalEmotionTexts.length ||
    journey?.customEmotionText ||
    journey?.question3OptionText ||
    journey?.question3CustomText ||
    journey?.question4OptionTexts.length ||
    journey?.question4CustomText ||
    journey?.emotion,
  );
}
export function saveEmotionRecord(
  visibility: EmotionVisibility,
): EmotionRecord | null {
  const journey = readEmotionJourney();
  if (
    !journey?.emotion ||
    !journey.changeAfter ||
    (journey.writingMode === "guided"
      ? !hasGuidedAnswer(journey)
      : !journey.content.trim())
  )
    return null;
  const record: EmotionRecord = {
    ...journey,
    emotion: journey.emotion,
    changeAfter: journey.changeAfter,
    visibility,
    status: visibility === "anonymous" ? "sent" : "saved",
  };
  const stored = readJson(RECORDS_KEY);
  const records = Array.isArray(stored)
    ? stored.filter((item) => item && typeof item === "object")
    : [];
  writeJson(RECORDS_KEY, [
    record,
    ...records.filter((item) => (item as { id?: unknown }).id !== record.id),
  ]);
  writeJson(ACTIVE_KEY, record);
  return record;
}
export function getEmotionRecords(): EmotionRecord[] {
  const stored = readJson(RECORDS_KEY);
  return Array.isArray(stored)
    ? stored
        .map(normalizeJourney)
        .filter((item): item is EmotionRecord =>
          Boolean(item?.emotion && item.changeAfter && item.visibility),
        )
    : [];
}
export function getEmotionRecord(id: string | null) {
  return getEmotionRecords().find((record) => record.id === id) ?? null;
}
export function buildGuidedLetterDraft(journey: EmotionJourney) {
  const pieces: string[] = [];
  const situation = journey.situationCustomText || journey.situationDetailText;
  const feelings = [
    journey.emotion,
    ...journey.additionalEmotionTexts,
    journey.customEmotionText,
  ].filter(Boolean);
  const q3 = journey.question3CustomText || journey.question3OptionText;
  const q4 = [
    ...journey.question4OptionTexts,
    journey.question4CustomText,
  ].filter(Boolean);
  if (situation) pieces.push(`오늘 이런 일이 있었어요.\n\n${situation}`);
  if (feelings.length)
    pieces.push(`그때 저는 ${feelings.join(", ")}에 가까운 마음이 들었어요.`);
  if (q3)
    pieces.push(
      `${journey.emotionType === "positive" ? "특히 기억에 남는 건" : "가장 마음에 걸리는 건"} ${q3}`,
    );
  if (q4.length) pieces.push(`지금은 ${q4.join(", ")}`);
  return pieces.join("\n\n");
}
export function buildGuidedSummary(journey: EmotionJourney) {
  return buildGuidedLetterDraft(journey).replace(/\n+/g, " ").trim();
}
