export const CATEGORIES = [
  { id: "clinic", label: "Clinic & aesthetic", short: "Clinic" },
  { id: "beauty", label: "Beauty & fashion", short: "Beauty" },
  { id: "fnb", label: "Food & drink", short: "F&B" },
  { id: "service", label: "Apps & services", short: "Services" },
  { id: "side", label: "Side quests", short: "Side quests" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export function categoryLabel(id: CategoryId) {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export type ProjectImage = {
  id: string;
  /** Either an absolute site path ("/seed/...") or a storage object path ("projects/<id>/<file>"). */
  path: string;
  alt: string;
  width: number;
  height: number;
};

export type Project = {
  id: string;
  slug: string;
  title: string;
  client: string;
  category: CategoryId;
  year: number | null;
  region: string | null;
  role: string | null;
  services: string[];
  summary: string;
  body: string;
  accent: string;
  featured: boolean;
  published: boolean;
  sortOrder: number;
  externalUrl: string | null;
  cover: ProjectImage | null;
  images: ProjectImage[];
};
