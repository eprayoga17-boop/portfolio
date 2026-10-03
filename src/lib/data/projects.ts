import "server-only";
import { cache } from "react";
import { seedProjects } from "@/lib/seed/projects";
import { createSupabasePublicClient } from "@/lib/supabase/server";
import type { Project, ProjectImage, CategoryId } from "@/lib/types";

type ImageRow = { id: string; path: string; alt: string; width: number; height: number; sort_order: number };
type ProjectRow = {
  id: string;
  slug: string;
  title: string;
  client: string;
  category: CategoryId;
  year: number | null;
  region: string | null;
  role: string | null;
  services: string[] | null;
  summary: string;
  body: string;
  accent: string;
  featured: boolean;
  published: boolean;
  sort_order: number;
  external_url: string | null;
  cover_path: string | null;
  cover_alt: string | null;
  cover_width: number | null;
  cover_height: number | null;
  project_images: ImageRow[] | null;
};

const SELECT =
  "id, slug, title, client, category, year, region, role, services, summary, body, accent, featured, published, sort_order, external_url, cover_path, cover_alt, cover_width, cover_height, project_images(id, path, alt, width, height, sort_order)";

export function mapProject(row: ProjectRow): Project {
  const images: ProjectImage[] = (row.project_images ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((i) => ({ id: i.id, path: i.path, alt: i.alt, width: i.width, height: i.height }));
  const cover: ProjectImage | null = row.cover_path
    ? {
        id: `${row.id}-cover`,
        path: row.cover_path,
        alt: row.cover_alt ?? row.title,
        width: row.cover_width ?? 1600,
        height: row.cover_height ?? 900,
      }
    : images[0] ?? null;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    client: row.client,
    category: row.category,
    year: row.year,
    region: row.region,
    role: row.role,
    services: row.services ?? [],
    summary: row.summary,
    body: row.body,
    accent: row.accent,
    featured: row.featured,
    published: row.published,
    sortOrder: row.sort_order,
    externalUrl: row.external_url,
    cover,
    images,
  };
}

/**
 * Published projects, ordered. Falls back to seed content when Supabase is
 * not configured, and also when the query fails, so a database hiccup
 * degrades to slightly stale content instead of a broken portfolio.
 */
export const getPublishedProjects = cache(async (): Promise<Project[]> => {
  const supabase = createSupabasePublicClient();
  if (!supabase) return seedProjects;
  const { data, error } = await supabase
    .from("projects")
    .select(SELECT)
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .limit(200);
  if (error) {
    console.error("[projects] public query failed", { code: error.code });
    return seedProjects;
  }
  return (data as unknown as ProjectRow[]).map(mapProject);
});

export async function getProjectBySlug(slug: string) {
  const all = await getPublishedProjects();
  const index = all.findIndex((p) => p.slug === slug);
  if (index === -1) return null;
  const project = all[index];
  // "Next case" skips side quests unless we're already in them.
  const pool = all.filter((p) => (project.category === "side" ? p.category === "side" : p.category !== "side"));
  const pos = pool.findIndex((p) => p.slug === slug);
  const next = pool[(pos + 1) % pool.length];
  return { project, next: next.slug === slug ? null : next };
}
