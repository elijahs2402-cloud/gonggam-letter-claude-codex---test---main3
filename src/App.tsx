import {
  ListenEntryAScreen,
  ListenEntryEmptyScreen,
} from "./pages/Letter/ListenEntryVariants";
import {
  MailboxEmptyDemoScreen,
  MailboxReplyArrivedDemoScreen,
  MailboxScreen,
} from "./pages/Mailbox/MailboxScreen";
import { TermsMockupScreen } from "./pages/MySpace/TermsMockup";
import { MySpaceScreen } from "./pages/MySpace/MySpaceScreen";
import {
  LetterPreviewScreen,
  LetterSentScreen,
  MyLetterDetailScreen,
  MyLetterRepliedDemoScreen,
  MyLetterWaitingDemoScreen,
  RepliedLetterDemoScreen,
  ReadLetterFlowScreen,
  RepliedLetterDetailScreen,
  ReplyReviewScreen,
  ReplySendingTransitionScreen,
  ReplySentScreen,
  WriteLetterFlowScreen,
  WriteReplyFlowScreen,
} from "./pages/Letter/LetterFlowScreens";
import {
  getCurrentAppPath,
  getCurrentAppSearchParams,
  navigateTo,
} from "./utils/navigation";
import {
  LetterSafetyReviewScreen,
  UrgentSupportScreen,
} from "./pages/Safety/SafetyScreens";
import {
  LetterReportCompleteDemoScreen,
  LetterReportFigmaScreen,
  SafetyManagementScreen,
} from "./pages/Safety/ReportScreens";
import {
  AuthGateRedirect,
  DirectNicknameScreen,
  DormantAccountScreen,
  LoginScreen,
  OnboardingRedesignScreen,
  ReturningWelcomeScreen,
  TermsConsentScreen,
  getRequiredOnboardingPath,
} from "./pages/Auth/AuthScreens";
import { HomeRuledScreen } from "./pages/Home/HomeRuledScreen";
import {
  getMockAuthSnapshot,
  isMockAuthenticated,
  setPostLoginPath,
} from "./data/mockAuth";
import {
  NotificationsScreen,
  NotificationSettingsScreen,
} from "./pages/Notifications/NotificationScreens";
import {
  LetterReturnScreen,
  ReplyReportScreen,
} from "./pages/Safety/SafetyActionScreens";
import {
  AnonymousNameSettingsScreen,
  AppInfoScreen,
  GuideScreen,
  PolicyScreen,
} from "./pages/MySpace/MySpaceDetails";
import {
  AccountRestrictedScreen,
  AccountSettingsScreen,
  AccountWithdrawalScreen,
  DataAndPrivacyScreen,
  LoginInformationScreen,
  WithdrawalCompleteScreen,
} from "./pages/Account/AccountManagementScreens";
import {
  NotFoundScreen,
  ServiceStateScreen,
} from "./components/common/CommonStates";

function goTo(path: string) {
  navigateTo(path);
}

