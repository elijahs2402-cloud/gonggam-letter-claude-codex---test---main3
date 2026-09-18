/**
 * 라우팅 목록 (규격 §12 — 라우팅은 이 파일에서 관리한다)
 *
 * 2026-09-17 App.tsx 의 주소 분기(if 문)를 React Router 라우트 목록으로 옮겼다.
 * 화면과 분기 조건은 그대로다.
 *
 * 구조
 * - 맨 위 라우트의 element 는 App(모든 화면의 틀)이다. App 이 화면 key ·
 *   나의 공간 셸 · ?system= 상태 화면 · 스크롤을 맡고, 아래 목록의 화면을 Outlet 으로 그린다.
 * - 로그인 없이 여는 화면 / 가입 단계 화면(자체 조건) / 로그인이 필요한 화면(RequireAuth)
 *   — 조건 · :id 연결 컴포넌트는 RouteElements.tsx 에 있다.
 *   세 묶음으로 나눈다.
 * - 목록에 없는 주소는 "이 화면은 지금 없어요"(NotFoundScreen).
 */
import {
  createBrowserRouter,
  createHashRouter,
  type RouteObject,
} from "react-router-dom";
import { App } from "../App";
import { BASE_PATH } from "../utils/basePath";
import { NotFoundScreen } from "../components/common/CommonStates";
import {
  DirectNicknameScreen,
  OnboardingRedesignScreen,
  TermsConsentScreen,
} from "../pages/Auth/AuthScreens";
import { IntroScreen } from "../pages/Intro/IntroScreen";
import { HomeRuledScreen } from "../pages/Home/HomeRuledScreen";
import { MailboxScreen } from "../pages/Mailbox/MailboxScreen";
import { MySpaceScreen } from "../pages/MySpace/MySpaceScreen";
import {
  AnonymousNameSettingsScreen,
  AppInfoScreen,
  GuideScreen,
  PolicyScreen,
} from "../pages/MySpace/MySpaceDetails";
import { TermsMockupScreen } from "../pages/MySpace/TermsMockup";
import {
  AccountSettingsScreen,
  AccountWithdrawalScreen,
  WithdrawalCompleteScreen,
} from "../pages/Account/AccountManagementScreens";
import {
  NotificationsScreen,
  NotificationSettingsScreen,
} from "../pages/Notifications/NotificationScreens";
import {
  ListenEntryAScreen,
  ListenEntryEmptyScreen,
} from "../pages/Letter/ListenEntryVariants";
import {
  LetterPreviewScreen,
  WriteLetterFlowScreen,
} from "../pages/Letter/LetterFlowScreens";
import { LetterSafetyReviewScreen } from "../pages/Safety/SafetyScreens";
import { SafetyManagementScreen } from "../pages/Safety/ReportScreens";
import {
  LetterReportRoute,
  LetterReturnRoute,
  LetterSentRoute,
  LoginRoute,
  MyLetterDetailRoute,
  OnboardingStepRoute,
  ReadLetterRoute,
  RepliedLetterDetailRoute,
  ReplyReportRoute,
  ReplyReviewRoute,
  ReplySendingRoute,
  ReplySentRoute,
  RequireAuth,
  ReturningWelcomeRoute,
  ServiceNoticeRoute,
  WriteReplyRoute,
} from "./RouteElements";

// ── 라우트 목록 ─────────────────────────────────────────────────────

const publicRoutes: RouteObject[] = [
  // 인트로는 예전에 대체 주소였다 — / 와 /intro 둘 다 연다.
  { path: "/", element: <IntroScreen /> },
  { path: "/intro", element: <IntroScreen /> },
  { path: "/onboarding", element: <OnboardingRedesignScreen /> },
  { path: "/login", element: <LoginRoute /> },
  { path: "/returning-welcome", element: <ReturningWelcomeRoute /> },
  {
    path: "/terms-consent",
    element: (
      <OnboardingStepRoute step="/terms-consent">
        <TermsConsentScreen />
      </OnboardingStepRoute>
    ),
  },
  // 이름 화면은 두 개다 — 신규 가입자용 /nickname-entry,
  // 기존 회원용 /anonymous-name-settings(아래, 로그인 필요).
  {
    path: "/nickname-entry",
    element: (
      <OnboardingStepRoute step="/nickname-entry">
        <DirectNicknameScreen />
      </OnboardingStepRoute>
    ),
  },
  // 로그인 없이도 열리는 화면(예전 분기와 같다)
  { path: "/withdrawal-complete", element: <WithdrawalCompleteScreen /> },
  { path: "/terms-of-service", element: <TermsMockupScreen /> },
  { path: "/listen-entry-empty", element: <ListenEntryEmptyScreen /> },
];

