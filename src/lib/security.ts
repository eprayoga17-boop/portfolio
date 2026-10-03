import "server-only";
import { createHmac } from "node:crypto";
import { headers } from "next/headers";
import { serverEnv } from "@/lib/env.server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

/** Client IP as reported by Vercel's edge. Never trusted for anything but throttling. */
export async function clientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || h.get("x-real-ip") || "unknown";
}

/**
 * Keyed hash of a value (e.g. an IP). We store this instead of the raw IP:
 * enough to spot abuse, not enough to identify a person (UU PDP minimisation).
 */
export function hashIdentifier(value: string): string | null {
  if (!serverEnv.IP_HASH_SECRET) return null;
  return createHmac("sha256", serverEnv.IP_HASH_SECRET).update(value).digest("hex").slice(0, 32);
}

/**
 * Fixed-window rate limit backed by Postgres (OWASP A04/A07).
 * Fails closed when the database is reachable but errors, and fails open
 * only when Supabase isn't configured at all (local seed mode).
 */
export async function rateLimit(bucket: string, identifier: string, limit: number, windowSeconds: number) {
  const service = createSupabaseServiceClient();
  if (!service) return { ok: true as const, configured: false };
  const key = `${bucket}:${hashIdentifier(identifier) ?? identifier}`;
  const { data, error } = await service.rpc("check_rate_limit", {
    p_key: key,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });
  if (error) {
    console.error("[rate-limit] rpc failed", { bucket, code: error.code });
    return { ok: false as const, configured: true };
  }
  return { ok: Boolean(data), configured: true };
}

/** Security events that happen outside table triggers (logins, MFA). */
export async function logSecurityEvent(
  action: string,
  meta: Record<string, string | number | boolean | null> = {},
  actor: string | null = null,
) {
  const service = createSupabaseServiceClient();
  if (!service) return;
  const { error } = await service.from("audit_log").insert({ action, entity: "auth", meta, actor });
  if (error) console.error("[audit] insert failed", { action, code: error.code });
}
