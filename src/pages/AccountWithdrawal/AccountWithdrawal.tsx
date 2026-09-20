// 계정 삭제 (/account-withdrawal)
// 2026-09-18 src/pages/Account/AccountManagementScreens.tsx 에서 옮겼다(코드 그대로).
import { useState } from "react";
import { deleteMockAccount } from "../../data/mockAuth";
import { navigateTo, setPageTimeout } from "../../utils/navigation";
import { ListenEntryLoadingState } from "../../components/letter/ListenEntryLoadingState";
import { ROUTES } from "../../routes/paths";
import { Header } from "../../components/account/Header";
// CSS Modules 전환: 기존 전역 class 이름은 그대로 두고 모듈 class 를 함께 붙인다
// (전역에 남은 공유 규칙과 utils/navigation.ts 가 기존 이름을 쓴다).
import styles from "../../components/account/Account.module.css";
import { DETAIL_MAX_LENGTH } from "../../constants/limits";

// 2026-09-18 항목 확정. '기타'를 고르면 아래 입력칸이 열리고, 한 자 이상 써야 다음으로 간다.
const OTHER_REASON = "기타(직접 입력)";

const withdrawalReasons = [
  "더 이상 이용하지 않아요",
  "잠시 쉬고 싶어요",
  "사용이 불편했어요",
  "기대했던 서비스가 아니에요",
  OTHER_REASON,
];

export function AccountWithdrawalScreen() {
  const [step, setStep] = useState<"reason" | "confirm" | "processing">(
    "reason",
  );
  // 이유는 여러 개를 고를 수 있다(2026-09-18). 고른 순서를 그대로 둔다.
  const [reasons, setReasons] = useState<string[]>([]);
  const toggleReason = (item: string) =>
    setReasons((current) =>
      current.includes(item)
        ? current.filter((value) => value !== item)
        : [...current, item],
    );
  const [detail, setDetail] = useState("");
  const [transitionDirection, setTransitionDirection] = useState<
    "forward" | "back"
  >("forward");
  const finish = () => {
    setStep("processing");
    // 처리 중에 화면을 떠나면 계정을 지우지 않는다(문서를 새로 불러오던 때와 같게).
    setPageTimeout(() => {
      deleteMockAccount();
      navigateTo(ROUTES.withdrawalComplete);
    }, 1700);
  };
  const showConfirmation = () => {
    setTransitionDirection("forward");
    setStep("confirm");
  };
  const showReasons = () => {
    setTransitionDirection("back");
    setStep("reason");
  };

  // '편지를 조심스럽게 가져오고 있어요' 로딩 화면과 같은 틀을 쓴다.
  // 앱에 로딩 표현이 둘로 갈려 있었다 — 이쪽은 점 애니메이션 없이 글자만 있었다.
  // 껍데기·스크롤·로딩 컴포넌트를 그대로 재사용하므로 새 CSS 는 없다.
  if (step === "processing")
    return (
      <main className="mobile-prototype listen-entry-screen is-loading">
        <header className="flow-header listen-entry-topbar">
          <span aria-hidden="true" />
          <strong>계정 삭제</strong>
          <span aria-hidden="true" />
        </header>
        <div className="listen-entry-scroll">
          <ListenEntryLoadingState message="계정을 삭제하고 있어요" />
        </div>
      </main>
    );

  if (step === "reason")
    return (
      <main
        key="withdrawal-reason"
        className={`mobile-prototype account-settings-screen account-withdrawal-screen account-withdrawal-stage account-withdrawal-stage--${transitionDirection}`}
      >
        <Header title="계정 삭제" fallback={ROUTES.accountSettings} />
        <div className="my-detail-scroll account-withdrawal-reason-scroll">
          <section className={`subpage-heading ${styles["subpage-heading"]}`}>
            <h1>
              계정 삭제 이유를
              <br />
              모두 선택해주세요
            </h1>
          </section>
          <section
            className={`withdrawal-reasons ${styles["withdrawal-reasons"]}`}
            aria-label="계정 삭제 이유"
          >
            {withdrawalReasons.map((item) => {
              const selected = reasons.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  className={selected ? "is-selected" : ""}
                  aria-pressed={selected}
                  onClick={() => toggleReason(item)}
                >
                  {item}
                </button>
              );
            })}
          </section>
          {reasons.includes(OTHER_REASON) && (
            <label
              className={`account-textarea ${styles["account-textarea"]} account-withdrawal-textarea ${styles["account-withdrawal-textarea"]}`}
            >
              <span>
                삭제 이유를 작성해주세요.{" "}
                <i
                  className={styles["required-mark"]}
                  aria-label="필수 입력"
                  role="img"
                >
                  *
                </i>
              </span>
              <textarea
                value={detail}
                onChange={(event) => setDetail(event.target.value)}
                maxLength={DETAIL_MAX_LENGTH}
              />
              <small>
                {detail.length} / {DETAIL_MAX_LENGTH}
              </small>
            </label>
          )}
        </div>
        <div
          className={`flow-fixed-action flow-fixed-action--single account-withdrawal-fixed-action ${styles["account-withdrawal-fixed-action"]} account-withdrawal-reason-action`}
        >
          {/* 하나도 고르지 않으면 다음으로 갈 수 없다(2026-09-18). 건너뛰기는 없앴다.
              '기타'를 골랐다면 이유를 한 자 이상 써야 한다. */}
          <button
            className="flow-primary-button"
            onClick={showConfirmation}
            disabled={
              reasons.length === 0 ||
              (reasons.includes(OTHER_REASON) && detail.trim().length === 0)
            }
          >
            다음
          </button>
        </div>
      </main>
    );

  return (
    <main
      key="withdrawal-confirm"
      className={`mobile-prototype account-settings-screen account-withdrawal-screen account-withdrawal-stage account-withdrawal-stage--${transitionDirection}`}
    >
      <Header
        title="계정 삭제"
        fallback={ROUTES.accountSettings}
        onBack={showReasons}
      />
      <div className="my-detail-scroll account-withdrawal-scroll">
        <section
          className={`subpage-heading ${styles["subpage-heading"]} account-withdrawal-copy ${styles["account-withdrawal-copy"]}`}
        >
          <h1>계정을 삭제할까요?</h1>
          <p>
            계정이 삭제되면 기록된 모든 데이터가 완전히 삭제되며, 이후에는
            복구할 수 없어요.
          </p>
        </section>
      </div>
      <div
        className={`flow-fixed-action flow-fixed-action--single account-withdrawal-fixed-action ${styles["account-withdrawal-fixed-action"]}`}
      >
        <button
          className={`flow-primary-button is-danger-action ${styles["is-danger-action"]}`}
          onClick={finish}
        >
          삭제하기
        </button>
      </div>
    </main>
  );
}
