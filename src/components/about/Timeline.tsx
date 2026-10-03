"use client";
import { useRef } from "react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import type { Experience } from "@/lib/seed/site";

const FLAG: Record<Experience["country"], string> = {
  ID: "Indonesia",
  SG: "Singapore",
  MY: "Malaysia",
  AU: "Australia",
};

/**
 * Career as a horizontal run (desktop): vertical scroll pans the track,
 * so seven years read left to right like a level map. Stacks vertically on
 * small screens and under reduced motion.
 */
export function Timeline({ items }: { items: Experience[] }) {
  const wrap = useRef<HTMLElement>(null);
  const track = useRef<HTMLOListElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`${MOTION_OK} and (min-width: 1024px)`, () => {
        const distance = () => track.current!.scrollWidth - window.innerWidth + 64;
        gsap.to(track.current, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: wrap.current,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
        gsap.to("[data-progress]", {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { trigger: wrap.current, start: "top top", end: () => `+=${distance()}`, scrub: true },
        });
      });
      return () => mm.revert();
    },
    { scope: wrap },
  );

  return (
    <section ref={wrap} aria-labelledby="timeline-title" className="relative overflow-hidden py-20 lg:flex lg:min-h-[100dvh] lg:flex-col lg:justify-center">
      <div className="mx-auto w-full max-w-[1400px] px-4 md:px-8">
        <h2 id="timeline-title" className="display text-[clamp(2.2rem,5vw,4.2rem)]">
          Where I&apos;ve been
        </h2>
        <div className="mt-4 hidden h-1.5 w-full bg-surface-2 lg:block" aria-hidden>
          <div data-progress className="h-full origin-left scale-x-0 bg-orange" />
        </div>
      </div>
      <ol
        ref={track}
        className="mt-10 flex flex-col gap-4 px-4 md:px-8 lg:w-max lg:flex-row lg:gap-5 lg:pl-[max(2rem,calc((100vw-1400px)/2+2rem))]"
      >
        {items.map((e, i) => (
          <li
            key={e.company + e.period}
            className={`chamfer-lg relative flex shrink-0 flex-col justify-between p-6 md:p-8 lg:h-[440px] lg:w-[380px] ${
              i === 0 ? "bg-cobalt text-on-cobalt" : "bg-surface-2"
            }`}
          >
            {i === 0 && <div aria-hidden className="halftone absolute inset-0 opacity-50" />}
            <div className="relative">
              <p className="font-mono text-sm opacity-80">{e.period}</p>
              <h3 className="display mt-4 text-[1.9rem] leading-[1.02]">{e.company}</h3>
              <p className="mt-2 font-bold">{e.role}</p>
              <p className="mt-1 text-sm opacity-80">
                {e.type}. {e.location}
                {e.location.includes(FLAG[e.country]) ? "" : `, ${FLAG[e.country]}`}
              </p>
            </div>
            <p className="relative mt-6 leading-relaxed opacity-90">{e.note}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
