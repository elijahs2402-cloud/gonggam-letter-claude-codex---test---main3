// 가입·로그인 화면의 틀과 머리글
// 2026-09-18 src/pages/Auth/AuthScreens.tsx 에서 옮겼다(코드 그대로).
import { navigateBack } from "../../utils/navigation";
import { ROUTES } from "../../routes/paths";

export function AuthShell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main className={`mobile-prototype auth-screen ${className}`}>
      {children}
    </main>
  );
}

export function AuthHeader({
  backTo = ROUTES.intro,
  title = "공감편지",
}: {
  backTo?: string;
  title?: string;
}) {
  return (
    <header className="auth-header">
      <button
        type="button"
        onClick={() => navigateBack(backTo)}
        aria-label="이전 화면으로 돌아가기"
      >
        ←
      </button>
      <span>{title}</span>
      <i aria-hidden="true" />
    </header>
  );
}
