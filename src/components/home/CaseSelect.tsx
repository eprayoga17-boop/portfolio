"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "@phosphor-icons/react";
import { TransitionLink } from "@/components/motion/PageTransition";
import { gsap, SplitText, useGSAP, MOTION_OK } from "@/lib/gsap";

export type CaseCard = {
  slug: string;
  title: string;
  client: string;
  category: string;
  summary: string;
  services: string[];
  accent: string;
  image: { src: string; alt: string; width: number; height: number } | null;
};

const SHOW = "polygon(0 0, 100% 0, 100% 100%, 0 100%)";
const HIDE_RIGHT = "polygon(100% 0, 115% 0, 100% 100%, 85% 100%)";
const HIDE_LEFT = "polygon(-15% 0, 0 0, 15% 100%, 0 100%)";

/**
 * "Character select" for featured work, after the agent picker on the ZZZ site.
 * Big outlined name, slanted art frame, a thumbnail roster underneath.
 */
export function CaseSelect({ cases }: { cases: CaseCard[] }) {
  const [index, setIndex] = useState(0);
  const prev = useRef(0);
  const dir = useRef<1 | -1>(1);
  const root = useRef<HTMLElement>(null);
  const pointerStart = useRef<number | null>(null);
  const current = cases[index];

  const go = (next: number) => {
    const n = (next + cases.length) % cases.length;
    if (n === index) return;
    dir.current = next > index || (index === cases.length - 1 && n === 0) ? 1 : -1;
    prev.current = index;
    setIndex(n);
  };

  useGSAP(
    () => {
      const frames = gsap.utils.toArray<HTMLElement>("[data-frame]");
      frames.forEach((f, i) => gsap.set(f, { zIndex: i === index ? 2 : i === prev.current ? 1 : 0 }));

      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        if (prev.current === index) {
          frames.forEach((f, i) => gsap.set(f, { clipPath: i === index ? SHOW : HIDE_RIGHT }));
          return;
        }
        const incoming = frames[index];
        gsap.fromTo(
          incoming,
          { clipPath: dir.current === 1 ? HIDE_RIGHT : HIDE_LEFT },
          { clipPath: SHOW, duration: 0.85, ease: "expo.inOut" },
        );
        gsap.fromTo(incoming.querySelector("img"), { scale: 1.18 }, { scale: 1, duration: 1.2, ease: "expo.out" });

        const split = SplitText.create("[data-case-title]", { type: "chars", mask: "chars" });
        gsap.from(split.chars, { yPercent: 110 * dir.current, stagger: 0.025, duration: 0.7, delay: 0.15 });
        gsap.from("[data-case-meta]", { y: 18, opacity: 0, stagger: 0.06, duration: 0.6, delay: 0.25 });
        return () => split.revert();
      });
      // Reduced motion: hard cut.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        frames.forEach((f, i) => gsap.set(f, { clipPath: i === index ? SHOW : HIDE_RIGHT }));
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [index], revertOnUpdate: false },
  );

  if (!current) return null;

  return (
    <section
      ref={root}
      className="relative overflow-hidden py-24"
      aria-roledescription="carousel"
      aria-label="Featured case studies"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(index + 1);
        if (e.key === "ArrowLeft") go(index - 1);
      }}
    >
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="label text-cobalt-text">Case files</p>
            <h2 className="display mt-3 text-[clamp(2.4rem,6vw,5rem)]">Pick a brand</h2>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => go(index - 1)}
              className="btn btn-ghost chamfer !px-0 w-12 justify-center"
              aria-label="Previous case"
            >
              <ArrowLeft size={20} weight="bold" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              className="btn btn-primary chamfer !px-0 w-12 justify-center"
              aria-label="Next case"
            >
              <ArrowRight size={20} weight="bold" aria-hidden />
            </button>
          </div>
        </div>

        <div className="grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative z-10 order-2 lg:order-1" aria-live="polite">
            <p data-case-meta className="label text-muted">
              {current.category}
            </p>
            <h3
              key={current.slug}
              data-case-title
              className="display mt-3 pb-2 text-[clamp(2.6rem,6.5vw,6rem)] leading-[1.02]"
              style={{ color: "var(--cobalt-text)" }}
            >
              {current.title}
            </h3>
            <p data-case-meta className="mt-5 max-w-[46ch] text-lg leading-relaxed text-muted">
              {current.summary}
            </p>
            <ul data-case-meta className="mt-5 flex flex-wrap gap-2">
              {current.services.slice(0, 4).map((s) => (
                <li key={s} className="chamfer bg-surface-2 px-3 py-1.5 text-sm font-semibold">
                  {s}
                </li>
              ))}
            </ul>
            <TransitionLink
              data-case-meta
              href={`/work/${current.slug}`}
              className="btn btn-primary chamfer mt-8"
            >
              Open case <ArrowUpRight size={18} weight="bold" aria-hidden />
            </TransitionLink>
          </div>

          <div
            className="relative order-1 aspect-[16/10] w-full touch-pan-y select-none lg:order-2"
            onPointerDown={(e) => (pointerStart.current = e.clientX)}
            onPointerUp={(e) => {
              if (pointerStart.current === null) return;
              const dx = e.clientX - pointerStart.current;
              pointerStart.current = null;
              if (Math.abs(dx) > 50) go(dx < 0 ? index + 1 : index - 1);
            }}
          >
            <div
              aria-hidden
              className="absolute -inset-3 translate-x-4 translate-y-4 chamfer-lg"
              style={{ background: current.accent, transition: "background-color .6s" }}
            />
            <div className="chamfer-lg absolute inset-0 overflow-hidden bg-surface-2">
              {cases.map((c, i) => (
                <div
                  key={c.slug}
                  data-frame
                  className="absolute inset-0"
                  style={{ clipPath: i === 0 ? SHOW : HIDE_RIGHT }}
                  aria-hidden={i !== index}
                >
                  {c.image && (
                    <Image
                      src={c.image.src}
                      alt={c.image.alt}
                      fill
                      sizes="(min-width: 1024px) 760px, 100vw"
                      className="object-cover"
                      priority={i === 0}
                      draggable={false}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <ol className="mt-12 grid grid-cols-4 gap-2 sm:grid-cols-8" aria-label="Choose a case">
          {cases.map((c, i) => (
            <li key={c.slug}>
              <button
                type="button"
                onClick={() => go(i)}
                aria-current={i === index ? "true" : undefined}
                aria-label={`Show ${c.title}`}
                className={`group relative block aspect-square w-full overflow-hidden chamfer transition-transform duration-300 ${
                  i === index ? "-translate-y-1 ring-0" : "opacity-60 hover:opacity-100"
                }`}
              >
                {c.image && (
                  <Image src={c.image.src} alt="" fill sizes="120px" className="object-cover" draggable={false} />
                )}
                <span
                  aria-hidden
                  className={`absolute inset-x-0 bottom-0 h-1.5 bg-orange transition-transform duration-300 ${
                    i === index ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </button>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
