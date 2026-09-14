export type SealedExcerpt = {
  id: string;
  letterId: string;
  replyId: string;
  ownerId: string;
  text: string;
  startOffset: number;
  endOffset: number;
  prefixContext?: string;
  suffixContext?: string;
  createdAt: string;
  updatedAt: string;
};

const KEY = "gonggam_sealed_excerpts_v1";
const bySourceOrder = (a: SealedExcerpt, b: SealedExcerpt) =>
  a.startOffset - b.startOffset || a.createdAt.localeCompare(b.createdAt);

function isExcerpt(value: unknown): value is SealedExcerpt {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<SealedExcerpt>;
  return (
    typeof item.id === "string" &&
    typeof item.letterId === "string" &&
    typeof item.replyId === "string" &&
    typeof item.ownerId === "string" &&
    typeof item.text === "string"
  );
}

function normalize(value: SealedExcerpt): SealedExcerpt {
  const startOffset =
    typeof value.startOffset === "number" ? value.startOffset : -1;
  const endOffset =
    typeof value.endOffset === "number"
      ? value.endOffset
      : startOffset < 0
        ? -1
        : startOffset + value.text.length;
  const createdAt =
    typeof value.createdAt === "string"
      ? value.createdAt
      : new Date(0).toISOString();
  return {
    ...value,
    startOffset,
    endOffset,
    createdAt,
    updatedAt:
      typeof value.updatedAt === "string" ? value.updatedAt : createdAt,
  };
}

const read = (): SealedExcerpt[] => {
  try {
    const data: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(data) ? data.filter(isExcerpt).map(normalize) : [];
  } catch {
    return [];
  }
};
const write = (items: SealedExcerpt[]) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
    return true;
  } catch {
    return false;
  }
};

export const getSealedExcerptsByReplyId = (replyId: string, ownerId: string) =>
  read()
    .filter((item) => item.replyId === replyId && item.ownerId === ownerId)
    .sort(bySourceOrder);
export const getSealedExcerptsByLetterId = (
  letterId: string,
  ownerId: string,
) =>
  read()
    .filter((item) => item.letterId === letterId && item.ownerId === ownerId)
    .sort(bySourceOrder);
export const getSealedExcerptsByUser = (ownerId: string) =>
  read()
    .filter((item) => item.ownerId === ownerId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
export const canAddSealedExcerpt = (replyId: string, ownerId: string) =>
  getSealedExcerptsByReplyId(replyId, ownerId).length < 5;
export const findOverlappingExcerpts = (
  replyId: string,
  ownerId: string,
  start: number,
  end: number,
) =>
  getSealedExcerptsByReplyId(replyId, ownerId).filter(
    (item) =>
      item.startOffset >= 0 && start < item.endOffset && end > item.startOffset,
  );

export function resolveExcerptPosition(
  content: string,
  excerpt: SealedExcerpt,
) {
  if (
    excerpt.startOffset >= 0 &&
    content.slice(excerpt.startOffset, excerpt.endOffset) === excerpt.text
  )
    return { startOffset: excerpt.startOffset, endOffset: excerpt.endOffset };
  const matches: number[] = [];
  let index = content.indexOf(excerpt.text);
  while (index >= 0) {
    matches.push(index);
    index = content.indexOf(excerpt.text, index + 1);
  }
  if (!matches.length) return undefined;
  const ranked = matches
    .map((startOffset) => {
      const before = content.slice(
        Math.max(0, startOffset - (excerpt.prefixContext?.length ?? 0)),
        startOffset,
      );
      const after = content.slice(
        startOffset + excerpt.text.length,
        startOffset +
          excerpt.text.length +
          (excerpt.suffixContext?.length ?? 0),
      );
      const score =
        (excerpt.prefixContext && before.endsWith(excerpt.prefixContext)
          ? 2
          : 0) +
        (excerpt.suffixContext && after.startsWith(excerpt.suffixContext)
          ? 2
          : 0);
      return {
        startOffset,
        endOffset: startOffset + excerpt.text.length,
        score,
      };
    })
    .sort((a, b) => b.score - a.score || a.startOffset - b.startOffset);
  return ranked[0];
}

export function addSealedExcerpt(
  input: Omit<SealedExcerpt, "id" | "createdAt" | "updatedAt">,
) {
  if (!canAddSealedExcerpt(input.replyId, input.ownerId)) return undefined;
  const now = new Date().toISOString();
  const excerpt: SealedExcerpt = {
    ...input,
    id: `excerpt-${crypto.randomUUID?.() ?? Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  return write([...read(), excerpt]) ? excerpt : undefined;
}

export function replaceSealedExcerpt(
  previousId: string,
  input: Omit<SealedExcerpt, "id" | "createdAt" | "updatedAt">,
) {
  const current = read();
  const previous = current.find(
    (item) => item.id === previousId && item.ownerId === input.ownerId,
  );
  if (!previous) return undefined;
  const now = new Date().toISOString();
  const next: SealedExcerpt = {
    ...input,
    id: previous.id,
    createdAt: previous.createdAt,
    updatedAt: now,
  };
  return write(current.map((item) => (item.id === previousId ? next : item)))
    ? next
    : undefined;
}

export function deleteSealedExcerpt(id: string, ownerId: string) {
  const current = read();
  const found = current.find(
    (item) => item.id === id && item.ownerId === ownerId,
  );
  return found && write(current.filter((item) => item.id !== id))
    ? found
    : undefined;
}
export function deleteSealedExcerptsByReply(replyId: string, ownerId: string) {
  const items = getSealedExcerptsByReplyId(replyId, ownerId);
  return write(
    read().filter(
      (item) => item.replyId !== replyId || item.ownerId !== ownerId,
    ),
  )
    ? items
    : [];
}
export function restoreSealedExcerpt(excerpt: SealedExcerpt) {
  return (
    canAddSealedExcerpt(excerpt.replyId, excerpt.ownerId) &&
    write([...read(), excerpt])
  );
}
