// 편지 화면의 날짜 표기
// 2026-09-18 src/pages/Letter/LetterFlowScreens.tsx 에서 옮겼다(코드 그대로).
import { formatDateTime } from "./datetime";

export function formatDate(value: string) {
  return formatDateTime(value);
}

export function formatDateWithYear(value: string) {
  return formatDateTime(value);
}

export function formatLetterReadTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const hour = date.getHours();
  const meridiem = hour >= 12 ? "pm" : "am";
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()} ${meridiem} ${hour % 12 || 12}:${String(date.getMinutes()).padStart(2, "0")}`;
}
