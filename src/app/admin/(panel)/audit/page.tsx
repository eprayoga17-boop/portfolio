import { createSupabaseServerClient } from "@/lib/supabase/server";

type Row = { id: number; actor: string | null; action: string; entity: string; entity_id: string | null; meta: Record<string, unknown>; created_at: string };

export default async function AuditPage() {
  const supabase = (await createSupabaseServerClient())!;
  const { data, error } = await supabase
    .from("audit_log")
    .select("id, actor, action, entity, entity_id, meta, created_at")
    .order("created_at", { ascending: false })
    .limit(300);
  if (error) throw new Error(`audit: ${error.code}`);
  const rows = (data ?? []) as Row[];
  const fmt = new Intl.DateTimeFormat("en-GB", { dateStyle: "short", timeStyle: "medium", timeZone: "Asia/Jakarta" });

  return (
    <>
      <h1 className="display text-4xl">Audit log</h1>
      <p className="mt-2 max-w-[70ch] text-muted">
        Append-only record of content changes, sign-ins and retention runs. Nobody can edit or delete these rows from
        the app, including you.
      </p>
      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-line">
            <tr className="label text-muted">
              <th className="py-2 pr-4 font-medium">When (WIB)</th>
              <th className="py-2 pr-4 font-medium">Action</th>
              <th className="py-2 pr-4 font-medium">Entity</th>
              <th className="py-2 pr-4 font-medium">Detail</th>
              <th className="py-2 font-medium">Actor</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-line/60 align-top">
                <td className="py-2 pr-4 font-mono">{fmt.format(new Date(r.created_at))}</td>
                <td className="py-2 pr-4 font-bold">{r.action}</td>
                <td className="py-2 pr-4">{r.entity}</td>
                <td className="py-2 pr-4 font-mono text-xs">{JSON.stringify(r.meta)}</td>
                <td className="py-2 font-mono text-xs">{r.actor ? r.actor.slice(0, 8) : "system"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="mt-6 text-muted">Nothing logged yet.</p>}
      </div>
    </>
  );
}
