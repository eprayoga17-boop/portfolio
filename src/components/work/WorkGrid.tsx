"use client";
import { useRef, useState } from "react";
import { Flip, gsap, useGSAP } from "@/lib/gsap";
import type { CategoryId, Project } from "@/lib/types";
import { ProjectCard } from "@/components/work/ProjectCard";

type Filter = { id: CategoryId | "all"; label: string; count: number };

// Rhythm for the grid: wide/narrow, narrow/wide, then three across.
const SPANS = ["lg:col-span-7", "lg:col-span-5", "lg:col-span-5", "lg:col-span-7", "lg:col-span-4", "lg:col-span-4", "lg:col-span-4"];
const SIZES = ["lg", "md", "md", "lg", "sm", "sm", "sm"] as const;

/**
 * Filterable work index. Filtering reflows with GSAP Flip so cards slide to
 * their new spots instead of popping, and the URL keeps the filter (?c=)
 * so a filtered view can be shared.
 */
export function WorkGrid({
  projects,
  filters,
  initial,
}: {
  projects: Project[];
  filters: Filter[];
  initial: CategoryId | "all";
}) {
  const [active, setActive] = useState<CategoryId | "all">(initial);
  const grid = useRef<HTMLUListElement>(null);
  const flipState = useRef<Flip.FlipState | null>(null);

  const visible = projects.filter((p) => active === "all" || p.category === active);

  const choose = (id: CategoryId | "all") => {
    if (id === active) return;
    if (grid.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      flipState.current = Flip.getState(grid.current.querySelectorAll("[data-flip-id]"));
    }
    setActive(id);
    const url = new URL(window.location.href);
    if (id === "all") url.searchParams.delete("c");
    else url.searchParams.set("c", id);
    window.history.replaceState(window.history.state, "", url);
  };

  useGSAP(
    () => {
      if (!flipState.current) return;
      Flip.from(flipState.current, {
        duration: 0.7,
        ease: "expo.inOut",
        absolute: true,
        stagger: 0.03,
        onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.6 }),
        onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.92, duration: 0.4 }),
      });
      flipState.current = null;
    },
    { dependencies: [active], scope: grid },
  );

  return (
    <>
      <div role="group" aria-label="Filter by industry" className="mt-10 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => choose(f.id)}
            aria-pressed={active === f.id}
            className={`chamfer min-h-11 px-4 text-sm font-extrabold uppercase tracking-wide transition-colors [font-stretch:112%] ${
              active === f.id ? "bg-cobalt text-on-cobalt" : "bg-surface-2 text-ink hover:bg-orange hover:text-on-orange"
            }`}
          >
            {f.label} <span className="ml-1 font-mono font-medium opacity-70">{f.count}</span>
          </button>
        ))}
      </div>

      <p className="sr-only" aria-live="polite">
        Showing {visible.length} projects
      </p>

      <ul ref={grid} className="mt-12 grid grid-cols-1 gap-x-6 gap-y-14 md:grid-cols-2 lg:grid-cols-12">
        {visible.map((p, i) => (
          <li key={p.slug} data-flip-id={p.slug} className={SPANS[i % SPANS.length]}>
            <ProjectCard project={p} size={SIZES[i % SIZES.length]} priority={i < 2} />
          </li>
        ))}
      </ul>
      {visible.length === 0 && <p className="mt-12 text-muted">Nothing here yet. Try another filter.</p>}
    </>
  );
}
