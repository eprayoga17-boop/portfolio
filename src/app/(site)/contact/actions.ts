"use server";
import { clientIp, hashIdentifier, rateLimit } from "@/lib/security";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { CONSENT_VERSION, inquirySchema } from "@/lib/validation";

export type ContactState =
  | { status: "idle" }
  | { status: "sent" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string> };

export async function sendInquiry(_prev: ContactState, formData: FormData): Promise<ContactState> {
  // Honeypot: real people never see or fill this field. Pretend it worked.
  if (String(formData.get("website") ?? "") !== "") return { status: "sent" };

  const parsed = inquirySchema.safeParse({
    name: formData.get("name") ?? "",
    email: formData.get("email") ?? "",
    company: formData.get("company") ?? "",
    projectType: formData.get("projectType") ?? "",
    message: formData.get("message") ?? "",
    consent: formData.get("consent") ?? undefined,
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return { status: "error", message: "A few fields need another look.", fieldErrors };
  }

  const service = createSupabaseServiceClient();
  if (!service) {
    return {
      status: "error",
      message: "The form isn't connected yet. Email or WhatsApp me directly in the meantime.",
    };
  }

  const ip = await clientIp();
  const [byIp, byEmail] = await Promise.all([
    rateLimit("contact-ip", ip, 5, 60 * 60),
    rateLimit("contact-email", parsed.data.email, 3, 60 * 60 * 24),
  ]);
  if (!byIp.ok || !byEmail.ok) {
    return { status: "error", message: "That's a lot of messages in a short time. Try again later, or email me." };
  }

  const { error } = await service.from("inquiries").insert({
    name: parsed.data.name,
    email: parsed.data.email,
    company: parsed.data.company,
    project_type: parsed.data.projectType,
    message: parsed.data.message,
    consent: true,
    consent_version: CONSENT_VERSION,
    ip_hash: hashIdentifier(ip),
  });
  if (error) {
    console.error("[contact] insert failed", { code: error.code });
    return { status: "error", message: "Something broke on my side. Email me directly and I'll sort it out." };
  }
  return { status: "sent" };
}
