# Fluentra — Locked Decisions

These are settled for the duration of the build. Revisit only if a constraint changes.

## 1. Pronunciation scoring → Azure Pronunciation Assessment (with fallback)

- **Why:** the AI/TTS providers cannot score pronunciation. Azure Speech's
  Pronunciation Assessment returns accuracy, fluency, completeness, and
  per-phoneme scores. Free tier = 5 audio hours/month, enough for development.
- **Degradation:** Built behind a `PronunciationProvider` interface. If
  `AZURE_SPEECH_KEY` is absent, the app falls back to the active AI provider's
  audio transcription + commentary (weaker, no numeric phoneme scores) so
  nothing is blocked.
- **Impact:** Phase 5. Adds `AZURE_SPEECH_KEY` / `AZURE_SPEECH_REGION` env vars.

## 2. Hosting → Vercel + Supabase

- **App:** Vercel (Next.js 15 App Router, server components, streaming).
- **Backend/DB/Auth/Storage:** Supabase.
- **Hostinger:** domain, DNS, email only. No VPS / PM2 / Nginx path.

## 4. App AI provider → OpenAI + Gemini (both, provider-agnostic layer)

- **Both supported.** `AI_PROVIDER` (`gemini` | `openai`) picks the active one;
  all model calls go through one `AIProvider` interface (Vercel AI SDK +
  `@ai-sdk/openai` and `@ai-sdk/google`). You can run either, switch with an
  env change, or route specific features to specific providers later.
- **Why keep both:** OpenAI is the well-trodden default with mature tooling;
  Gemini is strong on non-Latin scripts (Georgian, Arabic, Japanese, Chinese)
  matching the language grid, and Gemini Flash is cheap/fast for casual chat.
  Holding both avoids lock-in and lets you A/B on quality and cost.
- **Tiering (per provider):** a cheap/fast model for casual chat
  (`gpt-4o-mini` / `gemini-2.0-flash`), a premium model for graded feedback —
  grammar, writing, lesson generation (`gpt-4o` / `gemini-2.5-pro`).
- ElevenLabs still handles TTS; Azure still handles pronunciation scoring.
- **Note:** model names/limits on both sides change fast and my knowledge ends
  Jan 2026 — verify current model IDs and pricing before locking env values.

## 5. Build cadence → phase-by-phase, Claude-driven

- Each phase = a scoped prompt for Claude Code + foundational files designed
  carefully up front. No single mega-prompt.
- A phase is not "done" until its milestone (Mn) acceptance check passes.

## Cross-cutting, enforced every phase (not deferred to the end)

- **Security:** RLS enabled on every table at creation; Zod on every route;
  service-role key server-only.
- **Accessibility:** semantic markup + visible focus states as components are
  built. A full WCAG AA audit still happens in Phase 8, but a11y is not
  retrofitted.
- **Cost control:** `usage_limits` governs all tiers (soft caps even on
  "unlimited"); model tiering (cheap model for casual chat, premium where it
  matters); ElevenLabs audio cached by (text, voice, settings) hash.
