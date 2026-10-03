"use client";
import { usePathname } from "next/navigation";
import { gsap, ScrollTrigger, useGSAP, MOTION_OK } from "@/lib/gsap";

/**
 * Site-wide scroll reveals for anything marked with data-reveal.
 *   data-reveal="up"    rise + fade (default)
 *   data-reveal="clip"  diagonal clip wipe, for images
 * Batched so a row of cards enters as a staggered group.
 */
export function RevealOnScroll() {
  const pathname = usePathname();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const ups = gsap.utils.toArray<HTMLElement>('[data-reveal="up"], [data-reveal=""]');
        const clips = gsap.utils.toArray<HTMLElement>('[data-reveal="clip"]');
        if (ups.length) gsap.set(ups, { y: 40, opacity: 0 });
        if (clips.length) gsap.set(clips, { opacity: 1, clipPath: "polygon(0 0, 0 0, -30% 100%, -30% 100%)" });

        if (ups.length) ScrollTrigger.batch(ups, {
          start: "top 88%",
          once: true,
          onEnter: (els) => gsap.to(els, { y: 0, opacity: 1, stagger: 0.08, duration: 0.9 }),
        });
        if (clips.length) ScrollTrigger.batch(clips, {
          start: "top 85%",
          once: true,
          onEnter: (els) =>
            gsap.to(els, {
              clipPath: "polygon(0 0, 130% 0, 100% 100%, -30% 100%)",
              stagger: 0.1,
              duration: 1.1,
              ease: "expo.inOut",
            }),
        });
      });
      return () => mm.revert();
    },
    { dependencies: [pathname], revertOnUpdate: true },
  );

  return null;
}
