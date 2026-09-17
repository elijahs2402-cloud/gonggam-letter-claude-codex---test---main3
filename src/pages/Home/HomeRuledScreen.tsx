import { useState } from "react";
import { AppBottomNavigation } from "../../components/common/AppBottomNavigation";
import { getCurrentAnonymousName } from "../../data/mockAuth";
import { getCurrentUserId } from "../../data/letters";
import { unreadNotificationCount } from "../../data/notifications";
import { navigateTo } from "../../utils/navigation";
import { getReadCardPath } from "../../data/waitingLetters";
import styles from "./HomeRuledScreen.module.css";
import refined from "./HomeRuledRefinedScreen.module.css";
// 홈 머리·소식 카드 CSS Modules(전역에서 옮김): 기존 전역 class 이름은 그대로 두고 모듈 class 를 함께 붙인다.
// 두 홈 모듈보다 뒤에 import 해야 원래(전역) 적용 순서가 유지된다 — HomeScreen.module.css 머리 주석 참고.
import home from "./HomeScreen.module.css";

// 피그마 168-316 시안(괘선 2단 + 어두운 골동품 가구)에 '옅은 면'을 더한 홈.
// 기존 /home 은 건드리지 않고 이 라우트에서만 비교한다.
//
// home-screen 클래스를 함께 붙이는 이유: 브랜드·인사말·알림 벨·스크롤 여백이
// 시안과 이미 같은 값이라(실측: 브랜드 x24/y22, 인사말 28px 세리프 x24/y96)
// 그 규칙들을 그대로 물려받고, 달라지는 부분만 home-ruled-screen 으로 덮는다.
//
// 시안과 다른 점이 하나 있다: 시안은 두 칸에 면이 없어 칸의 좌우 경계가
// 형태로 드러나지 않는다. 여기서는 칸 안쪽을 흰쪽으로 아주 조금 들어 올려
// '이 칸 전체가 하나'라는 것이 보이게 했다. 더 올리면 종이결이 죽는다
// (측정: 결 진폭 2.68 → 강하게 올리면 0.86 으로 3분의 1이 된다).

const CHOICES = [
  {
    key: "write",
    icon: "/assets/home-card-write.webp",
    title: ["내 마음을", "털어놓고 싶어요"],
    helper: ["익명의 편지", "남기기"],
    path: "/write-letter",
    label: "익명의 편지 남기기",
  },
  {
    key: "read",
    icon: "/assets/home-card-read.webp",
    title: ["누군가의 마음을", "들어주고 싶어요"],
    helper: ["천천히 읽고", "답하기"],
    path: "/listen-entry-a",
    label: "누군가의 편지를 천천히 읽고 답하기",
  },
] as const;

