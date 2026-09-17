import type { CapacitorConfig } from "@capacitor/cli";

// Capacitor 설정 (PROJECT_SPEC.md §24)
// appId 는 자리표시자다. 실제 값은 개발팀이 스토어 등록 전에 확정한다.
// 네이티브 프로젝트(android/ios)는 아직 만들지 않았다 — README 의 "Android/iOS 빌드 방법" 참고.
const config: CapacitorConfig = {
  appId: "com.example.placeholder",
  appName: "공감편지",
  webDir: "dist",
};

export default config;
