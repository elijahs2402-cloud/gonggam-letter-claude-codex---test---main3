// 화면 여러 곳이 함께 쓰는 길이 제한 (규격 §20).
// 입력칸의 maxLength · 글자 수 표시 · 검사 조건이 같은 값을 봐야 하는 것들만 둔다.

/** 익명 이름 최대 글자 수 — 이름 정하기 · 나의 이름 입력칸과 이름 만들기 검사가 함께 쓴다. */
export const NAME_MAX_LENGTH = 10;

/** 편지 · 답장을 보내려면 필요한 최소 글자 수(공백 등을 뺀 길이). */
export const LETTER_MIN_LENGTH = 10;

/** 신고 추가 설명 · 계정 삭제 이유 입력칸의 최대 글자 수. */
export const DETAIL_MAX_LENGTH = 200;
