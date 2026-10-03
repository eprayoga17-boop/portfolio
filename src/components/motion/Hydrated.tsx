"use client";
import { useEffect } from "react";

declare global {
  interface Window {
    __hydrated?: boolean;
  }
}

/** Tells the inline boot script that JS is alive (see app/layout.tsx). */
export function Hydrated() {
  useEffect(() => {
    window.__hydrated = true;
  }, []);
  return null;
}
