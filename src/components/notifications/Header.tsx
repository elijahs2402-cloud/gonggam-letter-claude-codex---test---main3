// 알림 · 알림 설정 화면의 머리글
// 2026-09-18 src/pages/Notifications/NotificationScreens.tsx 에서 옮겼다(코드 그대로).
import { navigateBack } from "../../utils/navigation";

export function Header({
  title,
  fallback,
}: {
  title: string;
  fallback: string;
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
      <span aria-hidden="true" />
    </header>
  );
}
