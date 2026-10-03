import "server-only";
import { z } from "zod";

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20).optional(),
  // Used to HMAC IP addresses before they touch the database (data minimisation).
  IP_HASH_SECRET: z.string().min(32).optional(),
  // Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`.
  CRON_SECRET: z.string().min(32).optional(),
  INQUIRY_RETENTION_DAYS: z.coerce.number().int().min(30).max(1095).default(365),
});

const parsed = serverSchema.safeParse({
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || undefined,
  IP_HASH_SECRET: process.env.IP_HASH_SECRET || undefined,
  CRON_SECRET: process.env.CRON_SECRET || undefined,
  INQUIRY_RETENTION_DAYS: process.env.INQUIRY_RETENTION_DAYS || undefined,
});

if (!parsed.success) {
  throw new Error("Invalid server environment variables: " + parsed.error.message);
}

export const serverEnv = parsed.data;
