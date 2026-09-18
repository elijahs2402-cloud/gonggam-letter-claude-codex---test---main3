import {
  getMockAuthSnapshot,
  getOnboardingNextPath,
  isMockAuthenticated,
} from "../../data/mockAuth";
import { navigateTo } from "../../utils/navigation";
import { assetUrl } from "../../utils/basePath";
import { ROUTES } from "../../routes/paths";
// CSS Modules: 기존 전역 class 이름은 그대로 두고 모듈 class 를 함께 붙인다.
import intro from "./IntroScreen.module.css";

/** 인트로(/, /intro). 2026-09-17 App.tsx 에서 옮겨 왔다 — 내용은 그대로다. */
export function IntroScreen() {
  const auth = getMockAuthSnapshot();
  const handleEntry = () => {
    // 탈퇴한 사람은 처음 온 사람과 같다 — 약관도 이름도 다시 받아야 하므로
    // 로그인이 아니라 온보딩부터 시작한다.
    if (auth.state === "withdrawn") {
      navigateTo(ROUTES.onboarding);
      return;
    }
    if (isMockAuthenticated()) {
      navigateTo(ROUTES.home);
      return;
    }
    const nextOnboarding = getOnboardingNextPath();
    if (nextOnboarding && nextOnboarding !== ROUTES.login) {
      navigateTo(nextOnboarding);
      return;
    }
    // 로그아웃 상태면 신규·기존 모두 공감편지 소개부터 본다(2026-09-15 확정 흐름).
    // 소개의 '시작하기'는 신규회원용, '이미 이용하고 있어요'는 기존회원용 로그인으로 간다.
    navigateTo(ROUTES.onboarding);
  };
  return (
    <main className={`mobile-prototype intro-screen ${intro["intro-screen"]}`}>
      <img
        className={`intro-art ${intro["intro-art"]}`}
        src={assetUrl("/assets/intro-door-uploaded.webp")}
        alt="담쟁이덩굴이 감싼 보랏빛 현관문과 편지가 든 우편함"
      />
      <section
        className={`intro-copy ${intro["intro-copy"]}`}
        aria-labelledby="intro-title"
      >
        <p className={`intro-brand ${intro["intro-brand"]}`}>공감편지</p>
        <h1 id="intro-title">
          오늘도,
          <br />
          마음이 도착했습니다
        </h1>
        <p className={`intro-note ${intro["intro-note"]}`}>
          마음을 담은 편지가 조용히 머무는 곳
        </p>
      </section>
      <button
        className={`intro-cta ${intro["intro-cta"]}`}
        type="button"
        onClick={handleEntry}
      >
        마음의 문 열기
      </button>
    </main>
  );
}
