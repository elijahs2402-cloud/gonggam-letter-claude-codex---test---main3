// 답장 신고 · 편지 두고 가기 화면의 틀
// 2026-09-18 src/pages/Safety/SafetyActionScreens.tsx 에서 옮겼다(코드 그대로).
import { navigateBack } from "../../utils/navigation";

// action 은 스크롤 밖 하단 고정 바다. 편지 신고 최종본(ReportScreens.tsx)의 Shell 과 같은 형태로 맞췄다.
export function Shell({
  title,
  children,
  fallback,
  action,
  showBackButton = true,
}: {
  title: string;
  children: React.ReactNode;
  fallback: string;
  action?: React.ReactNode;
  showBackButton?: boolean;
}) {
  return (
    <main className="mobile-prototype letter-flow-screen">
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
