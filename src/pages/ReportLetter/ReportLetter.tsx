// 편지 신고 (/report-letter/:id)
// 2026-09-18 src/pages/Safety/ReportScreens.tsx 에서 옮겼다(코드 그대로).
import { useState } from "react";
import { blockUser } from "../../data/blocks";
import { hideContent } from "../../data/contentVisibility";
import { getCurrentUserId, getLetterById } from "../../data/letters";
import {
  createReport,
  getReportForTarget,
  type ReportReason,
} from "../../data/reports";
import { navigateTo, setPageTimeout } from "../../utils/navigation";
import { getListenEntryPath } from "../../data/waitingLetters";
import { ROUTES, routeTo } from "../../routes/paths";
import { Shell } from "../../components/safety/ReportShell";
// 신고 화면 CSS Modules(답장 신고 SafetyActionScreens.tsx 와 함께 쓴다).
import reportForm from "../Safety/ReportForm.module.css";

const reasons: ReadonlyArray<[ReportReason, string]> = [
  ["abusive", "모욕적이거나 공격적인 표현"],
  ["sexual", "성적이거나 불쾌한 내용"],
  ["personal_information", "개인정보 또는 연락처 포함"],
  ["spam", "광고 또는 반복적인 홍보"],
  ["dangerous_or_illegal", "위험하거나 불법적인 내용"],
  ["self_harm_encouragement", "자해·타해를 부추기는 내용"],
  ["other", "기타"],
];

export function LetterReportFigmaScreen({
  letterId,
  complete = false,
}: {
  letterId?: string;
  complete?: boolean;
}) {
  const userId = getCurrentUserId();
  const letter = letterId ? getLetterById(letterId) : undefined;
  const existing = letter
    ? getReportForTarget(userId, "letter", letter.id)
    : undefined;
  const [reason, setReason] = useState<ReportReason | undefined>("abusive");
  const [detail, setDetail] = useState("");
  const hide = true;
  const [block, setBlock] = useState(false);
  const [state, setState] = useState<
    "ready" | "processing" | "failed" | "complete"
  >(complete ? "complete" : "ready");
  if (!letter)
    return (
      <Shell title="편지 신고">
        <section className="flow-message">
          <h1>신고할 편지를 찾을 수 없어요</h1>
          <button
            className="flow-primary-button"
            type="button"
            onClick={() => navigateTo(getListenEntryPath(getCurrentUserId()))}
          >
            다른 편지 만나기
          </button>
        </section>
      </Shell>
    );
  // 신고를 접수하면 /report-letter/:id/complete 로 옮겨와 이 화면을 본다
  // (답장 신고와 같은 규칙). 2026-09-16 이전에는 /report-letter-complete-demo
  // 라는 이름이었는데, 데모 주소를 정리하면서 실제 흐름과 같은 자리로 옮겼다.
  if (state === "complete")
    return (
      <Shell title="신고 접수" showBackButton={false}>
        <section className="flow-message">
          <h1>신고가 접수되었어요</h1>
          <p>이 편지는 대기 목록에서 숨겨졌어요.</p>
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
  if (existing)
    return (
      <Shell title="편지 신고" showBackButton={false}>
        <section className="flow-message">
          <h1>이미 신고한 편지예요</h1>
          <p>신고한 편지는 대기 목록에 다시 나타나지 않아요.</p>
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
    if (!reason || state === "processing") return;
    // 아래 타이머 안에서는 letter 가 다시 undefined 로 보인다(타입 좁힘이 풀린다).
    // 여기서 한 번 잡아 둔다.
    const target = letter;
    if (!target) return;
    setState("processing");
    // 접수 중에 화면을 떠나면 신고를 만들지 않는다.
    setPageTimeout(() => {
      const report = createReport({
        reporterId: userId,
        targetType: "letter",
        targetId: target.id,
        reason,
        detail: detail.trim() || undefined,
        hiddenByReporter: hide,
        ...(block ? { blockedUserId: target.senderId } : {}),
      });
      if (!report) {
        setState("failed");
        return;
      }
      if (hide) hideContent(userId, "letter", target.id);
      if (block) blockUser(userId, target.senderId, "letter_report");
      navigateTo(routeTo.reportLetterComplete(target.id));
    }, 580);
  }
  return (
    <Shell
      title="편지 신고"
      screenClassName={`figma-report-letter-screen ${reportForm["figma-report-letter-screen"]}`}
      action={
        <div className="flow-fixed-action flow-fixed-action--split figma-report-action">
          <button
            className="flow-secondary-button"
            type="button"
            onClick={() => navigateTo(ROUTES.home)}
          >
            홈으로
          </button>
          <button
            className="flow-primary-button"
            disabled={!reason || state === "processing"}
            type="button"
            onClick={submit}
          >
            {state === "failed" ? "다시 시도" : "신고 접수하기"}
          </button>
        </div>
      }
    >
      <section
        className={`figma-report-screen ${reportForm["figma-report-screen"]}`}
      >
        <header>
          <h1>
            어떤 점이
            <br />
            불편하셨나요?
          </h1>
          <p>
            알려주신 내용은 운영 정책에 따라 살펴보고,
            <br />
            작성자에게는 알리지 않아요.
          </p>
        </header>
        <fieldset>
          <legend>신고 사유 (필수)</legend>
          {reasons.map(([value, label]) => (
            <label
              key={value}
              className={reason === value ? "is-selected" : ""}
            >
              <input
                type="radio"
                name="figma-letter-report-reason"
                checked={reason === value}
                onChange={() => setReason(value)}
              />
              <span>{label}</span>
            </label>
          ))}
        </fieldset>
        <section className="figma-report-detail">
          <label htmlFor="figma-report-detail">추가 설명 (선택)</label>
          <textarea
            id="figma-report-detail"
            value={detail}
            maxLength={200}
            onChange={(event) => setDetail(event.target.value)}
            placeholder="신고 사유를 자세히 입력해 주세요."
          />
          <small>{detail.length} / 200</small>
        </section>
        <label
          className={`figma-report-setting ${reportForm["figma-report-setting"]}${block ? " is-selected" : ""}`}
        >
          <input
            type="checkbox"
            checked={block}
            onChange={(event) => setBlock(event.target.checked)}
          />
          <span>
            <strong>신고와 작성자 차단 함께하기</strong>
            <small>앞으로 이 사용자의 편지가 나타나지 않아요.</small>
          </span>
        </label>
        <p className="flow-notice" role="status">
          {state === "processing"
            ? "신고를 접수하고 있어요."
            : state === "failed"
              ? "신고를 접수하지 못했어요. 다시 시도해주세요."
              : ""}
        </p>
      </section>
    </Shell>
  );
}
