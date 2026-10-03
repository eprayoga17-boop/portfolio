import Image from "next/image";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { TransitionLink } from "@/components/motion/PageTransition";
import { CATEGORIES, type Project } from "@/lib/types";
import { imageUrl } from "@/lib/images";

/**
 * Client path: "is my kind of business in here?" Four doors into the
 * work index, each pre-filtered, each showing a real piece of work.
 */
export function Industries({ projects }: { projects: Project[] }) {
  const doors = CATEGORIES.filter((c) => c.id !== "side").map((c) => {
    const items = projects.filter((p) => p.category === c.id);
    const lead = items.find((p) => p.featured) ?? items[0];
    return { ...c, count: items.length, lead };
  });

  return (
    <section aria-labelledby="industries-title" className="py-24">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <h2 id="industries-title" className="display max-w-[18ch] text-[clamp(2.2rem,5vw,4.2rem)]">
          Find your industry
        </h2>
        <p className="mt-4 max-w-[52ch] text-lg text-muted">
          Most of my work lands in four places. Pick yours and skip straight to the relevant stuff.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-3 md:grid-cols-6 md:grid-rows-[300px_300px]">
          {doors.map((d, i) => (
            <TransitionLink
              key={d.id}
              href={`/work?c=${d.id}`}
              data-reveal="up"
              className={`group chamfer-lg relative flex min-h-[260px] flex-col justify-end overflow-hidden bg-ink p-6 text-paper md:p-8 ${
                ["md:col-span-4", "md:col-span-2", "md:col-span-2", "md:col-span-4"][i]
              }`}
            >
              {d.lead?.cover && (
                <Image
                  src={imageUrl(d.lead.cover.path)}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 66vw, 100vw"
                  className="object-cover opacity-55 transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-105"
                />
              )}
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#0a0e1f] via-[#0a0e1f]/50 to-transparent" />
              <div
                aria-hidden
                className="absolute inset-0 origin-bottom-left scale-y-0 bg-cobalt/85 halftone transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-y-100"
                style={{ clipPath: "polygon(0 0, 100% 0, 85% 100%, 0 100%)" }}
              />
              <div className="relative flex items-end justify-between gap-4 text-[#eef2ff]">
                <div>
                  <p className="font-mono text-sm opacity-80">{d.count} projects</p>
                  <h3 className="display mt-2 text-[clamp(1.8rem,3.2vw,3rem)]">{d.label}</h3>
                </div>
                <ArrowUpRight
                  size={36}
                  weight="bold"
                  aria-hidden
                  className="shrink-0 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-orange"
                />
              </div>
            </TransitionLink>
          ))}
        </div>
      </div>
    </section>
  );
}
