import type { Metadata } from "next";
import Game from "@/components/Game";
import { tierFor } from "@/lib/i18n";
import { parseShare } from "@/lib/share";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const share = parseShare(await searchParams);
  if (!share) return {};

  const { a, b } = share;
  const tier = tierFor(share.score);
  const tierText = share.lang === "en" ? tier.en : tier.bm;

  // Preview image URL: hidden links carry initials + score only, never the full names.
  const q = new URLSearchParams({ a, b });
  if (share.hidden) {
    q.set("s", String(share.score));
    q.set("h", "1");
  }
  if (share.lang === "en") q.set("l", "en");

  const title = `${a} ❤ ${b} = ${share.score}% | Kira Serasi`;
  const description =
    share.lang === "en"
      ? `${tierText} Try your own names on Kira Serasi!`
      : `${tierText} Cuba nama korang kat Kira Serasi!`;
  const image = `/api/og?${q.toString()}`;

  return {
    title,
    description,
    openGraph: { title, description, images: [{ url: image, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function Page({ searchParams }: Props) {
  const share = parseShare(await searchParams);
  return <Game initial={share} />;
}
