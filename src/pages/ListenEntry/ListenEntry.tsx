// 편지 만나기 (/listen-entry-a)
// 2026-09-18 src/pages/Letter/ListenEntryVariants.tsx 에서 옮겼다(코드 그대로).
import { type ReactNode, useState } from "react";
import { navigateTo, setPageTimeout } from "../../utils/navigation";
import { getCurrentUserId } from "../../data/letters";
import { seedSampleLetters } from "../../data/sampleLetters";
import {
  getAvailableWaitingLetters,
  markWaitingLetterViewed,
} from "../../data/waitingLetters";
import { assetUrl } from "../../utils/basePath";
import { ROUTES, routeTo } from "../../routes/paths";
import { goTo } from "../../utils/listenEntryGoTo";
import { ListenEntryHeader } from "../../components/letter/ListenEntryHeader";
import { ListenEntryLoadingState } from "../../components/letter/ListenEntryLoadingState";
// 편지 고르기 CSS Modules: 기존 전역 class 이름은 그대로 두고 모듈 class 를 함께 붙인다.
import listen from "../../components/letter/ListenEntry.module.css";

type ListenVariant = "A" | "B" | "C";

type ListenEntryState = "ready" | "loading";

const HELPER_COPY = (
  <>
    정답을 찾지 않아도 괜찮아요.
    <br />
    그저 끝까지 읽어주는 마음만으로도 충분해요.
  </>
);

/**
 * 한 사람이 한 번에 맡을 수 있는 편지는 한 통이므로 목록을 거치지 않는다.
 * 배정 순서는 편지함 목록과 같은 규칙(안 읽은 편지 우선, 그다음 오래된 순)을 쓴다.
 */
function openAssignedLetter() {
  seedSampleLetters();
  const [assigned] = getAvailableWaitingLetters(getCurrentUserId());
  if (!assigned) {
    navigateTo(ROUTES.listenEntryEmpty);
    return;
  }
  markWaitingLetterViewed(assigned.id);
  navigateTo(routeTo.readLetter(assigned.id));
}

function ListenHeading({
  compact = false,
  title,
  showBrand = true,
}: {
  compact?: boolean;
  title?: ReactNode;
  showBrand?: boolean;
}) {
  return (
    <section
      className={`listen-entry-heading ${listen["listen-entry-heading"]}${compact ? " is-compact" : ""}${showBrand ? "" : ` without-brand ${listen["without-brand"]}`}`}
    >
      {showBrand && <p>공감편지</p>}
      <h1>
        {title ?? (
          <>
            누군가의 마음을
            <br />
            들어주고 싶어요
          </>
        )}
      </h1>
      <div>{HELPER_COPY}</div>
    </section>
  );
}

function FixedActions({
  state,
  onMeet,
}: {
  state: ListenEntryState;
  onMeet: () => void;
}) {
  if (state === "loading") return null;

  return (
    <div
      className={`flow-fixed-action listen-entry-actions ${listen["listen-entry-actions"]}`}
    >
      <button type="button" className="flow-primary-button" onClick={onMeet}>
        {/* 헤더가 "편지 만나기"라 버튼까지 같은 말이면 한 단어가 두 일을 겸한다.
            이 앱의 다른 흐름 화면은 헤더가 '어디', 버튼이 '다음 단계'를 말한다
            (편지 쓰기 화면: 헤더 "편지 쓰기" / 버튼 "보내기 전 미리보기").
            헤더는 형제 화면들과 같은 짜임이라 그대로 두고, 버튼만 다음에
            일어날 일로 바꾼다 — 누르면 편지 한 통을 맡아 읽기 화면이 열린다. */}
        {state === "ready"
          ? "편지 열어보기"
          : state === "loading"
            ? "편지를 가져오는 중"
            : "다시 시도하기"}
      </button>
    </div>
  );
}

function ListenEntryFrame({
  className,
  // B and C remain pinned to the single sample letter they were designed against.
  meetPath = routeTo.readLetter("sample-waiting-letter-one"),
  onMeet,
  children,
}: {
  variant: ListenVariant;
  className: string;
  meetPath?: string;
  onMeet?: () => void;
  children: ReactNode;
}) {
  const [state, setState] = useState<ListenEntryState>("ready");
  function meetLetter() {
    if (state === "loading") return;
    setState("loading");
    // 불러오는 중에 뒤로 가면 편지를 열지 않는다.
    setPageTimeout(() => {
      if (onMeet) {
        onMeet();
        return;
      }
      goTo(meetPath);
      // 점 물결이 두 번 완성되는 길이. 한 점의 주기 720ms + 셋째 점 지연 240ms = 960ms 가
      // 한 물결이므로, 이전 값 900ms 는 첫 물결이 끝나기 60ms 전에 화면이 사라졌다.
    }, 1700);
  }

  const content = state === "loading" ? <ListenEntryLoadingState /> : children;

  return (
    <main
      className={`mobile-prototype listen-entry-screen ${className}${state === "loading" ? " is-loading" : ""}`}
    >
      <ListenEntryHeader />
      <div className="listen-entry-scroll">{content}</div>
      <FixedActions state={state} onMeet={meetLetter} />
    </main>
  );
}

export function ListenEntryScreen() {
  return (
    <ListenEntryFrame
      variant="A"
      className="listen-entry-a"
      onMeet={openAssignedLetter}
    >
      <>
        <ListenHeading
          showBrand={false}
          title={
            <>
              누군가의 마음이
              <br />
              도착했어요
            </>
          }
        />
        <figure className={`listen-a-hero-art ${listen["listen-a-hero-art"]}`}>
          <img
            src={assetUrl("/assets/read-letter-object-tight.webp")}
            alt="독서등과 펼쳐진 편지, 안경"
          />
        </figure>
        <section
          className={`listen-a-guide ${listen["listen-a-guide"]}`}
          aria-labelledby="listen-a-guide-title"
        >
          <div>
            <p id="listen-a-guide-title">잠시 기억해주세요</p>
          </div>
          <ul>
            <li>판단하기보다 끝까지 읽기</li>
            <li>내 경험보다 상대의 마음을 먼저 바라보기</li>
            <li>짧아도 진심을 담아 답하기</li>
          </ul>
        </section>
      </>
    </ListenEntryFrame>
  );
}
