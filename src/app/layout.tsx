import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { headers } from "next/headers";
import { siteUrl } from "@/lib/env";
import { Hydrated } from "@/components/motion/Hydrated";
import "./globals.css";

const archivo = localFont({
  variable: "--font-archivo",
  display: "swap",
  src: [
    { path: "../fonts/archivo-latin-standard-normal.woff2", style: "normal", weight: "100 900" },
    { path: "../fonts/archivo-latin-standard-italic.woff2", style: "italic", weight: "100 900" },
  ],
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
});

const mono = localFont({
  variable: "--font-mono-face",
  display: "swap",
  src: [{ path: "../fonts/jetbrains-mono-latin-500-normal.woff2", weight: "500", style: "normal" }],
});

const script = localFont({
  variable: "--font-script-face",
  display: "swap",
  src: [{ path: "../fonts/caveat-latin-700-normal.woff2", weight: "700", style: "normal" }],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Erik Prayoga | Brand & social media designer",
    template: "%s | Erik Prayoga",
  },
  description:
    "Portfolio of Erik Prayoga, a brand and social media designer from Surabaya. Seven years, 50+ brands, clients in Indonesia, Singapore, Malaysia and Australia.",
  openGraph: {
    type: "website",
    siteName: "Erik Prayoga",
    images: [{ url: "/seed/milagros/cover.webp", width: 1600, height: 900 }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eef2ff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0e1f" },
  ],
};

// Runs before first paint: theme, js flag, and whether to play the boot loader.
// If the JS bundle hasn't hydrated within 4s, it backs out so content is never stuck hidden.
const bootScript = `(function(){try{var d=document.documentElement;d.classList.add('js');var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}d.dataset.theme=t;var rm=matchMedia('(prefers-reduced-motion: reduce)').matches;if(!rm&&!sessionStorage.getItem('booted')&&location.pathname.indexOf('/admin')!==0){d.dataset.boot='1'}setTimeout(function(){if(!window.__hydrated){d.classList.remove('js');d.removeAttribute('data-boot')}},4000)}catch(e){}})();`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={`${archivo.variable} ${mono.variable} ${script.variable}`}
    >
      <head>
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body className="bg-paper text-ink antialiased">
        <Hydrated />
        {children}
      </body>
    </html>
  );
}
