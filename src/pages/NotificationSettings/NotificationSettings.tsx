// 알림 설정 (/notification-settings)
// 2026-09-18 src/pages/Notifications/NotificationScreens.tsx 에서 옮겼다(코드 그대로).
import { useState } from "react";
import {
  getNotificationSettings,
  updateNotificationSettings,
} from "../../data/notifications";
import { ROUTES } from "../../routes/paths";
import { Header } from "../../components/notifications/Header";
// CSS Modules 시범 전환: 기존 전역 class 이름은 그대로 두고 모듈 class 를 함께 붙인다
// (전역에 남은 공유 규칙과 utils/navigation.ts 가 기존 이름을 쓴다).
import styles from "../Notifications/NotificationScreens.module.css";

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
      className={`mobile-prototype notification-settings-screen ${styles["notification-settings-screen"]}${stageClassName ? ` ${stageClassName}` : ""}`}
    >
      <Header title="알림 설정" fallback={ROUTES.mySpace} />
      <div className={`notification-scroll ${styles["notification-scroll"]}`}>
        <section
          className={`notification-settings-list ${styles["notification-settings-list"]}`}
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
