// 나의 이름 (/anonymous-name-settings)
// 2026-09-18 src/pages/MySpace/MySpaceDetails.tsx 에서 옮겼다(코드 그대로).
import { useState } from "react";
import {
  generateAnonymousName,
  getCurrentAnonymousName,
  updateAnonymousName,
} from "../../data/mockAuth";
import { navigateBack } from "../../utils/navigation";
import { ROUTES } from "../../routes/paths";
// 이름 바꾸기 CSS Modules: 기존 전역 class 이름은 그대로 두고 모듈 class 를 함께 붙인다.
import nameSettings from "./AnonymousNameSettings.module.css";

export function AnonymousNameSettingsScreen({
  stageClassName = "",
}: { stageClassName?: string } = {}) {
  const [current, setCurrent] = useState(getCurrentAnonymousName());
  const [name, setName] = useState(current);
  const [confirm, setConfirm] = useState(false);
  const [failed, setFailed] = useState(false);
  const [toast, setToast] = useState("");
  const [isToastLeaving, setIsToastLeaving] = useState(false);
  const canSubmit = Boolean(name.trim());
  const suggestRandom = () => {
    setName(generateAnonymousName(current));
    setFailed(false);
  };
  const save = () => {
    const finalized = name.trim();
    if (!finalized) {
      setFailed(true);
      return;
    }
    const account = updateAnonymousName(finalized);
    if (!account) {
      setFailed(true);
      return;
    }
    const updatedName = account.anonymousName ?? finalized;
    setCurrent(updatedName);
    setName(updatedName);
    setConfirm(false);
    setToast("나의 이름을 바꿨어요.");
    setIsToastLeaving(false);
    window.setTimeout(() => setIsToastLeaving(true), 3000);
  };
  return (
    <main
      className={`mobile-prototype auth-screen nef-screen${stageClassName ? ` ${stageClassName}` : ""}`}
    >
      {toast && (
        <p
          className={`home-draft-saved-toast ${nameSettings["home-draft-saved-toast"]}${isToastLeaving ? " is-leaving" : ""}`}
          role="status"
          aria-live="polite"
          onAnimationEnd={() => {
            if (isToastLeaving) setToast("");
          }}
        >
          {toast}
        </p>
      )}
      <header className="auth-header">
        <button
          type="button"
          onClick={() => navigateBack(ROUTES.mySpace)}
          aria-label="이전 화면으로 돌아가기"
        >
          ←
        </button>
        <span>나의 이름</span>
        <i aria-hidden="true" />
      </header>
      <div className={`auth-scroll nef-scroll ${nameSettings["nef-scroll"]}`}>
        {/* 헤더가 "나의 이름", 대제목이 "이름 바꾸기"로 둘 다 라벨이라
        말을 거는 느낌이 없었다. 같은 일을 하는 이름 정하기
        ("나를 부를 이름을 정해볼까요?")와 같은 어투로 맞춘다. */}
        {/* 대제목을 두 줄로 끊는다. 어절 경계("새 이름을 / 정해볼까요?")에서 나누어
        읽는 호흡이 끊기지 않게 했다.
        도움말은 '앞으로 / 지난'을 짝지어 짧은 두 줄로 줄였다. 원래는
        "앞으로 보내는 편지와 답장에 이 이름이 보여요 / 이전에 보낸 편지와
        답장에는 당시의 이름이 그대로 남아요"였는데, 제목이 두 줄이 되면서
        글이 네 줄로 쌓여 화면 위쪽이 무거웠다. '편지와 답장'을 '편지'로 묶어도
        뜻은 그대로다. 지난 편지는 그대로라는 말은 남겼다 — 이름을 바꿀 때
        사람들이 실제로 걱정하는 지점이라 빼면 안 되는 정보다. */}
        <section
          className={`auth-intro-copy nef-intro ${nameSettings["nef-intro"]}`}
        >
          <h1>
            새 이름을
            <br />
            정해볼까요?
          </h1>
          <p className="auth-helper">
            앞으로 보내는 편지에 이 이름이 보여요.
            <br />
            지난 편지에는 그때의 이름이 남아요.
          </p>
        </section>
        <section
          className={`nef-field ${nameSettings["nef-field"]}`}
          aria-labelledby="nickname-settings-label"
        >
          <label
            id="nickname-settings-label"
            className={`nef-label ${nameSettings["nef-label"]}`}
            htmlFor="nickname-settings-input"
          >
            이름
          </label>
          <div
            className={`anonymous-name-input-wrap ${nameSettings["anonymous-name-input-wrap"]}`}
          >
            <input
              id="nickname-settings-input"
              type="text"
              value={name}
              maxLength={10}
              onChange={(event) => {
                setName(event.target.value);
                setFailed(false);
              }}
              placeholder="이름을 입력해주세요"
              aria-describedby="nickname-settings-note nickname-settings-count"
            />
            {name && (
              <button
                className="anonymous-name-clear"
                type="button"
                onClick={() => setName("")}
                aria-label="입력한 이름 지우기"
              >
                ×
              </button>
            )}
          </div>
          <div
            className={`anonymous-name-field__meta ${nameSettings["anonymous-name-field__meta"]}`}
          >
            <span id="nickname-settings-note">10자 이내로 입력해주세요.</span>
            <span id="nickname-settings-count" aria-live="polite">
              {name.length} / 10
            </span>
          </div>
        </section>
        <div className={`nef-suggest-wrap ${nameSettings["nef-suggest-wrap"]}`}>
          <button
            className={`nef-suggest-button ${nameSettings["nef-suggest-button"]}`}
            type="button"
            onClick={suggestRandom}
          >
            이름 추천 받기
          </button>
        </div>
        {failed && (
          <div className="flow-notice">
            <strong>익명 이름을 바꾸지 못했어요.</strong>
            <span>잠시 후 다시 시도해주세요.</span>
          </div>
        )}
      </div>
      <footer
        className={`auth-actions nickname-settings-actions ${nameSettings["nickname-settings-actions"]}`}
      >
        <button
          className="auth-primary"
          type="button"
          disabled={!canSubmit}
          onClick={() => setConfirm(true)}
        >
          이 이름으로 바꾸기
        </button>
      </footer>
      {confirm && (
        <div
          className="draft-exit-overlay nickname-change-sheet"
          role="dialog"
          aria-modal="true"
          aria-labelledby="nickname-change-title"
        >
          <section className="draft-exit-panel">
            <div className="draft-exit-copy">
              <h2 id="nickname-change-title">나의 이름을 바꿀까요?</h2>
              <span>
                앞으로 작성하는 편지와 답장에는 새로운 이름이 보여요.
                <br />
                이전에 작성한 기록의 이름은 바뀌지 않아요.
              </span>
            </div>
            <div className="draft-exit-actions">
              <button
                className="flow-primary-button"
                type="button"
                onClick={save}
              >
                이름 바꾸기
              </button>
              <button
                className="flow-text-button"
                type="button"
                onClick={() => setConfirm(false)}
              >
                취소
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
