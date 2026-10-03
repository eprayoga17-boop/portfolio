"use server";
import { redirect, unstable_rethrow } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { AuthzError, requireAdminAction } from "@/lib/auth";
import { STORAGE_BUCKET } from "@/lib/images";
import { imageMetaSchema, projectSchema, storagePathFor, uuid } from "@/lib/validation";

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string; fieldErrors?: Record<string, string> };

/**
 * Every action:
 *  1. re-checks admin + MFA (never trusts the proxy or the page that rendered the form)
 *  2. validates input against an allowlist schema
 *  3. writes through the user's own Supabase session, so RLS and the audit
 *     trigger both see the real actor
 *  4. returns generic errors to the browser and logs details server-side
 */
async function guard<T>(fn: () => Promise<T>): Promise<T | ActionResult> {
  try {
    return await fn();
  } catch (e) {
    // redirect() and friends throw control-flow errors that must propagate.
    unstable_rethrow(e);
    if (e instanceof AuthzError) return { ok: false, error: "Your session expired or lacks MFA. Sign in again." };
    console.error("[admin] action failed", e instanceof Error ? e.message : e);
    return { ok: false, error: "Something went wrong. Nothing was saved." };
  }
}

function fieldErrors(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const i of error.issues) out[String(i.path[0] ?? "form")] ??= i.message;
  return out;
}

function refreshPublic(slug?: string) {
  revalidatePath("/", "layout");
  if (slug) revalidatePath(`/work/${slug}`);
}

function readProjectForm(fd: FormData) {
  return projectSchema.safeParse({
    slug: fd.get("slug") ?? "",
    title: fd.get("title") ?? "",
    client: fd.get("client") ?? "",
    category: fd.get("category") ?? "",
    year: fd.get("year") ?? "",
    region: fd.get("region") ?? "",
    role: fd.get("role") ?? "",
    services: fd.get("services") ?? "",
    summary: fd.get("summary") ?? "",
    body: fd.get("body") ?? "",
    accent: fd.get("accent") ?? "",
    externalUrl: fd.get("externalUrl") ?? "",
    sortOrder: fd.get("sortOrder") ?? "0",
    featured: fd.get("featured") ?? undefined,
    published: fd.get("published") ?? undefined,
  });
}

function toRow(d: z.infer<typeof projectSchema>) {
  return {
    slug: d.slug,
    title: d.title,
    client: d.client,
    category: d.category,
    year: d.year,
    region: d.region,
    role: d.role,
    services: d.services,
    summary: d.summary,
    body: d.body,
    accent: d.accent,
    external_url: d.externalUrl,
    sort_order: d.sortOrder,
    featured: d.featured,
    published: d.published,
  };
}

