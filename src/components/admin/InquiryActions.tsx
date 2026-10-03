"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteInquiry, setInquiryStatus } from "@/app/admin/actions";

export function InquiryActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [busy, start] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    start(async () => {
      const r = await fn();
      if (!r.ok) setError(r.error ?? "Failed.");
      else router.refresh();
    });

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label htmlFor={`status-${id}`} className="sr-only">
        Status
      </label>
      <select
        id={`status-${id}`}
        defaultValue={status}
        disabled={busy}
        onChange={(e) => run(() => setInquiryStatus(id, e.target.value))}
        className="bg-surface px-3 py-2 text-sm ring-[1.5px] ring-muted"
      >
        <option value="new">New</option>
        <option value="replied">Replied</option>
        <option value="archived">Archived</option>
      </select>
      {confirming ? (
        <>
          <button type="button" disabled={busy} onClick={() => run(() => deleteInquiry(id))} className="chamfer bg-ink px-3 py-2 text-sm font-bold text-paper">
            Yes, erase
          </button>
          <button type="button" onClick={() => setConfirming(false)} className="px-2 py-2 text-sm underline">
            Cancel
          </button>
        </>
      ) : (
        <button type="button" onClick={() => setConfirming(true)} className="px-2 py-2 text-sm font-bold underline underline-offset-4">
          Erase
        </button>
      )}
      {error && <span role="alert" className="text-sm font-semibold">{error}</span>}
    </div>
  );
}
