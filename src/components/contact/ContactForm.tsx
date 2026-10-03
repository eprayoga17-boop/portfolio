"use client";
import { useActionState, useEffect, useRef } from "react";
import { CheckCircle, PaperPlaneTilt, WarningCircle } from "@phosphor-icons/react";
import Link from "next/link";
import { sendInquiry, type ContactState } from "@/app/(site)/contact/actions";
import { PROJECT_TYPES } from "@/lib/validation";

const field =
  "w-full bg-surface px-4 py-3 text-base text-ink outline-none ring-[1.5px] ring-muted transition placeholder:text-muted focus:ring-[3px] focus:ring-cobalt aria-[invalid=true]:ring-orange-text";

export function ContactForm() {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendInquiry, { status: "idle" });
  const errorRef = useRef<HTMLDivElement>(null);
  const fe = state.status === "error" ? (state.fieldErrors ?? {}) : {};

  useEffect(() => {
    if (state.status === "error") errorRef.current?.focus();
  }, [state]);

  if (state.status === "sent") {
    return (
      <div role="status" className="chamfer-lg bg-cobalt p-8 text-on-cobalt md:p-12">
        <CheckCircle size={48} weight="bold" aria-hidden className="text-orange" />
        <p className="display mt-6 text-4xl">Got it. Makasih!</p>
        <p className="mt-4 max-w-[44ch] text-on-cobalt/85">
          Your message is in. I usually reply within a couple of days. If it&apos;s urgent, WhatsApp is faster.
        </p>
      </div>
    );
  }

  const err = (name: string) =>
    fe[name] ? (
      <p id={`${name}-error`} className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-ink">
        <WarningCircle size={18} weight="fill" aria-hidden className="shrink-0 text-orange-text" /> {fe[name]}
      </p>
    ) : null;

  return (
    <form action={action} noValidate className="grid gap-6">
      {state.status === "error" && (
        <div
          ref={errorRef}
          tabIndex={-1}
          role="alert"
          className="chamfer bg-orange px-4 py-3 font-semibold text-on-orange outline-none"
        >
          {state.message}
        </div>
      )}

      {/* Honeypot, hidden from people and assistive tech */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-2 block font-bold">
            Your name
          </label>
          <input id="name" name="name" required maxLength={120} autoComplete="name" className={field}
            aria-invalid={Boolean(fe.name)} aria-describedby={fe.name ? "name-error" : undefined} />
          {err("name")}
        </div>
        <div>
          <label htmlFor="email" className="mb-2 block font-bold">
            Email
          </label>
          <input id="email" name="email" type="email" required maxLength={254} autoComplete="email" className={field}
            aria-invalid={Boolean(fe.email)} aria-describedby={fe.email ? "email-error" : undefined} />
          {err("email")}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="company" className="mb-2 block font-bold">
            Company or brand <span className="font-normal text-muted">(optional)</span>
          </label>
          <input id="company" name="company" maxLength={160} autoComplete="organization" className={field} />
        </div>
        <div>
          <label htmlFor="projectType" className="mb-2 block font-bold">
            This is about
          </label>
          <select id="projectType" name="projectType" required defaultValue="" className={field}
            aria-invalid={Boolean(fe.projectType)} aria-describedby={fe.projectType ? "projectType-error" : undefined}>
            <option value="" disabled>
              Choose one
            </option>
            {PROJECT_TYPES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          {err("projectType")}
        </div>
      </div>

      <div>
        <label htmlFor="message" className="mb-2 block font-bold">
          Message
        </label>
        <textarea id="message" name="message" required minLength={10} maxLength={4000} rows={6} className={field}
          aria-invalid={Boolean(fe.message)}
          aria-describedby={`message-help${fe.message ? " message-error" : ""}`} />
        <p id="message-help" className="mt-2 text-sm text-muted">
          What you need, rough timeline, and where people will see it.
        </p>
        {err("message")}
      </div>

      <div>
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            name="consent"
            required
            className="mt-1 h-5 w-5 shrink-0 accent-[var(--cobalt)]"
            aria-invalid={Boolean(fe.consent)}
            aria-describedby={fe.consent ? "consent-error" : undefined}
          />
          <span className="text-sm leading-relaxed">
            I agree that Erik stores my name, email and message to reply to me. It&apos;s deleted automatically after 12
            months, or sooner if I ask. Details in the{" "}
            <Link href="/privacy" className="font-bold underline underline-offset-4 hover:text-cobalt-text">
              privacy notice
            </Link>
            .
          </span>
        </label>
        {err("consent")}
      </div>

      <div>
        <button type="submit" disabled={pending} className="btn btn-primary chamfer disabled:opacity-60">
          <PaperPlaneTilt size={18} weight="bold" aria-hidden />
          {pending ? "Sending..." : "Send message"}
        </button>
      </div>
    </form>
  );
}
