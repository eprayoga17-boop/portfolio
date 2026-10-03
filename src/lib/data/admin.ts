import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mapProject } from "@/lib/data/projects";
import type { Project } from "@/lib/types";

const SELECT =
  "id, slug, title, client, category, year, region, role, services, summary, body, accent, featured, published, sort_order, external_url, cover_path, cover_alt, cover_width, cover_height, project_images(id, path, alt, width, height, sort_order)";

/** Admin reads go through the user's session; RLS only returns everything to an aal2 admin. */
export async function adminListProjects(): Promise<Project[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("projects").select(SELECT).order("sort_order").limit(500);
  if (error) throw new Error(`admin list: ${error.code}`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map(mapProject);
}

export async function adminGetProject(id: string): Promise<Project | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("projects").select(SELECT).eq("id", id).maybeSingle();
  if (error) throw new Error(`admin get: ${error.code}`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data ? mapProject(data as any) : null;
}
