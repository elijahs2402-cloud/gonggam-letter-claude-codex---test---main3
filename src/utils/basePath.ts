// 앱이 놓인 폴더.
// 내 PC(개발 서버)와 휴대폰 앱에서는 도메인 맨 앞("/")에 놓이지만,
// GitHub Pages 에서는 저장소 이름 폴더 아래(/gonggam-letter-…/)에 놓인다.
// 빌드할 때 vite.config.ts 의 base 값이 import.meta.env.BASE_URL 로 들어온다
// (전체 주소일 수도 있어서 경로 부분만 쓴다).
const baseUrl = import.meta.env.BASE_URL;

/** 앱 폴더 경로. 맨 앞이면 "" , GitHub Pages 에서는 "/저장소이름" (끝 / 없음) */
export const BASE_PATH = new URL(
  baseUrl,
  window.location.origin,
).pathname.replace(/\/$/, "");

/** 실제 주소의 경로에서 앱 폴더 부분을 뗀다. 예: "/저장소이름/home" → "/home" */
export function stripBasePath(pathname: string) {
  if (!BASE_PATH) return pathname;
  if (pathname === BASE_PATH) return "/";
  if (pathname.startsWith(`${BASE_PATH}/`)) {
    return pathname.slice(BASE_PATH.length);
  }
  return pathname;
}

/** public/ 폴더 파일의 주소. 예: assetUrl("/assets/logo.webp") */
export function assetUrl(path: string) {
  return `${baseUrl}${path.replace(/^\//, "")}`;
}
