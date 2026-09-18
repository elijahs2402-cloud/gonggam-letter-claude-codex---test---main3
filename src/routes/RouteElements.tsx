/**
 * 라우트 목록(AppRoutes.tsx)에서 쓰는 작은 컴포넌트들.
 * - 들어오는 조건이 있는 화면(가입 단계 · 로그인 확인)
 * - 주소의 :id 를 화면에 넘기는 연결 컴포넌트
 * 컴포넌트만 내보내는 파일로 따로 둔다(개발 서버의 Fast Refresh 규칙).
 */
import type { ReactNode } from "react";
import { Outlet, useParams } from "react-router-dom";
import {
  getOnboardingNextPath,
  isMockAuthenticated,
  setPostLoginPath,
} from "../data/mockAuth";
import {
  getCurrentAppPath,
  getCurrentAppSearchParams,
} from "../utils/navigation";
import { AuthGateRedirect } from "../components/auth/AuthGateRedirect";
import { LoginScreen } from "../pages/Login/Login";
import { ReturningWelcomeScreen } from "../pages/ReturningWelcome/ReturningWelcome";
import { ServiceNoticeScreen } from "../pages/ServiceNotice/ServiceNotice";
import { LetterSentScreen } from "../pages/LetterSent/LetterSent";
import { MyLetterDetailScreen } from "../pages/MyLetterDetail/MyLetterDetail";
import { ReadLetterScreen } from "../pages/ReadLetter/ReadLetter";
import { RepliedLetterDetailScreen } from "../pages/RepliedLetterDetail/RepliedLetterDetail";
import { ReplyReviewScreen } from "../pages/ReplyReview/ReplyReview";
import { ReplySendingScreen } from "../pages/ReplySending/ReplySending";
import { ReplySentScreen } from "../pages/ReplySent/ReplySent";
import { WriteReplyScreen } from "../pages/WriteReply/WriteReply";
import { ReportLetterScreen } from "../pages/ReportLetter/ReportLetter";
import { ReturnLetterScreen } from "../pages/ReturnLetter/ReturnLetter";
import { ReportReplyScreen } from "../pages/ReportReply/ReportReply";
import { ROUTES } from "./paths";

// ── 가입 단계 화면: 각자 들어올 수 있는 조건이 있다 ─────────────────────

export function LoginRoute() {
  if (isMockAuthenticated()) return <AuthGateRedirect to={ROUTES.home} />;
  return <LoginScreen />;
}

export function ReturningWelcomeRoute() {
  if (!isMockAuthenticated())
    return <AuthGateRedirect to={getOnboardingNextPath() ?? ROUTES.login} />;
  return <ReturningWelcomeScreen />;
}

/** 지금 밟아야 할 가입 단계가 이 화면이 아니면 그 단계로 보낸다. */
export function OnboardingStepRoute({
  step,
  children,
}: {
  step: string;
  children: ReactNode;
}) {
  const next = getOnboardingNextPath();
  if (next && next !== step) return <AuthGateRedirect to={next} />;
  return children;
}

// ── 로그인이 필요한 화면 ─────────────────────────────────────────────

/** 로그인 전이면 지금 주소를 기억해 두고 가입 단계(또는 로그인)로 보낸다. */
export function RequireAuth() {
  if (!isMockAuthenticated()) {
    setPostLoginPath(getCurrentAppPath());
    return <AuthGateRedirect to={getOnboardingNextPath() ?? ROUTES.login} />;
  }
  return <Outlet />;
}

// ── 주소의 :id 를 화면의 letterId 로 넘긴다(React Router 가 디코딩해 준다) ──

function useIdParam() {
  return useParams().id ?? "";
}

export function ReplyReportRoute({ complete }: { complete: boolean }) {
  return <ReportReplyScreen letterId={useIdParam()} complete={complete} />;
}
export function LetterReportRoute({ complete }: { complete: boolean }) {
  // 답장 신고(/report-reply/:id/complete)와 같은 규칙으로 완료 화면을 연다.
  return <ReportLetterScreen letterId={useIdParam()} complete={complete} />;
}
export function LetterReturnRoute() {
  return <ReturnLetterScreen letterId={useIdParam()} />;
}
export function LetterSentRoute() {
  return (
    <LetterSentScreen
      letterId={getCurrentAppSearchParams().get("id") ?? undefined}
    />
  );
}
export function ReadLetterRoute() {
  return <ReadLetterScreen letterId={useIdParam()} />;
}
export function WriteReplyRoute() {
  return <WriteReplyScreen letterId={useIdParam()} />;
}
export function ReplyReviewRoute() {
  return <ReplyReviewScreen letterId={useIdParam()} />;
}
export function ReplySendingRoute() {
  return <ReplySendingScreen letterId={useIdParam()} />;
}
export function ReplySentRoute() {
  return <ReplySentScreen letterId={useIdParam()} />;
}
export function MyLetterDetailRoute() {
  return <MyLetterDetailScreen letterId={useIdParam()} />;
}
export function RepliedLetterDetailRoute() {
  return <RepliedLetterDetailScreen letterId={useIdParam()} />;
}
export function ServiceNoticeRoute() {
  // 서비스 안내 세부 — 1차 오픈 제외. 디자인 확인용으로 주소로만 연다(연결하는 곳 없음).
  return <ServiceNoticeScreen noticeId={useIdParam()} />;
}
