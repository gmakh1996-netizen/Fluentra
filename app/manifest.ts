import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Fluentra — Speak the world with AI",
    short_name: "Fluentra",
    description:
      "Learn any language through AI conversation, voice feedback, adaptive lessons, and gamified progress.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0b0b10",
    theme_color: "#4f46e5",
    categories: ["education", "productivity"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
