"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { List, X } from "@phosphor-icons/react";
import { TransitionLink } from "@/components/motion/PageTransition";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { Wordmark } from "@/components/site/Wordmark";
import { gsap, useGSAP } from "@/lib/gsap";
import { lenisStore } from "@/lib/lenis-store";
import type Lenis from "lenis";

const NAV = [
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/side-quests", label: "Side quests" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menu = useRef<HTMLDivElement>(null);
  const toggleBtn = useRef<HTMLButtonElement>(null);

  // Hide on scroll down, show on scroll up. Uses Lenis' own scroll event, not a window listener.
  useEffect(() => {
    let last = 0;
    let bound: Lenis | null = null;
    const onScroll = ({ scroll }: { scroll: number }) => {
      setHidden(scroll > 120 && scroll > last);
      setScrolled(scroll > 40);
      last = scroll;
    };
    const unsubscribe = lenisStore.subscribe((lenis) => {
      bound?.off("scroll", onScroll);
      bound = lenis;
      lenis?.on("scroll", onScroll);
    });
    return () => {
      unsubscribe();
      bound?.off("scroll", onScroll);
    };
  }, []);

  // Close the menu on navigation (render-time state adjustment, no effect needed).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    const lenis = lenisStore.get();
    if (open) lenis?.stop();
    else lenis?.start();
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleBtn.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    menu.current?.querySelector<HTMLElement>("a")?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useGSAP(
    () => {
      if (!open || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.fromTo(
        menu.current,
        { clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)" },
        { clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)", duration: 0.6, ease: "expo.inOut" },
      );
      gsap.from("[data-menu-item]", { yPercent: 110, skewY: 6, stagger: 0.06, duration: 0.8, delay: 0.2 });
    },
    { dependencies: [open], scope: menu },
  );

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-orange focus:px-4 focus:py-2 focus:text-on-orange"
      >
        Skip to content
      </a>
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] ${
          hidden && !open ? "-translate-y-full" : "translate-y-0"
        } ${scrolled ? "bg-paper/85 backdrop-blur-md shadow-[0_1px_0_var(--line)]" : ""}`}
      >
        <div className="mx-auto flex h-[68px] max-w-[1400px] items-center justify-between gap-6 px-4 md:px-8">
          <TransitionLink href="/" aria-label="Erik Prayoga, home" className="shrink-0">
            <Wordmark />
          </TransitionLink>

          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <TransitionLink
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className="group relative px-4 py-2 text-sm font-extrabold uppercase tracking-wide [font-stretch:112%]"
              >
                <span className="relative z-10">{item.label}</span>
                <span
                  aria-hidden
                  className={`absolute inset-x-3 bottom-1 h-[3px] origin-left bg-orange transition-transform duration-300 ${
                    isActive(item.href) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </TransitionLink>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            <TransitionLink href="/contact" className="btn chamfer hidden bg-orange text-on-orange hover:bg-ink hover:text-paper md:inline-flex">
              Let&apos;s talk
            </TransitionLink>
            <button
              ref={toggleBtn}
              type="button"
              className="grid h-11 w-11 place-items-center md:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <X size={26} weight="bold" /> : <List size={26} weight="bold" />}
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div
          ref={menu}
          id="mobile-menu"
          className="fixed inset-0 z-50 flex flex-col justify-between bg-cobalt halftone px-4 pb-10 pt-24 text-on-cobalt md:hidden"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute right-4 top-3 grid h-11 w-11 place-items-center"
            aria-label="Close menu"
          >
            <X size={26} weight="bold" />
          </button>
          <nav aria-label="Mobile" className="flex flex-col gap-2">
            {[...NAV, { href: "/contact", label: "Let's talk" }].map((item) => (
              <div key={item.href} className="overflow-hidden">
                <TransitionLink
                  data-menu-item
                  href={item.href}
                  className="display block py-1 text-[13vw] hover:text-orange"
                >
                  {item.label}
                </TransitionLink>
              </div>
            ))}
          </nav>
          <p className="script text-4xl text-orange">Berkarya untuk bercanda</p>
        </div>
      )}
    </>
  );
}
