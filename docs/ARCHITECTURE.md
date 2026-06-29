# Fluentra — Architecture

This document is the contract for how the codebase is organized. Read it before
adding code. UI is intentionally absent at this stage — everything here is the
skeleton features get built on.

## 1. Stack

Next.js 15 (App Router) · React 19 · TypeScript (strict) · Tailwind v4 · shadcn/ui
· Supabase (Postgres/Auth/Storage) · Vercel AI SDK with OpenAI **and** Gemini
behind one seam · ElevenLabs (TTS) · Azure (pronunciation, with AI fallback) ·
Stripe · Zustand + TanStack Query · Zod.

Hosting: Vercel (app) + Supabase (backend). Hostinger = domain/DNS/email only.

## 2. Folder structure

```
app/
  (marketing)/        public pages (landing, pricing, features, blog, legal…)
  (auth)/             login, register, forgot-password, magic-link
  (dashboard)/        authenticated app shell + learning surfaces
  admin/              admin-only area (role checked server-side)
  api/                route handlers (see §7)
config/               plans, site/nav, route constants — pure data
features/             feature-based modules (see §5)
lib/                  cross-cutting infrastructure (see §4)
  ai/                 provider-agnostic model factory + prompts
  supabase/           client / server / admin / middleware
  voice/              TTS provider interface (ElevenLabs)
  pronunciation/      scoring provider interface (Azure | fallback)
  env.ts auth.ts usage.ts rate-limit.ts errors.ts query-client.ts
stores/               Zustand stores (transient client state only)
types/                database.ts (generated) + shared types
supabase/migrations/  ordered SQL (see §8)
docs/                 DECISIONS.md, this file
middleware.ts         session refresh + route protection
```

Route groups `(marketing) (auth) (dashboard)` share layouts without affecting
URLs. `admin` is a real path segment so it reads clearly and is easy to match.

## 3. Naming conventions

- **Files:** `kebab-case.ts`. React components `PascalCase.tsx` (Phase 1+).
- **Folders:** `kebab-case`; route groups `(parens)`.
- **DB:** `snake_case` tables/columns, plural tables (`lesson_steps`), enums
  `snake_case` singular (`conversation_mode`).
- **Types/interfaces:** `PascalCase`. Zod schemas: `camelCaseSchema`; inferred
  type shares the base name (`createVocabularyItemSchema` → `CreateVocabularyItem`).
- **Functions/vars:** `camelCase`. Constants & enums-as-arrays: `UPPER_SNAKE`
  (`CONVERSATION_MODES`).
- **Routes:** never hardcode path strings — import from `config/site.ts → routes`.
- **API responses:** success returns the resource JSON; errors always
  `{ error: { code, message, details? } }` via `lib/errors`.

## 4. The `lib/` infrastructure layer

- **env.ts** — the only place `process.env` is read; Zod-validated at boot.
- **supabase/client|server|admin** — three clients, three trust levels.
  `client` (browser, RLS), `server` (cookie-bound, RLS as the user), `admin`
  (service role, **bypasses RLS**, `server-only`, for counters/billing/audit).
- **ai/index.ts** — `getModel(tier)` returns a Vercel-AI-SDK model for the
  active provider. **The single seam for swapping/AB-ing OpenAI vs Gemini.**
  Feature code never names a vendor.
- **ai/prompts.ts** — system-prompt builders keyed by mode + CEFR level.
- **usage.ts** — `consumeUsage(userId, meter)` checks+increments the daily
  budget via the admin client; throws `usage_limit_reached` (429) when over.
- **rate-limit.ts** — Upstash sliding window when configured, in-memory else.
- **auth.ts** — `requireUser()` / `requireAdmin()` guards for routes.
- **errors.ts** — `ApiError`, typed codes, `toErrorResponse()`.

## 5. Feature-based architecture

Each feature is a self-contained module under `features/<name>/` with a single
public entry (`index.ts`). Other code imports from the entry, never deep paths.
Standard internal shape (see `features/vocabulary/` as the reference):

```
features/vocabulary/
  schema/    Zod schemas (shared by API validation + client forms)
  types/     TypeScript types for the feature
  api/       pure logic + client-side fetchers (e.g. sm2.ts scheduler)
  index.ts   public surface — re-exports the above
  components/ (added in UI phases)
  hooks/      (added in UI phases)
```

Rule of thumb: cross-cutting concerns (auth, db, ai) live in `lib/`;
domain concerns (vocabulary, lessons, billing) live in `features/`.

## 6. State management

Three tiers, used deliberately:

1. **Server data → Server Components + Supabase.** Default for anything
   persisted. No client fetching needed to render.
