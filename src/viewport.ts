/**
 * 모바일 키보드가 올라오면 iOS 는 레이아웃 뷰포트를 그대로 둔 채
 * 비주얼 뷰포트만 줄인다. 그래서 100dvh / 100vh 로는 실제 보이는 높이를
 * 알 수 없고, 키보드를 내린 뒤 헤더가 화면 밖으로 밀리거나 하단 버튼이
 * 어긋나 보인다. 실제로 보이는 높이를 CSS 변수로 내려준다.
 *
 * visualViewport 를 지원하지 않는 환경에서는 변수를 세우지 않으므로
 * CSS 의 100dvh 폴백이 그대로 쓰인다.
 */
/** 포커스된 입력창이 담겨 스크롤되는 영역을 찾는다. 화면마다 클래스가 달라 이름 대신
 *  '넘치는 내용을 스스로 스크롤하는' 첫 조상으로 고른다. */
function findScrollPort(element: Element | null): HTMLElement | null {
  if (!(element instanceof HTMLElement)) return null;
  const isTextEntry =
    element.tagName === "INPUT" || element.tagName === "TEXTAREA" || element.isContentEditable;
  if (!isTextEntry) return null;

  let node = element.parentElement;
  while (node) {
    const overflowY = window.getComputedStyle(node).overflowY;
    const scrolls = overflowY === "auto" || overflowY === "scroll";
    if (scrolls && node.scrollHeight > node.clientHeight) return node;
    node = node.parentElement;
  }
  return null;
}

/* 글 높이를 재는 복제 요소에 옮겨야 하는 속성들. 하나라도 빠지면 줄바꿈이
   원본과 달라진다. 한글은 word-break / overflow-wrap 에 따라 끊기는 자리가 크게
   달라지므로 반드시 함께 복제한다. */
const TEXT_MEASURE_PROPS = [
  "box-sizing", "width",
  "padding-top", "padding-right", "padding-bottom", "padding-left",
  "border-top-width", "border-right-width", "border-bottom-width", "border-left-width",
  "font-family", "font-size", "font-weight", "font-style", "font-variant",
  "line-height", "letter-spacing", "word-spacing", "text-indent", "text-transform",
  "white-space", "word-break", "overflow-wrap", "text-align",
];

/**
 * 입력창에 담긴 글이 실제로 차지하는 높이.
 *
 * 입력창 자체의 높이로는 알 수 없다. 이 화면의 입력창에는 최소 높이가 있어
 * (편지 260px, 답장 410px) 한 줄만 써도 그 높이를 유지하고, height 를 auto 로
 * 두거나 min-height 를 인라인으로 덮어써도 풀리지 않았다. 그래서 같은 글꼴과
 * 너비를 가진 복제 요소에 같은 글을 넣어 직접 잰다.
 */
function textContentHeight(element: HTMLTextAreaElement): number {
  const style = window.getComputedStyle(element);
  const mirror = document.createElement("div");
  for (const prop of TEXT_MEASURE_PROPS) mirror.style.setProperty(prop, style.getPropertyValue(prop));
  mirror.style.position = "absolute";
  mirror.style.top = "0";
  mirror.style.left = "-9999px";
  mirror.style.height = "auto";
  mirror.style.minHeight = "0";
  mirror.style.visibility = "hidden";
  mirror.style.pointerEvents = "none";
  // 마지막이 줄바꿈이면 그 빈 줄도 높이에 들어가야 한다.
  mirror.textContent = element.value + "​";

  document.body.appendChild(mirror);
  const height = mirror.getBoundingClientRect().height;
  mirror.remove();
  return height;
}

