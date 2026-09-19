// 편지 신고 · 차단 및 신고 관리 화면의 틀
// 2026-09-18 src/pages/Safety/ReportScreens.tsx 에서 옮겼다(코드 그대로).
import { navigateBack } from "../../utils/navigation";
import { ROUTES } from "../../routes/paths";

// headingTitle: 본문에 화면 제목(h1)이 없는 화면에서 켠다. 머리글 제목을 화면 낭독기가
// 화면 제목으로 읽는다. 글자 태그는 그대로 두어 보이는 모양은 바뀌지 않는다(2026-09-19 접근성 점검).
export function Shell({
  headingTitle = false,
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
  headingTitle?: boolean;
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
        <strong
          role={headingTitle ? "heading" : undefined}
          aria-level={headingTitle ? 1 : undefined}
        >
          {title}
        </strong>
        <span />
      </header>
      <div className="letter-flow-scroll">{children}</div>
      {action}
    </main>
  );
}
