import { z } from "zod";

/**
 * Public env (safe for the browser). The site runs without Supabase in
 * "seed mode": public pages render the bundled seed content and the admin
 * panel shows a setup notice instead of a login form.
 */
const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20).optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
});

const parsedPublic = publicSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || undefined,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || undefined,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || undefined,
});

if (!parsedPublic.success) {
  // Fail loudly at boot rather than half-working with a malformed URL.
  throw new Error("Invalid public environment variables: " + parsedPublic.error.message);
}

export const publicEnv = parsedPublic.data;

export const isSupabaseConfigured = Boolean(
  publicEnv.NEXT_PUBLIC_SUPABASE_URL && publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export const siteUrl = publicEnv.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
