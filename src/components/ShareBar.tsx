"use client";

import { useEffect, useState } from "react";
import { initials } from "@/engine";
import { logEvent } from "@/lib/analytics";
import { t, type Lang } from "@/lib/i18n";
import { buildQuery } from "@/lib/share";

const btn =
  "wobbly-sm font-hand inline-flex min-h-11 items-center justify-center gap-2 border-2 px-4 py-1 text-xl font-bold transition-transform active:scale-95 hover:-translate-y-0.5";

export default function ShareBar({
  a,
  b,
  score,
  hide,
  lang,
}: {
  a: string;
  b: string;
  score: number;
  hide: boolean;
  lang: Lang;
}) {
  const d = t(lang);
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  const query = buildQuery({ a, b, hide, lang, score }).toString();
  const path = `/?${query}`;
  const storyHref = `/api/og?${query}&f=story`;
  const nameA = hide ? initials(a) : a.trim();
  const nameB = hide ? initials(b) : b.trim();
  const text = d.shareText(nameA, nameB, score);
  const fullUrl = () => `${window.location.origin}${path}`;

  const whatsapp = () => {
    logEvent("share", { channel: "whatsapp", hidden: hide });
    window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${fullUrl()}`)}`, "_blank", "noopener");
  };

  const copy = async () => {
    logEvent("copy_link", { hidden: hide });
    try {
      await navigator.clipboard.writeText(fullUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt(d.copyLink, fullUrl());
    }
  };

  const native = async () => {
    logEvent("share", { channel: "native", hidden: hide });
    try {
      await navigator.share({ title: "Kira Serasi", text, url: fullUrl() });
    } catch {
      /* user cancelled */
    }
  };

  return (
    <div className="flex flex-wrap justify-center gap-3" role="group" aria-label={d.share}>
      <button
        type="button"
        onClick={whatsapp}
        className={`${btn} border-pencil-green bg-pencil-green/10 text-pencil-green`}
      >
        {d.whatsapp}
      </button>
      <button
        type="button"
        onClick={copy}
        className={`${btn} border-pencil-blue bg-pencil-blue/10 text-pencil-blue`}
      >
        {copied ? d.copied : d.copyLink}
      </button>
      <a
        href={storyHref}
        download="kira-serasi.png"
        onClick={() => logEvent("story_download", { hidden: hide })}
        className={`${btn} border-pencil-pink bg-pencil-pink/10 text-pencil-pink`}
      >
        {d.story}
      </a>
      {canShare && (
        <button
          type="button"
          onClick={native}
          className={`${btn} border-pencil-purple bg-pencil-purple/10 text-pencil-purple`}
        >
          {d.nativeShare}
        </button>
      )}
    </div>
  );
}
