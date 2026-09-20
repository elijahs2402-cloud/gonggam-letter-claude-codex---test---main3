// 여러 화면이 함께 쓰는 문구.
//
// 같은 문장을 화면마다 따로 적어두면 말을 다듬을 때 한 곳을 빠뜨리게 된다.
// 실제로 '이미 두고 온 편지예요'는 세 파일 여섯 곳에 그대로 복사돼 있었다.
// 화면마다 달라져야 하는 문구는 여기 두지 않는다 — 어디서든 같은 뜻일 때만 올린다.

import { LETTER_MIN_LENGTH, NAME_MAX_LENGTH } from "./limits";

/** 이름 입력칸 아래 안내. 길이 제한과 문구가 어긋나지 않게 상수로 만든다. */
export const NAME_LENGTH_HELP = `${NAME_MAX_LENGTH}자 이내로 입력해주세요.`;

/** 편지 · 답장이 너무 짧을 때의 안내(입력칸 안내 문구로도 쓴다). */
export const LETTER_MIN_LENGTH_NOTICE = `마음을 ${LETTER_MIN_LENGTH}자 이상 적어주세요.`;

/** 편지를 이미 두고 온 뒤 그 편지로 다시 들어왔을 때. */
export const RETURNED_LETTER_TITLE = "이미 두고 온 편지예요";
export const RETURNED_LETTER_BODY =
  "이 편지는 다른 사람이 이어서 읽을 수 있어요.";
