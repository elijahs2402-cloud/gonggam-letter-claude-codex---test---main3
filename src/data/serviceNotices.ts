import type { ServiceNotice } from "../types/serviceNotices";
const SERVICE_NOTICES: ServiceNotice[] = [
  {
    id: "update-2026-09",
    title: "공감편지가 새로워졌어요",
    publishedAt: "2026-09-17T10:00:00+09:00",
    intro: [
      "조금 더 편안하게 머물 수 있도록, 화면을 오가는 느낌과 편지를 만나는 흐름을 다듬었어요.",
    ],
    sections: [
      {
        heading: "화면 사이를 부드럽게",
        paragraphs: [
          "화면을 옮길 때 잠깐 비어 보이거나 깜빡이던 순간을 없앴어요.",
          "홈 · 편지함 · 나의 공간을 오갈 때 아래 메뉴는 제자리에 두고, 내용만 차분히 바뀌어요.",
        ],
      },
      {
        heading: "편지를 만나는 흐름",
        paragraphs: [
          "신고하거나 차단한 편지는 다시 맡겨지지 않아요.",
          "받지 않기로 한 편지로 돌아가면, 이미 두고 온 편지라고 알려드려요.",
        ],
      },
      {
        heading: "앞으로도",
        paragraphs: [
          "누구나 편안하게 마음을 나눌 수 있도록 계속 다듬어 갈게요.",
        ],
      },
    ],
  },
];

export function getServiceNotice(id: string) {
  return SERVICE_NOTICES.find((notice) => notice.id === id);
}
