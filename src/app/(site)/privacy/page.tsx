import type { Metadata } from "next";
import { profile } from "@/lib/seed/site";
import { CONSENT_VERSION } from "@/lib/validation";

export const metadata: Metadata = {
  title: "Privacy notice",
  description: "How this site handles personal data under Indonesia's Personal Data Protection Law (UU PDP).",
  alternates: { canonical: "/privacy" },
};

/**
 * Plain-language notice written against UU No. 27 Tahun 2022 (UU PDP).
 * Have it reviewed by a lawyer before relying on it. It is a sensible
 * starting point, not legal advice.
 */
export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-[760px] px-4 pt-36 md:px-8">
      <h1 className="display text-[clamp(2.6rem,7vw,5rem)]">Privacy notice</h1>
      <p className="mt-4 font-mono text-sm text-muted">Version {CONSENT_VERSION}</p>

      <div className="mt-10 space-y-10 text-lg leading-relaxed [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-black [&_h2]:italic [&_h2]:uppercase [&_h2]:[font-stretch:125%] [&_li]:mt-1 [&_ul]:list-disc [&_ul]:pl-6">
        <section>
          <h2>Who is responsible</h2>
          <p>
            This site belongs to {profile.name}, {profile.city}. I&apos;m the data controller for anything you send
            through it. Contact:{" "}
            <a className="font-bold underline underline-offset-4" href={`mailto:${profile.email}`}>
              {profile.email}
            </a>
            .
          </p>
        </section>

        <section>
          <h2>What I collect, and why</h2>
          <p>Only what you type into the contact form:</p>
          <ul>
            <li>your name, email, and (if you add it) company</li>
            <li>what your message is about, and the message itself</li>
            <li>
              a one-way, keyed hash of your IP address, used only to block spam floods. It can&apos;t be turned back
              into your IP.
            </li>
          </ul>
          <p className="mt-3">
            I use this to reply to you, nothing else. The legal basis is your consent, which you give with the checkbox
            on the form.
          </p>
        </section>

        <section>
          <h2>What I don&apos;t do</h2>
          <ul>
            <li>No analytics, advertising or tracking cookies.</li>
            <li>No selling or sharing your data for marketing.</li>
            <li>No newsletter sign-ups unless you ask for one.</li>
          </ul>
          <p className="mt-3">The only cookies here are login cookies for the admin area, which visitors never get.</p>
        </section>

        <section>
          <h2>Where it&apos;s stored</h2>
          <p>
            Messages are stored with Supabase (database) and the site runs on Vercel. Their servers may be outside
            Indonesia, for example in Singapore. Both encrypt data in transit and at rest and are bound by data
            processing terms. By sending the form you agree to this transfer.
          </p>
        </section>

        <section>
          <h2>How long I keep it</h2>
          <p>
            Messages are deleted automatically 12 months after you send them. If we end up working together, I may keep
            our correspondence in my email for as long as the project needs it.
          </p>
        </section>

        <section>
          <h2>Your rights</h2>
          <p>
            Under UU PDP you can ask to see the data I hold about you, correct it, delete it, or withdraw your consent at
            any time. Email me and I&apos;ll handle it promptly. Withdrawing consent doesn&apos;t affect anything done
            before you withdrew it.
          </p>
        </section>

        <section>
          <h2>If something goes wrong</h2>
          <p>
            If there&apos;s ever a breach that affects your data, I&apos;ll tell you and the relevant authority in
            writing, within the time the law requires, including what happened and what I&apos;m doing about it.
          </p>
        </section>
      </div>
    </article>
  );
}
