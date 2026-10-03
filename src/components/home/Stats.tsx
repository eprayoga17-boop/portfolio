"use client";
import { useRef } from "react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { stats } from "@/lib/seed/site";

/** Numbers from the CV. They count up once, when they enter the viewport. */
export function Stats() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.utils.toArray<HTMLElement>("[data-count-to]").forEach((el) => {
          const to = Number(el.dataset.countTo);
          const obj = { v: 0 };
          gsap.to(obj, {
            v: to,
            duration: 1.6,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
            onUpdate: () => {
              el.textContent = String(Math.round(obj.v));
            },
          });
        });
        gsap.from("[data-stat]", {
          y: 40,
          opacity: 0,
          stagger: 0.08,
          scrollTrigger: { trigger: root.current, start: "top 80%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-labelledby="stats-title" className="relative py-24">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <h2 id="stats-title" className="display max-w-[16ch] text-[clamp(2.2rem,5vw,4.2rem)]">
          The short version
        </h2>
        <dl className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr]">
          {stats.map((s, i) => (
            <div
              key={s.label}
              data-stat
              className={`chamfer-lg relative flex min-h-[200px] flex-col justify-between overflow-hidden p-6 md:p-8 ${
                i === 0
                  ? "bg-cobalt text-on-cobalt lg:row-span-2"
                  : i === 3
                    ? "bg-orange text-on-orange"
                    : "bg-surface-2"
              } ${i === 4 ? "sm:col-span-2 lg:col-span-1" : ""}`}
            >
              {i === 0 && <div aria-hidden className="halftone absolute inset-0 opacity-60" />}
              <dt className="relative order-2 mt-4 max-w-[26ch] font-semibold">{s.label}</dt>
              <dd className="display relative order-1 text-[clamp(3.2rem,6vw,6rem)] leading-none">
                {"prefix" in s ? s.prefix : ""}
                <span data-count-to={s.value}>{s.value}</span>
                {s.suffix}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
