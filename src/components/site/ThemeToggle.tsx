"use client";
import { MoonStars, Sun } from "@phosphor-icons/react";

export function ThemeToggle() {
  const toggle = () => {
    const html = document.documentElement;
    const next = html.dataset.theme === "dark" ? "light" : "dark";
    html.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
  };
  return (
    <button
      type="button"
      onClick={toggle}
      className="chamfer grid h-11 w-11 place-items-center bg-paper text-ink transition-colors hover:bg-orange hover:text-on-orange"
      aria-label="Switch light or dark mode"
    >
      {/* Both icons render; CSS shows the right one, so there is no hydration flash. */}
      <Sun size={22} weight="bold" className="hidden [[data-theme=dark]_&]:block" aria-hidden />
      <MoonStars size={22} weight="bold" className="block [[data-theme=dark]_&]:hidden" aria-hidden />
    </button>
  );
}
