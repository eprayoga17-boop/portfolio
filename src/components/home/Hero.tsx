"use client";
import { useRef } from "react";
import Image from "next/image";
import { ArrowRight } from "@phosphor-icons/react";
import { TransitionLink } from "@/components/motion/PageTransition";
import { gsap, ScrollTrigger, SplitText, useGSAP, MOTION_OK } from "@/lib/gsap";
import { onBootReady } from "@/lib/boot";

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const split = SplitText.create("[data-split]", { type: "chars", mask: "chars" });
        gsap.set("[data-intro]", { opacity: 1 });
        gsap.set(split.chars, { yPercent: 115, skewX: -12 });
        gsap.set("[data-ribbon]", { yPercent: -160, rotate: -18, opacity: 0 });
        gsap.set("[data-name]", { clipPath: "inset(0 100% 0 0)" });
        gsap.set("[data-avatar]", { xPercent: 30, opacity: 0 });
        gsap.set("[data-halo]", { scale: 0, rotate: -30 });
        gsap.set("[data-slab]", { clipPath: "polygon(100% 0, 100% 0, 100% 100%, 100% 100%)" });
        gsap.set("[data-fade]", { y: 24, opacity: 0 });

        const intro = gsap.timeline({ paused: true });
        intro
          .to("[data-slab]", { clipPath: "polygon(22% 0, 100% 0, 100% 100%, 0% 100%)", duration: 1, ease: "expo.inOut" })
          .to(split.chars, { yPercent: 0, skewX: 0, stagger: 0.035, duration: 1 }, 0.15)
          .to("[data-ribbon]", { yPercent: 0, rotate: (i) => (i === 0 ? -8 : -4), opacity: 1, stagger: 0.1, ease: "back.out(2.2)" }, 0.35)
          .to("[data-name]", { clipPath: "inset(0 0% 0 0)", duration: 0.9, ease: "power3.inOut" }, 0.7)
          .to("[data-avatar]", { xPercent: 0, opacity: 1, duration: 1.2 }, 0.3)
          .to("[data-halo]", { scale: 1, rotate: -8, duration: 0.8, ease: "back.out(3)" }, 1.05)
          .to("[data-fade]", { y: 0, opacity: 1, stagger: 0.08 }, 0.9);

        const stop = onBootReady(() => intro.play());

        // Scroll-out: the lockup splits apart while the avatar drifts up.
        // It reads as a handoff into the next section rather than decoration.
        gsap
          .timeline({
            scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: 0.6 },
          })
          .to("[data-port]", { xPercent: -14 }, 0)
          .to("[data-folio]", { xPercent: 10 }, 0)
          .to("[data-avatar]", { yPercent: -12 }, 0)
          .to("[data-slab]", { yPercent: 18 }, 0);

        return () => {
          stop();
          split.revert();
        };
      });
      // Images loading late can shift layout; refresh once they're in.
      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener("load", refresh, { once: true });
      return () => {
        window.removeEventListener("load", refresh);
        mm.revert();
      };
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="relative isolate min-h-[100dvh] overflow-hidden pt-24"
      aria-labelledby="hero-title"
    >
      {/* Diagonal slab behind the avatar, like the ZZZ splash panels */}
      <div
        data-slab
        aria-hidden
        className="absolute bottom-0 right-0 -z-10 h-[44%] w-full bg-cobalt halftone md:top-0 md:h-full md:w-[52%]"
        style={{ clipPath: "polygon(22% 0, 100% 0, 100% 100%, 0% 100%)" }}
      />

      <div className="mx-auto grid min-h-[calc(100dvh-6rem)] max-w-[1400px] grid-cols-1 items-center gap-8 px-4 md:grid-cols-[1.15fr_1fr] md:px-8">
        <div className="relative z-10 py-10 md:py-0">
          <div className="mb-6 flex flex-wrap items-center gap-2" data-intro>
            <span data-ribbon className="ribbon -rotate-[8deg] bg-orange text-[0.8rem] text-on-orange">
              Berkarya
            </span>
            <span data-ribbon className="ribbon -rotate-[4deg] bg-cobalt text-[0.8rem] text-on-cobalt">
              untuk bercanda
            </span>
          </div>

          <h1 id="hero-title" className="relative" data-intro>
            <span className="sr-only">Erik Prayoga, brand and social media designer. Portfolio.</span>
            <span aria-hidden className="block">
              <span
                data-port
                data-split
                className="display block whitespace-nowrap text-[clamp(4rem,11.5vw,10.5rem)] text-cobalt-text"
              >
                Port
              </span>
              <span
                data-folio
                data-split
                className="display block whitespace-nowrap pl-[0.3em] text-[clamp(4rem,11.5vw,10.5rem)] text-cobalt-text"
              >
                folio
              </span>
              <span
                data-name
                className="script absolute left-[0.3em] top-[38%] -rotate-[8deg] whitespace-nowrap text-[clamp(3rem,8.5vw,7rem)] text-orange-text [text-shadow:3px_3px_0_var(--paper)]"
              >
                Erik Prayoga
              </span>
            </span>
          </h1>

          <p data-fade data-intro className="mt-8 max-w-[34ch] text-lg leading-relaxed text-muted md:text-xl">
            Brand and social media designer from Surabaya. Seven years, 50+ brands, clients in four countries.
          </p>

          <div data-fade data-intro className="mt-8 flex flex-wrap gap-3">
            <TransitionLink href="/work" className="btn btn-primary chamfer">
              See work <ArrowRight size={18} weight="bold" aria-hidden />
            </TransitionLink>
            <TransitionLink href="/contact" className="btn btn-ghost chamfer">
              Let&apos;s talk
            </TransitionLink>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[520px] self-end md:self-center" data-avatar data-intro>
          <Image
            src="/brand/avatar.webp"
            alt="Illustrated portrait of Erik: blue hair, round glasses, a wink, arms crossed in a pink and yellow shirt"
            width={890}
            height={1200}
            priority
            sizes="(min-width: 768px) 520px, 80vw"
            className="relative h-auto w-full drop-shadow-[0_24px_40px_rgba(0,20,80,0.35)]"
          />
          <span
            data-halo
            aria-hidden
            className="script absolute bottom-[18%] right-[2%] -rotate-[8deg] text-[clamp(4rem,9vw,7.5rem)] text-[#f8f9ff] [text-shadow:4px_4px_0_var(--orange)]"
          >
            Halo!
          </span>
        </div>
      </div>
    </section>
  );
}
