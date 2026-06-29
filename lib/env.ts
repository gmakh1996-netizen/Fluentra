import { z } from "zod";

/**
 * Centralized, validated environment access.
 * Import `env` everywhere instead of touching process.env directly.
 *
 * Provider keys are optional at boot; the active provider's key is enforced
 * at the point of use (see lib/ai/index.ts, lib/voice, lib/pronunciation) so
 * the app can build and run partial features without every integration set up.
 */
const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),

  // Supabase — required
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // AI provider selection
  AI_PROVIDER: z.enum(["gemini", "openai"]).default("gemini"),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL_DEFAULT: z.string().default("gpt-4o-mini"),
  OPENAI_MODEL_PREMIUM: z.string().default("gpt-4o"),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().optional(),
  GEMINI_MODEL_DEFAULT: z.string().default("gemini-2.0-flash"),
  GEMINI_MODEL_PREMIUM: z.string().default("gemini-2.5-pro"),

  // Voice / pronunciation — optional
  ELEVENLABS_API_KEY: z.string().optional(),
  AZURE_SPEECH_KEY: z.string().optional(),
  AZURE_SPEECH_REGION: z.string().optional(),

  // Stripe — required for billing routes
  STRIPE_SECRET_KEY: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRICE_PRO_MONTHLY: z.string().optional(),
  STRIPE_PRICE_PRO_YEARLY: z.string().optional(),
  STRIPE_PRICE_ULTIMATE_MONTHLY: z.string().optional(),
  STRIPE_PRICE_ULTIMATE_YEARLY: z.string().optional(),

  // Optional services
  RESEND_API_KEY: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment configuration. See errors above.");
}

export const env = parsed.data;
export type Env = typeof env;