2. **Client server-state → TanStack Query** (`lib/query-client.ts`). Mutations,
   optimistic updates, and data that refetches (chat history, flashcard reviews,
   dashboard widgets).
3. **Transient UI/session → Zustand** (`stores/`). Only state that isn't in the
   DB or URL — e.g. the active learning-session mode/level, recording flag.
   Never mirror DB rows into Zustand.

URL/search params hold shareable, navigable state (filters, selected lesson).

## 7. API structure

All under `app/api/`. Every handler: validate input with Zod → guard auth
(`requireUser`/`requireAdmin`) → gate usage/rate where relevant → do work →
return JSON or a stream. Errors flow through `toErrorResponse`.

| Route | Method | Notes |
|---|---|---|
| `/api/health` | GET | DB round-trip probe (returns seeded language count). |
| `/api/ai/chat` | POST | Auth + usage gate + rate limit; streams via active provider; persists to `ai_messages`. |
| `/api/ai/grammar` | POST | Structured `generateObject` correction. |
| `/api/ai/writing` | POST | Structured writing feedback + tone rewrite. |
| `/api/ai/vocabulary` | POST | AI-generated vocab items. |
| `/api/ai/lesson-generator` | POST | **Admin-only** lesson content generation. |
| `/api/voice/generate` | POST | ElevenLabs TTS; charges `voice_seconds`. |
| `/api/stripe/checkout` | POST | Creates a Checkout Session. |
| `/api/stripe/portal` | POST | Billing portal session. |
| `/api/stripe/webhook` | POST | **Signature-verified**; sole writer of subscription state. |
| `/api/contact` | POST | Rate-limited; Resend delivery. |
| `/api/admin/analytics` | GET | Admin-only aggregates. |

AI routes run on the Node runtime (`export const runtime = "nodejs"`).

## 8. Database structure

23 tables across eight ordered migrations. RLS is **on for every table**.
Pattern: users access their own rows (`auth.uid() = user_id`); admins read via
`is_admin()`; catalog tables are public-read/admin-write; sensitive writes
(usage counters, billing, audit, awarded achievements) happen only via the
service role, so no user write policy exists for them.

| Migration | Tables |
|---|---|
| 0001 foundation | `profiles`, `user_settings`, `languages`, `user_languages`, `usage_limits` + enums + `is_admin()`, auto-profile, privilege-escalation guard |
| 0002 lessons | `lessons`, `lesson_steps`, `lesson_progress` |
| 0003 ai | `ai_conversations`, `ai_messages` |
| 0004 vocabulary | `vocabulary_items`, `flashcard_reviews` (SM-2 state) |
| 0005 feedback | `grammar_corrections`, `writing_reviews`, `pronunciation_sessions`, `listening_sessions` |
| 0006 gamification | `user_stats`, `achievements`, `user_achievements`, `get_leaderboard()` |
| 0007 billing | `subscriptions`, `payments` |
| 0008 admin | `support_tickets`, `admin_audit_logs` |

Two deliberate security decisions worth flagging:

- **Privilege escalation:** a trigger blocks non-admins from changing their own
  `role` or `subscription_tier` (RLS can't restrict columns).
- **Leaderboard:** exposed via a `SECURITY DEFINER` function returning a minimal
  public projection — a plain view would bypass the "own row" RLS on `user_stats`
  and leak everyone's data.

After pushing migrations, regenerate the authoritative DB types:
`npm run db:types`. The hand-written `types/database.ts` is a foundation stub
that this replaces.

## 9. Environment variables

See `.env.example`. Required to boot: the three Supabase keys. Everything else
is validated at point-of-use, so the app runs with partial integrations during
development. `AI_PROVIDER` (`gemini` | `openai`) selects the active model
vendor; set only the keys you use.

## 10. Coding standards

- TypeScript `strict` + `noUncheckedIndexedAccess`. No `any`; prefer `unknown`
  + narrowing. Validate all external input (requests, env) with Zod.
- Server-only secrets never cross into client bundles (`server-only` import +
  the admin client is the enforced boundary).
- Accessibility floor from day one (focus-visible, reduced-motion in
  `globals.css`); full WCAG AA audit in the hardening phase.
- One responsibility per module; pure logic (e.g. `sm2.ts`) kept I/O-free so
  it's unit-testable.
- Conventional, present-tense commits.

## 11. What's NOT here yet (by design)

No pages, components, layouts, or styling beyond tokens. The `azure.ts`
pronunciation impl and a few persistence hooks intentionally throw or no-op with
a comment pointing to the phase that wires them — they're contract placeholders,
not silent stubs. Build order follows `docs/DECISIONS.md` and the phase plan.
