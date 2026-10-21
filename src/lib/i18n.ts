export type Lang = "bm" | "en";

export const DEFAULT_LANG: Lang = "bm";

export function parseLang(v: string | string[] | undefined): Lang {
  return v === "en" ? "en" : "bm";
}

export interface Tier {
  min: number;
  emoji: string;
  bm: string;
  en: string;
}

/** Five tiers, highest first. Scores are always 10-99. */
export const TIERS: Tier[] = [
  { min: 90, emoji: "💍", bm: "Jodoh confirm!", en: "Match made in heaven!" },
  { min: 70, emoji: "💘", bm: "Ada chemistry ni", en: "There's chemistry here" },
  { min: 50, emoji: "🙂", bm: "Boleh la tu", en: "Could work, lah" },
  { min: 30, emoji: "😅", bm: "Kawan je kot", en: "Just friends, maybe" },
  { min: 0, emoji: "🏃", bm: "Lari!!!", en: "Run!!!" },
];

export function tierFor(score: number): Tier {
  return TIERS.find((t) => score >= t.min) ?? TIERS[TIERS.length - 1];
}

const dict = {
  bm: {
    title: "Kira Serasi",
    tagline: "Serasi ke tak? Jom kira macam dulu-dulu.",
    nameA: "Nama kamu",
    nameB: "Nama dia",
    placeholderA: "cth: Ahmad",
    placeholderB: "cth: Siti Nurhaliza",
    calculate: "Kira!",
    hideNames: "Sorokkan nama dalam pautan kongsi",
    hideNamesHint: "Kad kongsi hanya tunjuk singkatan nama (cth: A.S.)",
    tooShort: "Nama terlalu pendek, cuba nama penuh!",
    tally: "Kira huruf",
    working: "Tengah kira…",
    tapSkip: "ketik untuk langkau",
    tryAgain: "Kira lagi",
    tryYours: "Cuba nama korang!",
    share: "Kongsi",
    shareText: (a: string, b: string, s: number) =>
      `${a} & ${b} serasi ${s}%! Cuba nama korang pulak 👇`,
    whatsapp: "WhatsApp",
    copyLink: "Salin pautan",
    copied: "Disalin!",
    story: "Muat turun Story",
    nativeShare: "Kongsi…",
    sound: "Bunyi",
    soundOn: "Bunyi: Hidup",
    soundOff: "Bunyi: Mati",
    language: "English",
    howTitle: "Cara main",
    how: [
      "Tulis kedua-dua nama, kira berapa kali setiap huruf muncul (ikut susunan huruf mula-mula keluar).",
      "Tambah nombor paling hujung: pertama + terakhir, kedua + kedua terakhir, dan seterusnya. Kalau jumlah 10 ke atas, pecahkan jadi dua digit.",
      "Kalau bilangan nombor ganjil, nombor tengah dibawa ke hujung baris seterusnya.",
      "Ulang sampai tinggal dua nombor. Itulah peratus serasi kamu!",
    ],
    disclaimer:
      "Untuk suka-suka je. Bukan ramalan jodoh. Kami tak simpan nama kamu.",
    privacy: "Privasi",
    privacyBody:
      "Kira Serasi dikira terus dalam pelayar kamu. Nama tidak disimpan di mana-mana pangkalan data. Nama hanya wujud dalam pautan yang kamu pilih untuk kongsi. Analitik kami tanpa kuki dan hanya merekod peristiwa (cth: 'kira', 'kongsi'), tidak pernah nama.",
    legalFull:
      "Aplikasi ini bukan alat tilik atau ramalan dan untuk hiburan semata-mata. Keputusan tidak patut diambil serius. Pembangun tidak mendakwa memiliki kuasa ghaib.",
    by: "Oleh Hadi Hafiz",
    resultFor: "Keputusan serasi",
    fromLink: "Seseorang kongsi keputusan ni dengan kamu",
    hiddenNote: "Nama disorokkan oleh pengirim",
    letterAria: "Huruf",
    scoreAria: "Skor serasi",
  },
  en: {
    title: "Kira Serasi",
    tagline: "Compatible or not? Let's calculate it like back in school.",
    nameA: "Your name",
    nameB: "Their name",
    placeholderA: "e.g. Ahmad",
    placeholderB: "e.g. Siti Nurhaliza",
    calculate: "Calculate!",
    hideNames: "Hide names in the share link",
    hideNamesHint: "The share card only shows initials (e.g. A.S.)",
    tooShort: "Names are too short, try full names!",
    tally: "Letter tally",
    working: "Working it out…",
    tapSkip: "tap to skip",
    tryAgain: "Try again",
    tryYours: "Try your own names!",
    share: "Share",
    shareText: (a: string, b: string, s: number) =>
      `${a} & ${b} are ${s}% compatible! Try your names 👇`,
    whatsapp: "WhatsApp",
    copyLink: "Copy link",
    copied: "Copied!",
    story: "Download Story",
    nativeShare: "Share…",
    sound: "Sound",
    soundOn: "Sound: On",
    soundOff: "Sound: Off",
    language: "Bahasa Melayu",
    howTitle: "How to play",
    how: [
      "Write both names and count how many times each letter appears (in order of first appearance).",
      "Add the outermost numbers: first + last, second + second-to-last, and so on. Sums of 10 or more are split into two digits.",
      "If there's an odd number of numbers, the middle one is carried to the end of the next row.",
      "Repeat until two numbers are left. That's your compatibility percentage!",
    ],
    disclaimer:
      "Just for fun. Not a fortune-teller. We don't store your names.",
    privacy: "Privacy",
    privacyBody:
      "Kira Serasi calculates right in your browser. Names are never stored in a database. They only exist in the link you choose to share. Our analytics are cookie-free and only record events (e.g. 'calculate', 'share'), never names.",
    legalFull:
      "This app is not a fortune-telling tool and is for entertainment only. Results should not be taken seriously. The creator does not claim any supernatural powers.",
    by: "By Hadi Hafiz",
    resultFor: "Compatibility result",
    fromLink: "Someone shared this result with you",
    hiddenNote: "Names hidden by the sender",
    letterAria: "Letter",
    scoreAria: "Compatibility score",
  },
} as const;

export type Dict = (typeof dict)["bm"] | (typeof dict)["en"];

export function t(lang: Lang): Dict {
  return dict[lang];
}
