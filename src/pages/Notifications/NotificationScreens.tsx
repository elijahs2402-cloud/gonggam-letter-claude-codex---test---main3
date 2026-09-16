import { useState } from "react";
import { getLetterById } from "../../data/letters";
import {
  getNotificationSettings,
  getNotifications,
  markNotificationRead,
  updateNotificationSettings,
  type MockNotification,
} from "../../data/notifications";
import { navigateBack, navigateTo } from "../../utils/navigation";
import { formatDate } from "../../utils/datetime";
// CSS Modules 시범 전환: 기존 전역 class 이름은 그대로 두고 모듈 class 를 함께 붙인다
// (전역에 남은 공유 규칙과 utils/navigation.ts 가 기존 이름을 쓴다).
import styles from "./NotificationScreens.module.css";

function Header({ title, fallback }: { title: string; fallback: string }) {
  return (
    <header className="flow-header">
      <button
        type="button"
        onClick={() => navigateBack(fallback)}
        aria-label="이전으로 돌아가기"
      >
        ←
      </button>
      <strong>{title}</strong>
      <span aria-hidden="true" />
    </header>
  );
}
function timeText(value: string) {
  const diff = Math.max(0, Date.now() - new Date(value).getTime());
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "방금";
  if (minutes < 60) return `${minutes}분 전`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}시간 전`;
  return formatDate(value);
}
function targetUnavailable(notice: MockNotification) {
  if (!notice.targetRoute) return false;
  const routeTarget = notice.targetRoute.match(
    /^\/(?:reply-arrived|write-reply|mailbox\/my)\/([^/?]+)/,
  )?.[1];
  const targetId = notice.targetId ?? routeTarget;
  return Boolean(targetId && !getLetterById(targetId));
}

export function NotificationsScreen({
  stageClassName = "",
  notices: noticesOverride,
}: {
  stageClassName?: string;
  /** 목업 저장소를 건드리지 않고 화면 상태를 확인할 때만 주입한다. */
  notices?: MockNotification[];
} = {}) {
  const [version, setVersion] = useState(0);
  const [noticeDetail, setNoticeDetail] = useState<
    MockNotification | undefined
  >();
  const notices = noticesOverride ?? getNotifications();
  const refresh = () => setVersion((value) => value + 1);
  const open = (notice: MockNotification) => {
    markNotificationRead(notice.id);
    refresh();
    // 신고 접수·검토 완료 알림은 차단 및 신고 관리에서 내역을 본다(2026-09-15).
    if (
      notice.type === "report_received" ||
      notice.type === "report_resolved"
    ) {
      navigateTo("/safety-management");
      return;
    }
    if (!notice.targetRoute) {
      setNoticeDetail(notice);
      return;
    }
    if (targetUnavailable(notice)) {
      setNoticeDetail({
        ...notice,
        title: "연결된 내용을 찾을 수 없어요.",
        message: "이 알림과 연결된 내용을 더 이상 볼 수 없어요.",
      });
      return;
    }
    navigateTo(notice.targetRoute);
  };
  return (
    <main
      className={`mobile-prototype notification-screen ${styles["notification-screen"]} ${styles[`notification-screen ${styles["notification-screen"]}`]}${stageClassName ? ` ${stageClassName}` : ""}`}
      data-version={version}
    >
      <Header title="알림" fallback="/home" />
      <div
        className={`notification-scroll ${styles["notification-scroll"]} ${styles[`notification-scroll ${styles["notification-scroll"]}`]}`}
      >
        {notices.length ? (
          <section
            className={`notification-list ${styles["notification-list"]} ${styles[`notification-list ${styles["notification-list"]}`]}`}
            aria-label="알림 목록"
          >
            {notices.map((notice) => (
              <button
                key={notice.id}
                className={`notification-row ${styles["notification-row"]} ${styles[`notification-row ${styles["notification-row"]}`]}${notice.isRead ? "" : " is-unread"}`}
                type="button"
                onClick={() => open(notice)}
              >
                <span
                  className={`notification-row-copy ${styles["notification-row-copy"]} ${styles[`notification-row-copy ${styles["notification-row-copy"]}`]}`}
                >
                  <span
                    className={`notification-row-title ${styles["notification-row-title"]} ${styles[`notification-row-title ${styles["notification-row-title"]}`]}`}
                  >
                    {notice.title}
                    {!notice.isRead && (
                      <i
                        className={`notification-row-dot ${styles["notification-row-dot"]} ${styles[`notification-row-dot ${styles["notification-row-dot"]}`]}`}
                        aria-label="읽지 않은 알림"
                      />
                    )}
                  </span>
                  <span>{notice.message}</span>
                  <time>{timeText(notice.createdAt)}</time>
                </span>
              </button>
            ))}
          </section>
        ) : (
          <section
            className={`notification-empty ${styles["notification-empty"]} ${styles[`notification-empty ${styles["notification-empty"]}`]}`}
          >
            <h1>아직 새로운 알림이 없어요</h1>
            <p>
              편지의 소식이 도착하면
              <br />
              이곳에서 알려드릴게요.
            </p>
            <button
              className="flow-secondary-button"
              type="button"
              onClick={() => navigateTo("/home")}
            >
              홈으로 돌아가기
            </button>
          </section>
        )}
      </div>
      {noticeDetail && (
        <div
          className={`auth-dialog-backdrop ${styles["auth-dialog-backdrop"]}`}
        >
          <section
            className={`auth-dialog ${styles["auth-dialog"]} notification-detail ${styles["notification-detail"]}`}
            role="dialog"
            aria-modal="true"
          >
            <p>알림</p>
            <h2>{noticeDetail.title}</h2>
            <span>{noticeDetail.message}</span>
            <button
              className="auth-primary"
              type="button"
              onClick={() => setNoticeDetail(undefined)}
            >
              닫기
            </button>
          </section>
        </div>
      )}
    </main>
  );
}

/** 알림 화면에 표시할 수 있는 모든 유형을 한 번에 확인하는 임시 시안. */
const allNotificationCases: MockNotification[] = [
  {
    id: "demo-reply-arrived",
    userId: "demo",
    type: "reply_arrived",
    title: "답장이 도착했어요.",
    message: "당신의 편지를 읽은 사람이 마음을 전했어요.",
    targetRoute: "/mailbox-my-replied-demo",
    isRead: false,
    createdAt: "2026-09-15T08:45:00.000Z",
  },
  {
    id: "demo-letter-assigned",
    userId: "demo",
    type: "letter_assigned",
    title: "누군가가 편지를 맡았어요.",
    message: "답장이 도착하면 다시 알려드릴게요.",
    targetRoute: "/mailbox-my-waiting-demo",
    isRead: false,
    createdAt: "2026-09-14T15:20:00.000Z",
  },
  {
    id: "demo-reply-reminder",
    userId: "demo",
    type: "reply_reminder",
    title: "맡은 편지에 답장을 전해주세요.",
    message: "하루 안에 사라져요. 짧은 한마디도 괜찮아요.",
    targetRoute: "/write-reply",
    isRead: false,
    createdAt: "2026-09-14T05:00:00.000Z",
  },
  {
    id: "demo-report-received",
    userId: "demo",
    type: "report_received",
    title: "신고를 접수했어요.",
    message: "확인 후 필요한 조치를 안내해 드릴게요.",
    targetRoute: "/safety-management",
    isRead: true,
    createdAt: "2026-09-12T04:30:00.000Z",
  },
  {
    id: "demo-report-resolved",
    userId: "demo",
    type: "report_resolved",
    title: "신고 검토가 완료되었어요.",
    message: "검토 결과와 조치 내용을 확인해 주세요.",
    targetRoute: "/safety-management",
    isRead: true,
    createdAt: "2026-09-10T01:15:00.000Z",
  },
];

export function NotificationsAllCasesDemoScreen() {
  return <NotificationsScreen notices={allNotificationCases} />;
}

const settingRows = [
  ["replyArrived", "답장 도착", "답장이 도착했을 때 알려드려요."],
  [
    "replyReminders",
    "맡은 편지 답장 안내",
    "아직 전하지 못한 답장이 있을 때 알려드려요.",
  ],
] as const;

export function NotificationSettingsScreen({
  stageClassName = "",
}: { stageClassName?: string } = {}) {
  const [settings, setSettings] = useState(getNotificationSettings);
  const change = (
    changes: Parameters<typeof updateNotificationSettings>[0],
  ) => {
    const next = updateNotificationSettings(changes);
    setSettings(next);
  };
  return (
    <main
      className={`mobile-prototype notification-settings-screen ${styles["notification-settings-screen"]} ${styles[`notification-settings-screen ${styles["notification-settings-screen"]}`]}${stageClassName ? ` ${stageClassName}` : ""}`}
    >
      <Header title="알림 설정" fallback="/my-space" />
      <div
        className={`notification-scroll ${styles["notification-scroll"]} ${styles[`notification-scroll ${styles["notification-scroll"]}`]}`}
      >
        <section
          className={`notification-settings-list ${styles["notification-settings-list"]} ${styles[`notification-settings-list ${styles["notification-settings-list"]}`]}`}
          aria-label="알림 종류 설정"
        >
          {settingRows.map(([key, title, description]) => (
            <label key={key}>
              <span>
                <strong>{title}</strong>
                <small>{description}</small>
              </span>
              <input
                type="checkbox"
                checked={settings[key]}
                onChange={() => change({ [key]: !settings[key] })}
              />
              <i aria-hidden="true" />
            </label>
          ))}
          <label className="is-required">
            <span>
              <strong>서비스 중요 안내</strong>
              <small>서비스 이용에 꼭 필요한 안내예요.</small>
            </span>
            <input type="checkbox" checked readOnly />
            <i aria-hidden="true" />
          </label>
        </section>
      </div>
    </main>
  );
}
