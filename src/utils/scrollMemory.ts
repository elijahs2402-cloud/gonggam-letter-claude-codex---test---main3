/**
 * 뒤로 · 앞으로 가기로 돌아온 화면의 스크롤 위치를 되살린다 (2026-09-17)
 *
 * 왜 필요한가: 화면을 옮길 때마다 새로 그리므로(App 의 key) 돌아온 목록이 맨 위에서
 * 시작했다. 문서를 새로 불러오던 때는 브라우저 캐시로 위치가 남을 때가 있었다.
 * 이 앱은 창이 아니라 화면 안쪽 영역(예: 편지함 목록)이 스크롤되므로, React Router 의
 * ScrollRestoration(창 기준)으로는 되지 않아 직접 기억한다.
 *
 * 방법: 화면을 떠날 때 그 화면 안에서 스크롤되는 영역들의 위치를 기록(key)별로 적어 두고,
 * 같은 기록으로 되돌아오면(POP) 같은 순서의 영역에 위치를 되돌린다.
 * 메모리에만 둔다 — 새로고침하면 처음부터다.
 */

const MAX_ENTRIES = 50;
const saved = new Map<string, number[]>();

function currentScreen() {
  return document.querySelector<HTMLElement>("main.mobile-prototype");
}

function scrollAreas(root: HTMLElement) {
  return [root, ...root.querySelectorAll<HTMLElement>("*")].filter((el) => {
    const overflowY = window.getComputedStyle(el).overflowY;
    return overflowY === "auto" || overflowY === "scroll";
  });
}

/** 지금 보이는 화면의 스크롤 위치를 이 기록 이름으로 적어 둔다. */
export function rememberScroll(entryKey: string) {
  const screen = currentScreen();
  if (!screen) return;
  const positions = scrollAreas(screen).map((el) => el.scrollTop);
  saved.delete(entryKey);
  if (positions.some((top) => top > 0)) saved.set(entryKey, positions);
  // 오래된 기록부터 지운다(Map 은 넣은 순서를 지킨다).
  while (saved.size > MAX_ENTRIES) {
    const oldest = saved.keys().next().value;
    if (oldest === undefined) break;
    saved.delete(oldest);
  }
}

/** 이 기록에 적어 둔 위치가 있으면 지금 화면에 되돌린다. */
export function restoreScroll(entryKey: string) {
  const positions = saved.get(entryKey);
  const screen = currentScreen();
  if (!positions || !screen) return;
  scrollAreas(screen).forEach((el, index) => {
    const top = positions[index];
    if (top) el.scrollTop = top;
  });
}
