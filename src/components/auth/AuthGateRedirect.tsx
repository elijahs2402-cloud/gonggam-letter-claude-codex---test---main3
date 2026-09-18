// 로그인·가입 단계 확인 뒤 다른 주소로 보내는 자리 표시 화면
// 2026-09-18 src/pages/Auth/AuthScreens.tsx 에서 옮겼다(코드 그대로).
import { useEffect } from "react";
import { replaceRoute } from "../../utils/navigation";
import { AuthShell } from "./AuthShell";
// CSS Modules: 기존 전역 class 이름은 그대로 두고 모듈 class 를 함께 붙인다.
import auth from "../../pages/Auth/AuthScreens.module.css";

export function AuthGateRedirect({ to }: { to: string }) {
  useEffect(() => {
    replaceRoute(to);
  }, [to]);
  return (
    <AuthShell
      className={`auth-redirect-screen ${auth["auth-redirect-screen"]}`}
    >
      <span>공감편지를 준비하고 있어요.</span>
    </AuthShell>
  );
}
