import { z } from "zod";
import { CATEGORIES } from "@/lib/types";

const trimmed = (max: number) => z.string().trim().max(max);
const optionalTrimmed = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v === "" ? null : v))
    .nullable();

export const PROJECT_TYPES = [
  { id: "full-time", label: "A full-time role" },
  { id: "freelance", label: "A freelance project" },
  { id: "branding", label: "Brand identity" },
  { id: "social", label: "Social media design" },
  { id: "other", label: "Something else" },
] as const;

export const CONSENT_VERSION = "2026-10";

export const inquirySchema = z.object({
  name: trimmed(120).min(1, "Tell me your name."),
  email: z.string().trim().toLowerCase().max(254).email("That email doesn't look right."),
  company: optionalTrimmed(160),
  projectType: z.enum(PROJECT_TYPES.map((p) => p.id) as [string, ...string[]], {
    message: "Pick what this is about.",
  }),
  message: trimmed(4000).min(10, "A little more detail, please (10 characters minimum)."),
  consent: z.literal("on", { message: "I need your OK to store this message so I can reply." }),
});

const slug = z
  .string()
  .trim()
  .toLowerCase()
  .min(2)
  .max(80)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Lowercase letters, numbers and single hyphens only.");

/** Allowlisted project fields. Anything not listed here is dropped (no mass assignment). */
export const projectSchema = z.object({
  slug,
  title: trimmed(120).min(1, "Title is required."),
  client: trimmed(160).min(1, "Client is required."),
  category: z.enum(CATEGORIES.map((c) => c.id) as [string, ...string[]]),
  year: z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : Number(v)))
    .pipe(z.number().int().min(2000).max(2100).nullable()),
  region: optionalTrimmed(80),
  role: optionalTrimmed(120),
  services: z
    .string()
    .trim()
    .max(600)
    .transform((v) =>
      v
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 12),
    ),
  summary: trimmed(300).min(1, "Summary is required."),
  body: trimmed(6000),
  accent: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "Use a hex colour like #0039C1."),
  externalUrl: z
    .string()
    .trim()
    .max(500)
    .transform((v) => (v === "" ? null : v))
    .pipe(z.string().url().startsWith("https://", "Links must use https://").nullable()),
  sortOrder: z.coerce.number().int().min(-10000).max(10000),
  featured: z.literal("on").optional().transform(Boolean),
  published: z.literal("on").optional().transform(Boolean),
});

export const uuid = z.string().uuid();

/** Storage object path we generated for an upload: projects/<project uuid>/<uuid>.<ext> */
export const storagePathFor = (projectId: string) =>
  z
    .string()
    .regex(
      new RegExp(`^projects/${projectId}/[0-9a-f-]{36}\\.(webp|jpg|jpeg|png|avif)$`),
      "Unexpected upload path.",
    );

export const imageMetaSchema = z.object({
  alt: trimmed(300).min(1, "Alt text is required. Describe what's in the image."),
  width: z.coerce.number().int().min(1).max(12000),
  height: z.coerce.number().int().min(1).max(12000),
});
