import { publicEnv } from "@/lib/env";

export const STORAGE_BUCKET = "portfolio";

/** Turns a stored image path into a URL next/image can load. */
export function imageUrl(path: string): string {
  if (path.startsWith("/")) return path; // bundled seed asset
  const base = publicEnv.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return "/brand/avatar.webp";
  return `${base}/storage/v1/object/public/${STORAGE_BUCKET}/${path
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}
