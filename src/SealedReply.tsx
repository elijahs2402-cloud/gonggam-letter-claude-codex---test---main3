import { useEffect, useMemo, useRef, useState } from "react";
import {
  addSealedExcerpt,
  deleteSealedExcerpt,
  findOverlappingExcerpts,
  getSealedExcerptsByReplyId,
  replaceSealedExcerpt,
  resolveExcerptPosition,
  restoreSealedExcerpt,
  type SealedExcerpt,
} from "./sealedExcerpts";

type Selection = {
  text: string;
  start: number;
  end: number;
  top: number;
  left: number;
  right: number;
  bottom: number;
};
type Props = {
  letterId: string;
  replyId: string;
  ownerId: string;
  content: string;
  focusExcerptId?: string;
};

export function SealedReply({
  letterId,
  replyId,
  ownerId,
  content,
  focusExcerptId,
}: Props) {
  const root = useRef<HTMLElement>(null);
  const markerRefs = useRef(new Map<string, HTMLElement>());
  const [items, setItems] = useState<SealedExcerpt[]>(() =>
    getSealedExcerptsByReplyId(replyId, ownerId),
  );
  const [selection, setSelection] = useState<Selection>();
  const [notice, setNotice] = useState("");
  const [undo, setUndo] = useState<SealedExcerpt>();
  const [activeItem, setActiveItem] = useState<SealedExcerpt>();
  const [overlaps, setOverlaps] = useState<SealedExcerpt[]>([]);
  const [emphasisId, setEmphasisId] = useState<string>();
  const refresh = () => setItems(getSealedExcerptsByReplyId(replyId, ownerId));
  const positionedItems = useMemo(
    () =>
      items
        .map((item) => ({
          item,
          position: resolveExcerptPosition(content, item),
        }))
        .filter(
          (
            entry,
          ): entry is {
            item: SealedExcerpt;
            position: { startOffset: number; endOffset: number };
          } => Boolean(entry.position),
        )
        .sort((a, b) => a.position.startOffset - b.position.startOffset),
    [content, items],
  );

  useEffect(() => {
    refresh();
  }, [replyId, ownerId]);
  useEffect(() => {
    if (!focusExcerptId) return;
    window.setTimeout(() => jumpTo(focusExcerptId), 180);
  }, [focusExcerptId, positionedItems.length]);

  function capture() {
    const selected = window.getSelection();
    if (
      !selected ||
      selected.rangeCount === 0 ||
      selected.isCollapsed ||
      !root.current?.contains(selected.anchorNode) ||
      !root.current.contains(selected.focusNode)
    ) {
      setSelection(undefined);
      return;
    }
    const range = selected.getRangeAt(0);
    const text = selected.toString();
    const before = range.cloneRange();
    before.selectNodeContents(root.current);
    before.setEnd(range.startContainer, range.startOffset);
    const start = before.toString().length;
    const rect = range.getBoundingClientRect();
    const rootRect = root.current.getBoundingClientRect();
    if (!text.trim() || !rect.width) return;
    setSelection({
      text,
      start,
      end: start + text.length,
      top: rect.top - rootRect.top,
      left: rect.left - rootRect.left,
      right: rect.right - rootRect.left,
      bottom: rect.bottom - rootRect.top,
    });
  }
  function clearSelection() {
    setSelection(undefined);
    setOverlaps([]);
    window.getSelection()?.removeAllRanges();
  }
  function makeInput(selectionValue: Selection) {
    return {
      letterId,
      replyId,
      ownerId,
      text: selectionValue.text,
      startOffset: selectionValue.start,
      endOffset: selectionValue.end,
      prefixContext: content.slice(
        Math.max(0, selectionValue.start - 28),
        selectionValue.start,
      ),
      suffixContext: content.slice(selectionValue.end, selectionValue.end + 28),
    };
  }
  function save() {
    if (!selection) return;
    const matches = findOverlappingExcerpts(
      replyId,
      ownerId,
      selection.start,
      selection.end,
    );
    if (matches.length > 1) {
      setNotice("여러 문구와 겹쳐 있어요. 선택 범위를 조금 조절해보세요.");
      return;
    }
    if (matches.length === 1) {
      setOverlaps(matches);
      return;
    }
    const result = addSealedExcerpt(makeInput(selection));
    if (!result) {
      setNotice("한 답장에서 문구를 다섯 개까지 간직할 수 있어요.");
      return;
    }
    refresh();
    clearSelection();
    setNotice("마음에 남은 문구를 간직했어요.");
  }
  function replaceOverlap() {
    if (!selection || !overlaps[0]) return;
    if (replaceSealedExcerpt(overlaps[0].id, makeInput(selection))) {
      refresh();
      clearSelection();
      setNotice("마음에 남은 문구를 간직했어요.");
    }
  }
  function remove(item: SealedExcerpt) {
    if (deleteSealedExcerpt(item.id, ownerId)) {
      setUndo(item);
      setActiveItem(undefined);
      refresh();
      setNotice("간직한 문구를 지웠어요.");
    }
  }
  function jumpTo(id: string) {
    const target = markerRefs.current.get(id);
    if (!target) {
      setNotice("원문에서 이 문구의 위치를 찾지 못했어요.");
      return;
    }
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    setEmphasisId(id);
    window.setTimeout(() => setEmphasisId(undefined), 1500);
  }

  return (
    <section className="sealed-reply">
      <article
        ref={root}
        className="sealed-reply-body"
        onMouseUp={capture}
        onTouchEnd={() => window.setTimeout(capture, 0)}
        onScroll={clearSelection}
      >
        {renderMarked(
          content,
          positionedItems,
          markerRefs,
          setActiveItem,
          emphasisId,
        )}
        {selection && (
          <>
            <i
              className="seal-handle seal-handle--start"
              style={{ top: selection.top + 3, left: selection.left - 5 }}
            />
            <i
              className="seal-handle seal-handle--end"
              style={{ top: selection.bottom - 5, left: selection.right - 5 }}
            />
            <button
              className="seal-selection-button"
              style={{
                top: Math.max(-44, selection.top - 52),
                left: Math.max(0, selection.left),
              }}
              onPointerDown={(event) => event.preventDefault()}
              onClick={save}
            >
              간직하기
            </button>
          </>
        )}
      </article>
      <p className="sealed-guide">
        <span className="sealed-guide-mobile">
          마음에 남는 문구를 길게 눌러 간직해보세요.
        </span>
        <span className="sealed-guide-pc">
          마음에 남는 문구를 선택해 간직해보세요.
        </span>
      </p>
      {overlaps.length === 1 && (
        <div className="sealed-choice" role="dialog">
          <p>이미 간직한 문구와 겹쳐 있어요.</p>
          <button type="button" onClick={replaceOverlap}>
            새 범위로 바꾸기
          </button>
          <button type="button" onClick={clearSelection}>
            그대로 둘게요
          </button>
        </div>
      )}
      {activeItem && (
        <div className="sealed-marker-menu" role="dialog">
          <span>간직한 문구</span>
          <button type="button" onClick={() => remove(activeItem)}>
            간직하지 않기
          </button>
          <button type="button" onClick={() => setActiveItem(undefined)}>
            닫기
          </button>
        </div>
      )}
      {notice && (
        <p className="flow-notice" role="status">
          {notice}
        </p>
      )}
      <section className="sealed-list">
        <h2>
          이 답장에서 간직한 문구 <span>{items.length} / 5</span>
        </h2>
        {items.length ? (
          items.map((item) => (
            <div key={item.id}>
              <button type="button" onClick={() => jumpTo(item.id)}>
                {item.text}
              </button>
              <button type="button" onClick={() => remove(item)}>
                간직하지 않기
              </button>
            </div>
          ))
        ) : (
          <p>아직 간직한 문구가 없어요.</p>
        )}
      </section>
      {undo && (
        <div className="sealed-undo" role="status">
          간직한 문구를 지웠어요.
          <button
            type="button"
            onClick={() => {
              if (restoreSealedExcerpt(undo)) {
                refresh();
                setUndo(undefined);
              } else
                setNotice("한 답장에서는 문구를 다섯 개까지 간직할 수 있어요.");
            }}
          >
            되돌리기
          </button>
        </div>
      )}
    </section>
  );
}

function renderMarked(
  content: string,
  entries: {
    item: SealedExcerpt;
    position: { startOffset: number; endOffset: number };
  }[],
  refs: React.MutableRefObject<Map<string, HTMLElement>>,
  activate: (item: SealedExcerpt) => void,
  emphasisId?: string,
) {
  let position = 0;
  const parts: React.ReactNode[] = [];
  entries.forEach(({ item, position: resolved }) => {
    parts.push(content.slice(position, resolved.startOffset));
    position = resolved.endOffset;
    parts.push(
      <mark
        ref={(node) => {
          if (node) refs.current.set(item.id, node);
          else refs.current.delete(item.id);
        }}
        key={item.id}
        className={emphasisId === item.id ? "is-emphasized" : ""}
        onClick={() => activate(item)}
        title="간직한 문구"
      >
        {content.slice(resolved.startOffset, resolved.endOffset)}
      </mark>,
    );
  });
  parts.push(content.slice(position));
  return parts;
}
