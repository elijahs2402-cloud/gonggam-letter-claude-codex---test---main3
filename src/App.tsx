import { useEffect, useLayoutEffect } from "react";
import { Outlet, useLocation, useNavigationType } from "react-router-dom";
import { ServiceStateScreen } from "./components/common/CommonStates";
import { syncDerivedNotifications } from "./data/notificationEvents";
import { getMockAuthSnapshot, isMockAuthenticated } from "./data/mockAuth";
import { MySpaceScreen } from "./pages/MySpace/MySpaceScreen";
import {
  getCurrentAppPath,
  getCurrentAppSearchParams,
  isShellPath,
  isTabPath,
  markPageChanged,
  markTabSwitch,
} from "./utils/navigation";
import { rememberScroll, restoreScroll } from "./utils/scrollMemory";

/**
 * 모든 화면의 틀. 어느 주소에 어떤 화면이 오는지는 src/routes/AppRoutes.tsx 가 정하고,
 * 여기서는 그 화면을 Outlet 으로 그리면서 화면 사이의 공통 동작만 맡는다.
 */

// 주소 기록이 바뀔 때마다(셸 안 이동 포함) 한 번만 하는 일.
// effect 가 아니라 그리기 전에 부른다 — 새 화면이 그리면서 알림을 읽고,
// 새 화면의 effect(자식이 부모보다 먼저 돈다)가 타이머를 걸기 전에 끝나 있어야 한다.
// - 알림 목록을 지금 상태에 맞춘다. 문서를 새로 불러오던 때는 main.tsx 에서
//   화면마다 한 번씩 돌았다. 로그인 전에는 볼 편지가 없으므로 건너뛴다.
// - 떠난 화면의 타이머가 실행되지 않도록 화면 번호를 올린다(setPageTimeout).
// - 탭 → 탭 이동인지 표시한다(화면 전체 모션을 끄는 CSS 가 읽는다). 새 화면이
//   붙기 전에 정해져 있어야 첫 프레임부터 모션 없이 그려진다.
// - 떠나는 화면의 스크롤 위치를 적어 둔다. 그리기 전이라 아직 떠나는 화면이 보인다.
let lastLocationKey: string | null = null;
let lastPath: string | null = null;
function handleLocationChange(locationKey: string, path: string) {
  if (lastLocationKey === locationKey) return;
  if (lastLocationKey !== null) rememberScroll(lastLocationKey);
  lastLocationKey = locationKey;
  markTabSwitch(lastPath !== null && isTabPath(lastPath) && isTabPath(path));
  lastPath = path;
  markPageChanged();
  if (getMockAuthSnapshot().account) syncDerivedNotifications();
}

const SYSTEM_STATES = [
  "offline",
  "maintenance",
  "update_required",
  "restricted",
  "error",
] as const;
type SystemState = (typeof SYSTEM_STATES)[number];
function isSystemState(value: string | null): value is SystemState {
  return SYSTEM_STATES.some((state) => state === value);
}

export function App() {
  const location = useLocation();
  const path = getCurrentAppPath();
  handleLocationChange(location.key, path);
  // 화면마다 key 를 바꿔 새로 만든다 — 문서를 새로 불러오던 때처럼 화면 상태가
  // 처음부터 시작하고, 들어오는 모션(.mobile-prototype)도 매번 재생된다.
  // 나의 공간 셸이 맡은 주소는 같은 key 를 써서 셸을 그대로 둔다(셸 안 전환 모션).
  // 로그인 전이면 셸을 쓰지 않는다 — 라우트의 로그인 확인(RequireAuth)이 먼저다.
  const shell = isShellPath(path) && isMockAuthenticated();
  const screenKey = shell ? "my-space-shell" : location.key;

  useEffect(() => {
    // 문서를 새로 불러오면 맨 위에서 시작했다. 같은 동작을 맞춘다.
    if (!shell) window.scrollTo(0, 0);
  }, [screenKey, shell]);

  // 뒤로 · 앞으로 가기(POP)로 돌아온 화면은 떠날 때의 스크롤 위치로 되돌린다.
  // 화면이 붙은 직후, 그려지기 전에 맞춰 위치가 튀어 보이지 않게 한다.
  // 나의 공간 셸 안 이동은 셸이 스스로 화면을 바꾸므로 제외한다(목록이 짧다).
  const navigationType = useNavigationType();
  useLayoutEffect(() => {
    if (navigationType === "POP" && !shell) restoreScroll(location.key);
  }, [location.key, navigationType, shell]);

  // ?system= 은 어느 주소에서든 서비스 상태 화면을 먼저 보여준다.
  const systemState = getCurrentAppSearchParams().get("system");
  if (isSystemState(systemState))
    return <ServiceStateScreen key={screenKey} variant={systemState} />;

  // 셸이 맡은 주소(나의 공간 목록 + 하위 화면)는 셸이 스스로 그린다.
  if (shell) return <MySpaceScreen key={screenKey} />;

  return <Outlet key={screenKey} />;
}
