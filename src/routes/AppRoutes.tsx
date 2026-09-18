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
import { DirectNicknameScreen } from "../pages/NicknameEntry/NicknameEntry";
import { OnboardingRedesignScreen } from "../pages/Onboarding/Onboarding";
import { TermsConsentScreen } from "../pages/TermsConsent/TermsConsent";
import { IntroScreen } from "../pages/Intro/Intro";
import { HomeRuledScreen } from "../pages/Home/Home";
import { MailboxScreen } from "../pages/Mailbox/Mailbox";
import { MySpaceScreen } from "../pages/MySpace/MySpace";
import { AnonymousNameSettingsScreen } from "../pages/AnonymousNameSettings/AnonymousNameSettings";
import { AppInfoScreen } from "../pages/AppInfo/AppInfo";
import { GuideScreen } from "../pages/ServiceGuide/ServiceGuide";
import { PolicyScreen } from "../pages/PrivacyPolicy/PrivacyPolicy";
import { TermsMockupScreen } from "../pages/TermsOfService/TermsOfService";
import { AccountSettingsScreen } from "../pages/AccountSettings/AccountSettings";
import { AccountWithdrawalScreen } from "../pages/AccountWithdrawal/AccountWithdrawal";
import { WithdrawalCompleteScreen } from "../pages/WithdrawalComplete/WithdrawalComplete";
import { NotificationsScreen } from "../pages/Notifications/Notifications";
import { NotificationSettingsScreen } from "../pages/NotificationSettings/NotificationSettings";
import { ListenEntryAScreen } from "../pages/ListenEntry/ListenEntry";
import { ListenEntryEmptyScreen } from "../pages/ListenEntryEmpty/ListenEntryEmpty";
import { WriteLetterFlowScreen } from "../pages/WriteLetter/WriteLetter";
import { LetterPreviewScreen } from "../pages/LetterPreview/LetterPreview";
import { LetterSafetyReviewScreen } from "../pages/LetterSafetyReview/LetterSafetyReview";
import { SafetyManagementScreen } from "../pages/SafetyManagement/SafetyManagement";
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
import { ROUTES, ROUTE_PATTERNS } from "./paths";

// ── 라우트 목록 ─────────────────────────────────────────────────────

const publicRoutes: RouteObject[] = [
  // 인트로는 예전에 대체 주소였다 — / 와 /intro 둘 다 연다.
  { path: ROUTES.root, element: <IntroScreen /> },
  { path: ROUTES.intro, element: <IntroScreen /> },
  { path: ROUTES.onboarding, element: <OnboardingRedesignScreen /> },
  { path: ROUTES.login, element: <LoginRoute /> },
  { path: ROUTES.returningWelcome, element: <ReturningWelcomeRoute /> },
  {
    path: ROUTES.termsConsent,
    element: (
      <OnboardingStepRoute step={ROUTES.termsConsent}>
        <TermsConsentScreen />
      </OnboardingStepRoute>
    ),
  },
  // 이름 화면은 두 개다 — 신규 가입자용 /nickname-entry,
  // 기존 회원용 /anonymous-name-settings(아래, 로그인 필요).
  {
    path: ROUTES.nicknameEntry,
    element: (
      <OnboardingStepRoute step={ROUTES.nicknameEntry}>
        <DirectNicknameScreen />
      </OnboardingStepRoute>
    ),
  },
  // 로그인 없이도 열리는 화면(예전 분기와 같다)
  { path: ROUTES.withdrawalComplete, element: <WithdrawalCompleteScreen /> },
  { path: ROUTES.termsOfService, element: <TermsMockupScreen /> },
  { path: ROUTES.listenEntryEmpty, element: <ListenEntryEmptyScreen /> },
];

const protectedRoutes: RouteObject[] = [
  // 탭
  { path: ROUTES.home, element: <HomeRuledScreen refinedCardsOnly /> },
  { path: ROUTES.mailbox, element: <MailboxScreen /> },
  // 나의 공간 — 목록과 하위 화면은 셸이 떠 있으면 App 이 셸로 그린다.
  // 아래 하위 화면 라우트는 주소로 바로 들어왔을 때(셸 없음) 쓰인다.
  { path: ROUTES.mySpace, element: <MySpaceScreen /> },
  {
    path: ROUTES.anonymousNameSettings,
    element: <AnonymousNameSettingsScreen />,
  },
  { path: ROUTES.accountSettings, element: <AccountSettingsScreen /> },
  { path: ROUTES.accountWithdrawal, element: <AccountWithdrawalScreen /> },
  {
    path: ROUTES.notificationSettings,
    element: <NotificationSettingsScreen />,
  },
  { path: ROUTES.safetyManagement, element: <SafetyManagementScreen /> },
  { path: ROUTES.serviceGuide, element: <GuideScreen /> },
  { path: ROUTES.privacyPolicy, element: <PolicyScreen kind="privacy" /> },
  { path: ROUTES.appInfo, element: <AppInfoScreen /> },
  // 알림
  { path: ROUTES.notifications, element: <NotificationsScreen /> },
  { path: ROUTE_PATTERNS.serviceNotice, element: <ServiceNoticeRoute /> },
  // 편지 쓰기
  { path: ROUTES.writeLetter, element: <WriteLetterFlowScreen /> },
  { path: ROUTES.letterPreview, element: <LetterPreviewScreen /> },
  { path: ROUTES.letterSafetyReview, element: <LetterSafetyReviewScreen /> },
  { path: ROUTES.letterSent, element: <LetterSentRoute /> },
  // 편지 만나기 · 읽기 · 답장
  { path: ROUTES.listenEntryA, element: <ListenEntryAScreen /> },
  { path: ROUTE_PATTERNS.readLetter, element: <ReadLetterRoute /> },
  { path: ROUTE_PATTERNS.writeReply, element: <WriteReplyRoute /> },
  { path: ROUTE_PATTERNS.replyReview, element: <ReplyReviewRoute /> },
  { path: ROUTE_PATTERNS.replySending, element: <ReplySendingRoute /> },
  { path: ROUTE_PATTERNS.replySent, element: <ReplySentRoute /> },
  { path: ROUTE_PATTERNS.returnLetter, element: <LetterReturnRoute /> },
  // 편지함 상세
  { path: ROUTE_PATTERNS.myLetter, element: <MyLetterDetailRoute /> },
  { path: ROUTE_PATTERNS.repliedLetter, element: <RepliedLetterDetailRoute /> },
  // 신고
  {
    path: ROUTE_PATTERNS.reportReply,
    element: <ReplyReportRoute complete={false} />,
  },
  {
    path: ROUTE_PATTERNS.reportReplyComplete,
    element: <ReplyReportRoute complete />,
  },
  {
    path: ROUTE_PATTERNS.reportLetter,
    element: <LetterReportRoute complete={false} />,
  },
  {
    path: ROUTE_PATTERNS.reportLetterComplete,
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