function ScreenShell({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  return <main className={`mobile-prototype ${className}`}>{children}</main>;
}

function IntroScreen() {
  const auth = getMockAuthSnapshot();
  const handleEntry = () => {
    // 탈퇴한 사람은 처음 온 사람과 같다 — 약관도 이름도 다시 받아야 하므로
    // 로그인이 아니라 온보딩부터 시작한다.
    if (auth.state === "withdrawn") {
      goTo("/onboarding");
      return;
    }
    if (isMockAuthenticated()) {
      goTo("/home");
      return;
    }
    const nextOnboarding = getRequiredOnboardingPath();
    if (nextOnboarding && nextOnboarding !== "/login") {
      goTo(nextOnboarding);
      return;
    }
    // A completed prototype account that is logged out follows the existing-user login path.
    goTo(auth.account?.onboardingCompleted ? "/login" : "/onboarding");
  };
  return (
    <ScreenShell className="intro-screen">
      <img
        className="intro-art"
        src="/assets/intro-door-uploaded.png"
        alt="담쟁이덩굴이 감싼 보랏빛 현관문과 편지가 든 우편함"
      />
      <section className="intro-copy" aria-labelledby="intro-title">
        <p className="intro-brand">공감편지</p>
        <h1 id="intro-title">
          오늘도,
          <br />
          마음이 도착했습니다
        </h1>
        <p className="intro-note">마음을 담은 편지가 조용히 머무는 곳</p>
      </section>
      <button className="intro-cta" type="button" onClick={handleEntry}>
        마음의 문 열기
      </button>
    </ScreenShell>
  );
}

export function App() {
  const path = getCurrentAppPath();
  const systemState = getCurrentAppSearchParams().get("system");
  if (
    systemState === "offline" ||
    systemState === "maintenance" ||
    systemState === "update_required" ||
    systemState === "restricted" ||
    systemState === "error"
  )
    return <ServiceStateScreen variant={systemState} />;

  // Intro was formerly the fallback route; retain both direct and root entry.
  if (path === "/" || path === "/intro") return <IntroScreen />;

  if (path === "/onboarding") return <OnboardingRedesignScreen />;
  if (path === "/dormant-account") return <DormantAccountScreen />;
  if (path === "/login") {
    if (isMockAuthenticated()) return <AuthGateRedirect to="/home" />;
    return <LoginScreen />;
  }
  if (path === "/returning-welcome") {
    if (!isMockAuthenticated())
      return <AuthGateRedirect to={getRequiredOnboardingPath() ?? "/login"} />;
    return <ReturningWelcomeScreen />;
  }
  if (path === "/terms-consent") {
    const next = getRequiredOnboardingPath();
    if (next && next !== "/terms-consent")
      return <AuthGateRedirect to={next} />;
    return <TermsConsentScreen />;
  }
  // /anonymous-name 라우트를 지웠다. 이름 화면은 두 개면 된다 —
  // 신규 가입자용 /nickname-entry, 기존 회원용 /anonymous-name-settings.
  // 세 번째였던 이 화면은 앱 어디에서도 연결되지 않으면서 URL 로는 열려,
  // 온보딩을 마친 사람도 여기서 이름을 바꿀 수 있었다. 그 화면에만 있던
  // 환영 연출은 실제로 쓰이는 /nickname-entry 로 옮겼다.
  if (path === "/nickname-entry") {
    const next = getRequiredOnboardingPath();
    // 지워진 /anonymous-name 과의 비교도 함께 뺀다 — 이제 갈 수 없는 곳이다.
    if (next && next !== "/nickname-entry")
      return <AuthGateRedirect to={next} />;
    return <DirectNicknameScreen />;
  }

  const protectedPaths = new Set([
    "/home",
    "/write-letter",
    "/listen-entry-a",
    "/mailbox",
    "/my-space",
    "/anonymous-name-settings",
    "/account-settings",
    "/login-information",
    "/data-and-privacy",
    "/account-withdrawal",
    "/notifications",
    "/notification-settings",
    "/safety-management",
    "/service-guide",
    "/safety-guide",
    "/privacy-policy",
    "/app-info",
    "/letter-safety-review",
  ]);
  const protectedFlowPrefixes = [
    "/report-reply/",
    "/return-letter/",
    "/reply-sending/",
    "/report-letter/",
    "/read-letter/",
    "/write-reply/",
    "/reply-review/",
    "/reply-sent/",
    "/mailbox/my/",
    "/mailbox/replied/",
  ];
  const isProtectedServicePath =
    protectedPaths.has(path) ||
    ["/letter-preview", "/letter-sent", "/urgent-support"].includes(path) ||
    protectedFlowPrefixes.some((prefix) => path.startsWith(prefix));
  if (isProtectedServicePath && !isMockAuthenticated()) {
    setPostLoginPath(path);
    return <AuthGateRedirect to={getRequiredOnboardingPath() ?? "/login"} />;
  }

  if (path === "/notifications") return <NotificationsScreen />;
  if (path === "/notification-settings") return <NotificationSettingsScreen />;

  if (path === "/home") return <HomeRuledScreen refinedCardsOnly />;
  if (path === "/my-space") return <MySpaceScreen />;
  if (path === "/anonymous-name-settings")
    return <AnonymousNameSettingsScreen />;
  if (path === "/account-settings") return <AccountSettingsScreen />;
  if (path === "/login-information") return <LoginInformationScreen />;
  if (path === "/data-and-privacy") return <DataAndPrivacyScreen />;
  if (path === "/account-withdrawal") return <AccountWithdrawalScreen />;
  if (path === "/withdrawal-complete") return <WithdrawalCompleteScreen />;
  if (path === "/account-restricted") return <AccountRestrictedScreen />;
  if (path === "/service-guide") return <GuideScreen kind="service" />;
  if (path === "/safety-guide") return <GuideScreen kind="safety" />;
  if (path === "/privacy-policy") return <PolicyScreen kind="privacy" />;
  if (path === "/terms-of-service") return <TermsMockupScreen />;
  if (path === "/app-info") return <AppInfoScreen />;
  if (path === "/write-letter") return <WriteLetterFlowScreen />;
  if (path === "/letter-preview") return <LetterPreviewScreen />;
  if (path === "/letter-safety-review") return <LetterSafetyReviewScreen />;
  if (path === "/report-reply-demo") return <ReplyReportScreen existingDemo />;
  if (path === "/report-reply-complete-demo")
    return <ReplyReportScreen completeDemo />;
  if (path.startsWith("/report-reply/")) {
    const suffix = path.slice("/report-reply/".length);
    const isComplete = suffix.endsWith("/complete");
    const replyLetterId = decodeURIComponent(
      isComplete ? suffix.slice(0, -"/complete".length) : suffix,
    );
    return <ReplyReportScreen letterId={replyLetterId} complete={isComplete} />;
  }
  if (path.startsWith("/return-letter/"))
    return (
      <LetterReturnScreen
        letterId={decodeURIComponent(path.slice("/return-letter/".length))}
      />
    );
  if (path === "/urgent-support")
    return <UrgentSupportScreen kind="letter" returnTo="/write-letter" />;
  if (path === "/safety-management") return <SafetyManagementScreen />;
  if (path === "/report-letter-demo")
    return <LetterReportFigmaScreen letterId="sample-waiting-letter-one" />;
  if (path === "/report-letter-complete-demo")
    return <LetterReportCompleteDemoScreen />;
  if (path.startsWith("/report-letter/"))
    return (
      <LetterReportFigmaScreen
        letterId={decodeURIComponent(path.slice("/report-letter/".length))}
      />
    );
  if (path === "/letter-sent")
    return (
      <LetterSentScreen
        letterId={getCurrentAppSearchParams().get("id") ?? undefined}
      />
    );
  if (path.startsWith("/read-letter/"))
    return (
      <ReadLetterFlowScreen
        letterId={decodeURIComponent(path.slice("/read-letter/".length))}
      />
    );
  if (path.startsWith("/write-reply/"))
    return (
      <WriteReplyFlowScreen
        letterId={decodeURIComponent(path.slice("/write-reply/".length))}
      />
    );
  if (path.startsWith("/reply-review/"))
    return (
      <ReplyReviewScreen
        letterId={decodeURIComponent(path.slice("/reply-review/".length))}
      />
    );
  if (path.startsWith("/reply-sending/"))
    return (
      <ReplySendingTransitionScreen
        letterId={decodeURIComponent(path.slice("/reply-sending/".length))}
      />
    );
  if (path.startsWith("/reply-sent/"))
    return (
      <ReplySentScreen
        letterId={decodeURIComponent(path.slice("/reply-sent/".length))}
      />
    );
  if (path === "/mailbox-my-replied-demo") return <MyLetterRepliedDemoScreen />;
  if (path === "/mailbox-my-waiting-demo") return <MyLetterWaitingDemoScreen />;
  if (path === "/mailbox-replied-demo") return <RepliedLetterDemoScreen />;
  if (path.startsWith("/mailbox/my/"))
    return (
      <MyLetterDetailScreen
        letterId={decodeURIComponent(path.slice("/mailbox/my/".length))}
      />
    );
  if (path.startsWith("/mailbox/replied/"))
    return (
      <RepliedLetterDetailScreen
        letterId={decodeURIComponent(path.slice("/mailbox/replied/".length))}
      />
    );
  // 답장 쓰기 확정본. 실제 흐름은 /write-reply/:letterId 로 들어오고,
  // 이름만 부른 /write-reply 는 시안 확인용으로 표본 편지를 띄운다.
  // (예전 /write-reply 시안 WriteReplyScreen 은 이 화면으로 대체되었다.)
  if (path === "/write-reply")
    return <WriteReplyFlowScreen letterId="sample-waiting-letter-one" />;
  if (path === "/mailbox-empty") return <MailboxEmptyDemoScreen />;
  if (path === "/mailbox-reply-arrived-demo")
    return <MailboxReplyArrivedDemoScreen />;
  if (path === "/mailbox") return <MailboxScreen />;
  if (path === "/listen-entry-a") return <ListenEntryAScreen />;
  if (path === "/listen-entry-empty") return <ListenEntryEmptyScreen />;
  return <NotFoundScreen />;
}
