import { InquiryActions } from "@/components/admin/InquiryActions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PROJECT_TYPES } from "@/lib/validation";

type Row = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  project_type: string;
  message: string;
  status: string;
  created_at: string;
};

export default async function InquiriesPage() {
  const supabase = (await createSupabaseServerClient())!;
  const { data, error } = await supabase
    .from("inquiries")
    .select("id, name, email, company, project_type, message, status, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(`inquiries: ${error.code}`);
  const rows = (data ?? []) as Row[];
  const fmt = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" });

  return (
    <>
      <h1 className="display text-4xl">Inquiries</h1>
      <p className="mt-2 max-w-[70ch] text-muted">
        Messages from the contact form. They are deleted automatically after the retention period. Use Erase when
        someone asks you to delete their data.
      </p>
      {rows.length === 0 ? (
        <div className="chamfer-lg mt-10 bg-surface-2 p-10 text-center">
          <p className="display text-2xl">Inbox zero</p>
          <p className="mt-2 text-muted">New messages from the contact page land here.</p>
        </div>
      ) : (
        <ul className="mt-10 grid gap-4">
          {rows.map((r) => (
            <li key={r.id} className={`chamfer-lg grid gap-3 p-5 ${r.status === "new" ? "bg-surface ring-2 ring-cobalt" : "bg-surface-2"}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-extrabold">
                  {r.name}
                  {r.company ? <span className="font-normal text-muted">, {r.company}</span> : null}
                </p>
                <p className="font-mono text-xs text-muted">{fmt.format(new Date(r.created_at))}</p>
              </div>
              <p className="text-sm">
                <a className="font-bold underline underline-offset-4" href={`mailto:${r.email}`}>
                  {r.email}
                </a>{" "}
                <span className="text-muted">
                  about {PROJECT_TYPES.find((p) => p.id === r.project_type)?.label.toLowerCase() ?? r.project_type}
                </span>
              </p>
              <p className="whitespace-pre-wrap leading-relaxed">{r.message}</p>
              <InquiryActions id={r.id} status={r.status} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
