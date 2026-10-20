"use client";

import { motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { SerasiResult, Step } from "@/engine";
import { t, type Lang } from "@/lib/i18n";
import { pencilAt } from "@/lib/pencils";
import ScoreBadge from "./ScoreBadge";

type Ok = Extract<SerasiResult, { ok: true }>;

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
          transition={{ delay: instant ? 0 : delay + i * 0.035, type: "spring", stiffness: 380, damping: 18 }}
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
            transition={{ duration: 0.45, delay: instant ? 0 : 0.05 + k * 0.08, ease: "easeOut" }}
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
          transition={{ duration: 0.3, delay: instant ? 0 : 0.2 }}
        />
      )}
    </svg>
  );
}

export default function Working({
  result,
  lang,
  onStep,
  onDone,
  autoSkip = false,
}: {
  result: Ok;
  lang: Lang;
  onStep?: () => void;
  onDone?: () => void;
  autoSkip?: boolean;
}) {
  const d = t(lang);
  const reduce = useReducedMotion();
  const total = result.rows.length;

  // NOTE: `reduce` is only known on the client, so it must not influence the first render
  // (that would cause a hydration mismatch). It is applied in the mount effect instead.
  const [shown, setShown] = useState(autoSkip ? total : 0);
  const [skipped, setSkipped] = useState(autoSkip);
  const doneRef = useRef(false);
  const [done, setDone] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setDone(true);
    onDone?.();
  }, [onDone]);

  useEffect(() => {
    const clear = () => timers.current.forEach(clearTimeout);
    if (autoSkip || reduce) {
      setSkipped(true);
      setShown(total);
      finish();
      return clear;
    }
    const tallyMs = Math.min(1300, 350 + result.letters.length * 70);
    const stepMs = Math.min(1000, Math.max(650, 4200 / total));

    const schedule = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, ms));
    let at = tallyMs;
    for (let k = 1; k <= total; k++) {
      const row = k;
      schedule(() => {
        setShown(row);
        onStep?.();
      }, at);
      at += stepMs;
    }
    schedule(finish, at);
    return clear;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const skip = () => {
    if (doneRef.current) return;
    timers.current.forEach(clearTimeout);
    setSkipped(true);
    setShown(total);
    finish();
  };

  const inst = skipped;

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
              transition={{ delay: inst ? 0 : i * 0.06 }}
            >
              <span className="text-ink/70 uppercase">{l.letter}</span>
              <span style={{ color: pencilAt(0) }}>:{l.count}</span>
            </motion.li>
          ))}
        </ul>
      </section>

      <div className="flex flex-col">
        {result.rows.map((row, k) => {
          if (shown <= k) return null;
          const color = pencilAt(k);
          const step = result.steps[k];
          const arcsVisible = !!step && shown > k + 1;
          return (
            <div key={k}>
              <NumberRow row={row} color={color} delay={k === 0 ? 0 : 0.55} instant={inst} />
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
