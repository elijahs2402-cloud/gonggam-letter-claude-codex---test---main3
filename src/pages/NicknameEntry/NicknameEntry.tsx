// 이름 정하기 (/nickname-entry)
// 2026-09-18 src/pages/Auth/AuthScreens.tsx 에서 옮겼다(코드 그대로).
import { useState } from "react";
import {
  confirmAnonymousName,
  generateAnonymousName,
} from "../../data/mockAuth";
import { navigateTo } from "../../utils/navigation";
import { ROUTES } from "../../routes/paths";
import { AuthShell, AuthHeader } from "../../components/auth/AuthShell";
// 닉네임 정하기 CSS Modules: 기존 전역 class 이름은 그대로 두고 모듈 class 를 함께 붙인다.
import nickname from "../Auth/NicknameEntryScreen.module.css";

export function DirectNicknameScreen() {
  const [name, setName] = useState("");
  const validName = Boolean(name.trim());
  const recommendName = () => setName(generateAnonymousName(name || undefined));

  /* 이름을 확정하면 환영 화면(/returning-welcome)으로 간다.
     예전에는 이 화면 위에 같은 환영문구(.anonymous-name-welcome)를 겹쳐 띄웠는데,
     신규·기존 유저가 같은 환영 화면을 거치도록 2026-09-15 통일했다. */
  const continueWithName = () => {
    const finalizedName = name.trim();
    if (!finalizedName) return;
    confirmAnonymousName(finalizedName);
    navigateTo(ROUTES.returningWelcome);
  };

  return (
    <AuthShell
      className={`direct-nickname-screen ${nickname["direct-nickname-screen"]}`}
    >
      <AuthHeader backTo={ROUTES.termsConsent} title="이름 정하기" />
      <div className="auth-scroll direct-nickname-scroll">
        <section
          className={`direct-nickname-content ${nickname["direct-nickname-content"]}`}
          aria-labelledby="direct-nickname-title"
        >
          <h1 id="direct-nickname-title">
            나를 부를 이름을
            <br />
            정해볼까요?
          </h1>
          <p>편지 속에서 나를 대신해 불러줄 이름이에요.</p>
          <div
            className={`direct-nickname-field ${nickname["direct-nickname-field"]}`}
          >
            <div
              className={`direct-nickname-field__label ${nickname["direct-nickname-field__label"]}`}
            >
              <label htmlFor="direct-nickname-input">이름</label>
            </div>
            <div
              className={`direct-nickname-input-wrap ${nickname["direct-nickname-input-wrap"]}`}
            >
              <input
                id="direct-nickname-input"
                type="text"
                value={name}
                maxLength={10}
                onChange={(event) => setName(event.target.value.slice(0, 10))}
                placeholder="이름을 입력해주세요"
                aria-describedby="direct-nickname-help"
                autoFocus
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
              className={`direct-nickname-field__meta ${nickname["direct-nickname-field__meta"]}`}
            >
              <p id="direct-nickname-help">10자 이내로 입력해주세요.</p>
              <span aria-live="polite">{name.length} / 10</span>
            </div>
          </div>
          <button
            className={`direct-nickname-recommend ${nickname["direct-nickname-recommend"]}`}
            type="button"
            onClick={recommendName}
          >
            이름 추천 받기
          </button>
        </section>
      </div>
      <footer className="auth-actions direct-nickname-actions">
        <button
          className="auth-primary"
          type="button"
          disabled={!validName}
          onClick={continueWithName}
        >
          이 이름으로 시작하기
        </button>
      </footer>
    </AuthShell>
  );
}
