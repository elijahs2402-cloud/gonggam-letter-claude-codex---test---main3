// 편지 만나기 화면의 이동 도우미
// 2026-09-18 src/pages/Letter/ListenEntryVariants.tsx 에서 옮겼다(코드 그대로).
import { navigateTo } from "./navigation";

export function goTo(path: string) {
  navigateTo(path);
}
