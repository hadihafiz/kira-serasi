import { initials, serasi } from "@/engine";
import type { Lang } from "./i18n";

export const MAX_NAME_LENGTH = 30;

export interface SharePayload {
  a: string;
  b: string;
  /** true when names are hidden: `a` and `b` are initials and `s` carries the score */
  hidden: boolean;
  /** score, only present for hidden links */
  s?: number;
  lang: Lang;
}

/** Build the query string for a shareable result. Hidden links never contain the full names. */
export function buildQuery(opts: {
  a: string;
  b: string;
  hide: boolean;
  lang: Lang;
  score: number;
}): URLSearchParams {
  const p = new URLSearchParams();
  if (opts.hide) {
    p.set("a", initials(opts.a));
    p.set("b", initials(opts.b));
    p.set("s", String(opts.score));
    p.set("h", "1");
  } else {
    p.set("a", opts.a.trim().slice(0, MAX_NAME_LENGTH));
    p.set("b", opts.b.trim().slice(0, MAX_NAME_LENGTH));
  }
  if (opts.lang === "en") p.set("l", "en");
  return p;
}

type Raw = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/** Parse and validate the URL params of a shared link. Returns null if there is nothing usable. */
export function parseShare(raw: Raw): (SharePayload & { score: number }) | null {
  const a = (first(raw.a) ?? "").slice(0, MAX_NAME_LENGTH).trim();
  const b = (first(raw.b) ?? "").slice(0, MAX_NAME_LENGTH).trim();
  if (!a || !b) return null;
  const lang: Lang = first(raw.l) === "en" ? "en" : "bm";

  if (first(raw.h) === "1") {
    const s = Number(first(raw.s));
    if (!Number.isInteger(s) || s < 10 || s > 99) return null;
    return { a, b, hidden: true, s, score: s, lang };
  }

  const r = serasi(a, b);
  if (!r.ok) return null;
  return { a, b, hidden: false, score: r.score, lang };
}
