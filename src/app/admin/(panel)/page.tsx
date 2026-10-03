import Image from "next/image";
import Link from "next/link";
import { Plus } from "@phosphor-icons/react/dist/ssr";
import { adminListProjects } from "@/lib/data/admin";
import { imageUrl } from "@/lib/images";
import { categoryLabel } from "@/lib/types";

export default async function AdminProjectsPage({ searchParams }: PageProps<"/admin">) {
  const { deleted } = await searchParams;
  const projects = await adminListProjects();
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-4xl">Projects</h1>
          <p className="mt-2 text-muted">
            {projects.length} total, {projects.filter((p) => p.published).length} published. Lower sort number shows
            first.
          </p>
        </div>
        <Link href="/admin/projects/new" className="btn btn-primary chamfer">
          <Plus size={18} weight="bold" aria-hidden /> New project
        </Link>
      </div>
      {deleted && (
        <p role="status" className="chamfer mt-6 bg-surface-2 px-4 py-3 font-semibold">
          Project deleted.
        </p>
      )}
      {projects.length === 0 ? (
        <div className="chamfer-lg mt-10 bg-surface-2 p-10 text-center">
          <p className="display text-2xl">No projects yet</p>
          <p className="mt-2 text-muted">
            Add your first one, or run <code className="font-mono">supabase/seed.sql</code> to import the portfolio.
          </p>
        </div>
      ) : (
        <ul className="mt-10 divide-y divide-line">
          {projects.map((p) => (
            <li key={p.id}>
              <Link
                href={`/admin/projects/${p.id}`}
                className="grid grid-cols-[72px_1fr_auto] items-center gap-4 py-3 hover:bg-surface-2 md:grid-cols-[96px_1fr_160px_120px]"
              >
                <div className="chamfer relative aspect-[4/3] overflow-hidden bg-surface-2">
                  {p.cover && <Image src={imageUrl(p.cover.path)} alt="" fill sizes="96px" className="object-cover" />}
                </div>
                <div>
                  <p className="font-extrabold">{p.title}</p>
                  <p className="text-sm text-muted">/{p.slug}</p>
                </div>
                <p className="hidden text-sm md:block">{categoryLabel(p.category)}</p>
                <div className="flex flex-col items-end gap-1 text-xs font-bold uppercase">
                  <span className={p.published ? "text-cobalt-text" : "text-muted"}>
                    {p.published ? "Published" : "Draft"}
                  </span>
                  {p.featured && <span className="bg-orange px-1.5 text-on-orange">Featured</span>}
                  <span className="font-mono text-muted">#{p.sortOrder}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
