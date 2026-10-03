"use client";
import { createContext, useCallback, useContext, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { lenisStore } from "@/lib/lenis-store";

type Ctx = { navigate: (href: string) => void };
const TransitionContext = createContext<Ctx>({ navigate: () => {} });

const HIDDEN_A = "polygon(0 0, 0 0, -20% 100%, -20% 100%)";
const FULL = "polygon(0 0, 120% 0, 100% 100%, -20% 100%)";
const GONE_A = "polygon(120% 0, 120% 0, 100% 100%, 100% 100%)";

/**
 * Route change as a diagonal two-panel slash (cobalt, then orange), in the
 * spirit of the ZZZ site's hard cuts. Covers, navigates, then uncovers once
 * the new pathname has rendered. Plain navigation under reduced motion.
 */
export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const covering = useRef(false);
  const fallback = useRef<number | null>(null);
  const a = useRef<HTMLDivElement>(null);
  const b = useRef<HTMLDivElement>(null);

  const reveal = useCallback(() => {
    if (fallback.current) window.clearTimeout(fallback.current);
    const lenis = lenisStore.get();
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo(0, 0);
    ScrollTrigger.refresh();
    gsap
      .timeline({
        onComplete: () => {
          covering.current = false;
          gsap.set([a.current, b.current], { clipPath: HIDDEN_A, visibility: "hidden" });
        },
      })
      .to(b.current, { clipPath: GONE_A, duration: 0.55, ease: "expo.inOut" }, 0.05)
      .to(a.current, { clipPath: GONE_A, duration: 0.55, ease: "expo.inOut" }, 0.12);
  }, []);

  const navigate = useCallback(
    (href: string) => {
      const url = new URL(href, window.location.href);
      if (url.pathname === window.location.pathname) {
        // Same page (filters, hashes): no curtain, just update the URL.
        if (url.search !== window.location.search || url.hash) router.push(href, { scroll: false });
        return;
      }
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || covering.current) {
        router.push(href);
        return;
      }
      covering.current = true;
      gsap.set([a.current, b.current], { visibility: "visible", clipPath: HIDDEN_A });
      gsap
        .timeline({
          onComplete: () => {
            router.push(href);
            // If the route never changes (error, same page), uncover anyway.
            fallback.current = window.setTimeout(reveal, 2500);
          },
        })
        .to(a.current, { clipPath: FULL, duration: 0.5, ease: "expo.inOut" }, 0)
        .to(b.current, { clipPath: FULL, duration: 0.5, ease: "expo.inOut" }, 0.07);
    },
    [router, reveal],
  );

  useEffect(() => {
    if (covering.current) {
      // Give the new page one frame to mount its ScrollTriggers.
      requestAnimationFrame(() => requestAnimationFrame(reveal));
    }
  }, [pathname, reveal]);

  return (
    <TransitionContext.Provider value={{ navigate }}>
      {children}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[80]">
        <div
          ref={b}
          className="absolute inset-0 bg-orange"
          style={{ clipPath: HIDDEN_A, visibility: "hidden" }}
        />
        <div
          ref={a}
          className="absolute inset-0 bg-cobalt halftone"
          style={{ clipPath: HIDDEN_A, visibility: "hidden" }}
        />
      </div>
    </TransitionContext.Provider>
  );
}

export function useTransitionNav() {
  return useContext(TransitionContext);
}

type LinkProps = React.ComponentProps<typeof Link> & { href: string };

/** Drop-in for next/link that plays the slash transition on plain left-clicks. */
export function TransitionLink({ href, onClick, ...rest }: LinkProps) {
  const { navigate } = useTransitionNav();
  return (
    <Link
      href={href}
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        if (
          e.defaultPrevented ||
          e.button !== 0 ||
          e.metaKey ||
          e.ctrlKey ||
          e.shiftKey ||
          e.altKey ||
          rest.target === "_blank" ||
          !href.startsWith("/")
        )
          return;
        e.preventDefault();
        navigate(href);
      }}
    />
  );
}
