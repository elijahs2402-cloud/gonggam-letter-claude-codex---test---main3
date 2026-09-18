// 이용 안내 (/service-guide)
// 2026-09-18 src/pages/MySpace/MySpaceDetails.tsx 에서 옮겼다(코드 그대로).
import { Header } from "../../components/mySpace/Header";
// 이용 안내 CSS Modules: 기존 전역 class 이름은 그대로 두고 모듈 class 를 함께 붙인다.
import guide from "./ServiceGuide.module.css";

const guideContent = [
  [
    "공감편지는",
    "익명으로 마음을 담은 편지를 남기고, 한 사람이 읽어 답장을 전하는 서비스예요.",
  ],
  [
    "답장이 도착하기까지",
    "답장은 바로 도착하지 않을 수 있어요. 편지를 맡은 사람이 천천히 마음을 읽고 답장을 전해요.",
  ],
  [
    "편지와 답장",
    "여러 통의 편지를 보낼 수 있고, 각 편지는 저마다의 여정을 이어가요. 편지를 맡은 뒤 답장이 어렵다면 조용히 두고 갈 수 있어요.",
  ],
  // 위급 상황 안내는 아래 강조 블록이 맡는다. 여기서 한 번 더 말하면
  // 같은 지시가 한 화면에 두 번 나와 오히려 무게가 흩어진다.
  [
    "안전하게 이용하기",
    "불편한 편지는 언제든 신고하거나 차단할 수 있어요. 공감편지는 전문적인 상담이나 의료 서비스가 아니에요.",
  ],
];

// 이용 안내 화면. 안전 가이드(/safety-guide) 분기는 앱에서 갈 수 없어 2026-09-15 지웠다.
export function ServiceGuideScreen({
  stageClassName = "",
}: {
  stageClassName?: string;
}) {
  return (
    <main
      className={`mobile-prototype guide-screen ${guide["guide-screen"]} guide-screen--my-space${stageClassName ? ` ${stageClassName}` : ""}`}
    >
      <Header title="이용 안내" />
      <div className="my-detail-scroll">
        {/* 이용 안내는 헤더 타이틀("이용 안내")이 곧 제목이라
      본문 대제목이 같은 말을 두 번 하는 꼴이었다. 헤더만 남긴다. */}
        <section className={`guide-sections ${guide["guide-sections"]}`}>
          {guideContent.map(([title, body]) => (
            <article key={title}>
              <h2>{title}</h2>
              <p>{body}</p>
            </article>
          ))}
        </section>
        <p className={`guide-urgent-note ${guide["guide-urgent-note"]}`}>
          <span aria-hidden="true">✻</span>
          <strong>
            공감편지의 답장은 언제 도착할지 알 수 없어요. 지금 도움이 필요하다면
            가까운 사람이나 전문 기관에 먼저 연락해주세요.
          </strong>
        </p>
      </div>
    </main>
  );
}
