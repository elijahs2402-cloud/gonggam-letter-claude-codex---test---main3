// 편지 신고 · 차단 및 신고 관리 화면의 틀
// 2026-09-18 src/pages/Safety/ReportScreens.tsx 에서 옮겼다(코드 그대로).
import { navigateBack } from "../../utils/navigation";
import { ROUTES } from "../../routes/paths";

export function Shell({
  title,
  children,
  fallback = ROUTES.home,
  action,
  screenClassName = "",
  showBackButton = true,
}: {
  title: string;
  children: React.ReactNode;
  fallback?: string;
  action?: React.ReactNode;
  screenClassName?: string;
  showBackButton?: boolean;
}) {
  return (
    <main className={`mobile-prototype letter-flow-screen ${screenClassName}`}>
      <header className="flow-header">
        {showBackButton ? (
          <button
            type="button"
            onClick={() => navigateBack(fallback)}
            aria-label="이전으로 돌아가기"
          >
            ←
          </button>
        ) : (
          <span aria-hidden="true" />
        )}
        <strong>{title}</strong>
        <span />
      </header>
      <div className="letter-flow-scroll">{children}</div>
      {action}
    </main>
  );
}
