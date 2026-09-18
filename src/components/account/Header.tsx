// 계정 화면들의 머리글
// 2026-09-18 src/pages/Account/AccountManagementScreens.tsx 에서 옮겼다(코드 그대로).
import { navigateBack } from "../../utils/navigation";
import { ROUTES } from "../../routes/paths";

export function Header({
  title,
  fallback = ROUTES.mySpace,
  onBack,
}: {
  title: string;
  fallback?: string;
  onBack?: () => void;
}) {
  return (
    <header className="flow-header">
      <button
        type="button"
        onClick={onBack ?? (() => navigateBack(fallback))}
        aria-label="이전으로 돌아가기"
      >
        ←
      </button>
      <strong>{title}</strong>
      <span />
    </header>
  );
}
