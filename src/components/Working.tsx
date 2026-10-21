"use client";

import { motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SerasiResult, Step } from "@/engine";
import { t, type Lang } from "@/lib/i18n";
import { pencilAt } from "@/lib/pencils";
import ScoreBadge from "./ScoreBadge";

type Ok = Extract<SerasiResult, { ok: true }>;

/* ---- Animation timeline (ms) --------------------------------------------------------------
 * Single source of truth: the motion transitions below AND the sound effects are scheduled
 * from these numbers, so what you hear always matches what you see.
 */
const NUM_STAGGER_MS = 35; // NumberRow: per-number delay
const NUM_SETTLE_MS = 250; // NumberRow: spring settle time
const TALLY_STAGGER_MS = 60; // tally list: per-letter delay
const ARC_MS = 450; // Arcs: one arc draw time
const ARC_STAGGER_MS = 80; // Arcs: delay between arcs
const GAP_MS = 130; // pause between events
/** ScoreBadge: red circle starts at 350ms and takes 900ms; the "ting" lands as it closes. */
const CIRCLE_START_MS = 350;
const CIRCLE_MS = 900;

/** Sound kinds the parent may play, with the exact animation duration to match. */
export type WorkingSound = (kind: "scratch" | "circle" | "ting", ms: number) => void;

const ROW_REM = 2.75; // max width of one cell

function NumberRow({
  row,
  color,
  delay,
  instant,
}: {
  row: number[];
  color: string;
  delay: number;
  instant: boolean;
}) {
  return (
    <div
      className="mx-auto flex"
      style={{ width: `min(100%, ${row.length * ROW_REM}rem)` }}
      aria-label={row.join(" ")}
    >
      {row.map((n, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          className="font-hand pencil flex-1 text-center leading-[1.35] font-bold"
          style={{ color, fontSize: `min(2.2rem, calc(80cqw / ${row.length}))` }}
          initial={instant ? false : { opacity: 0, y: -8, scale: 0.7 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: instant ? 0 : delay + (i * NUM_STAGGER_MS) / 1000, type: "spring", stiffness: 380, damping: 18 }}
        >
          {n}
        </motion.span>
      ))}
    </div>
  );
}

/** Arcs linking the pairs that get added, drawn in the colour of the row they came from. */
function Arcs({ step, color, instant }: { step: Step; color: string; instant: boolean }) {
  const n = step.from.length;
  const W = n * 100;
  const outerSpan = (n - 1) * 100;
  const depthOf = (span: number) => 6 + span * 0.17;
  const peak = 2 + 0.75 * (depthOf(outerSpan) - 2);
  const H = peak + 8;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="pencil mx-auto block overflow-visible"
      style={{ width: `min(100%, ${n * ROW_REM}rem)` }}
      aria-hidden="true"
    >
      {step.pairs.map((p, k) => {
        const x1 = (p.i + 0.5) * 100;
        const x2 = (p.j + 0.5) * 100;
        const d = depthOf(x2 - x1);
        return (
          <motion.path
            key={k}
            d={`M ${x1} 2 C ${x1} ${d}, ${x2} ${d}, ${x2} 2`}
            fill="none"
            stroke={color}
            strokeWidth={3}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            initial={instant ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: ARC_MS / 1000, delay: instant ? 0 : (k * ARC_STAGGER_MS) / 1000, ease: "easeOut" }}
          />
        );
      })}
      {step.middle !== null && (
        <motion.path
          d={`M ${(step.middle + 0.5) * 100} 2 q 0 10 24 14`}
          fill="none"
          stroke={color}
          strokeWidth={3}
          strokeDasharray="4 5"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          initial={instant ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: ARC_MS / 1000,
            delay: instant ? 0 : (step.pairs.length * ARC_STAGGER_MS) / 1000,
          }}
        />
      )}
    </svg>
  );
}

/* ---- Timeline builder --------------------------------------------------------------------- */
type TimelineEvent = { kind: "row" | "arcs"; k: number; ms: number };

function buildTimeline(result: Ok): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  result.rows.forEach((row, k) => {
    events.push({ kind: "row", k, ms: row.length * NUM_STAGGER_MS + NUM_SETTLE_MS });
    const step = result.steps[k];
    if (step) {
      const n = step.pairs.length + (step.middle !== null ? 1 : 0);
      events.push({ kind: "arcs", k, ms: ARC_MS + (n - 1) * ARC_STAGGER_MS });
    }
  });
  return events;
}

