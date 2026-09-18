import { BASE_PATH, stripBasePath } from "./basePath";
import { ROUTES } from "../routes/paths";

export function getCurrentAppPath() {
  if (window.location.protocol === "file:") {
    const hashRoute = window.location.hash.replace(/^#/, "").split("?")[0];
    return hashRoute.replace(/\/$/, "") || ROUTES.intro;
  }

  return (
    stripBasePath(window.location.pathname).replace(/\/$/, "") || ROUTES.intro
  );
}

export function getCurrentAppSearchParams() {
  if (window.location.protocol === "file:") {
    const query = window.location.hash.split("?")[1] ?? "";
    return new URLSearchParams(query);
  }

  return new URLSearchParams(window.location.search);
}

let isPageNavigationInProgress = false;
let pageNavigationTimer: number | null = null;

// 화면 이동은 React Router 가 맡는다(2026-09-17). 예전에는 화면마다 문서를 새로
// 불러와(window.location.href) 그 사이 빈 틈과 멈춤이 생겼다.
// 라우터는 main.tsx 에서 만들고 여기에 이동 함수만 등록한다 — 이 파일이 라우터를
// 직접 import 하면 main → App → navigation → main 으로 순환이 생긴다.
type RouterNavigate = (path: string, options: { replace: boolean }) => void;
let routerNavigate: RouterNavigate | null = null;

export function registerRouterNavigate(navigate: RouterNavigate) {
  routerNavigate = navigate;
}

function goToPath(path: string, replace = false) {
  if (routerNavigate) {
    routerNavigate(path, { replace });
    return;
  }
  // 라우터가 없을 때(등록 전)만 옛 방식으로 문서를 새로 불러온다.
  if (window.location.protocol === "file:") {
    window.location.hash = path;
    window.location.reload();
    return;
  }
  if (replace) window.location.replace(BASE_PATH + path);
  else window.location.href = BASE_PATH + path;
}

// 화면이 바뀔 때마다 올라가는 번호. 문서를 새로 불러오던 때는 화면을 떠나면
// 그 화면이 걸어 둔 타이머도 함께 사라졌지만, 이제는 남아서 실행된다.
// setPageTimeout 은 걸어 둘 때의 번호를 기억했다가, 그사이 화면이 바뀌었으면
// 실행하지 않는다(예: 계정 삭제 처리 중 뒤로 갔는데 1.7초 뒤 계정이 지워지는 일).
let pageEpoch = 0;

export function markPageChanged() {
  pageEpoch += 1;
}

export function setPageTimeout(callback: () => void, delay: number) {
  const epoch = pageEpoch;
  return window.setTimeout(() => {
    if (epoch === pageEpoch) callback();
  }, delay);
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getCurrentPage() {
  return document.querySelector<HTMLElement>(".mobile-prototype");
}

function getExitDuration(page: HTMLElement | null) {
  if (!page || prefersReducedMotion()) return 0;

  const duration = Number.parseFloat(
    window.getComputedStyle(page).getPropertyValue("--page-exit-duration"),
  );

  return Number.isFinite(duration) ? duration : 180;
}

function resetPageTransition() {
  isPageNavigationInProgress = false;
  if (pageNavigationTimer !== null) {
    window.clearTimeout(pageNavigationTimer);
    pageNavigationTimer = null;
  }

  const page = getCurrentPage();
  page?.classList.remove(
    "is-page-leaving",
    "is-tab-leaving",
    "is-pushed-away",
    "is-popped-away",
  );
  page?.removeAttribute("aria-busy");
}

// 나의 공간 목록에서 항목 상세로 들어갈 때만 '밀고 들어오기' 모션을 쓴다.
// 이 목록 자체는 항상 같아서 route.ts 쪽을 건드리지 않고 여기 하드코딩해도
// 안전하다. 바텀 내비게이션으로 홈·편지함 등 다른 곳으로 가는 경우는
// my-space-screen 이 나가는 화면이어도 이 목록에 없어 기본 모션을 쓴다.
const MY_SPACE_DETAIL_PATHS = new Set<string>([
  ROUTES.anonymousNameSettings,
  ROUTES.accountSettings,
  ROUTES.notificationSettings,
  ROUTES.safetyManagement,
  ROUTES.serviceGuide,
  ROUTES.privacyPolicy,
  ROUTES.termsOfService,
]);

// 위 목록과 같은 화면들을, 이번엔 경로가 아니라 각 화면 루트에 붙는
// 클래스명으로 다시 적어둔다. navigateBack() 은 '지금 어느 화면을 떠나는지'를
// 클래스로만 판별할 수 있어(경로는 이미 fallback 하나 "/my-space" 뿐이라
// 구분이 안 된다) 별도 목록이 필요하다.
//
// account-settings-screen · guide-screen · terms-screen 은 bare 클래스로 두면
// 각각 계정 삭제 흐름 · (예전) 안전 안내 · 온보딩 약관 동의 화면과도
// 겹친다(index.css 의 같은 목록에 적힌 사연 참고). 여기서도 같은 전용 클래스
// (--figma, --my-space)로 좁혀 CSS 쪽과 판단 기준을 맞춘다.
const MY_SPACE_DETAIL_CLASSES = [
  "nef-screen",
  "account-settings-screen--figma",
  "notification-settings-screen",
  "safety-management-screen",
  "guide-screen--my-space",
  "privacy-policy-screen",
  "terms-screen--my-space",
];

function markPushTransition(page: HTMLElement | null, destination: string) {
  if (!page) return;
  if (
    page.classList.contains("my-space-screen") &&
    MY_SPACE_DETAIL_PATHS.has(destination)
  ) {
    page.classList.add("is-pushed-away");
  }
}

// '깊이가 하나 더 있는' 밀고 들어오기 쌍. 나의 공간 → 상세 화면 말고도,
// 계정 관리 → 계정 삭제(/account-withdrawal)도 같은 구조다: 상세 화면을
// 나와 정확히 이 fallback 으로 돌아갈 때만 반대 방향(pop)을 쓴다.
// fromClasses 는 그 상세 화면 루트에 붙는 클래스명들이다.
const POP_PAIRS: ReadonlyArray<{
  fallbackPath: string;
  fromClasses: readonly string[];
}> = [
  { fallbackPath: ROUTES.mySpace, fromClasses: MY_SPACE_DETAIL_CLASSES },
  {
    fallbackPath: ROUTES.accountSettings,
    fromClasses: ["account-withdrawal-screen"],
  },
];

// 나의 공간 상세 화면(또는 계정 삭제 화면)을 떠나 각각의 짝이 되는 목록으로
// 돌아가는 경우에만 참이다. 이때는 들어올 때와 반대 방향(오른쪽으로 나가기 /
// 왼쪽에서 들어오기)을 쓴다.
function isPoppingBack(page: HTMLElement | null, fallbackPath: string) {
  if (!page) return false;
  return POP_PAIRS.some(
    (pair) =>
      pair.fallbackPath === fallbackPath &&
      pair.fromClasses.some((cls) => page.classList.contains(cls)),
  );
}

// history.back() 은 bfcache 로 복원될 수 있는데, 그러면 이미 한 번 끝난
// CSS 진입 애니메이션이 다시 재생되지 않아 모션이 매번 다르게(또는 아예
// 안 보이게) 나온다. 이 세션스토리지 표시를 도착 화면이 마운트될 때 읽어
// (MySpaceScreen.tsx, AccountSettingsScreen) 진입 애니메이션을 켤지 정한다 —
// 새로 불러오기라 매번 확실히 재생된다. 한 번에 한 화면만 새로 마운트되므로
// 목적지가 둘이어도 플래그 하나면 충분하다.
const POP_ENTRY_FLAG_KEY = "gonggam:pop-entry";

export function markPopEntry() {
  try {
    window.sessionStorage.setItem(POP_ENTRY_FLAG_KEY, "1");
  } catch {
    // 세션스토리지를 못 쓰는 환경에서는 그냥 기본 모션으로 들어온다.
  }
}

export function consumePopEntry() {
  try {
    const flagged = window.sessionStorage.getItem(POP_ENTRY_FLAG_KEY) === "1";
    if (flagged) window.sessionStorage.removeItem(POP_ENTRY_FLAG_KEY);
    return flagged;
  } catch {
    return false;
  }
}

function leavePage(complete: () => void) {
  if (isPageNavigationInProgress) return;

  isPageNavigationInProgress = true;
  const page = getCurrentPage();
  const exitDuration = getExitDuration(page);
  // 문서를 새로 불러오지 않으므로, 이동을 마치면 '이동 중' 표시를 직접 푼다.
  // 떠난 화면은 곧 사라지므로 그 화면의 클래스는 건드릴 필요가 없다.
  const finish = () => {
    isPageNavigationInProgress = false;
    pageNavigationTimer = null;
    complete();
  };

  if (!page || exitDuration === 0) {
    finish();
    return;
  }

  page.classList.add("is-page-leaving");
  page.setAttribute("aria-busy", "true");
  pageNavigationTimer = window.setTimeout(finish, exitDuration);
}

function isCurrentDestination(path: string) {
  if (window.location.protocol === "file:") {
    return window.location.hash.replace(/^#/, "") === path;
  }

  const destination = new URL(path, window.location.origin);
  return (
    destination.pathname === stripBasePath(window.location.pathname) &&
    destination.search === window.location.search
  );
}

// 앱 안에서 뒤로 갈 곳이 있는지. 문서를 새로 불러오지 않으니 document.referrer 는
// 첫 화면의 값에 머문다. 대신 라우터가 기록마다 남기는 순번(idx)을 본다 —
// 앱을 연 첫 기록은 0 이고, 앱 안에서 이동할 때마다 1씩 늘어난다.
function canGoBackInApp() {
  const state = window.history.state as { idx?: unknown } | null;
  return typeof state?.idx === "number" && state.idx > 0;
}

window.addEventListener("pageshow", resetPageTransition);

// 하단 메뉴가 있는 세 탭 화면. 탭끼리 옮길 때는 화면 전체 모션을 쓰지 않는다
// (2026-09-17). 하단 메뉴가 각 화면 안에 있어, 모션을 타면 메뉴까지 8px
// 내려갔다 올라와 탭을 누를 때마다 툭툭 튀었다. 각 화면 안쪽 모션은 그대로 둔다.
const TAB_PATHS = new Set<string>([
  ROUTES.home,
  ROUTES.mailbox,
  ROUTES.mySpace,
]);
// global.css 의 app-tab-content-exit 길이와 같아야 한다.
const TAB_EXIT_DURATION = 120;

export function isTabPath(path: string) {
  return TAB_PATHS.has(path);
}

// App 이 주소가 바뀔 때마다 부른다. 탭 → 탭 이동이면 html 에 표시를 붙이고
// (CSS 가 화면 전체 모션을 끈다), 아니면 뗀다. 기기 뒤로 가기도 여기를 지난다.
export function markTabSwitch(isTabSwitch: boolean) {
  if (isTabSwitch) document.documentElement.dataset.tabSwitch = "";
  else delete document.documentElement.dataset.tabSwitch;
}

export function navigateTo(path: string) {
  if (isPageNavigationInProgress || isCurrentDestination(path)) return;

  // 탭 → 탭: 화면 전체가 아니라 하단 메뉴를 뺀 내용만 잠깐 옅어진 뒤 바꾼다
  // (global.css 의 .is-tab-leaving). 메뉴는 끝까지 제자리에 있다.
  if (isTabPath(getCurrentAppPath()) && isTabPath(path)) {
    const page = getCurrentPage();
    if (!page || prefersReducedMotion()) {
      goToPath(path);
      return;
    }
    isPageNavigationInProgress = true;
    page.classList.add("is-tab-leaving");
    pageNavigationTimer = window.setTimeout(() => {
      isPageNavigationInProgress = false;
      pageNavigationTimer = null;
      goToPath(path);
    }, TAB_EXIT_DURATION);
    return;
  }

  // 셸 안에서 갈 수 있는 곳이면 페이지를 새로 불러오지 않는다.
  if (shellRouter?.go(path)) return;

  markPushTransition(getCurrentPage(), path);

  leavePage(() => goToPath(path));
}

export function replaceRoute(path: string) {
  if (isCurrentDestination(path)) return;
  goToPath(path, true);
}

// 나의 공간 셸이 하위 화면으로 바꿀 때 주소만 앞으로 한 칸 옮긴다(나가는 모션 없음).
// 예전에는 history.pushState 를 직접 불렀는데, 라우터가 모르는 기록이 끼면
// 뒤로 가기 순번(idx)이 어긋난다.
export function pushShellRoute(path: string) {
  if (isCurrentDestination(path)) return;
  goToPath(path);
}

// 한 화면 안에서 하위 뷰를 state 로 전환하는 '셸' 화면(나의 공간)이 등록해 둔다.
// 하위 화면들은 저마다 navigateTo("/account-withdrawal") 나
// navigateBack("/my-space") 를 부르는데, 여기서 가로채면 그 화면들을 하나도
// 건드리지 않고도 페이지 이동 대신 셸 안에서 전환할 수 있다.
// go/back 은 자기가 처리했으면 true 를 준다 — false 면 평소대로 페이지가 이동한다.
type ShellRouter = {
  go: (path: string) => boolean;
  back: (fallbackPath: string) => boolean;
  // 셸이 스스로 그리는 주소인지. App 은 이 주소들로 옮겨 갈 때 화면을 새로
  // 만들지 않고 셸을 그대로 둔다(그래야 셸 안의 전환 모션이 산다).
  owns: (path: string) => boolean;
};

let shellRouter: ShellRouter | null = null;

// 나의 공간 목록 자체이거나, 떠 있는 셸이 맡은 주소이면 참.
export function isShellPath(path: string) {
  return path === ROUTES.mySpace || Boolean(shellRouter?.owns(path));
}

export function registerShellRouter(router: ShellRouter) {
  shellRouter = router;
  return () => {
    if (shellRouter === router) shellRouter = null;
  };
}

export function navigateBack(fallbackPath: string) {
  if (isPageNavigationInProgress) return;

  // 셸이 처리할 수 있으면 페이지를 새로 불러오지 않고 셸에게 넘긴다.
  if (shellRouter?.back(fallbackPath)) return;

  const page = getCurrentPage();

  if (isPoppingBack(page, fallbackPath)) {
    // history.back() 이 아니라 목록 주소로 앞으로 이동한다 — 도착 화면이
    // 표시(markPopEntry)를 읽어 pop-in 애니메이션을 고른다. navigateTo() 를
    // 재사용하지 않는 이유: 그 함수는 나가는 모션을 기본(push)으로 다시 고르고,
    // 이 화면에는 이미 pop 방향 클래스를 붙였기 때문이다.
    page?.classList.add("is-popped-away");
    markPopEntry();
    leavePage(() => goToPath(fallbackPath));
    return;
  }

  if (!canGoBackInApp()) {
    navigateTo(fallbackPath);
    return;
  }

  leavePage(() => window.history.back());
}

export function replaceAppState(state: string) {
  if (window.location.protocol === "file:") {
    const params = getCurrentAppSearchParams();
    params.set("state", state);
    window.history.replaceState(
      window.history.state,
      "",
      `#${getCurrentAppPath()}?${params.toString()}`,
    );
    return;
  }

  // 기록에 남은 라우터 정보(idx 등)는 그대로 둔다 — 비우면 뒤로 가기 판단이 틀어진다.
  const url = new URL(window.location.href);
  url.searchParams.set("state", state);
  window.history.replaceState(window.history.state, "", url);
}

/**
 * 주소에 남긴 화면 상태 표시를 지운다.
 *
 * 완료 화면처럼 '한 번만 보여주는' 자리에서 쓴다. 떠나기 직전에 지워 두면,
 * 뒤로 돌아왔을 때 완료 화면이 다시 뜨지 않고 그때의 실제 상태가 보인다
 * (예: 편지 두고 가기 → 돌아오면 '이미 두고 온 편지예요').
 */
export function clearAppState() {
  if (window.location.protocol === "file:") {
    const params = getCurrentAppSearchParams();
    params.delete("state");
    const query = params.toString();
    window.history.replaceState(
      window.history.state,
      "",
      `#${getCurrentAppPath()}${query ? `?${query}` : ""}`,
    );
    return;
  }

  const url = new URL(window.location.href);
  url.searchParams.delete("state");
  window.history.replaceState(window.history.state, "", url);
}
