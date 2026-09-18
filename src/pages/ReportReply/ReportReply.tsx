// 답장 신고 (/report-reply/:id)
// 2026-09-18 src/pages/Safety/SafetyActionScreens.tsx 에서 옮겼다(코드 그대로).
import { useState } from "react";
import { blockUser } from "../../data/blocks";
import { getCurrentUserId, getLetterById } from "../../data/letters";
import { navigateTo, setPageTimeout } from "../../utils/navigation";
import {
  createReport,
  getReportForTarget,
  type ReportReason,
} from "../../data/reports";
import { ROUTES, routeTo } from "../../routes/paths";
import { Shell } from "../../components/safety/Shell";
// 신고 화면 CSS Modules(편지 신고 ReportScreens.tsx 와 함께 쓴다).
import reportForm from "../Safety/ReportForm.module.css";

const reportReasons: ReadonlyArray<[ReportReason, string]> = [
  ["abusive", "모욕적이거나 공격적인 표현"],
  ["sexual", "성적이거나 불쾌한 내용"],
  ["personal_information", "개인정보 또는 연락처 포함"],
  ["spam", "광고 또는 반복적인 홍보"],
  ["dangerous_or_illegal", "위험하거나 불법적인 내용"],
  ["self_harm_encouragement", "자해·타해를 부추기는 내용"],
  ["other", "기타"],
];

export function ReportReplyScreen({
  letterId,
  complete = false,
  existingDemo = false,
  completeDemo = false,
}: {
  letterId?: string;
  complete?: boolean;
  existingDemo?: boolean;
  completeDemo?: boolean;
}) {
  if (existingDemo)
    return (
      <Shell title="편지 신고" fallback={ROUTES.mailbox} showBackButton={false}>
        <section className="flow-message">
          <h1>이미 신고한 편지예요</h1>
          <p>신고 내역은 차단 및 신고 관리에서 확인할 수 있어요.</p>
          <button
            className="flow-primary-button"
            type="button"
            onClick={() => navigateTo(ROUTES.safetyManagement)}
          >
            신고 내역 확인
          </button>
          <button
            className="flow-text-button"
            type="button"
            onClick={() => navigateTo(ROUTES.home)}
          >
            홈으로 돌아가기
          </button>
        </section>
      </Shell>
    );
  if (completeDemo)
    return (
      <Shell title="신고 접수" fallback={ROUTES.mailbox} showBackButton={false}>
        <section className="flow-message">
          <h1>신고를 접수했어요</h1>
          <p>신고 내역은 차단 및 신고 관리에서 확인할 수 있어요.</p>
          <button
            className="flow-primary-button"
            type="button"
            onClick={() => navigateTo(ROUTES.safetyManagement)}
          >
            신고 내역 확인
          </button>
          <button
            className="flow-text-button"
            type="button"
            onClick={() => navigateTo(ROUTES.home)}
          >
            홈으로 돌아가기
          </button>
        </section>
      </Shell>
    );
  return <ReplyReportForm letterId={letterId} complete={complete} />;
}

