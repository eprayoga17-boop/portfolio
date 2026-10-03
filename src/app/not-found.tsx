import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative grid min-h-[100dvh] place-items-center overflow-hidden bg-cobalt px-4 text-on-cobalt">
      <div aria-hidden className="halftone absolute inset-0" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,.15) 0 2px, transparent 2px 4px)" }}
      />
      <div className="relative text-center">
        <p className="font-mono text-lg">404</p>
        <h1 className="display mt-4 text-[clamp(3rem,12vw,10rem)]">No signal</h1>
        <p className="mx-auto mt-4 max-w-[36ch] text-lg text-on-cobalt/85">
          This page doesn&apos;t exist, or it moved. The good stuff is still on the home page.
        </p>
        <Link href="/" className="btn chamfer mt-8 bg-orange text-on-orange hover:bg-paper hover:text-cobalt">
          Back home
        </Link>
      </div>
    </main>
  );
}
