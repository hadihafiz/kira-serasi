"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { initials, serasi, type SerasiResult } from "@/engine";
import { logEvent } from "@/lib/analytics";
import { t, type Lang } from "@/lib/i18n";
import { pencilAt } from "@/lib/pencils";
import { buildQuery, MAX_NAME_LENGTH, type SharePayload } from "@/lib/share";
import { playFlip, playScratch, playTing } from "@/lib/sound";
import Doodles from "./Doodles";
import ScoreBadge from "./ScoreBadge";
import ShareBar from "./ShareBar";
import Working from "./Working";

type Ok = Extract<SerasiResult, { ok: true }>;
type Initial = (SharePayload & { score: number }) | null;
type View = "form" | "working" | "hidden";

function Heart({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={`pencil inline-block ${className}`} aria-hidden="true">
      <path
        d="M32 54C14 40 8 29 13 21c4-7 14-6 19 2 5-8 15-9 19-2 5 8-1 19-19 31z"
        fill="color-mix(in srgb, var(--color-pencil-red) 25%, transparent)"
        stroke="var(--color-pencil-red)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const btnBase =
  "wobbly font-hand inline-flex min-h-12 items-center justify-center gap-2 border-[3px] px-7 py-1 text-3xl font-bold transition-transform active:scale-95 hover:-translate-y-0.5";

export default function Game({ initial }: { initial: Initial }) {
  const [lang, setLang] = useState<Lang>(initial?.lang ?? "bm");
  const d = t(lang);

  const [a, setA] = useState(initial && !initial.hidden ? initial.a : "");
  const [b, setB] = useState(initial && !initial.hidden ? initial.b : "");
  const [hide, setHide] = useState(false);
  const [sound, setSound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [result, setResult] = useState<Ok | null>(() => {
    if (initial && !initial.hidden) {
      const r = serasi(initial.a, initial.b);
      return r.ok ? r : null;
    }
    return null;
  });
  const [view, setView] = useState<View>(() => {
    if (initial?.hidden) return "hidden";
    if (initial && !initial.hidden) return "working";
    return "form";
  });
  const [done, setDone] = useState(false);
  const [runId, setRunId] = useState(0);
  const [fromLink] = useState(!!initial);

  useEffect(() => {
    document.documentElement.lang = lang === "en" ? "en" : "ms";
  }, [lang]);

  const toggleLang = () => {
    const next: Lang = lang === "bm" ? "en" : "bm";
    setLang(next);
    logEvent("lang_toggle", { to: next });
    const p = new URLSearchParams(window.location.search);
    if (next === "en") p.set("l", "en");
    else p.delete("l");
    const qs = p.toString();
    window.history.replaceState(null, "", qs ? `/?${qs}` : "/");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = serasi(a, b);
    if (!r.ok) {
      setError(d.tooShort);
      return;
    }
    setError(null);
    setResult(r);
    setDone(false);
    setRunId((n) => n + 1);
    setView("working");
    if (sound) playFlip();
    logEvent("calculate", { lang });
    const q = buildQuery({ a, b, hide, lang, score: r.score });
    window.history.replaceState(null, "", `/?${q.toString()}`);
  };

  const reset = (clearNames: boolean) => {
    if (clearNames) {
      setA("");
      setB("");
    }
    setResult(null);
    setDone(false);
    setView("form");
    setError(null);
    window.history.replaceState(null, "", lang === "en" ? "/?l=en" : "/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const shownA = hide ? initials(a) : a.trim();
  const shownB = hide ? initials(b) : b.trim();

  return (
    <>
      <Doodles />
      <main className="relative z-10 mx-auto flex min-h-dvh w-full max-w-xl flex-col px-5 pt-5 pb-10 pl-[calc(clamp(14px,4vw,44px)+1.25rem)]">
        {/* top bar */}
        <div className="flex items-center justify-between gap-2 text-lg">
          <button
            type="button"
            onClick={() => {
              setSound((s) => !s);
            }}
            aria-pressed={sound}
            className="font-hand min-h-10 px-2 text-xl text-ink/70 underline decoration-dotted underline-offset-4"
          >
            {sound ? d.soundOn : d.soundOff}
          </button>
          <button
            type="button"
            onClick={toggleLang}
            className="font-hand min-h-10 px-2 text-xl text-ink/70 underline decoration-dotted underline-offset-4"
            lang={lang === "bm" ? "en" : "ms"}
          >
            {d.language}
          </button>
        </div>

        {/* cover title */}
        <header className="mt-2 mb-6 text-center">
          <h1
            className="font-hand text-[clamp(3.5rem,17vw,6rem)] leading-[1.05] font-bold"
            aria-label={d.title}
          >
            {d.title.split("").map((ch, i) => (
              <span
                key={i}
                aria-hidden="true"
                className="pencil inline-block"
                style={{ color: pencilAt(i), transform: `rotate(${((i * 7) % 9) - 4}deg)` }}
              >
                {ch === " " ? "\u00A0" : ch}
              </span>
            ))}
          </h1>
          <p className="font-hand mt-1 text-2xl text-ink/80">{d.tagline}</p>
        </header>

        {view === "form" && (
          <motion.form
            onSubmit={submit}
            noValidate
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="wobbly border-[3px] border-pencil-blue/40 bg-white/60 p-6 backdrop-blur-[1px]"
          >
            <label className="block">
              <span className="font-hand text-2xl font-bold text-ink/70">{d.nameA}</span>
              <input
                className="line-input"
                value={a}
                maxLength={MAX_NAME_LENGTH}
                onChange={(e) => setA(e.target.value)}
                placeholder={d.placeholderA}
                autoComplete="off"
                autoCapitalize="words"
                enterKeyHint="next"
              />
            </label>

            <div className="my-3 flex justify-center" aria-hidden="true">
              <Heart className="w-9" />
            </div>

            <label className="block">
              <span className="font-hand text-2xl font-bold text-ink/70">{d.nameB}</span>
              <input
                className="line-input"
                value={b}
                maxLength={MAX_NAME_LENGTH}
                onChange={(e) => setB(e.target.value)}
                placeholder={d.placeholderB}
                autoComplete="off"
                autoCapitalize="words"
                enterKeyHint="go"
              />
            </label>

            <label className="mt-5 flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={hide}
                onChange={(e) => setHide(e.target.checked)}
                className="mt-1.5 h-5 w-5 accent-pencil-pink"
              />
              <span className="leading-tight">
                <span className="font-hand text-xl font-bold">{d.hideNames}</span>
                <span className="block text-sm text-ink/60">{d.hideNamesHint}</span>
              </span>
            </label>

            <p role="alert" className="font-hand mt-3 min-h-7 text-center text-xl font-bold text-pencil-red">
              {error}
            </p>

            <div className="mt-2 flex justify-center">
              <button
                type="submit"
                className={`${btnBase} border-pencil-red bg-pencil-red text-white shadow-[3px_4px_0_0_rgba(230,57,70,0.25)]`}
              >
                {d.calculate}
                <Heart className="w-7" />
              </button>
            </div>
          </motion.form>
        )}

        {view === "working" && result && (
          <section aria-label={d.resultFor}>
            {fromLink && runId === 0 && (
              <p className="font-hand mb-2 text-center text-xl text-ink/60">{d.fromLink}</p>
            )}
            <h2 className="font-hand mb-4 flex flex-wrap items-center justify-center gap-x-3 text-center text-[clamp(1.8rem,8vw,2.6rem)] leading-tight font-bold">
              <span className="hl pencil px-1 text-pencil-blue">{shownA}</span>
              <Heart className="w-8" />
              <span className="hl pencil px-1 text-pencil-purple">{shownB}</span>
            </h2>

            <Working
              key={runId}
              result={result}
              lang={lang}
              onStep={sound ? playScratch : undefined}
              onDone={() => {
                setDone(true);
                if (sound) playTing();
              }}
            />

            {done && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 }}
                className="mt-4 flex flex-col items-center gap-5"
              >
                <ShareBar a={a} b={b} score={result.score} hide={hide} lang={lang} />
                <button
                  type="button"
                  onClick={() => reset(fromLink && runId === 0)}
                  className={`${btnBase} border-pencil-blue text-pencil-blue`}
                >
                  {fromLink && runId === 0 ? d.tryYours : d.tryAgain}
                </button>
              </motion.div>
            )}
          </section>
        )}

        {view === "hidden" && initial?.hidden && (
          <section aria-label={d.resultFor}>
            <p className="font-hand mb-2 text-center text-xl text-ink/60">{d.fromLink}</p>
            <h2 className="font-hand mb-2 flex flex-wrap items-center justify-center gap-x-3 text-center text-[clamp(2rem,9vw,3rem)] leading-tight font-bold">
              <span className="hl pencil px-1 text-pencil-blue">{initial.a}</span>
              <Heart className="w-9" />
              <span className="hl pencil px-1 text-pencil-purple">{initial.b}</span>
            </h2>
            <p className="font-hand mb-2 text-center text-lg text-ink/50">{d.hiddenNote}</p>
            <ScoreBadge score={initial.score} lang={lang} />
            <div className="mt-6 flex flex-col items-center gap-5">
              <ShareBar a={initial.a} b={initial.b} score={initial.score} hide lang={lang} />
              <button
                type="button"
                onClick={() => reset(true)}
                className={`${btnBase} border-pencil-red bg-pencil-red text-white`}
              >
                {d.tryYours}
              </button>
            </div>
          </section>
        )}

        {/* footer */}
        <footer className="mt-auto pt-12 text-center">
          <details className="mx-auto mb-2 max-w-md text-left">
            <summary className="font-hand cursor-pointer text-center text-2xl font-bold text-pencil-green">
              {d.howTitle}
            </summary>
            <ol className="font-hand mt-2 list-decimal space-y-1 pl-6 text-xl leading-snug">
              {d.how.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </details>
          <details className="mx-auto mb-4 max-w-md text-left">
            <summary className="font-hand cursor-pointer text-center text-2xl font-bold text-pencil-purple">
              {d.privacy}
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-ink/70">{d.privacyBody}</p>
            <p className="mt-2 text-sm leading-relaxed text-ink/70">{d.legalFull}</p>
          </details>
          <p className="text-xs text-ink/60">{d.disclaimer}</p>
          <p className="font-hand mt-1 text-lg text-ink/50">
            {d.by} ·{" "}
            <a
              className="underline decoration-dotted underline-offset-4"
              href="https://github.com/hadihafiz/SerasiApp"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </p>
        </footer>
      </main>
    </>
  );
}
