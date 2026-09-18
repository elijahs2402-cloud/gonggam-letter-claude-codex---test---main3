// 편지 흐름 화면들이 함께 쓰는 틀(머리글 · 스크롤 영역 · 하단 버튼)
// 2026-09-18 src/pages/Letter/LetterFlowScreens.tsx 에서 옮겼다(코드 그대로).
import { navigateBack } from "../../utils/navigation";
import { ROUTES } from "../../routes/paths";

export function FocusShell({
  title,
  children,
  fallback,
  onBack,
  action,
  headerAction,
  hideBack = false,
  className = "",
  scrollClassName = "",
}: {
  title: string;
  children: React.ReactNode;
  fallback?: string;
  onBack?: () => void;
  action?: React.ReactNode;
  headerAction?: React.ReactNode;
  hideBack?: boolean;
  className?: string;
  scrollClassName?: string;
}) {
  return (
    <main className={`mobile-prototype letter-flow-screen ${className}`.trim()}>
      <header
        className={`flow-header${headerAction ? " flow-header--action" : ""}`}
      >
        {hideBack ? (
          <span aria-hidden="true" />
        ) : (
          <button
            type="button"
            onClick={onBack ?? (() => navigateBack(fallback ?? ROUTES.home))}
            aria-label="이전으로 돌아가기"
          >
            ←
          </button>
        )}
        <strong>{title}</strong>
        {headerAction ?? <span aria-hidden="true" />}
      </header>
      <div className={`letter-flow-scroll ${scrollClassName}`.trim()}>
        {children}
      </div>
      {action}
    </main>
  );
}