export default function Working({
  result,
  lang,
  onSound,
  onDone,
  autoSkip = false,
}: {
  result: Ok;
  lang: Lang;
  onSound?: WorkingSound;
  onDone?: () => void;
  autoSkip?: boolean;
}) {
  const d = t(lang);
  const reduce = useReducedMotion();
  const timeline = useMemo(() => buildTimeline(result), [result]);

  // NOTE: `reduce` is only known on the client, so it must not influence the first render
  // (that would cause a hydration mismatch). It is applied in the mount effect instead.
  /** number of timeline events revealed so far */
  const [ev, setEv] = useState(autoSkip ? timeline.length : 0);
  const [skipped, setSkipped] = useState(autoSkip);
  const doneRef = useRef(false);
  const [done, setDone] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const soundTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const soundRef = useRef(onSound);
  soundRef.current = onSound;

  const finish = useCallback(
    (withSound: boolean) => {
      if (doneRef.current) return;
      doneRef.current = true;
      setDone(true);
      onDone?.();
      if (withSound) {
        // Score reveal: pencil scratch while the red circle draws, "ting" as it closes.
        soundTimers.current.push(
          setTimeout(() => soundRef.current?.("circle", CIRCLE_MS), CIRCLE_START_MS),
          setTimeout(() => soundRef.current?.("ting", 0), CIRCLE_START_MS + CIRCLE_MS),
        );
      }
    },
    [onDone],
  );

  useEffect(() => {
    const clearAll = () => {
      timers.current.forEach(clearTimeout);
      soundTimers.current.forEach(clearTimeout);
    };
    if (autoSkip || reduce) {
      setSkipped(true);
      setEv(timeline.length);
      finish(false);
      return clearAll;
    }

    const schedule = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, ms));
    const tallyMs = result.letters.length * TALLY_STAGGER_MS + 200;

    // 1. letter tally: sound runs for the whole stagger (scheduled, so cleanup cancels a dev double-mount)
    schedule(() => soundRef.current?.("scratch", tallyMs), 0);
    let at = tallyMs + GAP_MS;

    // 2. each row of numbers, then the arcs that add its pairs, one sound per animation
    timeline.forEach((e, i) => {
      schedule(() => {
        setEv(i + 1);
        soundRef.current?.("scratch", e.ms);
      }, at);
      at += e.ms + GAP_MS;
    });

    // 3. score reveal
    schedule(() => finish(true), at);
    return clearAll;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const skip = () => {
    if (doneRef.current) return;
    timers.current.forEach(clearTimeout);
    setSkipped(true);
    setEv(timeline.length);
    finish(true);
  };

  const inst = skipped;

  // index of each row's / arcs' event in the timeline
  const rowEventIndex = (k: number) => timeline.findIndex((e) => e.kind === "row" && e.k === k);
  const arcsEventIndex = (k: number) => timeline.findIndex((e) => e.kind === "arcs" && e.k === k);

  return (
    <div className="cq" onClick={skip}>
      <section aria-label={d.tally} className="mb-3">
        <p className="font-hand mb-1 text-center text-xl text-ink/60">{d.tally}</p>
        <ul className="flex flex-wrap justify-center gap-x-3 gap-y-0 font-hand text-2xl font-bold">
          {result.letters.map((l, i) => (
            <motion.li
              key={l.letter}
              className="pencil"
              initial={inst ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: inst ? 0 : (i * TALLY_STAGGER_MS) / 1000 }}
            >
              <span className="text-ink/70 uppercase">{l.letter}</span>
              <span style={{ color: pencilAt(0) }}>:{l.count}</span>
            </motion.li>
          ))}
        </ul>
      </section>

      <div className="flex flex-col">
        {result.rows.map((row, k) => {
          if (ev <= rowEventIndex(k)) return null;
          const color = pencilAt(k);
          const step = result.steps[k];
          const arcsVisible = !!step && ev > arcsEventIndex(k);
          return (
            <div key={k}>
              <NumberRow row={row} color={color} delay={0} instant={inst} />
              {arcsVisible && <Arcs step={step} color={color} instant={inst} />}
            </div>
          );
        })}
      </div>

      {done ? (
        <ScoreBadge score={result.score} lang={lang} instant={!!reduce} />
      ) : (
        <p className="mt-4 text-center">
          <button
            type="button"
            className="font-hand text-xl text-ink/55 underline decoration-dotted underline-offset-4"
            onClick={skip}
          >
            {d.working} ({d.tapSkip})
          </button>
        </p>
      )}
    </div>
  );
}
