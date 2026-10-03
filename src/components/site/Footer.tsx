import { InstagramLogo, EnvelopeSimple, WhatsappLogo, FilePdf } from "@phosphor-icons/react/dist/ssr";
import { TransitionLink } from "@/components/motion/PageTransition";
import { profile } from "@/lib/seed/site";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative mt-32 overflow-hidden bg-cobalt text-on-cobalt">
      <div className="stripes h-3 w-full" aria-hidden />
      <div className="mx-auto grid max-w-[1400px] gap-12 px-4 py-16 md:grid-cols-[1.4fr_1fr_1fr] md:px-8">
        <div>
          <p className="script text-5xl text-orange md:text-6xl">Terima kasih!</p>
          <p className="mt-4 max-w-[38ch] text-on-cobalt/80">
            Thanks for scrolling this far. If something here made you think of your brand, that&apos;s a good sign.
          </p>
          <TransitionLink href="/contact" className="btn chamfer mt-8 bg-orange text-on-orange hover:bg-paper hover:text-cobalt">
            Let&apos;s talk
          </TransitionLink>
        </div>

        <nav aria-label="Footer" className="flex flex-col gap-3 text-lg font-bold">
          <TransitionLink href="/work" className="hover:text-orange">Work</TransitionLink>
          <TransitionLink href="/about" className="hover:text-orange">About</TransitionLink>
          <TransitionLink href="/side-quests" className="hover:text-orange">Side quests</TransitionLink>
          <TransitionLink href="/privacy" className="hover:text-orange">Privacy</TransitionLink>
        </nav>

        <ul className="flex flex-col gap-3">
          <li>
            <a href={`mailto:${profile.email}`} className="inline-flex items-center gap-3 hover:text-orange">
              <EnvelopeSimple size={22} weight="bold" aria-hidden /> {profile.email}
            </a>
          </li>
          <li>
            <a
              href={`https://wa.me/${profile.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 hover:text-orange"
            >
              <WhatsappLogo size={22} weight="bold" aria-hidden /> {profile.whatsappDisplay}
            </a>
          </li>
          <li>
            <a
              href={`https://instagram.com/${profile.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 hover:text-orange"
            >
              <InstagramLogo size={22} weight="bold" aria-hidden /> @{profile.instagram}
            </a>
          </li>
          <li>
            <a href={profile.cvPath} className="inline-flex items-center gap-3 hover:text-orange" download>
              <FilePdf size={22} weight="bold" aria-hidden /> Download CV
            </a>
          </li>
        </ul>
      </div>
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-end justify-between gap-4 px-4 pb-8 md:px-8">
        <p className="display select-none text-[18vw] leading-[0.8] text-on-cobalt/10 md:text-[12vw]" aria-hidden>
          Portfolio
        </p>
        <p className="text-sm text-on-cobalt/70">
          © {year} {profile.name}. {profile.city}.
        </p>
      </div>
    </footer>
  );
}
