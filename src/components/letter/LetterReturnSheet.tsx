// 편지 두고 가기 확인 시트 (편지 읽기 · 두고 가기 화면이 함께 씀)
// 2026-09-18 src/pages/Safety/SafetyActionScreens.tsx 에서 옮겼다(코드 그대로).

// 두고 갈지 묻는 시트. 편지 읽기 화면 위에 그대로 얹히도록 화면이 아니라 컴포넌트로 뺐다.
// 뒤에 읽던 편지가 남아 있어야 '이 편지를' 이라는 말이 성립한다.
// 형태·모션은 앱에 이미 있는 임시저장 확인 시트(.draft-exit-*)를 그대로 쓴다.
export function LetterReturnSheet({
  onCancel,
  onConfirm,
}: {
  hasDraft: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="draft-exit-overlay return-confirm-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="return-confirm-title"
    >
      <section className="draft-exit-panel">
        <div className="draft-exit-copy">
          <h2 id="return-confirm-title">이 편지를 받지 않겠어요?</h2>
          <p>받지 않은 편지는 다시 확인할 수 없어요.</p>
        </div>
        <div className="draft-exit-actions">
          <button
            className="flow-primary-button"
            type="button"
            onClick={onCancel}
          >
            편지로 돌아가기
          </button>
          <button
            className="flow-secondary-button"
            type="button"
            onClick={onConfirm}
          >
            받지 않기
          </button>
        </div>
      </section>
    </div>
  );
}
