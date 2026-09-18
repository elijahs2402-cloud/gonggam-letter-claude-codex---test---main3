// 편지 발송 완료 (/letter-sent)
// 2026-09-18 src/pages/Letter/LetterFlowScreens.tsx 에서 옮겼다(코드 그대로).
import { navigateTo } from "../../utils/navigation";
import { getLetterById } from "../../data/letters";
import { assetUrl } from "../../utils/basePath";
import { ROUTES } from "../../routes/paths";
import { FocusShell } from "../../components/letter/FocusShell";
import { MissingLetterScreen } from "../../components/letter/MissingLetterScreen";
// CSS Modules: 기존 전역 class 이름은 그대로 두고 모듈 class 를 함께 붙인다.
import flow from "../../components/letter/LetterFlow.module.css";

export function LetterSentScreen({ letterId }: { letterId?: string }) {
  const letter = letterId ? getLetterById(letterId) : undefined;
  if (!letter) return <MissingLetterScreen fallback={ROUTES.mailbox} />;
  return (
    <FocusShell title="발송 완료" fallback={ROUTES.home} hideBack>
      <section className={`flow-complete ${flow["flow-complete"]}`}>
        <img
          src={assetUrl("/assets/reply-sent-lavender-envelope.webp")}
          alt="봉인된 편지 봉투"
        />
        <h1>편지를 보냈어요</h1>
        <p>오늘 쓴 한 통이 누군가에게 가는 중이에요.</p>
        <div>
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
        </div>
      </section>
    </FocusShell>
  );
}
