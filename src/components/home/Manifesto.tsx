"use client";
import { useRef } from "react";
import { gsap, SplitText, useGSAP, MOTION_OK } from "@/lib/gsap";

/**
 * Pinned statement. Words light up as you scroll, so the motto is read at
 * the pace of the scroll instead of skimmed.
 */
export function Manifesto() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const split = SplitText.create("[data-words]", { type: "words" });
        gsap.set(split.words, { opacity: 0.14 });
        const tl = gsap.timeline({
          scrollTrigger: { trigger: root.current, start: "top top", end: "+=140%", pin: true, scrub: 0.5 },
        });
        tl.to(split.words, { opacity: 1, stagger: 0.1, ease: "none" })
          .fromTo("[data-motto]", { scale: 0.6, rotate: -14, opacity: 0 }, { scale: 1, rotate: -6, opacity: 1, ease: "back.out(2)" }, "<40%");
        return () => split.revert();
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative flex min-h-[100dvh] items-center overflow-hidden" aria-labelledby="manifesto-title">
      <div className="mx-auto max-w-[1100px] px-4 py-24 md:px-8">
        <h2 id="manifesto-title" className="sr-only">
          What branding means to me
        </h2>
        <p
          data-words
          className="text-[clamp(1.6rem,3.6vw,3.2rem)] font-extrabold leading-[1.15] tracking-tight [font-stretch:108%]"
        >
          A brand is more than a logo and a colour palette. It&apos;s how a business says hello, and whether you
          remember it after you scroll past. I&apos;ve handled 50+ brands, and the hard part never changes: posting a
          lot is easy, posting well every single day is the job.
        </p>
        <p
          data-motto
          className="script mt-12 block w-fit -rotate-6 text-[clamp(3rem,7vw,6rem)] text-orange-text"
        >
          Berkarya untuk bercanda.
        </p>
        <p className="mt-10 max-w-[48ch] text-muted">
          My motto. Roughly: make things, and have fun making them. That&apos;s also how I like to work.
        </p>
      </div>
    </section>
  );
}
