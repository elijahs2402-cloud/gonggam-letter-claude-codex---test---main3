import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

export type DraftSaveState = "idle" | "saving" | "saved" | "error";

export function useDraftAutosave<T>(
  value: T,
  save: (value: T) => boolean,
  enabled = true,
) {
  const [state, setState] = useState<DraftSaveState>("idle");
  // 저장 함수는 타이머 · 이벤트 · 화면을 떠날 때 뒤늦게 불린다. 그때의 최신 값을 쓰도록
  // ref 에 담아 둔다. 그리는 도중이 아니라 그린 직후에 바꾼다(React 규칙).
  const latest = useRef(value);
  const saveRef = useRef(save);
  const enabledRef = useRef(enabled);
  useLayoutEffect(() => {
    latest.current = value;
    saveRef.current = save;
    enabledRef.current = enabled;
  });

  // '지우고 나가기'처럼 초안을 지운 뒤 화면을 떠날 때, 아직 붙어 있는 자동저장이
  // 방금 지운 내용을 그대로 되살리는 것을 막는다.
  // ref 는 렌더를 기다리지 않고 그 자리에서 바뀌므로 다음 저장이 곧바로 막힌다.
  const cancelled = useRef(false);
  // 마지막 저장 뒤에 바뀐 내용이 있는지. 화면을 떠날 때 이 값이 참이면 한 번 더 저장한다.
  const dirty = useRef(false);

  const saveNow = useCallback(() => {
    if (!enabledRef.current || cancelled.current) return true;
    setState("saving");
    const saved = saveRef.current(latest.current);
    if (saved) dirty.current = false;
    setState(saved ? "saved" : "error");
    return saved;
  }, []);

  useEffect(() => {
    if (!enabled) return;
    dirty.current = true;
    const timer = window.setTimeout(saveNow, 700);
    return () => window.clearTimeout(timer);
  }, [value, enabled, saveNow]);

  // 앱을 닫거나 다른 앱으로 넘어갈 때
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
  }, [enabled, saveNow]);

  // 앱 안에서 다른 화면으로 떠날 때(2026-09-17). 화면 이동이 문서를 새로 불러오지 않으므로
  // beforeunload 가 오지 않는다. 입력 직후(700ms 안) 기기 뒤로 가기로 떠나면 마지막
  // 글자가 저장되지 않았다. 사라지는 화면이라 저장 상태 표시는 바꾸지 않는다.
  useEffect(
    () => () => {
      if (!dirty.current || !enabledRef.current || cancelled.current) return;
      saveRef.current(latest.current);
    },
    [],
  );

  // 되돌릴 일이 없다 — 이 화면을 떠나기로 한 순간에만 부른다.
  const cancel = () => {
    cancelled.current = true;
  };

  return { state, saveNow, cancel };
}
