/**
 * 입력창 밖의 빈 곳을 탭하면 키보드를 내린다.
 *
 * iOS 는 포커스를 받지 않는 요소(빈 여백, 본문, 제목 등)를 탭해도
 * 입력창의 포커스를 그대로 두기 때문에 키보드가 계속 떠 있다.
 * 안드로이드도 동작이 제각각이라 직접 blur 해 주는 편이 예측 가능하다.
 *
 * 화면마다 붙이지 않고 문서 전체에 한 번만 건다. 입력이 있는 화면이면
 * 자동으로 적용되고, 없는 화면에서는 아무 일도 하지 않는다.
 */

/** 눌렀을 때 키보드를 내리면 안 되는 것들 — 그쪽 동작에 맡긴다. */
const INTERACTIVE_SELECTOR =
  'input, textarea, select, button, a, label, [contenteditable], [role="button"], [role="textbox"]';

/**
 * '쓰는 자리' — 편지지처럼, 입력창을 감싸고 있어서 사용자가 글 쓰는 곳으로
 * 읽는 영역이다.
 *
 * 편지지에는 입력창 둘레로 여백이 있다(측정: 좌우 각 21px, 위 61px, 아래 46px).
 * 그 여백은 화면상 분명히 편지지 안인데도, 아래 handlePointerDown 은 '입력창
 * 밖의 빈 곳'으로 보아 키보드를 내려버렸다. 쓰다가 종이 가장자리를 스치기만
 * 해도 키보드가 사라졌다는 뜻이다. 반대로 아무것도 쓰지 않은 상태에서 여백을
 * 눌러도 아무 일이 없었다 — 종이를 눌렀는데 펜이 잡히지 않는 셈이다.
 *
 * 그래서 이 영역은 키보드를 내리는 대상에서 빼고, 대신 안쪽 입력창으로
 * 초점을 넘겨준다.
 */
const WRITING_AREA_SELECTOR = ".letter-compose-paper, .reply-compose-paper, .figma-report-detail";

function isTextEntry(element: Element | null): element is HTMLElement {
  if (!(element instanceof HTMLElement)) return false;
  return element.tagName === "INPUT" || element.tagName === "TEXTAREA" || element.isContentEditable;
}

export function installTapToDismissKeyboard() {
  if (typeof document === "undefined") return () => {};

  const handlePointerDown = (event: Event) => {
    const active = document.activeElement;
    if (!isTextEntry(active)) return;

    const target = event.target;
    // 다른 입력창·버튼·링크를 눌렀다면 건드리지 않는다.
    // pointerdown 시점에 blur 하면 레이아웃이 움직여 이어질 click 이
    // 엉뚱한 곳에 떨어질 수 있어서, 조작 요소는 반드시 걸러내야 한다.
    if (target instanceof Element && target.closest(INTERACTIVE_SELECTOR)) return;
    // 편지지 여백은 '빈 곳'이 아니라 쓰는 자리다. 아래 handleClick 이 받는다.
    if (target instanceof Element && target.closest(WRITING_AREA_SELECTOR)) return;

    active.blur();
  };

  /**
   * 쓰는 자리를 누르면 안쪽 입력창으로 초점을 넘긴다.
   *
   * pointerdown 이 아니라 click 에 거는 이유: 글을 읽으려고 종이를 잡고
   * 밀어 올리는 동작도 pointerdown 으로 시작한다. 거기서 초점을 옮기면
   * 스크롤하려 했을 뿐인데 키보드가 올라온다. click 은 끌지 않고 눌렀다
   * 뗐을 때만 오므로 '누른 것'과 '민 것'이 구분된다.
   *
   * iOS 는 사용자 제스처 안에서 부른 focus() 만 키보드를 띄우는데,
   * click 핸들러도 사용자 제스처라 그 조건을 만족한다.
   */
  const handleClick = (event: Event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const area = target.closest(WRITING_AREA_SELECTOR);
    if (!area) return;
    // 입력창 자체를 눌렀다면 브라우저가 알아서 한다 — 커서도 누른 자리에 놓인다.
    if (isTextEntry(target)) return;
    // 글자 수 표시 옆의 버튼처럼, 영역 안에 있어도 제 동작이 있는 것은 건드리지 않는다.
    if (target.closest(INTERACTIVE_SELECTOR)) return;

    const input = area.querySelector<HTMLElement>("textarea, input, [contenteditable]");
    if (!input || input === document.activeElement) return;
    input.focus();
  };

  // 캡처 단계에서 받아 화면별 핸들러가 이벤트를 막아도 동작하게 한다.
  document.addEventListener("pointerdown", handlePointerDown, true);
  document.addEventListener("click", handleClick, true);

  return () => {
    document.removeEventListener("pointerdown", handlePointerDown, true);
    document.removeEventListener("click", handleClick, true);
  };
}
