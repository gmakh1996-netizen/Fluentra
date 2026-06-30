import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Languages",
  description:
    "Explore 100+ languages with Fluentra — from Spanish and Mandarin to Georgian, Swahili, and Quechua. One AI tutor, every language on Earth.",
  openGraph: {
    title: "100+ Languages · Fluentra",
    description:
      "From global staples like Spanish and Mandarin to languages most apps overlook. One AI tutor, every language.",
  },
};

export default function LanguagesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