/**
 * 입력창이 화면에 한 조각도 안 보일 때만, 보이도록 스크롤한다.
 *
 * 아래 window.scrollTo(0, 0) 이 iOS 의 '쓰는 자리 보여주기'까지 없애버리기
 * 때문에, 그 자리를 대신 메우는 최소한의 처리다.
 *
 * 일부러 '완전히 안 보일 때'로 좁혔다. 조금이라도 걸쳐 있으면 iOS 가 스스로
 * 커서를 따라가고 있다는 뜻이라, 거기에 끼어들면 서로 다른 위치로 끌어당겨
 * 화면이 한 번 튀고 만다(그렇게 네 번 틀렸다). 우리가 움직이는 경우는
 * iOS 의 보정이 사라져 아무도 화면을 옮기지 않는 상황뿐이다.
 *
 * 커서를 정확한 자리에 놓지는 못한다. 쓰는 자리가 화면에 나타나는 것까지만 맡는다.
 */
function revealWritingAreaIfHidden(element: Element | null) {
  const scroller = findScrollPort(element);
  if (!scroller || !(element instanceof HTMLElement)) return;

  const rect = element.getBoundingClientRect();
  const port = scroller.getBoundingClientRect();
  const margin = 12;

  // 1) 한 조각도 안 보이면 맨 위가 보이게 데려온다.
  const overlaps = rect.bottom > port.top && rect.top < port.bottom;
  if (!overlaps) {
    scroller.scrollTop += rect.top - (port.top + margin);
    return;
  }

  // 2) 걸쳐는 있지만 입력창이 화면보다 크고, 커서가 글 맨 끝이며, 그 끝이 화면
  //    아래로 넘어가 있는 경우. 쓰다가 키보드를 내렸다 다시 탭해 이어 쓰는
  //    상황이 정확히 여기에 해당한다 — 커서는 늘 맨 끝에 있다.
  //
  //    '커서가 맨 끝인가'만 본다(selectionStart). 커서의 화면 좌표를 복제 요소로
  //    재는 방식은 iOS 가 그 위에 자기 판단으로 한 번 더 스크롤해 화면이 튀었다.
  //    여기서는 정확히 아는 값 하나만 쓰고, 글 중간을 탭한 경우는 손대지 않는다.
  if (!(element instanceof HTMLTextAreaElement)) return;
  if (element.selectionStart !== element.value.length) return;

  // 입력창이 '내용만큼 자란 상태'일 때만 아랫변을 글 끝으로 본다.
  //
  // 이 화면의 입력창에는 최소 높이가 있다(편지 260px, 답장 410px). 글이 짧으면
  // 높이가 그 최소값에 머물러 글 아래로 빈 줄이 길게 남는다. 그 상태에서
  // 아랫변에 맞추면 빈 줄을 보여주고 정작 쓴 글은 화면 위로 밀려난다
  // (20자짜리 답장에서 빈 줄만 보이던 증상이 이것이었다).
  //
  // 높이가 최소값을 넘었다는 것은 글이 그만큼 길어 높이를 밀어냈다는 뜻이고,
  // 그때는 아랫변과 글 끝이 사실상 같은 자리다.
  // 입력창의 아랫변이 아니라 '글이 끝나는 자리'를 기준으로 삼는다. 글이 짧으면
  // 아래로 빈 줄이 길게 남아, 아랫변에 맞추면 빈 줄만 보이고 정작 쓴 글이 화면
  // 위로 밀려난다(20자짜리 답장에서 빈 줄만 보이던 증상이 이것이었다).
  const textEnd = rect.top + textContentHeight(element);
  if (textEnd > port.bottom - margin) scroller.scrollTop += textEnd - (port.bottom - margin);
}

