// 편지함 — 내가 보낸 편지 (/mailbox/my/:id)
// 2026-09-18 src/pages/Letter/LetterFlowScreens.tsx 에서 옮겼다(코드 그대로).
import { getCurrentAppSearchParams, navigateTo } from "../../utils/navigation";
import {
  getCurrentUserId,
  getLetterById,
  markReplyOpened,
} from "../../data/letters";
import { isUserBlocked } from "../../data/blocks";
import { getSentLetterDisplayStatus } from "../../data/mailboxStatus";
import { isContentHidden, revealContent } from "../../data/contentVisibility";
import { assetUrl } from "../../utils/basePath";
import { ROUTES, routeTo } from "../../routes/paths";
import { FocusShell } from "../../components/letter/FocusShell";
import { formatDate, formatDateWithYear } from "../../utils/letterDates";
import { MissingLetterScreen } from "../../components/letter/MissingLetterScreen";
// CSS Modules: 기존 전역 class 이름은 그대로 두고 모듈 class 를 함께 붙인다.
import flow from "../../components/letter/LetterFlow.module.css";

export function MyLetterDetailScreen({ letterId }: { letterId?: string }) {
  const letter = letterId ? getLetterById(letterId) : undefined;
  if (!letter || letter.senderId !== getCurrentUserId())
    return <MissingLetterScreen />;
  const userId = getCurrentUserId();
  const params = getCurrentAppSearchParams();
  const showReply = params.get("reply") === "1";
  const replyHidden = Boolean(
    letter.reply && isContentHidden(userId, "reply", letter.reply.id),
  );
  const replyBlocked = Boolean(
    letter.reply && isUserBlocked(userId, letter.reply.writerId),
  );
  const display = getSentLetterDisplayStatus(letter, userId);
  if (display.isDeleted)
    return (
      <FocusShell title="내가 보낸 편지" fallback={ROUTES.mailbox}>
        <section className="flow-message">
          <h1>이 편지를 찾을 수 없어요</h1>
          <p>지워졌거나, 더는 열어볼 수 없는 편지예요.</p>
          <button
            className="flow-primary-button"
            type="button"
            onClick={() => navigateTo(ROUTES.mailbox)}
          >
            편지함 가기
          </button>
        </section>
      </FocusShell>
    );
  // 답장이 도착한 편지 — 설계된 화면(내가 답한 편지의 짝)으로 보여준다.
  // 예전에는 옛 레이아웃(상태 표 + '받은 답장 보기' 버튼)으로 빠졌고,
  // 설계본은 /mailbox-my-replied-demo 에 내용이 박힌 데모로만 있었다.
  // 안 읽은 답장도 봉투 화면(/reply-arrived)을 거치지 않고 바로 여기서 보여준다.
  // 차단·숨김은 예전 분기(아래 옛 레이아웃)가 그대로 처리하도록 여기서 제외한다.
  if (
    letter.reply &&
    !replyBlocked &&
    !replyHidden &&
    !display.isRestricted &&
    letter.status !== "withdrawn"
  ) {
    // 목록의 '안 읽음' 표시를 지운다. 이 화면에서 답장을 실제로 보여주기 때문이다.
    markReplyOpened(letter.id, letter.senderId);
    return (
      <FocusShell
        title="내가 보낸 편지"
        fallback={ROUTES.mailbox}
        className={`my-letter-waiting-screen ${flow["my-letter-waiting-screen"]}`}
        scrollClassName="my-letter-waiting-scroll"
      >
        <section
          className={`my-letter-waiting ${flow["my-letter-waiting"]}`}
          aria-label="내가 보낸 편지 공간"
        >
          <header
            className={`my-letter-waiting-heading ${flow["my-letter-waiting-heading"]}`}
          >
            <h1>
              내 마음에
              <br />
              <strong>답장</strong>이 도착했어요
            </h1>
            <img
              src={assetUrl("/assets/reply-sent-lavender-envelope.webp")}
              alt="보라색 봉인과 라벤더가 놓인 편지 봉투"
            />
          </header>
          <article
            className={`my-letter-waiting-paper ${flow["my-letter-waiting-paper"]}`}
          >
            <header
              className={`my-letter-waiting-paper-heading ${flow["my-letter-waiting-paper-heading"]}`}
            >
              <span>내가 보낸 편지</span>
              <time dateTime={letter.createdAt}>
                {formatDateWithYear(letter.createdAt)}
              </time>
            </header>
            <span
              className={`my-letter-waiting-quote ${flow["my-letter-waiting-quote"]} my-letter-waiting-quote--open ${flow["my-letter-waiting-quote--open"]}`}
              aria-hidden="true"
            >
              “
            </span>
            <blockquote>{letter.content}</blockquote>
            <span
              className={`my-letter-waiting-quote ${flow["my-letter-waiting-quote"]} my-letter-waiting-quote--close`}
              aria-hidden="true"
            >
              ”
            </span>
            <p>— {letter.anonymousName || "이름 없는 편지"}</p>
          </article>
          <div
            className={`my-letter-reply-connector ${flow["my-letter-reply-connector"]}`}
            aria-hidden="true"
          >
            <span />
          </div>
          <article
            className={`my-letter-waiting-paper ${flow["my-letter-waiting-paper"]} my-letter-reply-paper ${flow["my-letter-reply-paper"]}`}
          >
            <header
              className={`my-letter-waiting-paper-heading ${flow["my-letter-waiting-paper-heading"]}`}
            >
              <span>받은 답장</span>
              <time dateTime={letter.reply.createdAt}>
                {formatDateWithYear(letter.reply.createdAt)}
              </time>
            </header>
            <span
              className={`my-letter-waiting-quote ${flow["my-letter-waiting-quote"]} my-letter-waiting-quote--open ${flow["my-letter-waiting-quote--open"]}`}
              aria-hidden="true"
            >
              “
            </span>
            <blockquote>{letter.reply.content}</blockquote>
            <span
              className={`my-letter-waiting-quote ${flow["my-letter-waiting-quote"]} my-letter-waiting-quote--close`}
              aria-hidden="true"
            >
              ”
            </span>
            <p>— {letter.reply.anonymousName || "익명의 누군가"}</p>
            <div
              className={`my-letter-reply-report ${flow["my-letter-reply-report"]}`}
            >
              <button
                className="flow-text-button"
                type="button"
                onClick={() => navigateTo(routeTo.reportReply(letter.id))}
              >
                신고하기
              </button>
            </div>
          </article>
        </section>
      </FocusShell>
    );
  }
  if (!letter.reply && !display.isRestricted && letter.status !== "withdrawn")
    return (
      <FocusShell
        title="내가 보낸 편지"
        fallback={ROUTES.mailbox}
        className={`my-letter-waiting-screen ${flow["my-letter-waiting-screen"]}`}
        scrollClassName="my-letter-waiting-scroll"
      >
        <section
          className={`my-letter-waiting ${flow["my-letter-waiting"]}`}
          aria-label="내가 보낸 편지 공간"
        >
          <header
            className={`my-letter-waiting-heading ${flow["my-letter-waiting-heading"]}`}
          >
            <h1>
              <strong>답장</strong>을<br />
              기다리고 있어요
            </h1>
            <img
              src={assetUrl("/assets/reply-sent-lavender-envelope.webp")}
              alt="보라색 봉인과 라벤더가 놓인 편지 봉투"
            />
          </header>
          <article
            className={`my-letter-waiting-paper ${flow["my-letter-waiting-paper"]}`}
          >
            <header
              className={`my-letter-waiting-paper-heading ${flow["my-letter-waiting-paper-heading"]}`}
            >
              <span>내가 보낸 편지</span>
              <time dateTime={letter.createdAt}>
                {formatDateWithYear(letter.createdAt)}
              </time>
            </header>
            <span
              className={`my-letter-waiting-quote ${flow["my-letter-waiting-quote"]} my-letter-waiting-quote--open ${flow["my-letter-waiting-quote--open"]}`}
              aria-hidden="true"
            >
              “
            </span>
            <blockquote>{letter.content}</blockquote>
            <span
              className={`my-letter-waiting-quote ${flow["my-letter-waiting-quote"]} my-letter-waiting-quote--close`}
              aria-hidden="true"
            >
              ”
            </span>
            <p>— {letter.anonymousName || "이름 없는 편지"}</p>
          </article>
        </section>
      </FocusShell>
    );
  return (
    <FocusShell title="내가 보낸 편지" fallback={ROUTES.mailbox} headingTitle>
      <section className={`letter-detail ${flow["letter-detail"]}`}>
        <p className={`detail-kicker ${flow["detail-kicker"]}`}>
          내가 보낸 편지
        </p>
        <article className="flow-letter-paper">
          <blockquote>{letter.content}</blockquote>
        </article>
        <section className={`detail-status-card ${flow["detail-status-card"]}`}>
          <strong>{display.label}</strong>
          <p>{display.description}</p>
        </section>
        <dl>
          <div>
            <dt>현재 상태</dt>
            <dd>{display.label}</dd>
          </div>
          <div>
            <dt>보낸 날짜</dt>
            <dd>{formatDate(letter.createdAt)}</dd>
          </div>
          {letter.reply && (
            <div>
              <dt>답장 도착 날짜</dt>
              <dd>
                {letter.repliedAt
                  ? formatDate(letter.repliedAt)
                  : "답장을 받았어요"}
              </dd>
            </div>
          )}
        </dl>
        {letter.reply ? (
          showReply ? (
            <section className={`detail-reply ${flow["detail-reply"]}`}>
              <p>
                받은 답장{" "}
                <button
                  className={`reply-more-button ${flow["reply-more-button"]}`}
                  type="button"
                  onClick={() => navigateTo(routeTo.reportReply(letter.id))}
                >
                  ⋯
                </button>
              </p>
              {replyBlocked ? (
                <div
                  className={`content-restricted ${flow["content-restricted"]}`}
                >
                  <strong>차단한 사용자의 콘텐츠예요.</strong>
                  <span>안전을 위해 이 내용은 기본적으로 숨겨져 있어요.</span>
                  <button
                    type="button"
                    onClick={() => navigateTo(ROUTES.safetyManagement)}
                  >
                    안전 관리에서 확인
                  </button>
                </div>
              ) : replyHidden ? (
                <div
                  className={`content-restricted ${flow["content-restricted"]}`}
                >
                  <strong>숨긴 답장이에요.</strong>
                  <span>필요하면 다시 펼쳐볼 수 있어요.</span>
                  <button
                    type="button"
                    onClick={() => {
                      revealContent(userId, "reply", letter.reply!.id);
                      window.location.reload();
                    }}
                  >
                    답장 다시 보기
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateTo(ROUTES.mailbox)}
                  >
                    편지함으로 돌아가기
                  </button>
                </div>
              ) : (
                <>
                  {/* 간직하기·고마움 전하기는 1차 오픈에서 빠져(2026-09-15) 답장 글만 보여준다. */}
                  <blockquote>{letter.reply.content}</blockquote>
                  <small>
                    익명의 누군가 · {formatDate(letter.reply.createdAt)}
                  </small>
                </>
              )}
            </section>
          ) : (
            <section
              className={`detail-reply-arrival ${flow["detail-reply-arrival"]}`}
            >
              <strong>
                {display.hasUnreadReply
                  ? "답장이 도착했어요."
                  : "답장을 받았어요."}
              </strong>
              <p>
                {display.hasUnreadReply
                  ? "당신의 편지를 읽은 사람이 마음을 전했어요."
                  : "도착한 답장을 다시 읽을 수 있어요."}
              </p>
              <button
                className="flow-primary-button"
                type="button"
                onClick={() => {
                  // 답장 도착 봉투 화면(/reply-arrived)을 지워, 그 화면이 하던 일
                  // (읽음 표시 후 답장 펼치기)을 여기서 바로 한다.
                  if (display.hasUnreadReply)
                    markReplyOpened(letter.id, letter.senderId);
                  navigateTo(`${routeTo.myLetter(letter.id)}?reply=1`);
                }}
              >
                {display.hasUnreadReply ? "답장 읽기" : "받은 답장 보기"}
              </button>
            </section>
          )
        ) : display.isRestricted ? (
          <p className="detail-waiting">
            현재 이 편지의 내용을 확인할 수 없어요.
          </p>
        ) : letter.status === "withdrawn" ? (
          <p className="detail-waiting">이 편지는 조용히 거두었어요</p>
        ) : (
          <>
            <p className="detail-waiting">{display.description}</p>
          </>
        )}
      </section>
    </FocusShell>
  );
}
