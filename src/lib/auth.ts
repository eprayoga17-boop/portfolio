import "server-only";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminState =
  | { status: "unconfigured" }
  | { status: "anonymous" }
  | { status: "forbidden" } // signed in, but not in public.admins
  | { status: "needs_mfa"; enrolled: boolean }
  | { status: "ok"; userId: string; email: string | null };

/**
 * Authoritative admin check (OWASP A01/A07). Validates the session with
 * Supabase Auth, requires membership in public.admins, and requires an
 * MFA-verified (aal2) session. RLS enforces the same rule in the database.
 */
export async function getAdminState(): Promise<AdminState> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "unconfigured" };

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return { status: "anonymous" };

  const { data: isMember } = await supabase.rpc("is_admin_member");
  if (!isMember) return { status: "forbidden" };

  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal?.currentLevel !== "aal2") {
    return { status: "needs_mfa", enrolled: aal?.nextLevel === "aal2" };
  }
  return { status: "ok", userId: user.id, email: user.email ?? null };
}

/** For admin pages: redirect to the right step unless fully authorised. */
export async function requireAdminPage() {
  const state = await getAdminState();
  if (state.status === "ok") return state;
  if (state.status === "needs_mfa") redirect("/admin/mfa");
  redirect("/admin/login");
}

export class AuthzError extends Error {
  constructor() {
    super("Not authorised");
  }
}

/** For Server Actions: throw instead of redirecting. */
export async function requireAdminAction() {
  const state = await getAdminState();
  if (state.status !== "ok") throw new AuthzError();
  const supabase = (await createSupabaseServerClient())!;
  return { ...state, supabase };
}
