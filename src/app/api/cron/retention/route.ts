import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { serverEnv } from "@/lib/env.server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function authorised(req: NextRequest) {
  const secret = serverEnv.CRON_SECRET;
  const header = req.headers.get("authorization") ?? "";
  if (!secret) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const got = Buffer.from(header);
  return got.length === expected.length && timingSafeEqual(got, expected);
}

/**
 * Daily retention job (vercel.json). Deletes inquiries older than
 * INQUIRY_RETENTION_DAYS and prunes rate-limit rows. Logged in audit_log.
 */
export async function GET(req: NextRequest) {
  if (!authorised(req)) return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  const service = createSupabaseServiceClient();
  if (!service) return NextResponse.json({ skipped: "supabase not configured" });
  const { data, error } = await service.rpc("purge_expired_data", { p_days: serverEnv.INQUIRY_RETENTION_DAYS });
  if (error) {
    console.error("[cron] retention failed", { code: error.code });
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
  return NextResponse.json({ deleted: data });
}
