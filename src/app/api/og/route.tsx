import { ImageResponse } from "next/og";
import { serasi } from "@/engine";
import { GAEGU_BOLD_BASE64 } from "@/assets/gaegu-bold";
import { tierFor } from "@/lib/i18n";
import { parseShare } from "@/lib/share";

const PAPER = "#fffdf4";
const RULED = "#cfe3f1";
const MARGIN = "#f2a0a0";
const INK = "#2b2a4c";
const RED = "#e63946";
const BLUE = "#2f6fe4";
const PURPLE = "#8e44ad";
const PENCILS = ["#2f6fe4", "#e63946", "#2f9e6e", "#8e44ad", "#f4841f", "#e8509b"];

let fontCache: ArrayBuffer | null = null;
function font(): ArrayBuffer {
  if (!fontCache) {
    const bin = atob(GAEGU_BOLD_BASE64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    fontCache = bytes.buffer;
  }
  return fontCache;
}

function Heart({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      <path
        d="M32 54C14 40 8 29 13 21c4-7 14-6 19 2 5-8 15-9 19-2 5 8-1 19-19 31z"
        fill="rgba(230,57,70,0.25)"
        stroke={RED}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Title({ size }: { size: number }) {
  return (
    <div style={{ display: "flex" }}>
      {"Kira Serasi".split("").map((ch, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            ...(ch === " " ? { width: size * 0.3 } : {}),
            fontSize: size,
            color: PENCILS[i % PENCILS.length],
            transform: `rotate(${((i * 7) % 9) - 4}deg)`,
          }}
        >
          {ch === " " ? "" : ch}
        </div>
      ))}
    </div>
  );
}

function nameSize(a: string, b: string, story: boolean) {
  const longest = Math.max(a.length, b.length);
  const base = story ? 110 : 70;
  return Math.max(story ? 56 : 38, Math.round(base - Math.max(0, longest - 8) * (story ? 3 : 2.4)));
}

function Page({
  w,
  h,
  children,
  host,
}: {
  w: number;
  h: number;
  children: React.ReactNode;
  host: string;
}) {
  const lineH = Math.round(h / 14.5);
  const lines = Math.floor(h / lineH);
  return (
    <div
      style={{
        width: w,
        height: h,
        display: "flex",
        position: "relative",
        background: PAPER,
        fontFamily: "Gaegu",
        fontWeight: 700,
        color: INK,
      }}
    >
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          style={{ position: "absolute", left: 0, right: 0, top: (i + 1) * lineH, height: 2, background: RULED }}
        />
      ))}
      <div style={{ position: "absolute", top: 0, bottom: 0, left: w * 0.075, width: 3, background: MARGIN }} />
      <div style={{ position: "absolute", top: 0, bottom: 0, left: w * 0.075 + 9, width: 3, background: MARGIN }} />
      {children}
      <div
        style={{
          position: "absolute",
          bottom: h * 0.03,
          width: "100%",
          justifyContent: "center",
          display: "flex",
          fontSize: Math.round(h * (h > w ? 0.02 : 0.045)),
          color: "rgba(43,42,76,0.55)",
        }}
      >
        {host}
      </div>
    </div>
  );
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const story = url.searchParams.get("f") === "story";
  const w = story ? 1080 : 1200;
  const h = story ? 1920 : 630;
  const host = url.host;
  const raw = Object.fromEntries(url.searchParams.entries());
  const share = parseShare(raw);
  const options = {
    width: w,
    height: h,
    fonts: [{ name: "Gaegu", data: font(), weight: 700 as const, style: "normal" as const }],
  };

  // Generic cover when there is no (valid) result in the URL
  if (!share) {
    return new ImageResponse(
      (
        <Page w={w} h={h} host={host}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              paddingLeft: w * 0.08,
              gap: h * 0.03,
            }}
          >
            <Title size={story ? 190 : 150} />
            <div style={{ display: "flex", fontSize: story ? 72 : 52 }}>Serasi ke tak?</div>
            <Heart size={story ? 220 : 130} />
            <div style={{ display: "flex", fontSize: story ? 52 : 36, color: "rgba(43,42,76,0.7)" }}>
              Jom kira macam dulu-dulu
            </div>
          </div>
        </Page>
      ),
      options,
    );
  }

  const tier = tierFor(share.score);
  const tierText = share.lang === "en" ? tier.en : tier.bm;
  const nSize = nameSize(share.a, share.b, story);
  const calc = share.hidden ? null : serasi(share.a, share.b);
  const rows = calc && calc.ok ? calc.rows.slice(0, story ? 9 : 6) : [];

  const scoreBlock = (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: story ? 40 : 18 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: `${story ? 14 : 9}px solid ${RED}`,
          borderRadius: "50%",
          padding: story ? "40px 90px" : "18px 50px",
          transform: "rotate(-4deg)",
          color: RED,
          fontSize: story ? 340 : 170,
          lineHeight: 1,
        }}
      >
        {share.score}%
      </div>
      <div
        style={{
          display: "flex",
          fontSize: story ? 96 : 50,
          background: "rgba(233,184,0,0.45)",
          padding: "0 18px",
          textAlign: "center",
          whiteSpace: "nowrap",
        }}
      >
        {tierText}
      </div>
    </div>
  );

  const names = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: story ? 30 : 18,
        fontSize: nSize,
        maxWidth: story ? 900 : 640,
      }}
    >
      <div style={{ display: "flex", color: BLUE }}>{share.a}</div>
      <Heart size={Math.round(nSize * 0.9)} />
      <div style={{ display: "flex", color: PURPLE }}>{share.b}</div>
    </div>
  );

  const rowsBlock =
    rows.length > 0 ? (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: story ? 14 : 2 }}>
        {rows.map((row, k) => {
          const cell = Math.min(story ? 90 : 56, Math.floor((story ? 860 : 600) / row.length));
          return (
            <div key={k} style={{ display: "flex" }}>
              {row.map((n, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    width: cell,
                    fontSize: Math.round(cell * 0.95),
                    lineHeight: 1.1,
                    color: PENCILS[k % PENCILS.length],
                  }}
                >
                  {n}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    ) : null;

  return new ImageResponse(
    story ? (
      <Page w={w} h={h} host={host}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            paddingLeft: w * 0.08,
            paddingRight: 20,
            gap: 70,
          }}
        >
          <Title size={150} />
          {names}
          {rowsBlock}
          {scoreBlock}
        </div>
      </Page>
    ) : (
      <Page w={w} h={h} host={host}>
        <div style={{ display: "flex", width: "100%", alignItems: "center", paddingLeft: w * 0.09, paddingRight: 30 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: 600 }}>
            <Title size={64} />
            {names}
            {rowsBlock}
          </div>
          <div style={{ display: "flex", flex: 1, justifyContent: "center" }}>{scoreBlock}</div>
        </div>
      </Page>
    ),
    options,
  );
}
