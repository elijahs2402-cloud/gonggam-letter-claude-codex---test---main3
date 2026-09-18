// 나의 공간 안내 화면들의 머리글
// 2026-09-18 src/pages/MySpace/MySpaceDetails.tsx 에서 옮겼다(코드 그대로).
import { navigateBack } from "../../utils/navigation";
import { ROUTES } from "../../routes/paths";

export function Header({
  title,
  fallback = ROUTES.mySpace,
}: {
  title: string;
  fallback?: string;
}) {
  return (
    <header className="flow-header">
      <button
        type="button"
        onClick={() => navigateBack(fallback)}
        aria-label="이전으로 돌아가기"
      >
        ←
      </button>
      <strong>{title}</strong>
      <span />
    </header>
  );
}
