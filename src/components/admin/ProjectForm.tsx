"use client";
import { useActionState, useEffect, useRef } from "react";
import type { ActionResult } from "@/app/admin/actions";
import { CATEGORIES, type Project } from "@/lib/types";

const input =
  "w-full bg-surface px-3 py-2.5 text-ink outline-none ring-[1.5px] ring-muted focus:ring-[3px] focus:ring-cobalt aria-[invalid=true]:ring-[3px] aria-[invalid=true]:ring-orange";

type Props = {
  project?: Project;
  action: (prev: ActionResult | null, fd: FormData) => Promise<ActionResult>;
  submitLabel: string;
};

export function ProjectForm({ project, action, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, null);
  const fe = state && !state.ok ? (state.fieldErrors ?? {}) : {};
  const statusRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (state) statusRef.current?.focus();
  }, [state]);

  const field = (name: string, label: string, el: React.ReactNode, hint?: string) => (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-bold">
        {label}
      </label>
      {el}
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {fe[name] && (
        <p id={`${name}-err`} className="mt-1 text-sm font-semibold">
          {fe[name]}
        </p>
      )}
    </div>
  );
  const a = (name: string) => ({
    id: name,
    name,
    "aria-invalid": Boolean(fe[name]),
    "aria-describedby": fe[name] ? `${name}-err` : undefined,
  });

  return (
    <form action={formAction} className="grid gap-5">
      {state && (
        <p
          ref={statusRef}
          tabIndex={-1}
          role={state.ok ? "status" : "alert"}
          className={`chamfer px-4 py-3 font-semibold outline-none ${state.ok ? "bg-cobalt text-on-cobalt" : "bg-orange text-on-orange"}`}
        >
          {state.ok ? (state.message ?? "Saved.") : state.error}
        </p>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        {field("title", "Title", <input {...a("title")} required maxLength={120} defaultValue={project?.title} className={input} />)}
        {field(
          "slug",
          "URL slug",
          <input {...a("slug")} required maxLength={80} pattern="[a-z0-9]+(-[a-z0-9]+)*" defaultValue={project?.slug} className={`${input} font-mono`} />,
          "Lowercase and hyphens, e.g. mie-umi. Changing it breaks old links.",
        )}
        {field("client", "Client", <input {...a("client")} required maxLength={160} defaultValue={project?.client} className={input} />)}
        {field(
          "category",
          "Industry",
          <select {...a("category")} defaultValue={project?.category ?? "beauty"} className={input}>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>,
        )}
        {field("role", "Your role", <input {...a("role")} maxLength={120} defaultValue={project?.role ?? ""} className={input} />)}
        {field("region", "Region", <input {...a("region")} maxLength={80} defaultValue={project?.region ?? ""} className={input} />, "Optional, e.g. Singapore")}
        {field("year", "Year", <input {...a("year")} inputMode="numeric" maxLength={4} defaultValue={project?.year ?? ""} className={input} />, "Optional")}
        {field(
          "accent",
          "Accent colour",
          <input {...a("accent")} required pattern="#[0-9a-fA-F]{6}" defaultValue={project?.accent ?? "#0039C1"} className={`${input} font-mono`} />,
          "Hex, used for the hover wipe and the case-page frame.",
        )}
      </div>

      {field(
        "services",
        "Services",
        <input {...a("services")} maxLength={600} defaultValue={project?.services.join(", ") ?? ""} className={input} />,
        "Comma separated, up to 12.",
      )}
      {field(
        "summary",
        "Summary",
        <textarea {...a("summary")} required maxLength={300} rows={2} defaultValue={project?.summary} className={input} />,
        "One or two sentences. Shows on cards and in search results.",
      )}
      {field(
        "body",
        "Case text",
        <textarea {...a("body")} maxLength={6000} rows={8} defaultValue={project?.body} className={input} />,
        "Plain text. Leave a blank line between paragraphs.",
      )}
      {field(
        "externalUrl",
        "External link",
        <input {...a("externalUrl")} type="url" maxLength={500} defaultValue={project?.externalUrl ?? ""} placeholder="https://" className={input} />,
        "Optional, e.g. a video reel. https only.",
      )}

      <div className="grid gap-5 md:grid-cols-3">
        {field("sortOrder", "Sort order", <input {...a("sortOrder")} type="number" defaultValue={project?.sortOrder ?? 0} className={input} />)}
        <label className="flex items-center gap-3 self-end py-2 font-bold">
          <input type="checkbox" name="published" defaultChecked={project?.published ?? false} className="h-5 w-5 accent-[var(--cobalt)]" />
          Published
        </label>
        <label className="flex items-center gap-3 self-end py-2 font-bold">
          <input type="checkbox" name="featured" defaultChecked={project?.featured ?? false} className="h-5 w-5 accent-[var(--cobalt)]" />
          Featured on home
        </label>
      </div>

      <div>
        <button className="btn btn-primary chamfer" disabled={pending}>
          {pending ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

export function DeleteProjectForm({ action }: { action: (prev: ActionResult | null, fd: FormData) => Promise<ActionResult> }) {
  const [state, formAction, pending] = useActionState(action, null);
  return (
    <form action={formAction} className="chamfer-lg grid gap-3 bg-surface-2 p-6">
      <h2 className="display text-xl">Delete project</h2>
      <p className="text-sm text-muted">This removes the project and its uploaded images for good. Type “delete” to confirm.</p>
      {state && !state.ok && (
        <p role="alert" className="font-semibold">
          {state.error}
        </p>
      )}
      <label htmlFor="confirm" className="sr-only">
        Type delete to confirm
      </label>
      <input id="confirm" name="confirm" autoComplete="off" className={input} />
      <button className="btn chamfer w-fit bg-ink text-paper hover:bg-orange hover:text-on-orange" disabled={pending}>
        {pending ? "Deleting..." : "Delete project"}
      </button>
    </form>
  );
}
