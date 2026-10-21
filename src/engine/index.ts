/**
 * Kira Serasi engine: the childhood name-compatibility game.
 *
 * Rules:
 *  1. Combine both names. Keep A-Z only (case-insensitive, accents stripped).
 *  2. Count each letter in order of first appearance. Counts >= 10 are split into digits.
 *  3. Repeat until 2 numbers remain: add the outermost pair, then the next pair inwards...
 *     Sums >= 10 are split into digits. With an odd count, the middle number moves to the END
 *     of the next row.
 *  4. The two remaining digits form the percentage.
 *
 * Pure and dependency-free so it runs in the browser and on the edge.
 */

export interface Pair {
  /** index of the left number in the source row */
  i: number;
  /** index of the right number in the source row */
  j: number;
  sum: number;
}

export interface Step {
  from: number[];
  pairs: Pair[];
  /** index of the carried-over middle number in `from`, or null for even-length rows */
  middle: number | null;
  to: number[];
}

export interface LetterCount {
  letter: string;
  count: number;
}

export type SerasiResult =
  | {
      ok: true;
      letters: LetterCount[];
      /** rows[0] is the (digit-split) letter counts; the last row has exactly 2 digits */
      rows: number[][];
      steps: Step[];
      score: number;
    }
  | { ok: false; reason: "too_short" };

/** Max reduction rounds before giving up (safety net, never hit in practice). */
const MAX_ROUNDS = 100;

/** Lowercase, strip accents and keep only a-z. */
export function normalize(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
}

export function countLetters(a: string, b: string): LetterCount[] {
  const map = new Map<string, number>();
  for (const ch of normalize(a) + normalize(b)) {
    map.set(ch, (map.get(ch) ?? 0) + 1);
  }
  return [...map.entries()].map(([letter, count]) => ({ letter, count }));
}

function splitDigits(n: number): number[] {
  return n > 9 ? String(n).split("").map(Number) : [n];
}

/** Perform one reduction round. */
export function reduceRow(row: number[]): Step {
  const n = row.length;
  const pairs: Pair[] = [];
  const to: number[] = [];

  for (let i = 0; i < Math.floor(n / 2); i++) {
    const j = n - 1 - i;
    const sum = row[i] + row[j];
    pairs.push({ i, j, sum });
    to.push(...splitDigits(sum));
  }

  let middle: number | null = null;
  if (n % 2 === 1) {
    middle = Math.floor(n / 2);
    to.push(row[middle]);
  }

  return { from: row, pairs, middle, to };
}

export function serasi(nameA: string, nameB: string): SerasiResult {
  const letters = countLetters(nameA, nameB);
  let row = letters.flatMap((l) => splitDigits(l.count));
  if (row.length < 2) return { ok: false, reason: "too_short" };

  const rows: number[][] = [row];
  const steps: Step[] = [];

  let rounds = 0;
  while (row.length > 2) {
    if (++rounds > MAX_ROUNDS) return { ok: false, reason: "too_short" };
    const step = reduceRow(row);
    steps.push(step);
    row = step.to;
    rows.push(row);
  }

  return { ok: true, letters, rows, steps, score: row[0] * 10 + row[1] };
}

/** Initials of a name: "Nur Aisyah" -> "N.A." (already-dotted initials are kept as-is) */
export function initials(name: string): string {
  const trimmed = name.trim();
  if (/^([A-Z]\.)+$/.test(trimmed)) return trimmed;
  const parts = trimmed
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/\s+/)
    .map((w) => w.replace(/[^A-Za-z]/g, ""))
    .filter(Boolean);
  if (parts.length === 0) return "?";
  return parts.map((p) => p[0].toUpperCase() + ".").join("");
}
