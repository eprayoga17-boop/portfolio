"use client";
export const BOOT_DONE = "boot:done";

/** Runs `cb` once the boot loader has finished (or immediately if it never ran). */
export function onBootReady(cb: () => void): () => void {
  if (document.documentElement.dataset.boot !== "1") {
    cb();
    return () => {};
  }
  const handler = () => cb();
  window.addEventListener(BOOT_DONE, handler, { once: true });
  return () => window.removeEventListener(BOOT_DONE, handler);
}
