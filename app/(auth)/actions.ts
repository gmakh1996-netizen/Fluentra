"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Provider, AuthError } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getOrigin, safeNext } from "@/lib/url";
import { routes } from "@/config/site";

/** Shape returned to `useActionState`-driven forms. */
export type AuthState = {
  error?: string;
  success?: string;
  fields?: Record<string, string>;
};

const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email address.");
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(72, "Password must be 72 characters or fewer."); // bcrypt limit

/** Map Supabase auth errors to friendly, non-leaky copy. */
function friendly(error: AuthError): string {
  const m = error.message.toLowerCase();
  if (m.includes("invalid login credentials")) return "Incorrect email or password.";
  if (m.includes("email not confirmed")) return "Please verify your email before signing in.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "An account with this email already exists. Try signing in instead.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Too many attempts. Please wait a moment and try again.";
  if (m.includes("weak password")) return "Please choose a stronger password.";
  return error.message;
}

// ── Email + password ──────────────────────────────────────────────────

export async function signInWithPassword(
  _prev: AuthState | undefined,
  formData: FormData,
): Promise<AuthState> {
  const parsed = z
    .object({ email: emailSchema, password: z.string().min(1, "Enter your password.") })
    .safeParse({ email: formData.get("email"), password: formData.get("password") });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: friendly(error), fields: { email: parsed.data.email } };

  revalidatePath("/", "layout");
  redirect(safeNext(formData.get("next"), routes.dashboard));
}

export async function signUpWithPassword(
  _prev: AuthState | undefined,
  formData: FormData,
): Promise<AuthState> {
  const parsed = z
    .object({
      displayName: z.string().trim().min(1, "Enter your name.").max(80),
      email: emailSchema,
      password: passwordSchema,
      confirmPassword: z.string().min(1, "Please confirm your password."),
      terms: z.literal("on", { errorMap: () => ({ message: "Please accept the terms to continue." }) }),
    })
    .refine((d) => d.password === d.confirmPassword, {
      message: "Passwords don't match.",
      path: ["confirmPassword"],
    })
    .safeParse({
      displayName: formData.get("displayName"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
      terms: formData.get("terms"),
    });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
      fields: {
        displayName: String(formData.get("displayName") ?? ""),
        email: String(formData.get("email") ?? ""),
      },
    };
  }

  const supabase = await createClient();
  const origin = await getOrigin();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.displayName },
      emailRedirectTo: `${origin}${routes.authCallback}?next=${encodeURIComponent(routes.onboarding)}`,
    },
  });

  if (error) return { error: friendly(error), fields: { email: parsed.data.email } };

  // Supabase returns an empty identities array when the email is already registered
  // instead of an error (to prevent email enumeration at the provider level).
  // We surface it as a friendly duplicate-account message.
  if (data.user?.identities?.length === 0) {
    return {
      error: "An account with this email already exists. Try signing in instead.",
      fields: { email: parsed.data.email },
    };
  }

  // Email confirmation required → no session yet. Send to the "check inbox" page.
  if (data.user && !data.session) {
    redirect(`${routes.verifyEmail}?email=${encodeURIComponent(parsed.data.email)}`);
  }

  revalidatePath("/", "layout");
  redirect(routes.onboarding);
}

// ── OAuth (Google, Apple) ───────────────────────────────────────────────

const ALLOWED_PROVIDERS: Provider[] = ["google", "apple"];

export async function signInWithOAuth(formData: FormData): Promise<void> {
  const provider = String(formData.get("provider")) as Provider;
  if (!ALLOWED_PROVIDERS.includes(provider)) redirect(`${routes.login}?error=provider`);

  const next = safeNext(formData.get("next"), routes.dashboard);
  const supabase = await createClient();
  const origin = await getOrigin();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${origin}${routes.authCallback}?next=${encodeURIComponent(next)}`,
    },
  });

  if (error || !data.url) redirect(`${routes.login}?error=oauth`);
  redirect(data.url); // hand off to the provider's consent screen
}

// ── Magic link (passwordless) ───────────────────────────────────────────

export async function signInWithMagicLink(
  _prev: AuthState | undefined,
  formData: FormData,
): Promise<AuthState> {
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid email." };

  const supabase = await createClient();
  const origin = await getOrigin();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data,
    options: {
      emailRedirectTo: `${origin}${routes.authCallback}?next=${encodeURIComponent(routes.dashboard)}`,
    },
  });

  if (error) return { error: friendly(error) };
  return { success: `We emailed a magic sign-in link to ${parsed.data}. Check your inbox.` };
}

// ── Password reset ──────────────────────────────────────────────────────

export async function requestPasswordReset(
  _prev: AuthState | undefined,
  formData: FormData,
): Promise<AuthState> {
  const parsed = emailSchema.safeParse(formData.get("email"));
  // Always succeed to avoid leaking which emails are registered.
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid email." };

  const supabase = await createClient();
  const origin = await getOrigin();
  await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: `${origin}${routes.authCallback}?next=${encodeURIComponent(routes.resetPassword)}`,
  });

  return {
    success: "If an account exists for that email, a password reset link is on its way.",
  };
}

export async function updatePassword(
  _prev: AuthState | undefined,
  formData: FormData,
): Promise<AuthState> {
  const parsed = z
    .object({ password: passwordSchema, confirm: z.string() })
    .refine((d) => d.password === d.confirm, {
      message: "Passwords don't match.",
      path: ["confirm"],
    })
    .safeParse({ password: formData.get("password"), confirm: formData.get("confirm") });

  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const supabase = await createClient();
  // The recovery link established a session via /auth/callback before landing here.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your reset link has expired. Request a new one." };

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: friendly(error) };

  revalidatePath("/", "layout");
  redirect(`${routes.dashboard}?reset=1`);
}

// ── Sign out ─────────────────────────────────────────────────────────────

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect(routes.login);
}
