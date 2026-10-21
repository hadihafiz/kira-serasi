import { track } from "@vercel/analytics";

type EventName = "calculate" | "share" | "story_download" | "copy_link" | "lang_toggle";

/**
 * Privacy-first analytics: events only, NEVER names or any user input.
 * Swap this implementation to Umami/Plausible without touching call sites.
 */
export function logEvent(name: EventName, props?: Record<string, string | number | boolean>) {
  try {
    track(name, props);
  } catch {
    /* analytics must never break the game */
  }
}
