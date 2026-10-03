import { BrandMarquee } from "@/components/home/BrandMarquee";
import { CallToAction } from "@/components/home/CallToAction";
import { CaseSelect, type CaseCard } from "@/components/home/CaseSelect";
import { Hero } from "@/components/home/Hero";
import { Industries } from "@/components/home/Industries";
import { Manifesto } from "@/components/home/Manifesto";
import { Stats } from "@/components/home/Stats";
import { getPublishedProjects } from "@/lib/data/projects";
import { imageUrl } from "@/lib/images";
import { categoryLabel } from "@/lib/types";

export default async function HomePage() {
  const projects = await getPublishedProjects();
  const featured = projects.filter((p) => p.featured && p.category !== "side").slice(0, 8);
  const cases: CaseCard[] = (featured.length ? featured : projects.slice(0, 6)).map((p) => ({
    slug: p.slug,
    title: p.title,
    client: p.client,
    category: categoryLabel(p.category),
    summary: p.summary,
    services: p.services,
    accent: p.accent,
    image: p.cover
      ? { src: imageUrl(p.cover.path), alt: p.cover.alt, width: p.cover.width, height: p.cover.height }
      : null,
  }));

  return (
    <>
      <Hero />
      <BrandMarquee />
      <Manifesto />
      <CaseSelect cases={cases} />
      <Stats />
      <Industries projects={projects} />
      <CallToAction />
    </>
  );
}
