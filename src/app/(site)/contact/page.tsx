import type { Metadata } from "next";
import { EnvelopeSimple, InstagramLogo, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { ContactForm } from "@/components/contact/ContactForm";
import { profile } from "@/lib/seed/site";

export const metadata: Metadata = {
  title: "Let's talk",
  description: "Hire Erik Prayoga for a full-time role or a freelance brand and social media project.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const direct = [
    { href: `mailto:${profile.email}`, label: profile.email, Icon: EnvelopeSimple, external: false },
    { href: `https://wa.me/${profile.whatsapp}`, label: profile.whatsappDisplay, Icon: WhatsappLogo, external: true },
    { href: `https://instagram.com/${profile.instagram}`, label: `@${profile.instagram}`, Icon: InstagramLogo, external: true },
  ];
  return (
    <div className="mx-auto grid max-w-[1400px] gap-14 px-4 pt-36 md:px-8 lg:grid-cols-[0.8fr_1.2fr]">
      <div>
        <h1 className="display text-[clamp(3.2rem,9vw,8rem)] leading-[0.92]">
          Let&apos;s
          <br />
          <span className="text-cobalt-text">talk</span>
        </h1>
        <p className="mt-6 max-w-[40ch] text-lg text-muted">
          Hiring for a design role, or got a brand that needs a face? Send a note. I reply within a couple of days.
        </p>
        <ul className="mt-10 space-y-2">
          {direct.map(({ href, label, Icon, external }) => (
            <li key={href}>
              <a
                href={href}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="inline-flex min-h-11 items-center gap-3 text-lg font-bold hover:text-cobalt-text"
              >
                <Icon size={24} weight="bold" aria-hidden /> {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="relative">
        <ContactForm />
      </div>
    </div>
  );
}
