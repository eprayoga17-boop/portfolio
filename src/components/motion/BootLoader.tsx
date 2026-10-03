"use client";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { lenisStore } from "@/lib/lenis-store";

import { BOOT_DONE } from "@/lib/boot";

/**
 * First-visit loader, styled like a channel tuning in.
 * Only shown when the inline boot script set html[data-boot="1"]
 * (first visit this session, motion allowed, not /admin).
 */
export function BootLoader() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const html = document.documentElement;
      const finish = () => {
        html.removeAttribute("data-boot");
        try {
          sessionStorage.setItem("booted", "1");
        } catch {}
        lenisStore.get()?.start();
        window.dispatchEvent(new Event(BOOT_DONE));
      };

      if (html.dataset.boot !== "1") return;

      const counter = { v: 0 };
      const num = root.current!.querySelector<HTMLElement>("[data-count]")!;
      const tl = gsap.timeline({ onComplete: finish });
      tl.from("[data-tag]", { yPercent: 140, rotate: -12, stagger: 0.12, duration: 0.7, ease: "back.out(2)" })
        .to(counter, {
          v: 100,
          duration: 1.1,
          ease: "power2.inOut",
          onUpdate: () => {
            num.textContent = String(Math.round(counter.v)).padStart(3, "0");
          },
        }, 0.1)
        .to("[data-scan]", { opacity: 0.35, duration: 0.08, repeat: 5, yoyo: true }, 0.9)
        .to("[data-panel='a']", { clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)", duration: 0.75, ease: "expo.inOut" }, 1.35)
        .to("[data-panel='b']", { clipPath: "polygon(100% 0, 100% 0, 100% 100%, 100% 100%)", duration: 0.75, ease: "expo.inOut" }, 1.45)
        .to(root.current, { autoAlpha: 0, duration: 0.2 }, ">-0.1");
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      className="boot fixed inset-0 z-[90] items-center justify-center overflow-hidden"
      aria-hidden="true"
    >
      <div
        data-panel="b"
        className="absolute inset-0 bg-orange"
        style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
      />
      <div
        data-panel="a"
        className="absolute inset-0 bg-cobalt halftone"
        style={{ clipPath: "polygon(0 0, 100% 0, 85% 100%, 0 100%)" }}
      />
      <div
        data-scan
        className="pointer-events-none absolute inset-0 opacity-0"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,.18) 0 2px, transparent 2px 4px)",
        }}
      />
      <div className="relative flex flex-col items-start gap-3 text-on-cobalt">
        <span data-tag className="ribbon bg-orange text-on-orange -rotate-6 text-sm">Berkarya</span>
        <span data-tag className="ribbon bg-paper text-cobalt -rotate-3 text-sm">untuk bercanda</span>
        <span className="mt-6 font-mono text-6xl tabular-nums md:text-8xl" data-count>
          000
        </span>
        <span className="label opacity-80">Tuning in</span>
      </div>
    </div>
  );
}
