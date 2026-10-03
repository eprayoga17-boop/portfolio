import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createPlainClient } from "@supabase/supabase-js";
import { publicEnv, isSupabaseConfigured } from "@/lib/env";
import { serverEnv } from "@/lib/env.server";

/**
 * Request-scoped client that acts as the signed-in user (or anon).
 * Row Level Security applies, and audit triggers see auth.uid().
 */
export async function createSupabaseServerClient() {
  if (!isSupabaseConfigured) return null;
  const cookieStore = await cookies();
  return createServerClient(publicEnv.NEXT_PUBLIC_SUPABASE_URL!, publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component; the proxy refreshes the session instead.
        }
      },
    },
  });
}

/**
 * Cookie-less anon client for public reads (published projects only, via RLS).
 */
export function createSupabasePublicClient() {
  if (!isSupabaseConfigured) return null;
  return createPlainClient(publicEnv.NEXT_PUBLIC_SUPABASE_URL!, publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Service-role client. Bypasses RLS, so it is used for exactly three things:
 * inserting contact inquiries after validation, the rate limiter, and the
 * retention cron. Never import this into a Client Component.
 */
export function createSupabaseServiceClient() {
  if (!isSupabaseConfigured || !serverEnv.SUPABASE_SERVICE_ROLE_KEY) return null;
  return createPlainClient(publicEnv.NEXT_PUBLIC_SUPABASE_URL!, serverEnv.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
