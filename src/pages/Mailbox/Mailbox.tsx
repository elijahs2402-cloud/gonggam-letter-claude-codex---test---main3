import { useState } from "react";
import { navigateTo } from "../../utils/navigation";
import { AppBottomNavigation } from "../../components/common/AppBottomNavigation";
import {
  getCurrentUserId,
  getLettersRepliedByUser,
  getMyLetters,
} from "../../data/letters";
import type { Letter } from "../../types/letters";
import {
  getSentLetterDisplayStatus,
  sortSentLettersByActivity,
} from "../../data/mailboxStatus";
import { formatDate } from "../../utils/datetime";
import { ROUTES, routeTo } from "../../routes/paths";
// 편지함 CSS Modules: 기존 전역 class 이름은 그대로 두고 모듈 class 를 함께 붙인다.
import mailbox from "./Mailbox.module.css";

export function MailboxScreen() {
  const userId = getCurrentUserId();
  const myLetters = sortSentLettersByActivity(getMyLetters(userId), userId);
  const repliedLetters = getLettersRepliedByUser(userId);
  const records = [
    ...myLetters.map((letter) =>
      toUnifiedMailboxRecord(letter, "mine", userId),
    ),
    ...repliedLetters.map((letter) =>
      toUnifiedMailboxRecord(letter, "replied", userId),
    ),
    // 예전에는 여기에 getMailboxPreviewRecords() 로 만든 가짜 행 6개를 섞었다.
    // 그 행들은 href 가 모두 /mailbox-demo 라 눌러도 자기 상세로 가지 못했다.
    // 실제 편지만 보여주고, 화면을 채울 표본은 저장소에 심어 쓴다.
  ].sort((left, right) => right.activityAt.localeCompare(left.activityAt));
  return <MailboxCollection records={records} />;
}

