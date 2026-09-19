// 차단 및 신고 관리 (/safety-management)
// 2026-09-18 src/pages/Safety/ReportScreens.tsx 에서 옮겼다(코드 그대로).
import { useState } from "react";
import { getBlockedUsers, unblockUser } from "../../data/blocks";
import {
  getCurrentUserId,
  getLetterById,
  getLetters,
} from "../../data/letters";
import { getReportsByUser } from "../../data/reports";
import type { Report } from "../../types/reports";
import { formatDate } from "../../utils/datetime";
import { ROUTES } from "../../routes/paths";
import { Shell } from "../../components/safety/ReportShell";
// 차단 및 신고 관리 화면 CSS Modules: 기존 전역 class 이름은 그대로 두고 모듈 class 를 함께 붙인다.
import mgmt from "./SafetyManagement.module.css";

const reasonLabels: Record<string, string> = {
  abusive: "모욕적 표현",
  sexual: "불쾌한 내용",
  personal_information: "개인정보",
  spam: "광고",
  dangerous_or_illegal: "위험하거나 불법적인 내용",
  self_harm_encouragement: "위험 조장",
  irrelevant_or_insincere: "성의 없는 답장",
  other: "기타",
};

const managementDate = (value: string) => formatDate(value);

const nicknameOrFallback = (nickname?: string) =>
  nickname?.trim() || "이름을 확인할 수 없는 사용자";

function reportedNickname(report: Report) {
  if (report.targetType === "letter")
    return nicknameOrFallback(getLetterById(report.targetId)?.anonymousName);
  if (report.targetType === "reply") {
    const letter = getLetters(true).find(
      (candidate) => candidate.reply?.id === report.targetId,
    );
    return nicknameOrFallback(letter?.reply?.anonymousName);
  }
  return nicknameOrFallback();
}

function blockedNickname(blockedUserId: string, reports: Report[]) {
  const report = reports.find((item) => item.blockedUserId === blockedUserId);
  if (report) return reportedNickname(report);
  const letter = getLetters(true).find(
    (candidate) => candidate.senderId === blockedUserId,
  );
  return nicknameOrFallback(letter?.anonymousName);
}

// 차단 목록은 익명이라 항목이 전부 "익명의 사용자"로 똑같아 보인다.
// 어떤 경위로 차단했는지를 함께 보여 줘야 서로 구분된다.
const blockSource = (source: string) => {
  if (source === "letter_report") return "편지 신고로 차단";
  if (source === "reply_report") return "답장 신고로 차단";
  return "직접 차단";
};

// "검토 종료"(dismissed)는 끝난 상태인데 "검토 중"과 같은 색이라
// 아직 처리를 기다리는 것처럼 보였다. 끝났지만 조치는 없었다는 뜻이
// 색으로 전달되도록 완료(딥플럼)와도 구분해 회색으로 둔다.
const reportStatusTone = (status: string) => {
  if (status === "resolved") return "is-complete";
  if (status === "dismissed") return "is-closed";
  return "is-reviewing";
};

const reportStatus = (status: string) => {
  if (status === "resolved") return "처리 완료";
  if (status === "dismissed") return "검토 종료";
  return "검토 중";
};

export function SafetyManagementScreen({
  stageClassName = "",
}: { stageClassName?: string } = {}) {
  const userId = getCurrentUserId();
  const [refresh, setRefresh] = useState(0);
  const [confirm, setConfirm] = useState<string | undefined>();
  const blocks = getBlockedUsers(userId);
  const reports = getReportsByUser(userId);

  return (
    <Shell
      title="차단 및 신고 관리"
      fallback={ROUTES.mySpace}
      headingTitle
      screenClassName={`safety-management-screen${stageClassName ? ` ${stageClassName}` : ""}`}
    >
      <section
        className={`management-screen ${mgmt["management-screen"]}`}
        data-refresh={refresh}
      >
        {/* 상단 안내 문구를 뺐다. 헤더 타이틀과 각 섹션 설명이
          이미 무엇을 하는 화면인지 말하고 있어 한 번 더 설명할 필요가 없었다. */}
        <section
          className={`management-section ${mgmt["management-section"]}`}
          aria-labelledby="blocked-users-heading"
        >
          <header>
            <h2 id="blocked-users-heading">차단한 사용자</h2>
            <p>
              차단한 사용자는 나에게 편지를 보내거나 내 프로필을 볼 수 없어요.
            </p>
          </header>
          {blocks.length ? (
            <ul
              className={`management-record-list ${mgmt["management-record-list"]}`}
            >
              {blocks.map((item) => (
                <li key={item.id}>
                  <span
                    className={`management-record-copy ${mgmt["management-record-copy"]}`}
                  >
                    <strong>
                      {blockedNickname(item.blockedUserId, reports)}
                    </strong>
                    <small>
                      {blockSource(item.source)} <i />{" "}
                      {managementDate(item.createdAt)}
                    </small>
                  </span>
                  <button
                    type="button"
                    onClick={() => setConfirm(item.blockedUserId)}
                  >
                    차단 해제
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className={`management-empty ${mgmt["management-empty"]}`}>
              차단한 사용자가 없어요.
            </p>
          )}
        </section>

        <section
          className={`management-section ${mgmt["management-section"]}`}
          aria-labelledby="reports-heading"
        >
          <header>
            <h2 id="reports-heading">내가 접수한 신고</h2>
            <p>신고 내역은 운영팀에서 검토 후 조치합니다.</p>
          </header>
          {reports.length ? (
            <ul
              className={`management-record-list management-report-list ${mgmt["management-record-list"]} ${mgmt["management-report-list"]}`}
            >
              {reports.map((item) => (
                <li key={item.id}>
                  <span
                    className={`management-record-copy ${mgmt["management-record-copy"]}`}
                  >
                    <strong>{reportedNickname(item)}</strong>
                    <small>
                      {reasonLabels[item.reason] ?? "기타"} <i />{" "}
                      {managementDate(item.createdAt)}
                    </small>
                  </span>
                  <em className={reportStatusTone(item.status)}>
                    {reportStatus(item.status)}
                  </em>
                </li>
              ))}
            </ul>
          ) : (
            <p className={`management-empty ${mgmt["management-empty"]}`}>
              신고 내역이 없어요.
            </p>
          )}
        </section>
      </section>
      {/* 가운데 다이얼로그는 스크롤 컨테이너 안에 absolute 로 놓여 있어,
        목록을 내린 뒤 누르면 화면 밖에 그려져 아무것도 보이지 않았다.
        앱의 다른 팝업과 같은 하단 시트(fixed)로 바꿔 함께 해결한다. */}
      {confirm && (
        <div
          className="draft-exit-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="unblock-dialog-title"
        >
          <section className="draft-exit-panel">
            <div className="draft-exit-copy">
              <h2 id="unblock-dialog-title">차단을 해제할까요?</h2>
              <p>앞으로 이 사용자의 편지가 다시 연결될 수 있어요.</p>
            </div>
            <div className="draft-exit-actions">
              <button
                className="flow-primary-button"
                type="button"
                onClick={() => {
                  unblockUser(userId, confirm);
                  setConfirm(undefined);
                  setRefresh((value) => value + 1);
                }}
              >
                차단 해제
              </button>
              <button
                className="flow-text-button"
                type="button"
                onClick={() => setConfirm(undefined)}
              >
                계속 차단하기
              </button>
            </div>
          </section>
        </div>
      )}
    </Shell>
  );
}
