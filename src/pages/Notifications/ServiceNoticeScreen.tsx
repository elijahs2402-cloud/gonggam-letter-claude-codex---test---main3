import { NotFoundScreen } from "../../components/common/CommonStates";
import { getServiceNotice } from "../../data/serviceNotices";
import { formatDate } from "../../utils/datetime";
import { navigateBack } from "../../utils/navigation";
import styles from "./ServiceNoticeScreen.module.css";

/**
 * 서비스 안내 세부 화면 (/service-notices/:id) — 2026-09-17 디자인만 만들어 둠
 *
 * 1차 오픈에는 열지 않는다. 알림 목록은 서비스 안내 알림을 걸러 내고,
 * 앱 어디에서도 이 주소로 보내지 않는다. 주소로 직접 열어 확인한다.
 *
 * 모양은 이 앱의 기존 규칙을 조합했다(새 값을 만들지 않음).
 * - 머리글: 다른 상세 화면과 같은 flow-header
 * - 머리말: 약관 문서 머리말의 작은 보라 문구 + 세리프 제목 + 날짜
 * - 본문: 개인정보 처리방침의 소제목 · 문단
 */
export function ServiceNoticeScreen({ noticeId }: { noticeId: string }) {
  const notice = getServiceNotice(noticeId);
  if (!notice) return <NotFoundScreen />;
  return (
    <main
      className={`mobile-prototype service-notice-screen ${styles["service-notice-screen"]}`}
    >
      <header className="flow-header">
        <button
          type="button"
          onClick={() => navigateBack("/notifications")}
          aria-label="이전으로 돌아가기"
        >
          ←
        </button>
        <strong>서비스 안내</strong>
        <span aria-hidden="true" />
      </header>
      <div className="my-detail-scroll">
        <article
          className={styles["service-notice-document"]}
          aria-labelledby="service-notice-title"
        >
          <header className={styles["service-notice-heading"]}>
            <p>공감편지에서 알려드려요</p>
            <h1 id="service-notice-title">{notice.title}</h1>
            <time dateTime={notice.publishedAt}>
              {formatDate(notice.publishedAt)}
            </time>
          </header>
          <div className={styles["service-notice-intro"]}>
            {notice.intro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          {notice.sections.map((section) => (
            <section
              key={section.heading}
              className={styles["service-notice-section"]}
            >
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}
          <p className={styles["service-notice-sign"]}>공감편지 드림</p>
        </article>
      </div>
    </main>
  );
}
