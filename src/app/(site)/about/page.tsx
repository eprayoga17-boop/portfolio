import type { Metadata } from "next";
import Image from "next/image";
import { DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import { Timeline } from "@/components/about/Timeline";
import { TransitionLink } from "@/components/motion/PageTransition";
import { education, experience, profile, tools } from "@/lib/seed/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Erik Prayoga is a brand and social media designer from Surabaya with seven years of agency, in-house and remote work.",
  alternates: { canonical: "/about" },
};

const SOFT = ["Creative thinking", "Fast learner", "Visual strategy", "Brief interpretation", "Team coordination"];

export default function AboutPage() {
  return (
    <>
      <section className="mx-auto grid max-w-[1400px] items-end gap-10 px-4 pt-36 md:grid-cols-[1.25fr_0.75fr] md:px-8">
        <div>
          <h1 className="display text-[clamp(2.8rem,6.5vw,6rem)] leading-[0.95]">
            Halo, it&apos;s me,
            <br />
            <span className="text-cobalt-text">Erik.</span>
          </h1>
          <div className="mt-8 max-w-[60ch] space-y-5 text-lg leading-relaxed">
            <p>
              I&apos;m a graphic designer from Surabaya, and for about seven years I&apos;ve mostly been making brands look
              good on social media. Brand identities, feeds, campaign key visuals, the occasional app screen or website,
              and motion when a still image won&apos;t cut it.
            </p>
            <p>
              I&apos;ve worked in-house, at agencies, and remotely for clients in Singapore, Malaysia and Australia. Along
              the way I learned to run a lot of brands at once without letting them blur into each other. Right now I
              lead a small design team at an FMCG company in Surabaya.
            </p>
            <p>
              My motto is <span className="script text-[1.6em] text-orange-text">Berkarya untuk Bercanda</span>. Making things
              should be fun. If it isn&apos;t, it usually shows in the work.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={profile.cvPath} download className="btn btn-primary chamfer">
              <DownloadSimple size={18} weight="bold" aria-hidden /> Download CV
            </a>
            <TransitionLink href="/contact" className="btn btn-ghost chamfer">
              Let&apos;s talk
            </TransitionLink>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-[380px]">
          <div aria-hidden className="chamfer-lg absolute inset-x-0 bottom-0 top-[18%] bg-cobalt halftone" />
          <Image
            src="/brand/avatar.webp"
            alt="Illustrated portrait of Erik with blue hair and round glasses"
            width={890}
            height={1200}
            priority
            sizes="380px"
            className="relative h-auto w-full"
          />
        </div>
      </section>

      <Timeline items={experience} />

      <section aria-labelledby="toolbox-title" className="mx-auto max-w-[1400px] px-4 py-20 md:px-8">
        <h2 id="toolbox-title" className="display text-[clamp(2.2rem,5vw,4.2rem)]">
          Toolbox
        </h2>
        <div className="mt-10 grid gap-3 md:grid-cols-[1.2fr_1fr]">
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {tools.map((t, i) => (
              <li
                key={t.name}
                data-reveal="up"
                className={`chamfer flex min-h-28 flex-col justify-between p-5 ${
                  i === 0 ? "bg-orange text-on-orange" : "bg-surface-2"
                } ${i === tools.length - 1 && tools.length % 2 === 1 ? "sm:col-span-2" : ""}`}
              >
                <span className="text-lg font-extrabold">{t.name}</span>
                <span className="font-mono text-sm opacity-80">{t.level}</span>
              </li>
            ))}
          </ul>
          <div data-reveal="up" className="chamfer-lg relative overflow-hidden bg-ink p-6 text-paper md:p-8">
            <h3 className="display text-2xl">Also good at</h3>
            <ul className="mt-6 flex flex-wrap gap-2">
              {SOFT.map((s) => (
                <li key={s} className="chamfer bg-paper/10 px-3 py-2 font-semibold">
                  {s}
                </li>
              ))}
            </ul>
            <h3 className="display mt-10 text-2xl">School</h3>
            <ul className="mt-4 space-y-3">
              {education.map((e) => (
                <li key={e.school}>
                  <p className="font-bold">{e.school}</p>
                  <p className="text-sm opacity-80">
                    {e.detail}, {e.period}
                  </p>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm opacity-80">Bahasa Indonesia (native), English (intermediate)</p>
          </div>
        </div>
      </section>
    </>
  );
}
