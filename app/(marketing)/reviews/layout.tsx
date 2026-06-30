import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reviews",
  description:
    "See what 2,400+ learners say about Fluentra. Real stories from people who went from hesitant beginners to confident speakers in their target language.",
  openGraph: {
    title: "Learner Reviews · Fluentra",
    description:
      "4.8 stars from 2,400+ learners. Real stories from people who became confident speakers with Fluentra.",
  },
};

export default function ReviewsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
