// serviceNotices.ts 의 데이터 모양(타입). 2026-09-19 src/data/serviceNotices.ts 에서 옮겼다(내용 그대로).

/**
 * 서비스 안내(공감편지가 이용자에게 알리는 글) — 디자인용 예시 데이터 (2026-09-17)
 *
 * 1차 오픈에는 쓰지 않는다. 서비스 안내 알림(service_notice)은 알림 목록에서
 * 걸러지고(notifications.ts), 세부 화면 /service-notices/:id 는 앱 어디에서도
 * 연결하지 않는다. 주소로만 열어 디자인을 확인한다.
 * 실제로 열 때는 이 목록을 서버에서 받아 오도록 바꾸면 된다.
 *
 * 예시 글은 업데이트 소식이다. 내용은 2026-09-16~17 에 실제로 고친 것
 * (화면 전환 · 탭 이동 · 신고한 편지 · 두고 온 편지)을 이용자 말로 옮겼다.
 */
export type ServiceNotice = {
  id: string;
  title: string;
  publishedAt: string;
  /** 첫 문단 묶음. 소제목 없이 제목 바로 아래에 온다. */
  intro: string[];
  sections: { heading: string; paragraphs: string[] }[];
};
