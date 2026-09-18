// 계정 관리 (/account-settings)
// 2026-09-18 src/pages/Account/AccountManagementScreens.tsx 에서 옮겼다(코드 그대로).
import { useState } from "react";
import { getMockAuthSnapshot, logoutMockAccount } from "../../data/mockAuth";
import { consumePopEntry, navigateTo } from "../../utils/navigation";
import { assetUrl } from "../../utils/basePath";
import { ROUTES } from "../../routes/paths";
import { Header } from "../../components/account/Header";
// CSS Modules 전환: 기존 전역 class 이름은 그대로 두고 모듈 class 를 함께 붙인다
// (전역에 남은 공유 규칙과 utils/navigation.ts 가 기존 이름을 쓴다).
import styles from "../../components/account/Account.module.css";

function providerName(provider?: string) {
  return provider === "apple"
    ? "Apple"
    : provider === "google"
      ? "Google"
      : provider === "kakao"
        ? "토스"
        : "연결된";
}

// 연결된 계정 아이콘. 내부 id 는 kakao 지만 화면 표기는 토스다(로그인 화면과 동일).
const providerIcons: Record<string, { src: string; alt: string }> = {
  apple: { src: assetUrl("/assets/account-provider-apple.svg"), alt: "Apple" },
  google: {
    src: assetUrl("/assets/account-provider-google.webp"),
    alt: "Google",
  },
  kakao: { src: assetUrl("/assets/account-provider-toss.webp"), alt: "토스" },
};

// 편지 쓰기 나가기 시트(.draft-exit-*)와 같은 하단 시트를 쓴다.
// 가운데 다이얼로그와 하단 시트가 섞여 있어 같은 앱에서 팝업이 두 가지로 보였다.
function Dialog({
  title,
  description,
  primary,
  onPrimary,
  secondary,
  onSecondary,
}: {
  title: string;
  description: string;
  primary: string;
  onPrimary: () => void;
  secondary: string;
  onSecondary: () => void;
}) {
  return (
    <div
      className="draft-exit-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-dialog-title"
    >
      <section className="draft-exit-panel">
        <div className="draft-exit-copy">
          <h2 id="account-dialog-title">{title}</h2>
          <p>{description}</p>
        </div>
        <div className="draft-exit-actions">
          <button
            className="flow-primary-button"
            type="button"
            onClick={onPrimary}
          >
            {primary}
          </button>
          <button
            className="flow-text-button"
            type="button"
            onClick={onSecondary}
          >
            {secondary}
          </button>
        </div>
      </section>
    </div>
  );
}

// stageClassName 은 나의 공간 셸이 이 화면을 자기 하위 뷰로 그릴 때 넘기는
// 전환 클래스다. 라우터로 직접 들어온 경우엔 비어 있고 기존 페이지 모션을 쓴다.
export function AccountSettingsScreen({
  stageClassName = "",
}: { stageClassName?: string } = {}) {
  const account = getMockAuthSnapshot().account;
  const [confirmLogout, setConfirmLogout] = useState(false);
  const logout = () => {
    logoutMockAccount();
    // 로그아웃하면 인트로로 간다(2026-09-15). 다시 들어올 때는 소개 → 기존회원용 로그인.
    navigateTo(ROUTES.intro);
  };
  const emailAddress =
    account?.authProvider === "apple"
      ? "vk7yws7m28@privaterelay.appleid.com"
      : account?.authProvider === "google"
        ? "gonggamletter@gmail.com"
        : account?.authProvider === "kakao"
          ? "gonggamletter@naver.com"
          : "이메일 정보는 저장하지 않아요";
  const connectedAccountName =
    account?.authProvider === "apple"
      ? "애플"
      : providerName(account?.authProvider);
  const providerKey = account?.authProvider ?? "unknown";
  // 모듈에는 apple·kakao 표시 규칙만 있다 — 그 밖의 값이면 모듈 class 를 붙이지 않는다.
  const providerMarkModule = styles[`account-provider-mark--${providerKey}`];
  // 계정 삭제 화면(이유 선택 단계)의 ← 로 돌아온 경우에만 pop-in 을 쓴다.
  const [enteredViaPop] = useState(consumePopEntry);

  return (
    <main
      className={`mobile-prototype account-settings-screen account-settings-screen--figma${enteredViaPop ? " is-popped-in" : ""}${stageClassName ? ` ${stageClassName}` : ""}`}
    >
      <Header title="계정 관리" />
      <div className="my-detail-scroll account-settings-scroll--figma">
        <section
          className={`account-settings-list--figma ${styles["account-settings-list--figma"]}`}
          aria-label="계정 관리 메뉴"
        >
          <div
            className={`account-settings-row ${styles["account-settings-row"]} account-settings-row--email ${styles["account-settings-row--email"]}`}
          >
            <span>
              <small>이메일</small>
              <strong>{emailAddress}</strong>
            </span>
          </div>
          <div
            className={`account-settings-row ${styles["account-settings-row"]} account-settings-row--provider ${styles["account-settings-row--provider"]}`}
          >
            <span>
              <small>연결된 계정</small>
              <strong>{connectedAccountName}</strong>
            </span>
            {providerIcons[account?.authProvider ?? ""] ? (
              <img
                className={`account-provider-icon ${styles["account-provider-icon"]}`}
                src={providerIcons[account!.authProvider].src}
                alt={providerIcons[account!.authProvider].alt}
              />
            ) : (
              <i
                className={`account-provider-mark ${styles["account-provider-mark"]} account-provider-mark--${providerKey}${providerMarkModule ? ` ${providerMarkModule}` : ""}`}
                aria-label={`${providerName(account?.authProvider)} 계정`}
              />
            )}
          </div>
          <button
            className={`account-settings-row ${styles["account-settings-row"]}`}
            type="button"
            onClick={() => setConfirmLogout(true)}
          >
            <span>
              <strong>로그아웃</strong>
            </span>
          </button>
          <button
            className={`account-settings-row ${styles["account-settings-row"]} account-settings-row--delete ${styles["account-settings-row--delete"]}`}
            type="button"
            onClick={() => navigateTo(ROUTES.accountWithdrawal)}
          >
            <span>
              <strong>계정 삭제</strong>
            </span>
            <i aria-hidden="true">›</i>
          </button>
        </section>
      </div>
      {confirmLogout && (
        <Dialog
          title="로그아웃할까요?"
          description="다음에 로그인해도, 남겨둔 편지를 다시 확인할 수 있어요."
          primary="로그아웃"
          onPrimary={logout}
          secondary="계속 이용하기"
          onSecondary={() => setConfirmLogout(false)}
        />
      )}
    </main>
  );
}
