// 편지함 — 내가 답장한 편지 (/mailbox/replied/:id)
// 2026-09-18 src/pages/Letter/LetterFlowScreens.tsx 에서 옮겼다(코드 그대로).
import { getCurrentUserId, getLetterById } from "../../data/letters";
import { assetUrl } from "../../utils/basePath";
import { ROUTES } from "../../routes/paths";
import { FocusShell } from "../../components/letter/FocusShell";
import { formatDateWithYear } from "../../utils/letterDates";
import { MissingLetterScreen } from "../../components/letter/MissingLetterScreen";
// CSS Modules: 기존 전역 class 이름은 그대로 두고 모듈 class 를 함께 붙인다.
import flow from "../Letter/LetterFlowScreens.module.css";

export function RepliedLetterDetailScreen({ letterId }: { letterId?: string }) {
  const letter = letterId ? getLetterById(letterId) : undefined;
  if (!letter?.reply || letter.reply.writerId !== getCurrentUserId())
    return <MissingLetterScreen />;
  return (
    <FocusShell
      title="내가 답한 편지"
      fallback={ROUTES.mailbox}
      className={`my-letter-waiting-screen ${flow["my-letter-waiting-screen"]} my-letter-replied-demo-screen ${flow["my-letter-replied-demo-screen"]}`}
      scrollClassName="my-letter-waiting-scroll"
    >
      <section
        className={`my-letter-waiting ${flow["my-letter-waiting"]} replied-letter-detail ${flow["replied-letter-detail"]}`}
        aria-label="내가 답한 편지"
      >
        <header
          className={`my-letter-waiting-heading ${flow["my-letter-waiting-heading"]}`}
        >
          <h1>
            마음을 담아
            <br />
            <strong>답장</strong>을 전했어요
          </h1>
          <img
            src={assetUrl("/assets/reply-sent-paper-airplane.webp")}
            alt="날아가는 종이비행기"
          />
        </header>
        <article
          className={`my-letter-waiting-paper ${flow["my-letter-waiting-paper"]}`}
        >
          <header
            className={`my-letter-waiting-paper-heading ${flow["my-letter-waiting-paper-heading"]}`}
          >
            <span>상대가 보낸 편지</span>
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
            <span>내가 보낸 답장</span>
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
          <p>— {letter.reply.anonymousName || "이름 없는 편지"}</p>
        </article>
      </section>
    </FocusShell>
  );
}