function MailboxCollection({ records }: { records: UnifiedMailboxRecord[] }) {
  const [activeFilter, setActiveFilter] = useState<MailboxFilter>("all");
  const visibleRecords =
    activeFilter === "all"
      ? records
      : records.filter((record) => record.status === activeFilter);
  const filters: ReadonlyArray<{ id: MailboxFilter; label: string }> = [
    { id: "all", label: "전체" },
    { id: "waiting", label: "기다리는 중" },
    { id: "arrived", label: "답장 도착" },
    { id: "sent", label: "답장 보냄" },
  ];

  return (
    <main
      className={`mobile-prototype mailbox-screen ${mailbox["mailbox-screen"]} mailbox-screen--icon-set mailbox-screen--inline-direction ${mailbox["mailbox-screen--inline-direction"]}`}
    >
      <div
        className={`mailbox-scroll-region ${mailbox["mailbox-scroll-region"]}${visibleRecords.length ? "" : ` mailbox-scroll-region--empty ${mailbox["mailbox-scroll-region--empty"]}`}`}
      >
        <header
          className={`mailbox-heading ${mailbox["mailbox-heading"]} mailbox-heading--unified ${mailbox["mailbox-heading--unified"]}`}
          aria-labelledby="mailbox-title"
        >
          <h1 id="mailbox-title">편지함</h1>
          <span>주고받은 마음을 다시 꺼내볼 수 있어요.</span>
        </header>
        <div
          className={`mailbox-filter-chips ${mailbox["mailbox-filter-chips"]}`}
          role="group"
          aria-label="편지 상태로 정렬"
        >
          <span className="sr-only">편지 상태 필터</span>
          {filters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              className={activeFilter === filter.id ? "is-active" : ""}
              aria-pressed={activeFilter === filter.id}
              onClick={() => setActiveFilter(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>
        {visibleRecords.length ? (
          <section
            className={`mailbox-unified-list ${mailbox["mailbox-unified-list"]}`}
            aria-label="내 편지 목록"
          >
            {visibleRecords.map((record) => (
              <UnifiedMailboxRow key={record.id} record={record} />
            ))}
          </section>
        ) : (
          <UnifiedMailboxEmpty />
        )}
      </div>
      <AppBottomNavigation active="mailbox" />
    </main>
  );
}

type MailboxFilter = "all" | "waiting" | "arrived" | "sent";
type UnifiedMailboxRecord = {
  id: string;
  href: string;
  status: Exclude<MailboxFilter, "all">;
  label: string;
  nickname: string;
  activityAt: string;
  isUnread?: boolean;
  preview?: string;
};

// 미리보기는 "내가 쓴 글"이거나 "이미 읽은 글"에만 보여준다.
// 안 읽은 답장의 첫 줄을 목록에 노출하면, 편지를 열어보는 순간의
// 기다림을 미리 써버린다. 이 앱에서 가장 중요한 순간이다.
const previewText = (value?: string) =>
  value ? value.trim().replace(/\s+/g, " ") : undefined;

function toUnifiedMailboxRecord(
  letter: Letter,
  mode: "mine" | "replied",
  userId: string,
): UnifiedMailboxRecord {
  if (mode === "replied")
    return {
      id: letter.id,
      href: routeTo.repliedLetter(letter.id),
      status: "sent",
      label: "답장 보냄",
      nickname: letter.anonymousName || "누군가",
      activityAt: letter.repliedAt ?? letter.updatedAt,
      preview: previewText(letter.reply?.content),
    };
  const displayStatus = getSentLetterDisplayStatus(letter, userId);
  const arrived =
    displayStatus.kind === "reply_arrived_unread" ||
    displayStatus.kind === "reply_opened";
  const unread = displayStatus.hasUnreadReply;
  // 기다리는 중이면 내 편지 첫 줄, 이미 읽은 답장이면 답장 첫 줄.
  // 안 읽은 답장은 미리보기를 비워 두고 화면에서 상태 문장으로 대신한다.
  const preview = arrived
    ? unread
      ? undefined
      : previewText(letter.reply?.content)
    : previewText(letter.content);
  return {
    id: letter.id,
    href: routeTo.myLetter(letter.id),
    status: arrived ? "arrived" : "waiting",
    label: arrived ? "답장 도착" : "기다리는 중",
    nickname: letter.anonymousName || "익명",
    activityAt: displayStatus.activityAt,
    isUnread: unread,
    preview,
  };
}

// 편지함 한 줄 — 이름 · 상태 라벨(오른쪽) / 본문 미리보기 · 날짜
//
// 이전에는 날짜가 첫 줄을 혼자 쓰고 상태 라벨이 오른쪽 넓은 자리를 차지해,
// 정작 편지를 알아볼 단서(본문)가 들어갈 자리가 없었다. 상태를 짧은 라벨로
// 압축해 그 자리를 회수하고 미리보기를 넣는다.
//
// 한때 왼쪽에 방향 표식(← → –)도 뒀지만 뺐다. 색까지 같은 상태 라벨과
// 같은 말을 두 번 했고, 표식이 밀어낸 32px 때문에 목록만 제목·칩보다
// 안쪽으로 들어가 페이지의 왼쪽 선이 끊겼다.
function UnifiedMailboxRow({ record }: { record: UnifiedMailboxRecord }) {
  const name = record.status === "waiting" ? "내가 보낸 편지" : record.nickname;
  return (
    <button
      type="button"
      className={`mailbox-unified-item ${mailbox["mailbox-unified-item"]} mailbox-unified-item--${record.status}${record.isUnread ? " is-unread" : ""}`}
      onClick={() => navigateTo(record.href)}
    >
      <strong
        className={`mailbox-unified-name ${mailbox["mailbox-unified-name"]}`}
      >
        {name}
        {record.isUnread && (
          <i
            className={`mailbox-unified-unread ${mailbox["mailbox-unified-unread"]}`}
            aria-label="읽지 않은 답장"
          />
        )}
      </strong>
      <em
        className={`mailbox-unified-status ${mailbox["mailbox-unified-status"]} mailbox-unified-status--${record.status}`}
      >
        {record.label}
      </em>
      {record.preview ? (
        <span
          className={`mailbox-unified-preview ${mailbox["mailbox-unified-preview"]}`}
        >
          {record.preview}
        </span>
      ) : record.status === "arrived" && record.isUnread ? (
        <span
          className={`mailbox-unified-preview ${mailbox["mailbox-unified-preview"]} mailbox-unified-preview--sealed ${mailbox["mailbox-unified-preview--sealed"]}`}
        >
          아직 열어보지 않았어요.
        </span>
      ) : null}
      <time
        className={`mailbox-unified-date ${mailbox["mailbox-unified-date"]}`}
        dateTime={record.activityAt}
      >
        {formatDate(record.activityAt)}
      </time>
    </button>
  );
}

// 필터와 무관하게 같은 빈 상태를 보여준다. 상태별로 문구와 버튼이 달라지면
// 같은 화면이 두 가지 얼굴을 갖게 되고, 필터를 옮길 때마다 나가는 길이 사라진다.
function UnifiedMailboxEmpty() {
  return (
    <section
      className={`mailbox-letter-empty ${mailbox["mailbox-letter-empty"]} mailbox-letter-empty--unified ${mailbox["mailbox-letter-empty--unified"]}`}
    >
      <p>아직 편지가 없어요</p>
      <span>
        새로운 마음이 오면
        <br />
        이곳에 차분히 기록할게요.
      </span>
      <button type="button" onClick={() => navigateTo(ROUTES.writeLetter)}>
        편지 쓰기
      </button>
    </section>
  );
}
