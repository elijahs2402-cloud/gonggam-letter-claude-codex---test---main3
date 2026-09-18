// 편지를 찾는 동안 보여주는 점 물결 (여러 화면이 함께 씀)
// 2026-09-18 src/pages/Letter/ListenEntryVariants.tsx 에서 옮겼다(코드 그대로).
// 편지 고르기 CSS Modules: 기존 전역 class 이름은 그대로 두고 모듈 class 를 함께 붙인다.
import listen from "./ListenEntry.module.css";

export function ListenEntryLoadingState({
  message = "편지를 가져오고 있어요",
}: {
  message?: string;
}) {
  return (
    <section
      className={`listen-entry-feedback ${listen["listen-entry-feedback"]}`}
      aria-live="polite"
      aria-busy="true"
    >
      <div
        className={`listen-entry-loading-mark ${listen["listen-entry-loading-mark"]}`}
        aria-hidden="true"
      >
        <i className="draft-exit-saving-dots">
          <b />
          <b />
          <b />
        </i>
      </div>
      <h1>{message}</h1>
    </section>
  );
}
