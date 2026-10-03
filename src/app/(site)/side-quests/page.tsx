import type { Metadata } from "next";
import { ProjectCard } from "@/components/work/ProjectCard";
import { getPublishedProjects } from "@/lib/data/projects";
import { achievements } from "@/lib/seed/site";

export const metadata: Metadata = {
  title: "Side quests",
  description: "Personal projects and design competitions: a food stall, a galaxy-themed shop, and a logo that won first place.",
  alternates: { canonical: "/side-quests" },
};

export default async function SideQuestsPage() {
  const projects = (await getPublishedProjects()).filter((p) => p.category === "side");

  return (
    <div className="mx-auto max-w-[1400px] px-4 pt-36 md:px-8">
      <h1 className="display text-[clamp(3.4rem,10vw,9rem)]">
        Side <span className="text-cobalt-text">quests</span>
      </h1>
      <p className="mt-6 max-w-[56ch] text-lg text-muted">
        Stuff I do when nobody&apos;s paying me. A rice stall, a little shop full of stars, and a habit of entering
        design competitions. It&apos;s where I learn the things client briefs don&apos;t teach.
      </p>

      <ul className="mt-14 grid grid-cols-1 gap-x-6 gap-y-14 md:grid-cols-2">
        {projects.map((p, i) => {
          // Full-width every third card, and never leave the last card alone in a half column.
          const wide = i % 3 === 0 || (i === projects.length - 1 && i % 3 === 1);
          return (
            <li key={p.slug} data-reveal="up" className={wide ? "md:col-span-2" : ""}>
              <ProjectCard project={p} size={wide ? "lg" : "md"} priority={i === 0} />
            </li>
          );
        })}
      </ul>

      <section aria-labelledby="trophies" className="mt-28">
        <h2 id="trophies" className="display text-[clamp(2rem,4.5vw,3.6rem)]">
          Trophy shelf
        </h2>
        <ul className="mt-8 grid gap-3 md:grid-cols-2">
          {achievements.map((a, i) => (
            <li
              key={a}
              data-reveal="up"
              className={`chamfer flex min-h-24 items-center px-6 py-5 text-lg font-bold ${
                i === 0 ? "bg-orange text-on-orange md:col-span-2" : "bg-surface-2"
              } ${i > 0 && i === achievements.length - 1 && achievements.length % 2 === 0 ? "md:col-span-2" : ""
              }`}
            >
              {a}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
