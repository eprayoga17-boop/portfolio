import Link from "next/link";
import { signOut } from "@/app/admin/auth-actions";
import { Wordmark } from "@/components/site/Wordmark";
import { requireAdminPage } from "@/lib/auth";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "Projects" },
  { href: "/admin/inquiries", label: "Inquiries" },
  { href: "/admin/audit", label: "Audit log" },
];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdminPage();
  return (
    <div className="mx-auto max-w-[1200px] px-4 pb-24 md:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line py-5">
        <div className="flex items-center gap-6">
          <Link href="/admin" aria-label="Admin home">
            <Wordmark />
          </Link>
          <nav aria-label="Admin" className="flex flex-wrap gap-1">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="chamfer px-3 py-2 text-sm font-bold uppercase hover:bg-surface-2">
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted">{admin.email}</span>
          <Link href="/" className="font-bold underline underline-offset-4" target="_blank" rel="noopener noreferrer">
            View site
          </Link>
          <form action={signOut}>
            <button className="btn btn-ghost chamfer !min-h-9 !px-3 !text-xs">Sign out</button>
          </form>
        </div>
      </header>
      <main className="pt-10">{children}</main>
    </div>
  );
}
