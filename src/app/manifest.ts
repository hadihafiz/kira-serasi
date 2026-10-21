import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kira Serasi: Kalkulator Serasi Nostalgia",
    short_name: "Kira Serasi",
    description: "Permainan kira serasi zaman sekolah. Tulis dua nama, kira huruf, dapat peratus!",
    start_url: "/",
    display: "standalone",
    background_color: "#fffdf4",
    theme_color: "#fffdf4",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
