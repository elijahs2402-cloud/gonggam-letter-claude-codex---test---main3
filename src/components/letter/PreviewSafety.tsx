// 보내기 전 점검: 걸린 표현 강조 · 안내 문구
// 2026-09-18 src/pages/Letter/LetterFlowScreens.tsx 에서 옮겼다(코드 그대로).
import { reviewLetterSafety } from "../../data/safety";
// CSS Modules: 기존 전역 class 이름은 그대로 두고 모듈 class 를 함께 붙인다.
import flow from "../../pages/Letter/LetterFlowScreens.module.css";

type PreviewSafetyMatch = ReturnType<
  typeof reviewLetterSafety
>["matches"][number];

export function HighlightedPreviewContent({
  content,
  matches,
}: {
  content: string;
  matches: PreviewSafetyMatch[];
}) {
  const ranges = matches
    .flatMap((match) =>
      match.startIndex === undefined || match.endIndex === undefined
        ? []
        : [{ start: match.startIndex, end: match.endIndex }],
    )
    .sort((left, right) => left.start - right.start)
    .reduce<Array<{ start: number; end: number }>>((merged, range) => {
      const previous = merged.at(-1);
      if (previous && range.start <= previous.end)
        previous.end = Math.max(previous.end, range.end);
      else merged.push(range);
      return merged;
    }, []);
  if (!ranges.length) return <>{content}</>;
  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  ranges.forEach((range, index) => {
    if (cursor < range.start) nodes.push(content.slice(cursor, range.start));
    nodes.push(
      <mark
        className={`preview-safety-highlight ${flow["preview-safety-highlight"]}`}
        key={`${range.start}-${range.end}-${index}`}
      >
        {content.slice(range.start, range.end)}
      </mark>,
    );
    cursor = range.end;
  });
  if (cursor < content.length) nodes.push(content.slice(cursor));
  return <>{nodes}</>;
}

export function PreviewSafetyWarning() {
  return (
    <aside
      className={`preview-safety-warning ${flow["preview-safety-warning"]}`}
      role="alert"
    >
      <strong>상대에게 상처가 될 수 있는 표현이 있어요.</strong>
      <span>안전을 위해 내용을 조금 다듬어주세요.</span>
    </aside>
  );
}
