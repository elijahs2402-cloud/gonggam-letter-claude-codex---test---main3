// 편지 만나기 화면의 머리글
// 2026-09-18 src/pages/Letter/ListenEntryVariants.tsx 에서 옮겼다(코드 그대로).
import { navigateBack } from "../../utils/navigation";
import { ROUTES } from "../../routes/paths";

export function ListenEntryHeader() {
  return (
    <header className="flow-header listen-entry-topbar">
      <button
        type="button"
        onClick={() => navigateBack(ROUTES.home)}
        aria-label="이전으로 돌아가기"
      >
        <span aria-hidden="true">←</span>
      </button>
      <strong>편지 만나기</strong>
      <span aria-hidden="true" />
    </header>
  );
}
