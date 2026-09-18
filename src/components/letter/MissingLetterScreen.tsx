// 편지를 찾지 못했을 때 보여주는 화면
// 2026-09-18 src/pages/Letter/LetterFlowScreens.tsx 에서 옮겼다(코드 그대로).
import { navigateTo } from "../../utils/navigation";
import { ROUTES } from "../../routes/paths";
import { FocusShell } from "./FocusShell";

export function MissingLetterScreen({
  fallback = ROUTES.mailbox,
  title = "편지",
}: {
  fallback?: string;
  title?: string;
}) {
  return (
    <FocusShell title={title} fallback={fallback}>
      <section className="flow-message">
        <h1>편지를 찾을 수 없어요</h1>
        <p>다시 편지함에서 확인해주세요.</p>
        <button
          className="flow-primary-button"
          type="button"
          onClick={() => navigateTo(ROUTES.mailbox)}
        >
          편지함 가기
        </button>
        <button
          className="flow-text-button"
          type="button"
          onClick={() => navigateTo(ROUTES.home)}
        >
          홈으로 돌아가기
        </button>
      </section>
    </FocusShell>
  );
}
