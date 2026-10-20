import { describe, expect, it } from "vitest";
import { countLetters, initials, normalize, reduceRow, serasi } from "./index";

describe("normalize", () => {
  it("keeps only a-z, lowercased, accents stripped", () => {
    expect(normalize("Ahmad Fa'iz-Ünal 123!")).toBe("ahmadfaizunal");
  });
});

describe("countLetters", () => {
  it("counts letters in order of first appearance across both names", () => {
    expect(countLetters("ali", "abu")).toEqual([
      { letter: "a", count: 2 },
      { letter: "l", count: 1 },
      { letter: "i", count: 1 },
      { letter: "b", count: 1 },
      { letter: "u", count: 1 },
    ]);
  });
});

describe("reduceRow", () => {
  it("moves the middle number to the END (golden case)", () => {
    const step = reduceRow([1, 2, 3, 4, 5, 6, 7]);
    expect(step.to).toEqual([8, 8, 8, 4]);
    expect(step.middle).toBe(3);
  });

  it("splits two-digit sums into digits", () => {
    expect(reduceRow([8, 8, 8, 4]).to).toEqual([1, 2, 1, 6]);
  });

  it("uses the true middle for length 5 (old Streamlit bug)", () => {
    expect(reduceRow([1, 2, 3, 4, 5]).to).toEqual([6, 6, 3]);
  });

  it("handles length 3", () => {
    expect(reduceRow([2, 1, 3]).to).toEqual([5, 1]);
  });
});

describe("serasi", () => {
  it("golden case: [1..7] reduces to 73%", () => {
    // letter counts 1,2,3,4,5,6,7 (a..g)
    const r = serasi("abbcccdddd", "eeeeeffffffggggggg");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.rows).toEqual([
        [1, 2, 3, 4, 5, 6, 7],
        [8, 8, 8, 4],
        [1, 2, 1, 6],
        [7, 3],
      ]);
      expect(r.score).toBe(73);
    }
  });

  it("matches the hand-worked example for Ali + Abu (original app gave 42)", () => {
    const r = serasi("ali", "abu");
    expect(r.ok && r.score).toBe(42);
  });

  it("is case/space/accent insensitive", () => {
    const x = serasi("Siti Nurhaliza", "Ahmad");
    const y = serasi("  sitinurhaliza", "AHMAD!!");
    expect(x).toEqual(y);
  });

  it("is symmetric-agnostic: order of names only affects letter order", () => {
    const r = serasi("Hadi Hafiz", "Nur Aisyah");
    expect(r.ok).toBe(true);
  });

  it("rejects input with fewer than 2 numbers", () => {
    expect(serasi("", "")).toEqual({ ok: false, reason: "too_short" });
    expect(serasi("a", "a")).toEqual({ ok: false, reason: "too_short" });
    expect(serasi("123", "!!!")).toEqual({ ok: false, reason: "too_short" });
  });

  it("splits starting counts >= 10 into digits", () => {
    const r = serasi("aaaaaaaaaaaa", "b"); // a:12, b:1 -> [1,2,1]
    expect(r.ok && r.rows[0]).toEqual([1, 2, 1]);
  });

  it("always terminates with a score between 10 and 99 (fuzz)", () => {
    const alphabet = "abcdefghijklmnopqrstuvwxyz";
    let seed = 42;
    const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
    const word = (len: number) =>
      Array.from({ length: len }, () => alphabet[Math.floor(rnd() * 26)]).join("");

    for (let k = 0; k < 20000; k++) {
      const a = word(1 + Math.floor(rnd() * 30));
      const b = word(1 + Math.floor(rnd() * 30));
      const r = serasi(a, b);
      if (r.ok) {
        expect(r.score).toBeGreaterThanOrEqual(10);
        expect(r.score).toBeLessThanOrEqual(99);
        expect(r.rows[r.rows.length - 1]).toHaveLength(2);
      } else {
        // only legitimately too short inputs may fail
        expect(countLetters(a, b).length).toBeLessThan(2);
      }
    }
  });
});

describe("initials", () => {
  it("builds dotted initials", () => {
    expect(initials("Nur Aisyah")).toBe("N.A.");
    expect(initials("  ali ")).toBe("A.");
    expect(initials("!!!")).toBe("?");
    expect(initials("A.S.")).toBe("A.S."); // idempotent
  });
});
