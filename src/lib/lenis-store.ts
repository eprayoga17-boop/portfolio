"use client";
import type Lenis from "lenis";

// Single Lenis instance shared by the scroll provider, header and page transitions.
let instance: Lenis | null = null;
const listeners = new Set<(l: Lenis | null) => void>();

export const lenisStore = {
  get: () => instance,
  set: (l: Lenis | null) => {
    instance = l;
    listeners.forEach((fn) => fn(l));
  },
  /** Calls fn now and whenever the instance changes. */
  subscribe: (fn: (l: Lenis | null) => void) => {
    listeners.add(fn);
    fn(instance);
    return () => {
      listeners.delete(fn);
    };
  },
};
