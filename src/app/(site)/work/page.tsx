import type { Metadata } from "next";
import { WorkGrid } from "@/components/work/WorkGrid";
import { getPublishedProjects } from "@/lib/data/projects";
import { CATEGORIES, type CategoryId } from "@/lib/types";

export const metadata: Metadata = {
  title: "Work",
  description: "Brand identity and social media work for clinics, beauty brands, F&B and service companies.",
  alternates: { canonical: "/work" },
};

export default async function WorkPage({ searchParams }: PageProps<"/work">) {
  const { c } = await searchParams;
  const projects = (await getPublishedProjects()).filter((p) => p.category !== "side");
  const valid = CATEGORIES.map((x) => x.id as string);
  const initial = (typeof c === "string" && valid.includes(c) ? c : "all") as CategoryId | "all";

  const filters = [
    { id: "all" as const, label: "All", count: projects.length },
    ...CATEGORIES.filter((x) => x.id !== "side").map((x) => ({
      id: x.id,
      label: x.label,
      count: projects.filter((p) => p.category === x.id).length,
    })),
  ];

  return (
    <div className="mx-auto max-w-[1400px] px-4 pt-36 md:px-8">
      <h1 className="display text-[clamp(3.4rem,10vw,9rem)]">
        Selected <span className="text-cobalt-text">work</span>
      </h1>
      <p className="mt-6 max-w-[52ch] text-lg text-muted">
        Feeds, identities, campaigns and the odd app. Mostly health, beauty and food brands across Indonesia and
        Singapore.
      </p>
      <WorkGrid projects={projects} filters={filters} initial={initial} />
    </div>
  );
}
