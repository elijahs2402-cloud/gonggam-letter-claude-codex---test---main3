import { getCurrentAppSearchParams } from "./navigation";

/**
 * Keeps inspection controls out of normal prototype journeys.
 * Add `?qa=1` only when a reviewer needs to switch fixture states manually.
 */
export function isPrototypeQaMode() {
  return getCurrentAppSearchParams().get("qa") === "1";
}
