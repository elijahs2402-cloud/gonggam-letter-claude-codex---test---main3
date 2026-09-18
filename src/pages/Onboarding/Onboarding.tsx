// 공감편지 소개 (/onboarding)
// 2026-09-18 src/pages/Auth/AuthScreens.tsx 에서 옮겼다(코드 그대로).
import { navigateTo } from "../../utils/navigation";
import { assetUrl } from "../../utils/basePath";
import { ROUTES } from "../../routes/paths";
import { AuthShell, AuthHeader } from "../../components/auth/AuthShell";
// 공감편지 소개 CSS Modules: 기존 전역 class 이름은 그대로 두고 모듈 class 를 함께 붙인다.
import onboarding from "./Onboarding.module.css";
// CSS Modules: 기존 전역 class 이름은 그대로 두고 모듈 class 를 함께 붙인다.
import auth from "../../components/auth/Auth.module.css";

export function OnboardingScreen() {
  return (
    <AuthShell
      className={`onboarding-redesign-screen ${onboarding["onboarding-redesign-screen"]}`}
    >
      <AuthHeader title="공감편지 소개" />
      <div
        className={`auth-scroll onboarding-redesign-scroll ${onboarding["onboarding-redesign-scroll"]}`}
      >
        <section
          className={`onboarding-redesign-hero ${onboarding["onboarding-redesign-hero"]}`}
        >
          <p>이름 없이 오가는 한 통의 편지</p>
          <h1>
            오늘의 마음을
            <br />
            편지에 담아보세요
          </h1>
          <figure>
            <img
              src={assetUrl("/assets/onboarding-new-hero.webp")}
              alt="편지지와 보랏빛 펜, 봉투가 놓인 나무 책상"
            />
          </figure>
        </section>
        <section
          className={`onboarding-redesign-steps ${onboarding["onboarding-redesign-steps"]}`}
          aria-label="공감편지 이용 방법"
        >
          <article>
            <span>01</span>
            <div>
              <h2>이름을 밝히지 않아요</h2>
              <p>
                이름도 나이도 적지 않아요.
                <br />
                남는 건 오늘의 마음뿐이에요.
              </p>
            </div>
          </article>
          <article>
            <span>02</span>
            <div>
              <h2>한 사람이 끝까지 읽어요</h2>
              <p>
                한 통은 한 사람에게만 닿아요.
                <br />그 사람이 끝까지 읽고, 자신의 한 통으로 답해요.
              </p>
            </div>
          </article>
          <article>
            <span>03</span>
            <div>
              <h2>답장은 천천히 와요</h2>
              <p>
                바로 오지 않아요.
                <br />
                누군가 당신의 편지를 마주할 때까지 기다려요.
              </p>
            </div>
          </article>
          <article>
            <span>04</span>
            <div>
              <h2>좋은 편지만 오가도록 함께 지켜요</h2>
              <p>
                성의 없거나 상처가 되는 말은 신고될 수 있어요.
                <br />
                마음이 담긴 한 통이면 충분해요.
              </p>
            </div>
          </article>
          {/* 따로 떨어진 안내 박스였던 내용을 05번 항목으로 옮겼다(2026-09-15 사용자 요청). */}
          <article>
            <span>05</span>
            <div>
              <h2>전문 상담이나 진단을 제공하지 않아요</h2>
              <p>
                지금 바로 도움이 필요한 상황이라면
                <br />
                가까운 사람이나 전문적인 도움을 먼저 찾아주세요.
              </p>
            </div>
          </article>
        </section>
      </div>
      <footer
        className={`auth-actions auth-actions--stacked ${auth["auth-actions--stacked"]} onboarding-redesign-actions ${onboarding["onboarding-redesign-actions"]}`}
      >
        <button
          className="auth-primary"
          type="button"
          onClick={() => navigateTo(`${ROUTES.login}?new=1`)}
        >
          시작하기
        </button>
        <button
          className="auth-text-action"
          type="button"
          onClick={() => navigateTo(ROUTES.login)}
        >
          이미 이용하고 있어요
        </button>
      </footer>
    </AuthShell>
  );
}