const protectedRoutes: RouteObject[] = [
  // 탭
  { path: "/home", element: <HomeRuledScreen refinedCardsOnly /> },
  { path: "/mailbox", element: <MailboxScreen /> },
  // 나의 공간 — 목록과 하위 화면은 셸이 떠 있으면 App 이 셸로 그린다.
  // 아래 하위 화면 라우트는 주소로 바로 들어왔을 때(셸 없음) 쓰인다.
  { path: "/my-space", element: <MySpaceScreen /> },
  {
    path: "/anonymous-name-settings",
    element: <AnonymousNameSettingsScreen />,
  },
  { path: "/account-settings", element: <AccountSettingsScreen /> },
  { path: "/account-withdrawal", element: <AccountWithdrawalScreen /> },
  { path: "/notification-settings", element: <NotificationSettingsScreen /> },
  { path: "/safety-management", element: <SafetyManagementScreen /> },
  { path: "/service-guide", element: <GuideScreen /> },
  { path: "/privacy-policy", element: <PolicyScreen kind="privacy" /> },
  { path: "/app-info", element: <AppInfoScreen /> },
  // 알림
  { path: "/notifications", element: <NotificationsScreen /> },
  { path: "/service-notices/:id", element: <ServiceNoticeRoute /> },
  // 편지 쓰기
  { path: "/write-letter", element: <WriteLetterFlowScreen /> },
  { path: "/letter-preview", element: <LetterPreviewScreen /> },
  { path: "/letter-safety-review", element: <LetterSafetyReviewScreen /> },
  { path: "/letter-sent", element: <LetterSentRoute /> },
  // 편지 만나기 · 읽기 · 답장
  { path: "/listen-entry-a", element: <ListenEntryAScreen /> },
  { path: "/read-letter/:id", element: <ReadLetterRoute /> },
  { path: "/write-reply/:id", element: <WriteReplyRoute /> },
  { path: "/reply-review/:id", element: <ReplyReviewRoute /> },
  { path: "/reply-sending/:id", element: <ReplySendingRoute /> },
  { path: "/reply-sent/:id", element: <ReplySentRoute /> },
  { path: "/return-letter/:id", element: <LetterReturnRoute /> },
  // 편지함 상세
  { path: "/mailbox/my/:id", element: <MyLetterDetailRoute /> },
  { path: "/mailbox/replied/:id", element: <RepliedLetterDetailRoute /> },
  // 신고
  {
    path: "/report-reply/:id",
    element: <ReplyReportRoute complete={false} />,
  },
  {
    path: "/report-reply/:id/complete",
    element: <ReplyReportRoute complete />,
  },
  {
    path: "/report-letter/:id",
    element: <LetterReportRoute complete={false} />,
  },
  {
    path: "/report-letter/:id/complete",
    element: <LetterReportRoute complete />,
  },
];

export const appRoutes: RouteObject[] = [
  {
    element: <App />,
    children: [
      ...publicRoutes,
      { element: <RequireAuth />, children: protectedRoutes },
      { path: "*", element: <NotFoundScreen /> },
    ],
  },
];

/**
 * 앱 라우터. 빌드 결과를 파일로 바로 열면(file:) 주소 뒤 # 로 옮긴다.
 * GitHub Pages 처럼 폴더 아래에 놓이면 basename 으로 그 폴더를 알려 준다.
 */
export function createAppRouter() {
  if (window.location.protocol === "file:") return createHashRouter(appRoutes);
  return createBrowserRouter(appRoutes, { basename: BASE_PATH || "/" });
}
