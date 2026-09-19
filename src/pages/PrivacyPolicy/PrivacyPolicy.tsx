// 개인정보 처리방침 (/privacy-policy)
// 2026-09-18 src/pages/MySpace/MySpaceDetails.tsx 에서 옮겼다(코드 그대로).
import { Header } from "../../components/mySpace/Header";
// 약관·처리방침 CSS Modules: 기존 전역 class 이름은 그대로 두고 모듈 class 를 함께 붙인다.
import policy from "./PrivacyPolicy.module.css";

export function PrivacyPolicyScreen({
  kind,
  stageClassName = "",
}: {
  kind: "privacy" | "terms";
  stageClassName?: string;
}) {
  const privacy = kind === "privacy";
  const title = privacy ? "개인정보 처리방침" : "서비스 이용약관";
  const privacySections = [
    [
      "1. 문서의 목적과 적용 범위",
      "이 개인정보 처리방침은 공감편지 서비스를 이용하는 과정에서 수집·이용되는 정보의 종류와 처리 방식을 안내하기 위해 마련되었습니다.",
    ],
    [
      "2. 서비스 이용과 사용자 보호",
      "공감편지는 익명 기반 서비스로, 이용자를 특정할 수 있는 정보를 필수로 요구하지 않으며 최소한의 정보만 수집합니다.",
    ],
    [
      "3. 정보 처리 및 보관 기준",
      "수집된 정보는 서비스 제공 목적으로만 이용되며, 관련 법령에 따른 보관 기간이 지나면 지체 없이 파기됩니다.",
    ],
    [
      "4. 변경 사항 안내",
      "개인정보 처리방침의 내용이 변경되는 경우 서비스 내 공지를 통해 안내드립니다.",
    ],
  ];
  if (privacy)
    return (
      <main
        className={`mobile-prototype policy-screen privacy-policy-screen${stageClassName ? ` ${stageClassName}` : ""}`}
      >
        <Header title={title} headingTitle />
        <div className="my-detail-scroll">
          <section
            className={`privacy-policy-document ${policy["privacy-policy-document"]}`}
            aria-label="개인정보 처리방침"
          >
            {privacySections.map(([heading, body]) => (
              <article key={heading}>
                <h2>{heading}</h2>
                <p>{body}</p>
              </article>
            ))}
          </section>
        </div>
      </main>
    );
  const notice = privacy
    ? "최종 개인정보 처리방침은 실제 서비스 개발과 법률 검토 후 연결됩니다."
    : "최종 이용약관은 실제 서비스 정책과 법률 검토 후 연결됩니다.";
  const sections = [
    "문서의 목적과 적용 범위",
    "서비스 이용과 사용자 보호",
    "정보 처리 및 보관 기준",
    "문의와 변경 사항 안내",
  ];

  return (
    <main className="mobile-prototype policy-screen">
      <Header title={title} />
      <div className="my-detail-scroll">
        <article className={`policy-document ${policy["policy-document"]}`}>
          <header
            className={`policy-document-heading ${policy["policy-document-heading"]}`}
          >
            <p>공감편지의 약속</p>
            <span
              className={`policy-document-mark ${policy["policy-document-mark"]}`}
              aria-hidden="true"
            >
              01
            </span>
            <h1>{title}</h1>
            <time>적용 예정일 · 실제 서비스 준비 후 확정</time>
          </header>
          <aside
            className={`policy-notice ${policy["policy-notice"]}`}
            aria-label="문서 안내"
          >
            <span aria-hidden="true">✦</span>
            <div>
              <strong>{notice}</strong>
              <p>
                개발 단계에서는 이 안내 문서로 제공하며, 운영 전 실제 URL 또는
                CMS 문서로 교체합니다.
              </p>
            </div>
          </aside>
          <section
            className={`policy-contents ${policy["policy-contents"]}`}
            aria-labelledby="policy-contents-title"
          >
            <div
              className={`policy-section-label ${policy["policy-section-label"]}`}
            >
              <span>contents</span>
              <h2 id="policy-contents-title">문서의 차례</h2>
            </div>
            <ol>
              {sections.map((section, index) => (
                <li key={section}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{section}</strong>
                  <i aria-hidden="true">↗</i>
                </li>
              ))}
            </ol>
          </section>
          <p
            className={`policy-document-footnote ${policy["policy-document-footnote"]}`}
          >
            궁금한 점이 있다면, 서비스가 정식으로 시작된 뒤 안내되는 문의 경로로
            연락해주세요.
          </p>
        </article>
      </div>
    </main>
  );
}
