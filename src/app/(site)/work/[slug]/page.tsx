import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { TransitionLink } from "@/components/motion/PageTransition";
import { getProjectBySlug } from "@/lib/data/projects";
import { imageUrl } from "@/lib/images";
import { categoryLabel } from "@/lib/types";

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const found = await getProjectBySlug(slug);
  if (!found) return { title: "Not found" };
  const { project } = found;
  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: project.cover
      ? { images: [{ url: imageUrl(project.cover.path), width: project.cover.width, height: project.cover.height }] }
      : undefined,
  };
}

export default async function CasePage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const found = await getProjectBySlug(slug);
  if (!found) notFound();
  const { project, next } = found;
  const backHref = project.category === "side" ? "/side-quests" : "/work";

  const facts = [
    { k: "Client", v: project.client },
    { k: "Role", v: project.role },
    { k: "Region", v: project.region },
    { k: "Year", v: project.year?.toString() ?? null },
  ].filter((f): f is { k: string; v: string } => Boolean(f.v));

  return (
    <article>
      <header className="mx-auto max-w-[1400px] px-4 pt-32 md:px-8">
        <TransitionLink
          href={backHref}
          className="inline-flex min-h-11 items-center gap-2 text-sm font-bold uppercase tracking-wide hover:text-orange"
        >
          <ArrowLeft size={18} weight="bold" aria-hidden /> {project.category === "side" ? "Side quests" : "All work"}
        </TransitionLink>
        <p className="label mt-8 text-cobalt-text">{categoryLabel(project.category)}</p>
        <h1 className="display mt-3 max-w-[14ch] pb-2 text-[clamp(3rem,8.5vw,8rem)] leading-[0.95]">{project.title}</h1>
        <p className="mt-6 max-w-[52ch] text-xl leading-relaxed text-muted">{project.summary}</p>

        <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-line pt-6 md:grid-cols-4">
          {facts.map((f) => (
            <div key={f.k}>
              <dt className="label text-muted">{f.k}</dt>
              <dd className="mt-1.5 font-semibold">{f.v}</dd>
            </div>
          ))}
        </dl>
      </header>

      {project.cover && (
        <div className="mx-auto mt-12 max-w-[1600px] px-4 md:px-8">
          <div className="relative">
            <div
              aria-hidden
              className="chamfer-lg absolute inset-0 translate-x-3 translate-y-3 md:translate-x-5 md:translate-y-5"
              style={{ background: project.accent }}
            />
            <div className="chamfer-lg relative overflow-hidden bg-surface-2">
              <Image
                src={imageUrl(project.cover.path)}
                alt={project.cover.alt}
                width={project.cover.width}
                height={project.cover.height}
                priority
                sizes="(min-width: 1600px) 1536px, 100vw"
                className="h-auto max-h-[85dvh] w-full object-cover"
              />
            </div>
          </div>
        </div>
      )}

      <section className="mx-auto mt-20 grid max-w-[1400px] gap-10 px-4 md:grid-cols-[0.8fr_1.2fr] md:px-8">
        <div className="md:sticky md:top-28 md:self-start">
          <h2 className="display text-2xl">What I did</h2>
          <ul className="mt-5 flex flex-wrap gap-2">
            {project.services.map((s) => (
              <li key={s} className="chamfer bg-surface-2 px-3 py-1.5 text-sm font-semibold">
                {s}
              </li>
            ))}
          </ul>
          {project.externalUrl && (
            <a
              href={project.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary chamfer mt-8"
            >
              Open the reel <ArrowUpRight size={18} weight="bold" aria-hidden />
            </a>
          )}
        </div>
        <div className="max-w-[62ch] space-y-6 text-lg leading-relaxed" data-reveal="up">
          {project.body.split(/\n{2,}/).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </section>

      {project.images.length > 0 && (
        <section aria-label="Project images" className="mx-auto mt-24 flex max-w-[1600px] flex-col gap-8 px-4 md:px-8">
          {project.images.map((img) => (
            <figure key={img.id} data-reveal="clip" className="chamfer-lg overflow-hidden bg-surface-2">
              <Image
                src={imageUrl(img.path)}
                alt={img.alt}
                width={img.width}
                height={img.height}
                sizes="(min-width: 1600px) 1536px, 100vw"
                className="h-auto w-full"
              />
            </figure>
          ))}
        </section>
      )}

      {next && (
        <TransitionLink
          href={`/work/${next.slug}`}
          className="group relative mx-auto mt-28 block max-w-[1400px] overflow-hidden px-4 md:px-8"
        >
          <div className="chamfer-lg relative overflow-hidden bg-ink px-6 py-14 text-paper md:px-12 md:py-20">
            <div
              aria-hidden
              className="absolute inset-0 origin-left scale-x-0 transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-x-100"
              style={{ background: next.accent }}
            />
            <p className="label relative opacity-80">Next case</p>
            <p className="display relative mt-3 flex items-center justify-between gap-6 text-[clamp(2.4rem,7vw,6.5rem)] leading-[0.95]">
              <span>{next.title}</span>
              <ArrowUpRight size={64} weight="bold" aria-hidden className="shrink-0 transition-transform duration-500 group-hover:rotate-45" />
            </p>
          </div>
        </TransitionLink>
      )}
    </article>
  );
}
