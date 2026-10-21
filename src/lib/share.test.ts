import { describe, expect, it } from "vitest";
import { buildQuery, parseShare } from "./share";

describe("buildQuery", () => {
  it("includes full names for normal links", () => {
    const q = buildQuery({ a: "Ahmad", b: "Siti Nurhaliza", hide: false, lang: "bm", score: 63 });
    expect(q.get("a")).toBe("Ahmad");
    expect(q.get("b")).toBe("Siti Nurhaliza");
    expect(q.has("h")).toBe(false);
    expect(q.has("l")).toBe(false);
  });

  it("NEVER leaks full names in hidden links (initials + score only)", () => {
    const q = buildQuery({ a: "Ahmad Faiz", b: "Siti Nurhaliza", hide: true, lang: "en", score: 63 });
    const str = q.toString().toLowerCase();
    expect(str).not.toContain("ahmad");
    expect(str).not.toContain("faiz");
    expect(str).not.toContain("siti");
    expect(str).not.toContain("nurhaliza");
    expect(q.get("a")).toBe("A.F.");
    expect(q.get("b")).toBe("S.N.");
    expect(q.get("s")).toBe("63");
    expect(q.get("h")).toBe("1");
    expect(q.get("l")).toBe("en");
  });

  it("truncates very long names", () => {
    const q = buildQuery({ a: "x".repeat(100), b: "y", hide: false, lang: "bm", score: 10 });
    expect(q.get("a")).toHaveLength(30);
  });
});

describe("parseShare", () => {
  it("recomputes the score from names (cannot be spoofed on normal links)", () => {
    const p = parseShare({ a: "ali", b: "abu", s: "99" });
    expect(p?.score).toBe(42);
    expect(p?.hidden).toBe(false);
  });

  it("accepts hidden links with a valid score", () => {
    const p = parseShare({ a: "A.S.", b: "N.H.", s: "73", h: "1", l: "en" });
    expect(p).toMatchObject({ hidden: true, score: 73, lang: "en", a: "A.S.", b: "N.H." });
  });

  it("rejects hidden links with invalid scores", () => {
    expect(parseShare({ a: "A.", b: "B.", s: "5", h: "1" })).toBeNull();
    expect(parseShare({ a: "A.", b: "B.", s: "100", h: "1" })).toBeNull();
    expect(parseShare({ a: "A.", b: "B.", s: "abc", h: "1" })).toBeNull();
  });

  it("returns null when names are missing or too short", () => {
    expect(parseShare({})).toBeNull();
    expect(parseShare({ a: "x" })).toBeNull();
    expect(parseShare({ a: "a", b: "a" })).toBeNull();
  });

  it("defaults to Bahasa Melayu", () => {
    expect(parseShare({ a: "ali", b: "abu" })?.lang).toBe("bm");
  });
});