// Hook 은 조건에 따라 호출하면 안 되므로, 위의 데모 분기(조기 반환)와 Hook 을 쓰는 본문을 나눴다.
function ReplyReportForm({
  letterId,
  complete,
}: {
  letterId?: string;
  complete: boolean;
}) {
  const userId = getCurrentUserId();
  const letter = letterId ? getLetterById(letterId) : undefined;
  const reply = letter?.reply;
  const existing = reply
    ? getReportForTarget(userId, "reply", reply.id)
    : undefined;
  // '이미 신고한 편지'인지는 화면을 열 때 한 번만 판단한다.
  // 매번 새로 읽으면, 이 화면에서 신고를 접수한 직후 다시 그릴 때 방금 만든
  // 신고가 '이전 신고'로 잡혀 완료 화면 대신 '이미 신고한 편지예요'가 떴다.
  const [reportedBeforeOpening] = useState(() => Boolean(existing));
  const [reason, setReason] = useState<ReportReason | undefined>();
  const [detail, setDetail] = useState("");
  const [withBlock, setWithBlock] = useState(false);
  const [status, setStatus] = useState<
    "ready" | "submitting" | "failed" | "complete"
  >(complete || reportedBeforeOpening ? "complete" : "ready");
  if (!letter || !reply || letter.senderId !== userId)
    return (
      <Shell title="편지 신고" fallback={ROUTES.mailbox}>
        <section className="flow-message">
          <h1>신고할 편지를 찾을 수 없어요</h1>
          <button
            className="flow-primary-button"
            type="button"
            onClick={() => navigateTo(ROUTES.mailbox)}
          >
            편지함 가기
          </button>
        </section>
      </Shell>
    );
  const returnTo = routeTo.myLetter(letter.id);
  // 아래 submit 은 함수 선언이라 위 가드의 '답장이 있다'는 판단이 전달되지 않는다.
  const reportedReply = reply;
  if (reportedBeforeOpening && !complete)
    return (
      <Shell title="편지 신고" fallback={returnTo}>
        <section className="flow-message">
          <h1>이미 신고한 편지예요</h1>
          <p>신고 내역은 차단 및 신고 관리에서 확인할 수 있어요.</p>
          <button
            className="flow-primary-button"
            type="button"
            onClick={() => navigateTo(ROUTES.safetyManagement)}
          >
            신고 내역 확인
          </button>
          <button
            className="flow-text-button"
            type="button"
            onClick={() => navigateTo(ROUTES.home)}
          >
            홈으로 돌아가기
          </button>
        </section>
      </Shell>
    );
  function submit() {
    if (!reason || status === "submitting") return;
    setStatus("submitting");
    // 접수 중에 화면을 떠나면 신고를 만들지 않는다.
    setPageTimeout(() => {
      const report = createReport({
        reporterId: userId,
        targetType: "reply",
        targetId: reportedReply.id,
        reason,
        detail: detail.trim() || undefined,
        hiddenByReporter: false,
        ...(withBlock ? { blockedUserId: reportedReply.writerId } : {}),
      });
      if (!report) {
        setStatus("failed");
        return;
      }
      if (withBlock) blockUser(userId, reportedReply.writerId, "reply_report");
      setStatus("complete");
    }, 640);
  }
  if (status === "complete")
    return (
      <Shell title="신고 접수" fallback={returnTo} showBackButton={false}>
        <section className="flow-message">
          <h1>
            {withBlock
              ? "신고를 접수하고 작성자를 차단했어요"
              : "신고를 접수했어요"}
          </h1>
          <p>신고 내역은 차단 및 신고 관리에서 확인할 수 있어요.</p>
          <button
            className="flow-primary-button"
            type="button"
            onClick={() => navigateTo(ROUTES.safetyManagement)}
          >
            신고 내역 확인
          </button>
          <button
            className="flow-text-button"
            type="button"
            onClick={() => navigateTo(ROUTES.home)}
          >
            홈으로 돌아가기
          </button>
        </section>
      </Shell>
    );
  // 화면은 편지 신고 최종본(/report-letter/:id, ReportLetterScreen)과 같은 figma-report-* 마크업을 쓴다.
  // 신고 대상은 답장(reply.id), 차단 대상은 답장 작성자(reply.writerId) 그대로다 — 동작은 바꾸지 않았다.
  return (
    <Shell
      title="편지 신고"
      fallback={returnTo}
      action={
        <div className="flow-fixed-action flow-fixed-action--single figma-report-action">
          <button
            className="flow-primary-button"
            disabled={!reason || status === "submitting"}
            type="button"
            onClick={submit}
          >
            {status === "failed" ? "다시 시도" : "신고 접수하기"}
          </button>
        </div>
      }
    >
      <section
        className={`figma-report-screen ${reportForm["figma-report-screen"]}`}
      >
        <header>
          <h1>어떤 점이 불편하셨나요?</h1>
          <p>
            알려주신 내용은 운영 정책에 따라 살펴보고,
            <br />
            작성자에게는 알리지 않아요.
          </p>
        </header>
        <fieldset>
          <legend>신고 사유 (필수)</legend>
          {reportReasons.map(([value, label]) => (
            <label
              key={value}
              className={reason === value ? "is-selected" : ""}
            >
              <input
                type="radio"
                name="reply-report-reason"
                checked={reason === value}
                onChange={() => setReason(value)}
              />
              <span>{label}</span>
            </label>
          ))}
        </fieldset>
        <section className="figma-report-detail">
          <label htmlFor="figma-reply-report-detail">추가 설명 (선택)</label>
          <textarea
            id="figma-reply-report-detail"
            value={detail}
            maxLength={200}
            onChange={(event) => setDetail(event.target.value)}
            placeholder="신고 사유를 자세히 입력해 주세요."
          />
          <small>{detail.length} / 200</small>
        </section>
        <label
          className={`figma-report-setting ${reportForm["figma-report-setting"]}${withBlock ? " is-selected" : ""}`}
        >
          <input
            type="checkbox"
            checked={withBlock}
            onChange={(event) => setWithBlock(event.target.checked)}
          />
          <span>
            <strong>신고와 작성자 차단 함께하기</strong>
            <small>앞으로 이 사용자의 편지가 나타나지 않아요.</small>
          </span>
        </label>
        <p className="flow-notice" role="status">
          {status === "submitting"
            ? "신고를 접수하고 있어요."
            : status === "failed"
              ? "신고를 접수하지 못했어요. 다시 시도해주세요."
              : ""}
        </p>
      </section>
    </Shell>
  );
}
