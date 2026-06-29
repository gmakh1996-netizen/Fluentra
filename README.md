# Fluentra

Premium AI language-learning SaaS. Next.js 15 · Supabase · provider-agnostic AI
(OpenAI/Gemini) · Stripe · ElevenLabs · Azure pronunciation.

This repository currently contains the **architecture skeleton** (no UI yet):
infrastructure, API routes, full database schema, types, config, and conventions.

- Architecture & conventions: `docs/ARCHITECTURE.md`
- Locked decisions: `docs/DECISIONS.md`
- Setup: copy `.env.example` → `.env.local`, fill Supabase keys, then
  `npm install`, push migrations (`npm run db:push`), `npm run db:types`, `npm run dev`.

Build order follows the phase plan; UI begins in Phase 1.
