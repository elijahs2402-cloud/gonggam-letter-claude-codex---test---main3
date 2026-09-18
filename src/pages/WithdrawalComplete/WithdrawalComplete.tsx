// 계정 삭제 완료 (/withdrawal-complete)
// 2026-09-18 src/pages/Account/AccountManagementScreens.tsx 에서 옮겼다(코드 그대로).
import { navigateTo } from "../../utils/navigation";
import { ROUTES } from "../../routes/paths";
// CSS Modules 전환: 기존 전역 class 이름은 그대로 두고 모듈 class 를 함께 붙인다
// (전역에 남은 공유 규칙과 utils/navigation.ts 가 기존 이름을 쓴다).
import styles from "../Account/AccountManagementScreens.module.css";

export function WithdrawalCompleteScreen() {
  return (
    <main className="mobile-prototype account-settings-screen">
      <section
        className={`account-processing ${styles["account-processing"]} account-processing--withdrawal-complete ${styles["account-processing--withdrawal-complete"]}`}
      >
        <h1>
          계정 삭제가
          <br />
          완료되었어요
        </h1>
        <p>함께한 편지들은 탈퇴와 함께 모두 사라져요.</p>
        <button
          className="flow-primary-button"
          onClick={() => navigateTo(ROUTES.intro)}
        >
          처음으로
        </button>
      </section>
    </main>
  );
}
