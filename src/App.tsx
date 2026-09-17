import {
  ListenEntryAScreen,
  ListenEntryEmptyScreen,
} from "./pages/Letter/ListenEntryVariants";
import { MailboxScreen } from "./pages/Mailbox/MailboxScreen";
import { TermsMockupScreen } from "./pages/MySpace/TermsMockup";
import { MySpaceScreen } from "./pages/MySpace/MySpaceScreen";
import {
  LetterPreviewScreen,
  LetterSentScreen,
  MyLetterDetailScreen,
  ReadLetterFlowScreen,
  RepliedLetterDetailScreen,
  ReplyReviewScreen,
  ReplySendingTransitionScreen,
  ReplySentScreen,
  WriteLetterFlowScreen,
  WriteReplyFlowScreen,
} from "./pages/Letter/LetterFlowScreens";
import { useEffect } from "react";
import { useLocation } from "react-router";
import {
  getCurrentAppPath,
  getCurrentAppSearchParams,
  isShellPath,
  isTabPath,
  markPageChanged,
  markTabSwitch,
  navigateTo,
} from "./utils/navigation";
import { syncDerivedNotifications } from "./data/notificationEvents";
import { LetterSafetyReviewScreen } from "./pages/Safety/SafetyScreens";
import {
  LetterReportFigmaScreen,
  SafetyManagementScreen,
} from "./pages/Safety/ReportScreens";
import {
  AuthGateRedirect,
  DirectNicknameScreen,
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
import { ServiceNoticeScreen } from "./pages/Notifications/ServiceNoticeScreen";
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
  AccountSettingsScreen,
  AccountWithdrawalScreen,
  WithdrawalCompleteScreen,
} from "./pages/Account/AccountManagementScreens";
import {
  NotFoundScreen,
  ServiceStateScreen,
} from "./components/common/CommonStates";
// CSS Modules: 기존 전역 class 이름은 그대로 두고 모듈 class 를 함께 붙인다.
import intro from "./IntroScreen.module.css";

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
    // 로그아웃 상태면 신규·기존 모두 공감편지 소개부터 본다(2026-09-15 확정 흐름).
    // 소개의 '시작하기'는 신규회원용, '이미 이용하고 있어요'는 기존회원용 로그인으로 간다.
    goTo("/onboarding");
  };
  return (
    <ScreenShell className={`intro-screen ${intro["intro-screen"]}`}>
      <img
        className={`intro-art ${intro["intro-art"]}`}
        src="/assets/intro-door-uploaded.png"
        alt="담쟁이덩굴이 감싼 보랏빛 현관문과 편지가 든 우편함"
      />
      <section
        className={`intro-copy ${intro["intro-copy"]}`}
        aria-labelledby="intro-title"
      >
        <p className={`intro-brand ${intro["intro-brand"]}`}>공감편지</p>
        <h1 id="intro-title">
          오늘도,
          <br />
          마음이 도착했습니다
        </h1>
        <p className={`intro-note ${intro["intro-note"]}`}>
          마음을 담은 편지가 조용히 머무는 곳
        </p>
      </section>
      <button
        className={`intro-cta ${intro["intro-cta"]}`}
        type="button"
        onClick={handleEntry}
      >
        마음의 문 열기
      </button>
    </ScreenShell>
  );
}

// 주소 기록이 바뀔 때마다(셸 안 이동 포함) 한 번만 하는 일.
// effect 가 아니라 그리기 전에 부른다 — 새 화면이 그리면서 알림을 읽고,
// 새 화면의 effect(자식이 부모보다 먼저 돈다)가 타이머를 걸기 전에 끝나 있어야 한다.
// - 알림 목록을 지금 상태에 맞춘다. 문서를 새로 불러오던 때는 main.tsx 에서
//   화면마다 한 번씩 돌았다. 로그인 전에는 볼 편지가 없으므로 건너뛴다.
// - 떠난 화면의 타이머가 실행되지 않도록 화면 번호를 올린다(setPageTimeout).
// - 탭 → 탭 이동인지 표시한다(화면 전체 모션을 끄는 CSS 가 읽는다). 새 화면이
//   붙기 전에 정해져 있어야 첫 프레임부터 모션 없이 그려진다.
let lastLocationKey: string | null = null;
let lastPath: string | null = null;
function handleLocationChange(locationKey: string, path: string) {
  if (lastLocationKey === locationKey) return;
  lastLocationKey = locationKey;
  markTabSwitch(lastPath !== null && isTabPath(lastPath) && isTabPath(path));
  lastPath = path;
  markPageChanged();
  if (getMockAuthSnapshot().account) syncDerivedNotifications();
}

