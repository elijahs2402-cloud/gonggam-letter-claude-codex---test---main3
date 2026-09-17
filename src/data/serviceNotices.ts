/**
 * 서비스 안내(공감편지가 이용자에게 알리는 글) — 디자인용 예시 데이터 (2026-09-17)
 *
 * 1차 오픈에는 쓰지 않는다. 서비스 안내 알림(service_notice)은 알림 목록에서
 * 걸러지고(notifications.ts), 세부 화면 /service-notices/:id 는 앱 어디에서도
 * 연결하지 않는다. 주소로만 열어 디자인을 확인한다.
 * 실제로 열 때는 이 목록을 서버에서 받아 오도록 바꾸면 된다.
 */
export type ServiceNotice = {
  id: string;
  title: string;
  publishedAt: string;
  /** 첫 문단 묶음. 소제목 없이 제목 바로 아래에 온다. */
  intro: string[];
  sections: { heading: string; paragraphs: string[] }[];
};

const SERVICE_NOTICES: ServiceNotice[] = [
  {
    id: "welcome",
    title: "앱 안의 알림은 언제든 이곳에서 확인할 수 있어요",
    publishedAt: "2026-09-14T10:00:00+09:00",
    intro: [
      "공감편지를 찾아 주셔서 고마워요. 편지와 답장의 소식은 휴대폰 알림이 아니라 앱 안의 알림 목록으로 전해 드려요.",
    ],
    sections: [
      {
        heading: "어떤 소식을 알려드리나요",
        paragraphs: [
          "누군가 내 편지를 맡았을 때, 답장이 도착했을 때, 맡은 편지에 답장할 시간이 얼마 남지 않았을 때 알려드려요.",
          "신고를 접수하거나 검토를 마쳤을 때도 이곳에서 알려드려요.",
        ],
      },
      {
        heading: "알림을 받고 싶지 않다면",
        paragraphs: ["나의 공간의 알림 설정에서 종류별로 끄고 켤 수 있어요."],
      },
    ],
  },
];

export function getServiceNotice(id: string) {
  return SERVICE_NOTICES.find((notice) => notice.id === id);
}