export function HomeRuledScreen({
  isRefined = false,
  refinedCardsOnly = false,
}: {
  isRefined?: boolean;
  refinedCardsOnly?: boolean;
}) {
  const useRefinedCards = isRefined || refinedCardsOnly;
  const [isScrolled, setIsScrolled] = useState(false);
  const userId = getCurrentUserId();
  const name = getCurrentAnonymousName();
  // 벨의 점은 벨을 눌렀을 때 열리는 알림 목록만 본다.
  // 예전에는 편지함 소식(getMailboxAttention)으로 켰는데, 알림 화면은
  // 그것과 아무 상관 없는 별도 저장소를 읽는다. 그래서 점을 보고 눌러도
  // '아직 새로운 알림이 없어요'만 나왔다.
  const hasUnreadNotifications = unreadNotificationCount(userId) > 0;
  const notice = getHomeNotice();
  return (
    <main
      className={`mobile-prototype home-screen home-ruled-screen ${home["home-screen"]} ${home["home-ruled-screen"]} ${styles.screen}${isRefined ? ` ${refined.screen}` : refinedCardsOnly ? ` ${refined.cardsOnly}` : ""}`}
    >
      <div
        className={`home-heading-top ${home["home-heading-top"]} ${styles.headingTop}${isScrolled ? ` ${styles.scrolled}` : ""}`}
      >
        <p className={`home-brand ${home["home-brand"]}`}>공감편지</p>
        <button
          className={`home-notification-button ${home["home-notification-button"]}`}
          type="button"
          onClick={() => navigateTo("/notifications")}
          aria-label={
            hasUnreadNotifications ? "알림, 확인이 필요한 새 소식 있음" : "알림"
          }
        >
          {hasUnreadNotifications && <i aria-hidden="true" />}
        </button>
      </div>

      {notice && (
        <aside
          className={`home-notice-card ${home["home-notice-card"]}`}
          role="status"
        >
          <button
            className={`home-notice-dismiss ${home["home-notice-dismiss"]}`}
            type="button"
            aria-label="소식 닫기"
            onClick={notice.onDismiss}
          >
            ×
          </button>
          <span className={`home-notice-copy ${home["home-notice-copy"]}`}>
            <strong>{notice.title}</strong>
            {notice.time && (
              <span
                className={`home-notice-countdown ${home["home-notice-countdown"]}${notice.isUrgent ? " is-over" : ""}`}
              >
                {notice.time}
              </span>
            )}
            {!notice.time && (
              <span
                className={`home-notice-countdown home-notice-countdown--placeholder ${home["home-notice-countdown"]} ${home["home-notice-countdown--placeholder"]}`}
                aria-hidden="true"
              >
                시간 여백
              </span>
            )}
          </span>
          <button
            className={`home-notice-action ${home["home-notice-action"]}`}
            type="button"
            onClick={notice.onAction}
          >
            {notice.action}
          </button>
        </aside>
      )}

      <div
        className={`home-scroll-region ${home["home-scroll-region"]} ${styles.scroll}${useRefinedCards ? ` ${refined.scroll}` : ""}`}
        onScroll={(event) => setIsScrolled(event.currentTarget.scrollTop > 4)}
      >
        <header className={`home-heading ${home["home-heading"]}`}>
          <h1>
            <em>{name}</em>님,
            <br />
            오늘은 어떤 마음인가요?
          </h1>
          <p className={`home-heading-helper ${home["home-heading-helper"]}`}>
            지금 마음이 향하는 쪽을 골라주세요.
          </p>
        </header>

        <section
          className={`${styles.choices}${useRefinedCards ? ` ${refined.choices}` : ""}`}
          aria-label="오늘의 선택"
        >
          {CHOICES.map((choice) => (
            <button
              key={choice.key}
              className={`${styles.choice}${useRefinedCards ? ` ${refined.choice}` : ""}`}
              type="button"
              aria-label={choice.label}
              onClick={() =>
                navigateTo(
                  choice.key === "read" ? getReadCardPath(userId) : choice.path,
                )
              }
            >
              {!useRefinedCards && (
                <img className={styles.icon} src={choice.icon} alt="" />
              )}
              <strong>
                {choice.title[0]}
                <br />
                {choice.title[1]}
              </strong>
              <span>
                {choice.helper[0]}
                <br />
                {choice.helper[1]}
              </span>
              <i className={styles.arrow} aria-hidden="true" />
            </button>
          ))}
        </section>

        {(isRefined || useRefinedCards) && (
          <div className={refined.scene} aria-hidden="true" />
        )}

        <p
          className={`${styles.footer} ${styles.scrollFooter}${useRefinedCards ? ` ${refined.footer}` : ""}`}
        >
          <img src="/assets/home-footer-star-divider1.svg" alt="" />
          <span>마음을 쓰고, 마음을 읽는 시간</span>
          <img src="/assets/home-footer-star-divider2.svg" alt="" />
        </p>
      </div>

      <p
        className={`${styles.footer} ${styles.fixedFooter}${useRefinedCards ? ` ${refined.hidden}` : ""}`}
      >
        <img src="/assets/home-footer-star-divider1.svg" alt="" />
        <span>마음을 쓰고, 마음을 읽는 시간</span>
        <img src="/assets/home-footer-star-divider2.svg" alt="" />
      </p>

      <AppBottomNavigation active="home" />
    </main>
  );
}

/** 홈 아래에 잠깐 뜨는 소식 카드의 내용.
 *  1차 오픈에서는 띄우지 않기로 해서 항상 null 을 돌려준다(2026-09-16).
 *  카드 자체(마크업·CSS)는 남겨 뒀다. 실제로 띄울 때는 여기서
 *  맡은 편지의 기한·답장 도착을 읽어 아래 모양으로 돌려주면 된다:
 *  { title: "맡은 편지에 답장을 전해주세요.", time: "1일 23:59:59 남음",
 *    isUrgent: false, action: "답장 쓰기", onAction, onDismiss }
 *  기한이 얼마 안 남았으면 isUrgent 를 켜서 시간을 주황색으로 보여준다. */
function getHomeNotice(): {
  title: string;
  time?: string;
  isUrgent?: boolean;
  action: string;
  onAction: () => void;
  onDismiss: () => void;
} | null {
  return null;
}