export async function createProject(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const result = await guard(async () => {
    const { supabase } = await requireAdminAction();
    const parsed = readProjectForm(fd);
    if (!parsed.success) return { ok: false as const, error: "Check the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
    const { data, error } = await supabase.from("projects").insert(toRow(parsed.data)).select("id").single();
    if (error) {
      if (error.code === "23505") return { ok: false as const, error: "That slug is taken.", fieldErrors: { slug: "Already used." } };
      throw new Error(`insert project: ${error.code}`);
    }
    refreshPublic(parsed.data.slug);
    redirect(`/admin/projects/${data.id}?created=1`);
  });
  return result as ActionResult;
}

export async function updateProject(id: string, _prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return (await guard(async () => {
    const { supabase } = await requireAdminAction();
    if (!uuid.safeParse(id).success) return { ok: false as const, error: "Unknown project." };
    const parsed = readProjectForm(fd);
    if (!parsed.success) return { ok: false as const, error: "Check the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
    const { error } = await supabase.from("projects").update(toRow(parsed.data)).eq("id", id);
    if (error) {
      if (error.code === "23505") return { ok: false as const, error: "That slug is taken.", fieldErrors: { slug: "Already used." } };
      throw new Error(`update project: ${error.code}`);
    }
    refreshPublic(parsed.data.slug);
    return { ok: true as const, message: "Saved." };
  })) as ActionResult;
}

export async function deleteProject(id: string, _prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return (await guard(async () => {
    const { supabase } = await requireAdminAction();
    if (!uuid.safeParse(id).success) return { ok: false as const, error: "Unknown project." };
    if (fd.get("confirm") !== "delete") return { ok: false as const, error: 'Type "delete" to confirm.' };

    // Remove uploaded files first; seed images (/seed/...) live in the repo and are skipped.
    const { data: imgs } = await supabase.from("project_images").select("path").eq("project_id", id);
    const { data: proj } = await supabase.from("projects").select("cover_path").eq("id", id).single();
    const paths = [...(imgs ?? []).map((i) => i.path), proj?.cover_path]
      .filter((p): p is string => Boolean(p) && p!.startsWith("projects/"));
    if (paths.length) await supabase.storage.from(STORAGE_BUCKET).remove(paths);

    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) throw new Error(`delete project: ${error.code}`);
    refreshPublic();
    redirect("/admin?deleted=1");
  })) as ActionResult;
}

const addImageSchema = imageMetaSchema.extend({ projectId: uuid, path: z.string().max(300) });

/** Records an image the browser already uploaded straight to Storage (RLS-checked). */
export async function addImage(input: { projectId: string; path: string; alt: string; width: number; height: number }): Promise<ActionResult> {
  return (await guard(async () => {
    const { supabase } = await requireAdminAction();
    const parsed = addImageSchema.safeParse(input);
    if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid image." };
    const { projectId, path, alt, width, height } = parsed.data;
    if (!storagePathFor(projectId).safeParse(path).success) return { ok: false as const, error: "Unexpected upload path." };

    // Confirm the object really exists in our bucket before pointing the site at it.
    const folder = path.slice(0, path.lastIndexOf("/"));
    const name = path.slice(path.lastIndexOf("/") + 1);
    const { data: listed } = await supabase.storage.from(STORAGE_BUCKET).list(folder, { search: name, limit: 1 });
    if (!listed?.some((o) => o.name === name)) return { ok: false as const, error: "Upload not found. Try again." };

    const { count } = await supabase.from("project_images").select("id", { count: "exact", head: true }).eq("project_id", projectId);
    const { error } = await supabase
      .from("project_images")
      .insert({ project_id: projectId, path, alt, width, height, sort_order: count ?? 0 });
    if (error) throw new Error(`insert image: ${error.code}`);
    refreshPublic();
    return { ok: true as const };
  })) as ActionResult;
}

export async function updateImageAlt(imageId: string, alt: string): Promise<ActionResult> {
  return (await guard(async () => {
    const { supabase } = await requireAdminAction();
    const p = z.object({ id: uuid, alt: imageMetaSchema.shape.alt }).safeParse({ id: imageId, alt });
    if (!p.success) return { ok: false as const, error: p.error.issues[0]?.message ?? "Invalid." };
    const { error } = await supabase.from("project_images").update({ alt: p.data.alt }).eq("id", p.data.id);
    if (error) throw new Error(`update alt: ${error.code}`);
    refreshPublic();
    return { ok: true as const, message: "Alt text saved." };
  })) as ActionResult;
}

export async function deleteImage(imageId: string): Promise<ActionResult> {
  return (await guard(async () => {
    const { supabase } = await requireAdminAction();
    if (!uuid.safeParse(imageId).success) return { ok: false as const, error: "Unknown image." };
    const { data: img } = await supabase.from("project_images").select("path").eq("id", imageId).single();
    const { error } = await supabase.from("project_images").delete().eq("id", imageId);
    if (error) throw new Error(`delete image: ${error.code}`);
    if (img?.path?.startsWith("projects/")) await supabase.storage.from(STORAGE_BUCKET).remove([img.path]);
    refreshPublic();
    return { ok: true as const };
  })) as ActionResult;
}

export async function moveImage(projectId: string, imageId: string, direction: "up" | "down"): Promise<ActionResult> {
  return (await guard(async () => {
    const { supabase } = await requireAdminAction();
    if (!uuid.safeParse(projectId).success || !uuid.safeParse(imageId).success) return { ok: false as const, error: "Invalid." };
    const { data: imgs, error } = await supabase
      .from("project_images")
      .select("id, sort_order")
      .eq("project_id", projectId)
      .order("sort_order");
    if (error || !imgs) throw new Error("load images");
    const i = imgs.findIndex((x) => x.id === imageId);
    const j = direction === "up" ? i - 1 : i + 1;
    if (i < 0 || j < 0 || j >= imgs.length) return { ok: true as const };
    [imgs[i], imgs[j]] = [imgs[j], imgs[i]];
    for (const [idx, img] of imgs.entries()) {
      const { error: e } = await supabase.from("project_images").update({ sort_order: idx }).eq("id", img.id);
      if (e) throw new Error(`reorder: ${e.code}`);
    }
    refreshPublic();
    return { ok: true as const };
  })) as ActionResult;
}

export async function setCover(projectId: string, imageId: string): Promise<ActionResult> {
  return (await guard(async () => {
    const { supabase } = await requireAdminAction();
    if (!uuid.safeParse(projectId).success || !uuid.safeParse(imageId).success) return { ok: false as const, error: "Invalid." };
    const { data: img } = await supabase
      .from("project_images")
      .select("path, alt, width, height")
      .eq("id", imageId)
      .eq("project_id", projectId)
      .single();
    if (!img) return { ok: false as const, error: "Image not found." };
    const { error } = await supabase
      .from("projects")
      .update({ cover_path: img.path, cover_alt: img.alt, cover_width: img.width, cover_height: img.height })
      .eq("id", projectId);
    if (error) throw new Error(`set cover: ${error.code}`);
    refreshPublic();
    return { ok: true as const, message: "Cover updated." };
  })) as ActionResult;
}

const statusSchema = z.enum(["new", "replied", "archived"]);

export async function setInquiryStatus(id: string, status: string): Promise<ActionResult> {
  return (await guard(async () => {
    const { supabase } = await requireAdminAction();
    const p = z.object({ id: uuid, status: statusSchema }).safeParse({ id, status });
    if (!p.success) return { ok: false as const, error: "Invalid." };
    const { error } = await supabase.from("inquiries").update({ status: p.data.status }).eq("id", p.data.id);
    if (error) throw new Error(`inquiry status: ${error.code}`);
    revalidatePath("/admin/inquiries");
    return { ok: true as const };
  })) as ActionResult;
}

/** Erasure on request (UU PDP right to deletion). */
export async function deleteInquiry(id: string): Promise<ActionResult> {
  return (await guard(async () => {
    const { supabase } = await requireAdminAction();
    if (!uuid.safeParse(id).success) return { ok: false as const, error: "Invalid." };
    const { error } = await supabase.from("inquiries").delete().eq("id", id);
    if (error) throw new Error(`inquiry delete: ${error.code}`);
    revalidatePath("/admin/inquiries");
    return { ok: true as const };
  })) as ActionResult;
}
