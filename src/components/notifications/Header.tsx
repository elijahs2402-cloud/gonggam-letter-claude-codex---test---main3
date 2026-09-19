// 알림 · 알림 설정 화면의 머리글
// 2026-09-18 src/pages/Notifications/NotificationScreens.tsx 에서 옮겼다(코드 그대로).
import { navigateBack } from "../../utils/navigation";

// headingTitle: 본문에 화면 제목(h1)이 없는 화면에서 켠다. 머리글 제목을 화면 낭독기가
// 화면 제목으로 읽는다. 글자 태그는 그대로 두어 보이는 모양은 바뀌지 않는다(2026-09-19 접근성 점검).
export function Header({
  headingTitle = false,
  title,
  fallback,
}: {
  title: string;
  fallback: string;
  headingTitle?: boolean;
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
      <strong
        role={headingTitle ? "heading" : undefined}
        aria-level={headingTitle ? 1 : undefined}
      >
        {title}
      </strong>
      <span aria-hidden="true" />
    </header>
  );
}