export function App() {
  const location = useLocation();
  const path = getCurrentAppPath();
  handleLocationChange(location.key, path);
  // 화면마다 key 를 바꿔 새로 만든다 — 문서를 새로 불러오던 때처럼 화면 상태가
  // 처음부터 시작하고, 들어오는 모션(.mobile-prototype)도 매번 재생된다.
  // 나의 공간 셸이 맡은 주소는 같은 key 를 써서 셸을 그대로 둔다(셸 안 전환 모션).
  const shell = isShellPath(path);
  const screenKey = shell ? "my-space-shell" : location.key;

  useEffect(() => {
    // 문서를 새로 불러오면 맨 위에서 시작했다. 같은 동작을 맞춘다.
    if (!shell) window.scrollTo(0, 0);
  }, [screenKey, shell]);

  return <AppScreen key={screenKey} shell={shell} />;
}

function AppScreen({ shell }: { shell: boolean }) {
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
    "/account-withdrawal",
    "/notifications",
    "/notification-settings",
    "/safety-management",
    "/service-guide",
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
    "/service-notices/",
  ];
  const isProtectedServicePath =
    protectedPaths.has(path) ||
    ["/letter-preview", "/letter-sent"].includes(path) ||
    protectedFlowPrefixes.some((prefix) => path.startsWith(prefix));
  if (isProtectedServicePath && !isMockAuthenticated()) {
    setPostLoginPath(path);
    return <AuthGateRedirect to={getRequiredOnboardingPath() ?? "/login"} />;
  }

  // 셸이 맡은 주소(나의 공간 목록 + 하위 화면)는 셸이 스스로 그린다.
  // 하위 화면 주소의 단독 분기(아래 /notification-settings 등)보다 먼저 봐야 한다.
  if (shell) return <MySpaceScreen />;

  if (path === "/notifications") return <NotificationsScreen />;
  // 서비스 안내 세부 — 1차 오픈 제외. 디자인 확인용으로 주소로만 연다(연결하는 곳 없음).
  if (path.startsWith("/service-notices/"))
    return (
      <ServiceNoticeScreen
        noticeId={decodeURIComponent(path.slice("/service-notices/".length))}
      />
    );
  if (path === "/notification-settings") return <NotificationSettingsScreen />;

  if (path === "/home") return <HomeRuledScreen refinedCardsOnly />;
  if (path === "/anonymous-name-settings")
    return <AnonymousNameSettingsScreen />;
  if (path === "/account-settings") return <AccountSettingsScreen />;
  if (path === "/account-withdrawal") return <AccountWithdrawalScreen />;
  if (path === "/withdrawal-complete") return <WithdrawalCompleteScreen />;
  if (path === "/service-guide") return <GuideScreen />;
  if (path === "/privacy-policy") return <PolicyScreen kind="privacy" />;
  if (path === "/terms-of-service") return <TermsMockupScreen />;
  if (path === "/app-info") return <AppInfoScreen />;
  if (path === "/write-letter") return <WriteLetterFlowScreen />;
  if (path === "/letter-preview") return <LetterPreviewScreen />;
  if (path === "/letter-safety-review") return <LetterSafetyReviewScreen />;
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
  if (path === "/safety-management") return <SafetyManagementScreen />;
  if (path.startsWith("/report-letter/")) {
    // 답장 신고(/report-reply/:id/complete)와 같은 규칙으로 완료 화면을 연다.
    const suffix = path.slice("/report-letter/".length);
    const isComplete = suffix.endsWith("/complete");
    const reportedLetterId = decodeURIComponent(
      isComplete ? suffix.slice(0, -"/complete".length) : suffix,
    );
    return (
      <LetterReportFigmaScreen
        letterId={reportedLetterId}
        complete={isComplete}
      />
    );
  }
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
  if (path === "/mailbox") return <MailboxScreen />;
  if (path === "/listen-entry-a") return <ListenEntryAScreen />;
  if (path === "/listen-entry-empty") return <ListenEntryEmptyScreen />;
  return <NotFoundScreen />;
}
