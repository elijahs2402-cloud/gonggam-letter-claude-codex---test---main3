// 앱 정보 (/app-info)
// 2026-09-18 src/pages/MySpace/MySpaceDetails.tsx 에서 옮겼다(코드 그대로).
import { navigateTo } from "../../utils/navigation";
import { ROUTES } from "../../routes/paths";
import { Header } from "../../components/mySpace/Header";

export function AppInfoScreen() {
  return (
    <main className="mobile-prototype app-info-screen">
      <Header title="공감편지 정보" />
      <div className="my-detail-scroll">
        <section className="app-info-card">
          <p>공감편지</p>
          <h1>Prototype 0.1.0</h1>
          <span>실제 운영 앱이 아닌 디자인 프로토타입 버전이에요.</span>
          <dl>
            <div>
              <dt>오픈소스 라이선스</dt>
              <dd>실제 개발 단계에서 사용 패키지 기준으로 연결합니다.</dd>
            </div>
            <div>
              <dt>문의 경로</dt>
              <dd>문의 경로는 실제 서비스 운영 준비 후 연결됩니다.</dd>
            </div>
          </dl>
          <button
            type="button"
            onClick={() => navigateTo(ROUTES.privacyPolicy)}
          >
            개인정보 처리방침
          </button>
          <button
            type="button"
            onClick={() => navigateTo(ROUTES.termsOfService)}
          >
            서비스 이용약관
          </button>
        </section>
      </div>
    </main>
  );
}
