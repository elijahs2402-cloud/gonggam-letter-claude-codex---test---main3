import { getBlockedUsers } from "./blocks";
import { getCurrentUserId, getReceivedRepliesByUser } from "./letters";
import { getCurrentAnonymousName } from "./mockAuth";
import { getNotificationSettings } from "./notifications";
import { getReportsByUser } from "./reports";

/**
 * 나의 공간 목록이 보여 주는 요약(이름 · 받은 답장 · 알림 설정 · 차단 · 신고).
 * 2026-09-17 MySpaceDetails.tsx 에서 옮겼다 — 화면 파일은 컴포넌트만 내보내야
 * 개발 서버의 Fast Refresh 가 제대로 동작한다. 내용은 그대로다.
 */
export function getMySpaceSummary(userId = getCurrentUserId()) {
  const replies = getReceivedRepliesByUser(userId);
  const reports = getReportsByUser(userId);
  return {
    name: getCurrentAnonymousName(),
    replies,
    settings: getNotificationSettings(userId),
    blocks: getBlockedUsers(userId),
    reports,
  };
}
