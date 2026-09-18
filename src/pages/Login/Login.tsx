// 로그인 (/login)
// 2026-09-18 src/pages/Auth/AuthScreens.tsx 에서 옮겼다(코드 그대로).
import { useEffect, useState } from "react";
import {
  beginMockLogin,
  getMockAuthSnapshot,
  resolveMockLogin,
  retryMockLogin,
  type MockAuthProvider,
} from "../../data/mockAuth";
import { navigateTo, replaceRoute } from "../../utils/navigation";
import { assetUrl } from "../../utils/basePath";
import { ROUTES } from "../../routes/paths";
import { AuthShell, AuthHeader } from "../../components/auth/AuthShell";
// 로그인 CSS Modules: 기존 전역 class 이름은 그대로 두고 모듈 class 를 함께 붙인다.
import login from "./Login.module.css";
// CSS Modules: 기존 전역 class 이름은 그대로 두고 모듈 class 를 함께 붙인다.
import auth from "../../components/auth/Auth.module.css";

const providerLabels: Record<MockAuthProvider, string> = {
  apple: "Apple로 계속하기",
  google: "Google로 계속하기",
  kakao: "토스로 계속하기",
};

const loginProviderOrder: MockAuthProvider[] = ["kakao", "google", "apple"];

export function LoginScreen() {
  const [snapshot, setSnapshot] = useState(getMockAuthSnapshot);
  const loggingIn = snapshot.state === "logging_in";
  const failed = snapshot.state === "login_failed";

  useEffect(() => {
    if (!loggingIn) return;
    const timer = window.setTimeout(() => {
      const result = resolveMockLogin();
      setSnapshot(result);
      if (result.state === "logged_in") replaceRoute(ROUTES.returningWelcome);
      else if (result.state === "new_user") replaceRoute(ROUTES.termsConsent);
    }, 760);
    return () => window.clearTimeout(timer);
  }, [loggingIn]);

  // 이 화면은 신규·기존이 함께 쓴다. 로그인 전이라 신규 여부를
  // 계정으로 알 수 없으므로, 들어온 경로로 판단한다 —
  // 온보딩의 '시작하기'만 ?new=1 을 붙여 보낸다.
  // '이미 이용하고 있어요'·직접 진입은 기존 문구를 본다.
  // 문구뿐 아니라 로그인 결과도 이 구분을 따른다(신규 → 약관, 기존 → 환영 → 홈).
  const isNewComer =
    new URLSearchParams(window.location.search).get("new") === "1";

  const start = (provider: MockAuthProvider) => {
    beginMockLogin(provider, isNewComer ? "new" : "existing");
    setSnapshot(getMockAuthSnapshot());
  };

  return (
    <AuthShell className="login-screen">
      <AuthHeader backTo={ROUTES.onboarding} />
      <div className="auth-scroll">
        <section
          className={`auth-intro-copy auth-intro-copy--login ${login["auth-intro-copy--login"]}`}
        >
          <p>이름 없이 오가는 한 통의 편지</p>
          {isNewComer ? (
            <h1>
              새로운 편지함을
              <br />
              만들게요
            </h1>
          ) : (
            <h1>
              로그인하여
              <br />
              편지를 이어가세요
            </h1>
          )}
          <p className="auth-helper">
            로그인 정보는 다른 사용자에게 보이지 않아요.
          </p>
        </section>

        {failed && (
          <section
            className={`auth-login-error ${login["auth-login-error"]}`}
            role="alert"
          >
            <strong>로그인하지 못했어요.</strong>
            <p>잠시 후 다시 시도해주세요.</p>
          </section>
        )}

        <section
          className={`auth-provider-list ${login["auth-provider-list"]}`}
          aria-label="로그인 방법"
        >
          {loginProviderOrder.map((provider) => (
            <button
              key={provider}
              className={`auth-provider-button ${login["auth-provider-button"]}`}
              type="button"
              disabled={loggingIn}
              onClick={() => start(provider)}
            >
              <span
                className={`auth-provider-mark auth-provider-mark--${provider} ${login["auth-provider-mark"]}`}
                aria-hidden="true"
              >
                <img
                  src={
                    provider === "apple"
                      ? assetUrl("/assets/logo-apple.webp")
                      : provider === "google"
                        ? assetUrl("/assets/logo-google.webp")
                        : assetUrl("/assets/logo-toss.webp")
                  }
                  alt=""
                />
              </span>
              {loggingIn && snapshot.pendingProvider === provider ? (
                <span
                  className={`auth-loading-copy ${login["auth-loading-copy"]}`}
                >
                  <i className={`auth-spinner ${login["auth-spinner"]}`} />
                  로그인하고 있어요.
                </span>
              ) : (
                providerLabels[provider]
              )}
            </button>
          ))}
        </section>

        {failed && (
          <div
            className={`auth-failure-actions ${login["auth-failure-actions"]}`}
          >
            <button
              type="button"
              className="auth-primary"
              onClick={() => {
                retryMockLogin();
                start("apple");
              }}
            >
              다시 시도
            </button>
            <button
              type="button"
              className={`auth-secondary ${auth["auth-secondary"]}`}
              onClick={() => {
                retryMockLogin();
                setSnapshot(getMockAuthSnapshot());
              }}
            >
              다른 방법으로 로그인
            </button>
            <button
              type="button"
              className="auth-text-action"
              onClick={() => navigateTo(ROUTES.intro)}
            >
              처음으로 돌아가기
            </button>
          </div>
        )}
      </div>
    </AuthShell>
  );
}
