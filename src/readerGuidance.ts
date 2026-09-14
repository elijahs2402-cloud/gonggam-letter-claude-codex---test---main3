const KEY = "gonggam_reader_guidance_v1";
export const READER_GUIDANCE_VERSION = "2026-07-30";

type ReaderGuidance = { acceptedAt: string; version: string };

function read(): ReaderGuidance | undefined {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(KEY) ?? "null");
    return value &&
      typeof value === "object" &&
      typeof (value as ReaderGuidance).acceptedAt === "string" &&
      typeof (value as ReaderGuidance).version === "string"
      ? (value as ReaderGuidance)
      : undefined;
  } catch {
    return undefined;
  }
}

export function hasAcceptedReaderGuidance() {
  const value = read();
  return value?.version === READER_GUIDANCE_VERSION;
}
export function acceptReaderGuidance() {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        acceptedAt: new Date().toISOString(),
        version: READER_GUIDANCE_VERSION,
      }),
    );
    return true;
  } catch {
    return false;
  }
}
