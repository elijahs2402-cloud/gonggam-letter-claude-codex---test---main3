// 만날 편지가 없을 때 (/listen-entry-empty)
// 2026-09-18 src/pages/Letter/ListenEntryVariants.tsx 에서 옮겼다(코드 그대로).
import { getCurrentUserId } from "../../data/letters";
import { getListenEntryPath } from "../../data/waitingLetters";
import { assetUrl } from "../../utils/basePath";
import { ROUTES } from "../../routes/paths";
import { goTo } from "../../utils/listenEntryGoTo";
import { ListenEntryHeader } from "../../components/letter/ListenEntryHeader";
// 편지 고르기 CSS Modules: 기존 전역 class 이름은 그대로 두고 모듈 class 를 함께 붙인다.
import listen from "../../components/letter/ListenEntry.module.css";

export function ListenEntryEmptyScreen() {
  return (
    <main className="mobile-prototype listen-entry-screen listen-entry-empty-screen">
      <ListenEntryHeader />
      <div
        className={`listen-entry-empty-content ${listen["listen-entry-empty-content"]}`}
      >
        <img
          className={`listen-entry-empty-art ${listen["listen-entry-empty-art"]}`}
          src={assetUrl("/assets/listen-entry-empty-background.webp")}
          alt="비어 있는 라벤더색 우편함"
        />
        <section
          className={`listen-entry-empty-copy ${listen["listen-entry-empty-copy"]}`}
          aria-live="polite"
        >
          <h1>
            지금은
            <br />
            기다리는 편지가
            <br />
            없어요
          </h1>
          <p>
            새로운 마음이 도착하면
            <br />
            이곳에서 만날 수 있어요.
          </p>
        </section>
      </div>
      <div
        className={`flow-fixed-action flow-fixed-action--split listen-entry-actions ${listen["listen-entry-actions"]} listen-entry-empty-actions ${listen["listen-entry-empty-actions"]}`}
      >
        <button
          type="button"
          className="flow-secondary-button"
          onClick={() => goTo(ROUTES.home)}
        >
          홈으로
        </button>
        <button
          type="button"
          className="flow-primary-button"
          onClick={() => goTo(getListenEntryPath(getCurrentUserId()))}
        >
          다시 확인하기
        </button>
      </div>
    </main>
  );
}
