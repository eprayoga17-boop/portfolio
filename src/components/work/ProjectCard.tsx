import Image from "next/image";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { TransitionLink } from "@/components/motion/PageTransition";
import { imageUrl } from "@/lib/images";
import { categoryLabel, type Project } from "@/lib/types";

export function ProjectCard({
  project,
  size = "md",
  priority = false,
}: {
  project: Project;
  size?: "lg" | "md" | "sm";
  priority?: boolean;
}) {
  const aspect = size === "lg" ? "aspect-[16/10]" : size === "md" ? "aspect-[4/3]" : "aspect-square";
  return (
    <TransitionLink href={`/work/${project.slug}`} className="group block" aria-label={`${project.title}, ${categoryLabel(project.category)}`}>
      <div className={`chamfer-lg relative overflow-hidden bg-surface-2 ${aspect}`}>
        {project.cover && (
          <Image
            src={imageUrl(project.cover.path)}
            alt={project.cover.alt}
            fill
            priority={priority}
            sizes={size === "lg" ? "(min-width: 1024px) 58vw, 100vw" : "(min-width: 1024px) 40vw, 100vw"}
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.04]"
          />
        )}
        {/* Slash wipe in the project's own colour on hover */}
        <div
          aria-hidden
          className="absolute inset-0 translate-x-[-105%] transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-0 group-focus-visible:translate-x-0"
          style={{ background: project.accent, clipPath: "polygon(0 0, 78% 0, 58% 100%, 0 100%)", opacity: 0.92 }}
        />
        <div
          aria-hidden
          className="absolute bottom-0 left-0 flex max-w-[70%] translate-y-4 flex-col p-6 text-[#f8f9ff] opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100"
        >
          <span className="line-clamp-3 text-sm font-semibold leading-snug">{project.summary}</span>
        </div>
      </div>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="display text-[clamp(1.4rem,2.2vw,2rem)] leading-[1.05]">{project.title}</h3>
          <p className="mt-1.5 text-sm text-muted">
            {categoryLabel(project.category)}
            {project.region ? `, ${project.region}` : ""}
          </p>
        </div>
        <ArrowUpRight
          size={28}
          weight="bold"
          aria-hidden
          className="mt-1 shrink-0 text-cobalt-text transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
        />
      </div>
    </TransitionLink>
  );
}
