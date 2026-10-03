"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { clientIp, logSecurityEvent, rateLimit } from "@/lib/security";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type FormState = { error?: string; ok?: boolean };

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(256),
});

// One message for every failure so the form can't be used to probe which emails exist.
const GENERIC = "Email or password is wrong, or the account isn't allowed in here.";

export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Supabase isn't configured yet. See README." };

  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: GENERIC };

  const ip = await clientIp();
  const [byIp, byEmail] = await Promise.all([
    rateLimit("login-ip", ip, 10, 15 * 60),
    rateLimit("login-email", parsed.data.email, 5, 15 * 60),
  ]);
  if (!byIp.ok || !byEmail.ok) {
    await logSecurityEvent("login_throttled");
    return { error: "Too many attempts. Wait 15 minutes and try again." };
  }

  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user) {
    await logSecurityEvent("login_failed");
    return { error: GENERIC };
  }

  const { data: isMember } = await supabase.rpc("is_admin_member");
  if (!isMember) {
    await supabase.auth.signOut();
    await logSecurityEvent("login_rejected_not_admin");
    return { error: GENERIC };
  }

  await logSecurityEvent("login_password_ok", {}, data.user.id);
  redirect("/admin/mfa");
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase?.auth.signOut();
  redirect("/admin/login");
}

export type EnrollState = { error?: string; factorId?: string; qr?: string; secret?: string };

/** Starts TOTP enrolment. Clears any half-finished factor first so they don't pile up. */
export async function startEnroll(): Promise<EnrollState> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Not configured." };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Session expired. Sign in again." };
  const { data: isMember } = await supabase.rpc("is_admin_member");
  if (!isMember) return { error: "Not allowed." };

  const { data: factors } = await supabase.auth.mfa.listFactors();
  if (factors?.totp?.some((f) => f.status === "verified")) return { error: "An authenticator is already set up." };
  for (const f of factors?.all ?? []) {
    if (f.status !== "verified") await supabase.auth.mfa.unenroll({ factorId: f.id });
  }

  const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "Authenticator" });
  if (error || !data) return { error: "Couldn't start setup. Try again." };
  return { factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret };
}

const verifySchema = z.object({
  factorId: z.string().uuid().optional(),
  code: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code."),
});

export async function verifyMfa(_prev: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Not configured." };
  const parsed = verifySchema.safeParse({
    factorId: formData.get("factorId") || undefined,
    code: formData.get("code"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid code." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Session expired. Sign in again." };

  const limited = await rateLimit("mfa-user", user.id, 8, 15 * 60);
  if (!limited.ok) {
    await logSecurityEvent("mfa_throttled");
    return { error: "Too many codes tried. Wait 15 minutes." };
  }

  let factorId = parsed.data.factorId;
  if (!factorId) {
    const { data: factors } = await supabase.auth.mfa.listFactors();
    factorId = factors?.totp?.find((f) => f.status === "verified")?.id;
  }
  if (!factorId) return { error: "No authenticator found. Set one up first." };

  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code: parsed.data.code });
  if (error) {
    await logSecurityEvent("mfa_failed", {}, user.id);
    return { error: "That code didn't work. Codes change every 30 seconds." };
  }
  await logSecurityEvent("mfa_ok", {}, user.id);
  redirect("/admin");
}
