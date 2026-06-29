/** Brand + navigation data. Pure config consumed by UI later. */
export const siteConfig = {
  name: "Fluentra",
  tagline: "Speak the world with AI.",
  description:
    "Learn any language through AI conversation, voice feedback, adaptive lessons, and gamified progress.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
} as const;

/** Canonical route map. Import these instead of hardcoding path strings. */
export const routes = {
  home: "/",
  pricing: "/pricing",
  features: "/features",
  languages: "/languages",
  reviews: "/reviews",
  blog: "/blog",
  faq: "/faq",
  contact: "/contact",
  privacy: "/privacy",
  terms: "/terms",

  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  verifyEmail: "/verify-email",
  authCallback: "/auth/callback",
  authConfirm: "/auth/confirm",
  authCodeError: "/auth-code-error",
  onboarding: "/onboarding",

  dashboard: "/dashboard",
  chat: "/learn/chat",
  voice: "/learn/voice",
  lessons: "/learn/lessons",
  vocabulary: "/learn/vocabulary",
  grammar: "/learn/grammar",
  pronunciation: "/learn/pronunciation",
  writing: "/learn/writing",
  listening: "/learn/listening",
  roleplay: "/learn/roleplay",
  progress: "/progress",
  achievements: "/achievements",
  leaderboard: "/leaderboard",
  settings: "/settings",
  billing: "/billing",

  admin: "/admin",
  adminUsers: "/admin/users",
  adminSubscriptions: "/admin/subscriptions",
  adminUsage: "/admin/ai-usage",
  adminContent: "/admin/content",
  adminSupport: "/admin/support",
  adminAnalytics: "/admin/analytics",
} as const;

export const marketingNav = [
  { label: "Features", href: routes.features },
  { label: "Languages", href: routes.languages },
  { label: "Pricing", href: routes.pricing },
  { label: "Reviews", href: routes.reviews },
  { label: "Blog", href: routes.blog },
] as const;

export const dashboardNav = [
  { label: "Home", href: routes.dashboard, icon: "home" },
  { label: "AI Chat", href: routes.chat, icon: "message-circle" },
  { label: "Voice", href: routes.voice, icon: "mic" },
  { label: "Lessons", href: routes.lessons, icon: "book-open" },
  { label: "Vocabulary", href: routes.vocabulary, icon: "layers" },
  { label: "Grammar", href: routes.grammar, icon: "spell-check" },
  { label: "Pronunciation", href: routes.pronunciation, icon: "audio-lines" },
  { label: "Writing", href: routes.writing, icon: "pen-line" },
  { label: "Listening", href: routes.listening, icon: "headphones" },
  { label: "Progress", href: routes.progress, icon: "trending-up" },
  { label: "Achievements", href: routes.achievements, icon: "award" },
] as const;
