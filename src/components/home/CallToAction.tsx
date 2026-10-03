import Image from "next/image";
import { WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { TransitionLink } from "@/components/motion/PageTransition";
import { profile } from "@/lib/seed/site";

export function CallToAction() {
  return (
    <section aria-labelledby="cta-title" className="relative overflow-hidden">
      <div className="mx-auto grid max-w-[1400px] items-center gap-10 px-4 md:grid-cols-[1.3fr_1fr] md:px-8">
        <div data-reveal="up">
          <h2 id="cta-title" className="display text-[clamp(2.6rem,6.5vw,6rem)] leading-[0.95]">
            Your brand,
            <br />
            <span className="text-cobalt-text">on my desk?</span>
          </h2>
          <p className="mt-6 max-w-[44ch] text-lg text-muted">
            Open to full-time roles and freelance projects. Tell me what you&apos;re working on and I&apos;ll reply within a
            couple of days.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <TransitionLink href="/contact" className="btn btn-primary chamfer">
              Let&apos;s talk
            </TransitionLink>
            <a
              href={`https://wa.me/${profile.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost chamfer"
            >
              <WhatsappLogo size={20} weight="bold" aria-hidden /> WhatsApp
            </a>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-[360px]" data-reveal="up">
          <Image
            src="/brand/bust.webp"
            alt="Erik's illustrated avatar winking in front of an orange circle"
            width={606}
            height={881}
            sizes="360px"
            className="h-auto w-full"
          />
        </div>
      </div>
    </section>
  );
}
