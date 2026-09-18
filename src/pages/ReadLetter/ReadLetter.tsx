// 편지 읽기 (/read-letter/:id)
// 2026-09-18 src/pages/Letter/LetterFlowScreens.tsx 에서 옮겼다(코드 그대로).
import { useState } from "react";
import { navigateTo } from "../../utils/navigation";
import {
  assignLetterToReader,
  getCurrentUserId,
  getLetterById,
} from "../../data/letters";
import { getReplyDraft } from "../../data/letterDraft";
import { seedSampleLetters } from "../../data/sampleLetters";
import { isUserBlocked } from "../../data/blocks";
import { getLetterReturn } from "../../data/letterReturns";
import {
  RETURNED_LETTER_BODY,
  RETURNED_LETTER_TITLE,
} from "../../constants/copy";
import { getListenEntryPath } from "../../data/waitingLetters";
import { LetterReturnSheet } from "../../components/letter/LetterReturnSheet";
import { assetUrl } from "../../utils/basePath";
import { ROUTES, routeTo } from "../../routes/paths";
import { FocusShell } from "../../components/letter/FocusShell";
import { formatLetterReadTime } from "../../utils/letterDates";
import { MissingLetterScreen } from "../../components/letter/MissingLetterScreen";
// CSS Modules: 기존 전역 class 이름은 그대로 두고 모듈 class 를 함께 붙인다.
import flow from "../../components/letter/LetterFlow.module.css";

