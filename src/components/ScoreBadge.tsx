"use client";

import { motion } from "motion/react";
import { tierFor, type Lang } from "@/lib/i18n";
import { t } from "@/lib/i18n";

/** Big score with a hand-drawn red-pencil circle drawn around it, plus the tier message. */
export default function ScoreBadge({
  score,
  lang,
  instant = false,
}: {
  score: number;
  lang: Lang;
  instant?: boolean;
}) {
  const tier = tierFor(score);
  const d = t(lang);
  const dur = instant ? 0 : 0.9;

  return (
    <div className="flex flex-col items-center gap-2 py-3" role="status" aria-live="polite">
      <div className="relative" aria-label={`${d.scoreAria}: ${score}%`}>
        <motion.span
          initial={instant ? false : { scale: 0.4, opacity: 0, rotate: -8 }}
          animate={{ scale: 1, opacity: 1, rotate: -3 }}
          transition={{ type: "spring", stiffness: 260, damping: 14, delay: instant ? 0 : 0.15 }}
          className="font-hand pencil relative z-10 block px-10 py-3 text-[clamp(4.5rem,22vw,7.5rem)] leading-none font-bold text-pencil-red"
        >
          {score}%
        </motion.span>
        <svg
          viewBox="0 0 300 150"
          className="pencil pointer-events-none absolute inset-0 h-full w-full overflow-visible"
          aria-hidden="true"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M150 8 C 235 4, 292 36, 290 78 C 288 122, 220 144, 148 142 C 70 140, 8 112, 12 70 C 16 30, 80 10, 168 14 C 200 16, 226 22, 246 34"
            fill="none"
            stroke="var(--color-pencil-red)"
            strokeWidth="6"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            initial={instant ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: dur, ease: "easeInOut", delay: instant ? 0 : 0.35 }}
          />
        </svg>
      </div>

      <motion.p
        initial={instant ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: instant ? 0 : 1.1, duration: 0.4 }}
        className="font-hand text-center text-3xl font-bold text-ink"
      >
        <span className="hl px-2">
          {lang === "bm" ? tier.bm : tier.en} <span aria-hidden="true">{tier.emoji}</span>
        </span>
      </motion.p>
    </div>
  );
}
