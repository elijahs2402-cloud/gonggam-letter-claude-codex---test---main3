import { useEffect, useRef, useState } from "react";

export type DraftSaveState = "idle" | "saving" | "saved" | "error";

export function useDraftAutosave<T>(
  value: T,
  save: (value: T) => boolean,
  enabled = true,
) {
  const latest = useRef(value);
  const [state, setState] = useState<DraftSaveState>("idle");
  latest.current = value;

  // '지우고 나가기'처럼 초안을 지운 뒤 화면을 떠날 때, 아직 붙어 있는 자동저장이
  // 방금 지운 내용을 그대로 되살리는 것을 막는다.
  //
  // enabled 플래그를 false 로 내리는 방법은 여기서 통하지 않는다. 삭제 핸들러는
  // 같은 함수 안에서 곧바로 navigateTo 를 부르는데, navigateTo 는 페이지를 새로
  // 불러온다. 그 사이 React 가 다시 렌더할 틈이 없어 beforeunload 리스너가
  // 떨어지지 않고, 이탈 직전에 saveNow 가 한 번 더 돌아 초안이 되살아났다.
  // ref 는 렌더를 기다리지 않고 그 자리에서 바뀌므로 다음 saveNow 가 곧바로 막힌다.
  const cancelled = useRef(false);

  const saveNow = () => {
    if (!enabled || cancelled.current) return true;
    setState("saving");
    const saved = save(latest.current);
    setState(saved ? "saved" : "error");
    return saved;
  };

  useEffect(() => {
    if (!enabled) return;
    const timer = window.setTimeout(saveNow, 700);
    return () => window.clearTimeout(timer);
  }, [value, enabled]);

  useEffect(() => {
    if (!enabled) return;
    const onVisibility = () => {
      if (document.visibilityState === "hidden") saveNow();
    };
    const onBeforeUnload = () => {
      saveNow();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [enabled]);

  // 되돌릴 일이 없다 — 이 화면을 떠나기로 한 순간에만 부른다.
  const cancel = () => {
    cancelled.current = true;
  };

  return { state, saveNow, cancel };
}
