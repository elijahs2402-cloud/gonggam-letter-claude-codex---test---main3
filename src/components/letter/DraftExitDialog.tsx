// 쓰던 글이 있을 때 나가기 확인 대화상자
// 2026-09-18 src/pages/Letter/LetterFlowScreens.tsx 에서 옮겼다(코드 그대로).
// CSS Modules: 기존 전역 class 이름은 그대로 두고 모듈 class 를 함께 붙인다.
import flow from "../../pages/Letter/LetterFlowScreens.module.css";

export function DraftExitDialog({
  kind,
  onContinue,
  onSaveAndLeave,
  onDiscardAndLeave,
  isSaving = false,
}: {
  kind: "letter" | "reply";
  onContinue: () => void;
  onSaveAndLeave: () => void;
  onDiscardAndLeave: () => void;
  isSaving?: boolean;
}) {
  const isLetter = kind === "letter";
  return (
    <div
      className="draft-exit-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="draft-exit-title"
    >
      <section className="draft-exit-panel">
        <div className="draft-exit-copy">
          <h2 id="draft-exit-title">
            아직 보내지 않은 {isLetter ? "이야기가" : "답장이"} 있어요
          </h2>
          <p>작성한 내용은 임시로 보관할 수 있어요.</p>
        </div>
        <div className="draft-exit-actions">
          <button
            className="flow-primary-button"
            type="button"
            onClick={onContinue}
            disabled={isSaving}
          >
            이어서 쓰기
          </button>
          <button
            className={`flow-secondary-button draft-exit-save-button${isSaving ? ` is-saving ${flow["is-saving"]}` : ""}`}
            type="button"
            onClick={onSaveAndLeave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <span>보관 중</span>
                <i className="draft-exit-saving-dots" aria-label="보관 중">
                  <b />
                  <b />
                  <b />
                </i>
              </>
            ) : (
              "임시로 보관하고 나가기"
            )}
          </button>
          <button
            className="flow-text-button"
            type="button"
            onClick={onDiscardAndLeave}
            disabled={isSaving}
          >
            {isLetter ? "작성 내용" : "답장"} 지우고 나가기
          </button>
        </div>
      </section>
    </div>
  );
}
