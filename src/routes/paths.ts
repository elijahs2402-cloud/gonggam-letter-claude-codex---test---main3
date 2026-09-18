/**
 * 화면 주소 목록 (규격 §12 — URL 문자열을 직접 쓰지 않는다)
 *
 * 2026-09-18 코드 곳곳에 흩어져 있던 "/home" 같은 주소 문자열을 이곳으로 모았다.
 * 화면으로 옮길 때도(navigateTo), 라우트 목록(AppRoutes.tsx)도 이 값을 쓴다.
 * - ROUTES: 고정 주소
 * - ROUTE_PATTERNS: 편지 id 등이 들어가는 주소의 라우트 목록용 모양(:id)
 * - routeTo: 편지 id 등을 넣어 실제 주소를 만드는 함수
 */

export const ROUTES = {
  root: "/",
  // 가입 · 로그인
  intro: "/intro",
  onboarding: "/onboarding",
  login: "/login",
  returningWelcome: "/returning-welcome",
  termsConsent: "/terms-consent",
  nicknameEntry: "/nickname-entry",
  withdrawalComplete: "/withdrawal-complete",
  // 탭
  home: "/home",
  mailbox: "/mailbox",
  mySpace: "/my-space",
  // 나의 공간 하위 화면
  anonymousNameSettings: "/anonymous-name-settings",
  accountSettings: "/account-settings",
  accountWithdrawal: "/account-withdrawal",
  notificationSettings: "/notification-settings",
  safetyManagement: "/safety-management",
  serviceGuide: "/service-guide",
  privacyPolicy: "/privacy-policy",
  termsOfService: "/terms-of-service",
  appInfo: "/app-info",
  // 알림
  notifications: "/notifications",
  // 편지 쓰기
  writeLetter: "/write-letter",
  letterPreview: "/letter-preview",
  letterSafetyReview: "/letter-safety-review",
  letterSent: "/letter-sent",
  // 편지 만나기
  listenEntryA: "/listen-entry-a",
  listenEntryEmpty: "/listen-entry-empty",
} as const;

export const ROUTE_PATTERNS = {
  serviceNotice: "/service-notices/:id",
  readLetter: "/read-letter/:id",
  writeReply: "/write-reply/:id",
  replyReview: "/reply-review/:id",
  replySending: "/reply-sending/:id",
  replySent: "/reply-sent/:id",
  returnLetter: "/return-letter/:id",
  myLetter: "/mailbox/my/:id",
  repliedLetter: "/mailbox/replied/:id",
  reportReply: "/report-reply/:id",
  reportReplyComplete: "/report-reply/:id/complete",
  reportLetter: "/report-letter/:id",
  reportLetterComplete: "/report-letter/:id/complete",
} as const;

const withId = (prefix: string, id: string, suffix = "") =>
  `${prefix}/${encodeURIComponent(id)}${suffix}`;

export const routeTo = {
  readLetter: (id: string) => withId("/read-letter", id),
  writeReply: (id: string) => withId("/write-reply", id),
  replyReview: (id: string) => withId("/reply-review", id),
  replySending: (id: string) => withId("/reply-sending", id),
  replySent: (id: string) => withId("/reply-sent", id),
  myLetter: (id: string) => withId("/mailbox/my", id),
  repliedLetter: (id: string) => withId("/mailbox/replied", id),
  reportReply: (id: string) => withId("/report-reply", id),
  reportLetter: (id: string) => withId("/report-letter", id),
  reportLetterComplete: (id: string) =>
    withId("/report-letter", id, "/complete"),
  /** 편지 발송 완료 — 편지 id 는 주소 뒤 ?id= 로 넘긴다 */
  letterSent: (id: string) =>
    `${ROUTES.letterSent}?id=${encodeURIComponent(id)}`,
};
