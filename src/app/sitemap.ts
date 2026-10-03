export const revalidate = 3600;

import type { MetadataRoute } from "next";
import { getPublishedProjects } from "@/lib/data/projects";
import { siteUrl } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getPublishedProjects();
  const pages = ["", "/work", "/about", "/side-quests", "/contact", "/privacy"].map((p) => ({
    url: `${siteUrl}${p}`,
    changeFrequency: "monthly" as const,
    priority: p === "" ? 1 : 0.7,
  }));
  return [
    ...pages,
    ...projects.map((p) => ({ url: `${siteUrl}/work/${p.slug}`, changeFrequency: "yearly" as const, priority: 0.6 })),
  ];
}
