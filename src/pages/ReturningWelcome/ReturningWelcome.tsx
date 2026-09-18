// 다시 온 사람 환영 (/returning-welcome)
// 2026-09-18 src/pages/Auth/AuthScreens.tsx 에서 옮겼다(코드 그대로).
import { useEffect, useState } from "react";
import { getMockAuthSnapshot, getPostLoginPath } from "../../data/mockAuth";
import { navigateTo } from "../../utils/navigation";
import { ROUTES } from "../../routes/paths";
import { AuthShell } from "../../components/auth/AuthShell";
// 환영 문구 CSS Modules: 기존 전역 class 이름은 그대로 두고 모듈 class 를 함께 붙인다.
import welcome from "../Auth/ReturningWelcomeScreen.module.css";

export function ReturningWelcomeScreen() {
  const name = getMockAuthSnapshot().account?.anonymousName ?? "조용한 별빛";
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const revealTimer = window.setTimeout(() => setVisible(true), 90);
    const leaveTimer = window.setTimeout(() => setLeaving(true), 2510);
    const finishTimer = window.setTimeout(
      () => navigateTo(getPostLoginPath(ROUTES.home)),
      3230,
    );
    return () => {
      window.clearTimeout(revealTimer);
      window.clearTimeout(leaveTimer);
      window.clearTimeout(finishTimer);
    };
  }, []);

  return (
    <AuthShell className="anonymous-name-screen motion-preview is-completing returning-welcome-screen">
      <div
        className={`anonymous-name-welcome ${welcome["anonymous-name-welcome"]}${visible ? " is-visible" : ""}${leaving ? " is-leaving" : ""}`}
        role="status"
        aria-live="polite"
      >
        <p>
          <strong>{name}</strong>님, 반가워요.
        </p>
      </div>
    </AuthShell>
  );
}
