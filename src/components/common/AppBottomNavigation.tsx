import { navigateTo } from "../../utils/navigation";
import { getCurrentUserId } from "../../data/letters";
import { getLetterDraft } from "../../data/letterDraft";
import { hasMailboxAttention } from "../../data/mailboxAttention";
import { ROUTES } from "../../routes/paths";
// CSS Modules 전환: 기존 전역 class 이름은 그대로 두고 모듈 class 를 함께 붙인다.
import styles from "./AppBottomNavigation.module.css";

type AppSection = "home" | "mailbox" | "my-space";

// The mark artwork is attached in CSS so the icon can take the button's colour.
const items: ReadonlyArray<{
  id: AppSection;
  label: string;
  path: string;
  mark: string;
}> = [
  { id: "home", label: "홈", path: ROUTES.home, mark: "home" },
  { id: "mailbox", label: "편지함", path: ROUTES.mailbox, mark: "mailbox" },
  { id: "my-space", label: "나의 공간", path: ROUTES.mySpace, mark: "space" },
];

export function AppBottomNavigation({
  active,
  showAttention = true,
}: {
  active: AppSection;
  showAttention?: boolean;
}) {
  const userId = getCurrentUserId();
  const hasAttention = hasMailboxAttention(
    userId,
    Boolean(getLetterDraft(userId)?.content.trim()),
  );
  return (
    <nav
      className={`app-bottom-navigation ${styles["app-bottom-navigation"]}`}
      aria-label="주요 메뉴"
    >
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={item.id === active ? "is-active" : ""}
          aria-current={item.id === active ? "page" : undefined}
          onClick={() => navigateTo(item.path)}
        >
          <span
            className={`app-nav-mark app-nav-mark--${item.mark} ${styles["app-nav-mark"]} ${styles[`app-nav-mark--${item.mark}`]}`}
            aria-hidden="true"
          />
          {item.id === "mailbox" && showAttention && hasAttention && (
            <>
              <i
                className={`app-nav-notice-dot ${styles["app-nav-notice-dot"]}`}
                aria-hidden="true"
              />
              <span className="sr-only">
                확인이 필요한 편지함 소식이 있어요.
              </span>
            </>
          )}
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