export function installViewportHeightSync() {
  const viewport = typeof window !== "undefined" ? window.visualViewport : undefined;
  if (!viewport) return () => {};

  const root = document.documentElement;
  let frame = 0;
  // iOS 홈 화면 앱은 키보드가 떠도 layout viewport까지 함께 줄어드는 경우가 있다.
  // 그때 rawInset은 0이지만 visual viewport는 키보드 높이만큼 크게 작아진다.
  let largestViewportHeight = 0;
  // 키보드가 '닫힘 -> 열림'으로 바뀌는 순간을 한 번만 잡기 위한 직전 상태.
  let wasKeyboardVisible = false;

  const apply = () => {
    frame = 0;

    // iOS 는 키보드를 띄울 때 레이아웃 뷰포트를 그대로 둔 채 보이는 영역만
    // 위로 밀어 올린다(offsetTop). 그래서 '화면 바닥에서 키보드 윗면까지의
    // 거리'를 따로 계산해야 하단 바를 정확히 키보드 위에 세울 수 있다.
    const isIosStandalone =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      (("standalone" in navigator && (navigator as Navigator & { standalone?: boolean }).standalone === true) ||
        window.matchMedia("(display-mode: standalone)").matches);
    const standaloneHeight = Math.round(window.screen?.height ?? 0);
    const layoutHeight = document.documentElement.clientHeight;
    largestViewportHeight = Math.max(largestViewportHeight, Math.round(viewport.height));
    const rawInset = Math.round(layoutHeight - (viewport.height + viewport.offsetTop));
    // standalone 앱에서는 이전 전환 중 기록된 큰 visual viewport 값이 남을 수 있다.
    // 기기의 고정 화면 높이를 상한으로 삼아 키보드 높이가 터치마다 달라지지 않게 한다.
    const keyboardBaseline = isIosStandalone && standaloneHeight > 0
      ? Math.min(largestViewportHeight, standaloneHeight)
      : largestViewportHeight;
    const viewportReduction = keyboardBaseline - Math.round(viewport.height);
    // 주소창이 접히는 순간 1px 안팎의 오차가 생겨 바가 미세하게 떨린다.
    // 홈 화면에 추가한 iPhone 앱은 키보드가 떠도 rawInset 이 0이 될 수 있다.
    // 이 경우 줄어든 visual viewport 높이가 키보드 높이이므로, 두 값을 함께
    // 비교해야 하단 버튼이 키보드 뒤에 가려지지 않는다.
    // 키보드가 열린 동안에는 visual viewport가 줄어든 크기가 실제 키보드
    // 높이다. 일부 standalone iPhone에서는 rawInset이 화면 전체에 가깝게
    // 과대 계산되므로, 이 경우 rawInset보다 viewport 감소량을 우선한다.
    // 감소량을 얻을 수 없는 브라우저에서만 rawInset을 보조값으로 쓴다.
    const inset = viewportReduction > 150 ? viewportReduction : rawInset > 2 ? rawInset : 0;
    const keyboardVisible = viewportReduction > 150 || (rawInset > 150 && Math.round(viewport.height) < keyboardBaseline - 80);

    // 키보드가 열린 동안 셸까지 같이 줄이면, 셸 바닥이 보이는 영역 바닥보다
    // offsetTop 만큼 위에 놓여 그 아래가 빈 여백으로 남는다.
    // 셸은 레이아웃 높이를 그대로 쓰고, 키보드는 하단 바만 피하게 한다.
    // iOS 홈 화면 앱은 visual viewport와 clientHeight 모두 홈 인디케이터 높이만큼
    // 짧게 주는 경우가 있다. 이때 screen.height는 실제 독립 앱 창 높이이므로
    // 그것을 기준으로 셸을 채워야 화면 끝에 종이색 띠가 남지 않는다.
    const measuredHeight = Math.max(layoutHeight, Math.round(viewport.height));
    const standaloneFill = isIosStandalone ? Math.max(0, standaloneHeight - measuredHeight) : 0;
    // 키보드가 열린 동안에는 셸을 실제 보이는 viewport 높이로 전환한다.
    // 키보드 높이를 바의 margin/bottom에 따로 더하는 방식은 iOS가 반환하는
    // 값에 따라 두 번 적용될 수 있어, 버튼이 터치마다 다른 높이로 튀었다.
    // 셸 바닥 자체가 키보드 위가 되므로 모든 입력 화면이 같은 규칙을 쓴다.
    const shellHeight = keyboardVisible
      ? Math.round(viewport.height)
      : isIosStandalone
        ? Math.max(measuredHeight, standaloneHeight)
        : Math.round(viewport.height);
    const actionInset = keyboardVisible ? 0 : inset;

    root.style.setProperty("--app-viewport-height", `${shellHeight}px`);
    root.style.setProperty("--app-keyboard-inset", `${actionInset}px`);
    root.style.setProperty("--app-standalone-fill", `${standaloneFill}px`);
    if (isIosStandalone) root.dataset.iosStandalone = "true";
    else delete root.dataset.iosStandalone;

    // 키보드가 올라오면 하단 바가 키보드 위로 올라서가므로,
    // 아래에 비워둔 안전영역(홈 인디케이터 자리)가 필요 없어진다.
    // CSS 는 길이 변수의 0 여부로 규칙을 갈라 쓸 수 없어,
    // 상태를 속성으로 내려 준다. index.css 의 [data-keyboard="open"] 규칙이 받는다.
    // 주소창 변화는 수십 px 수준이지만 키보드는 150px 이상을 차지한다.
    // inset이 0이어도 이 차이를 이용하면 standalone 모드에서도 버튼 바의
    // 키보드 전용 여백 축소 규칙을 정확히 적용할 수 있다.
    if (keyboardVisible) root.dataset.keyboard = "open";
    else delete root.dataset.keyboard;

    // 키보드가 뜨면 iOS 는 입력창을 보이게 하려고 문서를 먼저 스크롤한다.
    // 그 직후 위에서 셸 높이를 '보이는 높이'로 줄이면 문서가 창보다 짧아지는데,
    // 스크롤값은 그대로 남는다. 그러면 셸은 문서 맨 위(0 ~ 셸높이)에 놓이고
    // 보이는 창은 그보다 아래를 비춰, 하단 바만 화면 위쪽에 걸리고 그 아래는
    // 빈 배경이 된다.
    //
    // iPhone 12 Pro / iOS 26.6.1 에서 실제로 측정한 값:
    //   client.height 668, viewport.height 397, offsetTop 271, scrollY 271
    // 이때 rawInset 은 668 - (397 + 271) = 0 이라, 위의 보정 경로는 '보정할
    // 거리가 없다'고 판단하고 아무것도 하지 않는다. 남은 것은 scrollY 뿐이다.
    //
    // 셸이 이미 보이는 높이만큼으로 줄어 문서가 스크롤될 이유가 없으므로 되돌린다.
    // scrollY 가 0 보다 클 때만 부르므로 되돌린 뒤 다시 불려 도는 일은 없다.
    if (keyboardVisible && window.scrollY > 0) window.scrollTo(0, 0);

    // 키보드가 막 열린 순간에만 한 번. 계속 돌리면 글을 쓰다 손으로 스크롤한 것을
    // 되돌리게 된다.
    if (keyboardVisible && !wasKeyboardVisible) revealWritingAreaIfHidden(document.activeElement);
    wasKeyboardVisible = keyboardVisible;
  };
  // 키보드 전환 중에는 resize 가 연달아 오므로 프레임당 한 번만 반영한다.
  const schedule = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(apply);
  };

  apply();
  viewport.addEventListener("resize", schedule);
  viewport.addEventListener("scroll", schedule);
  const handleOrientationChange = () => {
    largestViewportHeight = 0;
    schedule();
  };
  window.addEventListener("orientationchange", handleOrientationChange);

  return () => {
    if (frame) window.cancelAnimationFrame(frame);
    viewport.removeEventListener("resize", schedule);
    viewport.removeEventListener("scroll", schedule);
    window.removeEventListener("orientationchange", handleOrientationChange);
    root.style.removeProperty("--app-viewport-height");
    root.style.removeProperty("--app-keyboard-inset");
    root.style.removeProperty("--app-standalone-fill");
    delete root.dataset.keyboard;
    delete root.dataset.iosStandalone;
  };
}