export function ReadLetterScreen({ letterId }: { letterId?: string }) {
  // 두고 가기 확인은 페이지를 옳기지 않고 이 화면 위에 시트로 띄운다.
  // 뒤에 읽던 편지가 남아 있어야 '이 편지를'라는 말이 성립한다.
  // 가드보다 위에 두어야 훅이 조건부로 호출되지 않는다.
  const [showReturnSheet, setShowReturnSheet] = useState(false);
  if (letterId?.startsWith("sample-waiting-letter-")) seedSampleLetters();
  const letter = letterId ? getLetterById(letterId) : undefined;
  if (!letter)
    return <MissingLetterScreen fallback={ROUTES.home} title="편지 읽기" />;
  if (letter.senderId === getCurrentUserId())
    return <MissingLetterScreen fallback={ROUTES.home} title="편지 읽기" />;
  if (letter.prototypeWaitingScenario === "returned")
    return (
      <FocusShell title="편지 읽기" fallback={ROUTES.home}>
        <section className="flow-message">
          <h1>{RETURNED_LETTER_TITLE}</h1>
          <p>{RETURNED_LETTER_BODY}</p>
          <button
            className="flow-primary-button"
            type="button"
            onClick={() => navigateTo(getListenEntryPath(getCurrentUserId()))}
          >
            다른 편지 만나기
          </button>
        </section>
      </FocusShell>
    );
  if (letter.prototypeWaitingScenario === "blocked")
    return (
      <FocusShell title="편지 읽기" fallback={ROUTES.home}>
        <section className="flow-message">
          <h1>차단한 사용자와 연결된 편지예요</h1>
          <p>안전을 위해 이 내용은 확인할 수 없어요.</p>
          <button
            className="flow-primary-button"
            type="button"
            onClick={() => navigateTo(getListenEntryPath(getCurrentUserId()))}
          >
            다른 편지 만나기
          </button>
        </section>
      </FocusShell>
    );
  if (letter.prototypeWaitingScenario === "deleted")
    return (
      <FocusShell title="편지 읽기" fallback={ROUTES.home}>
        <section className="flow-message">
          <h1>이 편지를 찾을 수 없어요</h1>
          <p>지워졌거나, 더는 열어볼 수 없는 편지예요.</p>
          <button
            className="flow-primary-button"
            type="button"
            onClick={() => navigateTo(getListenEntryPath(getCurrentUserId()))}
          >
            다른 편지 만나기
          </button>
        </section>
      </FocusShell>
    );
  if (letter.status === "withdrawn")
    return (
      <FocusShell title="편지 읽기" fallback={ROUTES.home}>
        <section className="flow-message">
          <h1>
            편지의 주인이
            <br />
            편지를 거두었어요
          </h1>
          <p>더 이상 이 편지를 읽거나 답장을 쓸 수 없어요.</p>
          <button
            className="flow-primary-button"
            type="button"
            onClick={() => navigateTo(getListenEntryPath(getCurrentUserId()))}
          >
            다른 편지 만나기
          </button>
        </section>
      </FocusShell>
    );
  if (
    ["high_risk", "needs_revision", "under_review", "blocked"].includes(
      letter.safetyStatus ?? "clear",
    ) ||
    ["pending", "reviewing", "rejected"].includes(
      letter.moderationStatus ?? "not_required",
    )
  )
    return (
      <FocusShell title="편지 읽기" fallback={ROUTES.home}>
        <section className="flow-message">
          <h1>
            현재 이 편지를
            <br />열 수 없어요
          </h1>
          <p>안전을 위해 이 편지의 내용을 확인할 수 없어요.</p>
          <button
            className="flow-primary-button"
            type="button"
            onClick={() => navigateTo(getListenEntryPath(getCurrentUserId()))}
          >
            다른 편지 만나기
          </button>
        </section>
      </FocusShell>
    );
  if (getLetterReturn(letter.id, getCurrentUserId()))
    return (
      <FocusShell title="편지 읽기" fallback={ROUTES.home}>
        <section className="flow-message">
          <h1>{RETURNED_LETTER_TITLE}</h1>
          <p>{RETURNED_LETTER_BODY}</p>
          <button
            className="flow-primary-button"
            type="button"
            onClick={() => navigateTo(getListenEntryPath(getCurrentUserId()))}
          >
            다른 편지 만나기
          </button>
        </section>
      </FocusShell>
    );
  if (isUserBlocked(getCurrentUserId(), letter.senderId))
    return (
      <FocusShell title="편지 읽기" fallback={ROUTES.home} hideBack>
        <section className="flow-message">
          <h1>차단한 사용자의 콘텐츠예요</h1>
          <p>안전을 위해 이 내용은 기본적으로 숨겨져 있어요.</p>
          <button
            className="flow-primary-button"
            type="button"
            onClick={() => navigateTo(ROUTES.safetyManagement)}
          >
            차단 내역 확인
          </button>
          <button
            className="flow-text-button"
            type="button"
            onClick={() => navigateTo(ROUTES.home)}
          >
            홈으로 돌아가기
          </button>
        </section>
      </FocusShell>
    );
  if (letter.assignedReaderId && letter.assignedReaderId !== getCurrentUserId())
    return (
      <FocusShell title="편지 읽기" fallback={ROUTES.home}>
        <section className="flow-message">
          <h1>
            이 편지는 다른 사람이
            <br />
            먼저 맡았어요
          </h1>
          <p>다른 기다리는 마음을 만나볼 수 있어요.</p>
          <button
            className="flow-primary-button"
            type="button"
            onClick={() => navigateTo(getListenEntryPath(getCurrentUserId()))}
          >
            다른 편지 만나기
          </button>
          <button
            className="flow-text-button"
            type="button"
            onClick={() => navigateTo(ROUTES.home)}
          >
            홈으로 돌아가기
          </button>
        </section>
      </FocusShell>
    );
  const alreadyAssignedToCurrentUser =
    letter.assignedReaderId === getCurrentUserId();
  const continueTo = (destination: "reply" | "return") => {
    if (alreadyAssignedToCurrentUser) {
      navigateTo(
        `/${destination === "reply" ? "write-reply" : "return-letter"}/${encodeURIComponent(letter.id)}${destination === "return" ? "?start=1" : ""}`,
      );
      return;
    }

    const result = assignLetterToReader(letter.id, getCurrentUserId());
    if (result.ok) {
      navigateTo(
        `/${destination === "reply" ? "write-reply" : "return-letter"}/${encodeURIComponent(letter.id)}${destination === "return" ? "?start=1" : ""}`,
      );
      return;
    }
    navigateTo(getListenEntryPath(getCurrentUserId()));
  };
  // 편지를 맡은 뒤에도 '안 받을게요'는 그대로 둔다.
  //
  // 예전에는 맡고 나면 이 버튼을 감췄다. 그러면 두고 갈 방법이 아예 사라진다 —
  // 두고 가기 시트를 여는 곳이 이 버튼 하나뿐이라, 답장을 보내거나 3일이 지나
  // 편지가 사라지기를 기다리는 것 말고는 빠져나올 길이 없었다.

  // 오른쪽 버튼 문구는 '맡았는가'가 아니라 '쓰다 만 답장이 있는가'로 갈린다.
  //
  // 편지를 맡는 것과 답장을 쓰기 시작하는 것은 다른 일이다. 맡기만 하고
  // 한 글자도 쓰지 않았는데 '이어 쓰기'라고 하면, 쓴 적 없는 것을 이어 쓰라는
  // 말이 된다 — 새 편지를 받자마자 이 화면에 오면 늘 그 상태다.
  const replyDraft = getReplyDraft(letter.id, getCurrentUserId());
  const hasReplyDraft = Boolean(replyDraft?.content.trim());
  const useFirstMeetingActions = letter.id === "sample-waiting-letter-one";
  const startReply = () => {
    if (useFirstMeetingActions) {
      if (!alreadyAssignedToCurrentUser)
        assignLetterToReader(letter.id, getCurrentUserId());
      navigateTo(routeTo.writeReply(letter.id));
      return;
    }
    continueTo("reply");
  };
  // 뒤로가기는 히스토리를 되감고, 되감을 것이 없을 때만 아래 fallback 으로 간다.
  //
  // 예전에는 답장을 쓰던 중일 때 `/write-reply/:id` 로 '밀어 넣어' 돌려보냈다.
  // 그 순간 답장 쓰기 ↔ 편지 읽기 사이를 오가는 순환이 생겼다. 뒤로가기가
  // 앞으로 가는 동작이면 언제나 이런 고리가 만들어진다.
  //
  // fallback 을 홈으로 둔 이유:
  //  · 이 화면에 오는 길이 여럿이다(편지 만나기 · 홈 소식 카드의 "답장 쓰기" · 편지함).
  //    편지 만나기로 되돌리면 다른 길로 온 사람에게는 가 본 적 없는 화면이 나온다.
  //  · 편지 만나기는 새 편지를 받는 관문이라, 이미 편지를 든 사람을 그리로 보내면
  //    한 통 더 받으라는 뜻으로 읽힌다.
  //  · 편지 만나기 자신의 뒤로가기도 홈이다. 한 단계를 건너뛸 뿐 방향은 어긋나지 않는다.
  return (
    <FocusShell
      title="편지 읽기"
      fallback={ROUTES.home}
      className="letter-flow-screen--active-reader"
      scrollClassName="active-reading-scroll"
      action={
        <div className="flow-fixed-action flow-fixed-action--split">
          <button
            className="flow-secondary-button"
            type="button"
            onClick={() => setShowReturnSheet(true)}
          >
            안 받을게요
          </button>
          <button
            className="flow-primary-button"
            type="button"
            onClick={startReply}
          >
            {hasReplyDraft ? "답장 이어 쓰기" : "이 편지에 답장하기"}
          </button>
        </div>
      }
    >
      <section
        className={`active-reading-room ${flow["active-reading-room"]}`}
        aria-label="조용한 편지 읽기 공간"
      >
        <div
          className={`active-reading-room-copy ${flow["active-reading-room-copy"]}`}
        >
          <h1>
            <strong>{letter.anonymousName}</strong>님이
            <br />
            보낸 편지
          </h1>
          <p
            className={`active-reading-kicker ${flow["active-reading-kicker"]}`}
          >
            <time dateTime={letter.createdAt}>
              {formatLetterReadTime(letter.createdAt)}
            </time>
          </p>
        </div>
        <img
          src={assetUrl("/assets/read-letter-room-framed-two-trimmed.webp")}
          alt=""
          aria-hidden="true"
        />
      </section>
      <div className={`active-reading-mat`}>
        <article
          className={`active-reading-paper ${flow["active-reading-paper"]}`}
        >
          <span
            className={`active-reading-quote active-reading-quote--open ${flow["active-reading-quote--open"]}`}
            aria-hidden="true"
          >
            “
          </span>
          <blockquote>{letter.content}</blockquote>
          <span
            className="active-reading-quote active-reading-quote--close"
            aria-hidden="true"
          >
            ”
          </span>
          <div className="active-reading-report-area">
            <button
              className="flow-text-button active-reading-report"
              type="button"
              onClick={() => navigateTo(routeTo.reportLetter(letter.id))}
            >
              신고하기
            </button>
          </div>
        </article>
      </div>
      <section
        className={`active-reading-helper ${flow["active-reading-helper"]}`}
      >
        <img
          src={assetUrl("/assets/home-cards-ornaments-01.svg")}
          alt=""
          aria-hidden="true"
        />
        <p>
          <strong>당신의 마음을 전해주세요</strong>
          <span>짧은 한마디도 누군가에게 힘이 될 수 있어요.</span>
        </p>
      </section>
      {showReturnSheet && (
        <LetterReturnSheet
          hasDraft={hasReplyDraft}
          onCancel={() => setShowReturnSheet(false)}
          onConfirm={() => continueTo("return")}
        />
      )}
    </FocusShell>
  );
}
