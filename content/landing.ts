/**
 * Marketing copy + data for the landing page. Kept separate from components so
 * content can be edited (and later localized via next-intl) without touching
 * markup. Icons are referenced by lucide key and mapped in the components.
 */

export const heroStats = [
  { value: 10, suffix: "M+", label: "Lessons completed" },
  { value: 100, suffix: "+", label: "Languages & dialects" },
  { value: 4.9, suffix: "", label: "Average rating", decimals: 1 },
  { value: 98, suffix: "%", label: "Would recommend" },
] as const;

/** Tasteful, non-copyrighted text marks for the "trusted by" strip. */
export const trustMarks = [
  "NovaLearn",
  "Linguafy",
  "GlobeTalk",
  "Polyglot Co.",
  "Méridien",
  "Kanjo Labs",
] as const;

export type IconKey =
  | "messages-square"
  | "audio-lines"
  | "spell-check"
  | "pen-line"
  | "headphones"
  | "trophy";

export const features: {
  icon: IconKey;
  title: string;
  description: string;
  accent: "primary" | "accent" | "cyan";
}[] = [
  {
    icon: "messages-square",
    title: "AI conversation tutor",
    description:
      "Talk about anything, any time. Your tutor adapts to your level, remembers your goals, and keeps the conversation flowing — never judging, always patient.",
    accent: "primary",
  },
  {
    icon: "audio-lines",
    title: "Pronunciation scoring",
    description:
      "Speak a phrase and get per-syllable accuracy, fluency and completeness scores, with native audio to compare against and pinpoint the sounds to fix.",
    accent: "cyan",
  },
  {
    icon: "spell-check",
    title: "Instant grammar correction",
    description:
      "Write naturally and see mistakes highlighted with plain-language explanations and three better ways to say it — saved to your learning history.",
    accent: "accent",
  },
  {
    icon: "pen-line",
    title: "Writing coach",
    description:
      "Emails, essays, messages and posts — get corrections, tone rewrites (formal, friendly, confident) and vocabulary upgrades in seconds.",
    accent: "primary",
  },
  {
    icon: "headphones",
    title: "Listening practice",
    description:
      "AI-generated mini-podcasts and dialogues at your level, with comprehension questions and a transcript toggle when you need it.",
    accent: "cyan",
  },
  {
    icon: "trophy",
    title: "Gamified progress",
    description:
      "XP, streaks, daily missions, achievements and a leaderboard turn consistency into a habit you actually look forward to.",
    accent: "accent",
  },
];

export const steps: { step: string; title: string; description: string }[] = [
  {
    step: "01",
    title: "Choose your language",
    description: "Pick from 100+ languages and tell us your goal — travel, work, exams or culture.",
  },
  {
    step: "02",
    title: "Speak with your AI tutor",
    description: "Start a conversation by voice or text. The tutor meets you exactly at your level.",
  },
  {
    step: "03",
    title: "Get instant feedback",
    description: "Pronunciation scores, grammar fixes and vocabulary — corrected the moment you need it.",
  },
  {
    step: "04",
    title: "Improve every day",
    description: "Adaptive daily lessons and streaks keep you progressing without burning out.",
  },
];

export const languages: { name: string; native: string; flag: string }[] = [
  { name: "English", native: "English", flag: "🇬🇧" },
  { name: "Spanish", native: "Español", flag: "🇪🇸" },
  { name: "French", native: "Français", flag: "🇫🇷" },
  { name: "German", native: "Deutsch", flag: "🇩🇪" },
  { name: "Italian", native: "Italiano", flag: "🇮🇹" },
  { name: "Portuguese", native: "Português", flag: "🇵🇹" },
  { name: "Japanese", native: "日本語", flag: "🇯🇵" },
  { name: "Chinese", native: "中文", flag: "🇨🇳" },
  { name: "Korean", native: "한국어", flag: "🇰🇷" },
  { name: "Arabic", native: "العربية", flag: "🇸🇦" },
  { name: "Russian", native: "Русский", flag: "🇷🇺" },
  { name: "Turkish", native: "Türkçe", flag: "🇹🇷" },
  { name: "Georgian", native: "ქართული", flag: "🇬🇪" },
  { name: "Hindi", native: "हिन्दी", flag: "🇮🇳" },
];

export const testimonials: {
  quote: string;
  name: string;
  role: string;
  initials: string;
  language: string;
}[] = [
  {
    quote:
      "I went from freezing up in meetings to leading them in English. Talking to the AI every morning killed the fear of speaking — it's the part no app ever solved for me.",
    name: "Mariam Kapanadze",
    role: "Product Manager",
    initials: "MK",
    language: "Learning English",
  },
  {
    quote:
      "The pronunciation scoring is uncanny. It caught the exact sounds I was getting wrong in Japanese and showed me how to fix them. Three months in and locals understand me.",
    name: "Luca Romano",
    role: "Software Engineer",
    initials: "LR",
    language: "Learning Japanese",
  },
  {
    quote:
      "As a teacher I'm picky about pedagogy. Fluentra's feedback is genuinely good — corrections come with clear reasons, not just red lines. My French finally feels natural.",
    name: "Sofia Marchetti",
    role: "High-school Teacher",
    initials: "SM",
    language: "Learning French",
  },
  {
    quote:
      "I tried the big names and got bored in a week. The daily missions and streaks are the only thing that's ever kept me coming back. 140-day streak and counting.",
    name: "Daniel Okafor",
    role: "Medical Student",
    initials: "DO",
    language: "Learning German",
  },
  {
    quote:
      "The writing coach rewrote my cover letter in a confident tone and explained every change. I got the interview. Worth the subscription on that alone.",
    name: "Aiko Tanaka",
    role: "UX Designer",
    initials: "AT",
    language: "Learning English",
  },
  {
    quote:
      "Switching between casual and business modes is brilliant. I prep for client calls in Spanish in ten minutes and walk in sounding like I belong there.",
    name: "Elena Vasquez",
    role: "Sales Lead",
    initials: "EV",
    language: "Learning Spanish",
  },
];

export const faqs: { question: string; answer: string }[] = [
  {
    question: "How is Fluentra different from other language apps?",
    answer:
      "Most apps drill vocabulary in isolation. Fluentra is built around real conversation: you speak and write to an AI tutor that adapts to your level, scores your pronunciation, corrects your grammar with explanations, and builds adaptive daily lessons around your goals. It's practice that transfers to the real world.",
  },
  {
    question: "Do I need to pay to get started?",
    answer:
      "No. The Free plan includes daily AI conversations, basic lessons and vocabulary so you can build a habit. Upgrade to Pro or Ultimate any time for unlimited chat, voice conversation, the writing coach and advanced pronunciation analysis.",
  },
  {
    question: "Which languages can I learn?",
    answer:
      "Over 100 languages and dialects, from widely spoken ones like English, Spanish and Mandarin to languages many apps ignore, such as Georgian, Arabic and Korean. Our AI is especially strong with non-Latin scripts.",
  },
  {
    question: "How does pronunciation scoring work?",
    answer:
      "You record a phrase and receive accuracy, fluency and completeness scores down to the syllable, plus native audio to compare against and specific tips on the sounds to improve. It's the closest thing to a patient native coach available on demand.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Yes. Manage everything from the billing portal — upgrade, downgrade or cancel in a couple of clicks. If you cancel, you keep access until the end of your billing period. No emails, no friction.",
  },
  {
    question: "Is my data private and secure?",
    answer:
      "Your conversations and progress are yours. Data is encrypted in transit and at rest, isolated per account with row-level security, and never sold. You can export or delete your data whenever you want.",
  },
];
