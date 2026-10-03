import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteProject, updateProject } from "@/app/admin/actions";
import { ImageManager } from "@/components/admin/ImageManager";
import { DeleteProjectForm, ProjectForm } from "@/components/admin/ProjectForm";
import { adminGetProject } from "@/lib/data/admin";
import { uuid } from "@/lib/validation";

export default async function EditProjectPage({ params, searchParams }: PageProps<"/admin/projects/[id]">) {
  const { id } = await params;
  const { created } = await searchParams;
  if (!uuid.safeParse(id).success) notFound();
  const project = await adminGetProject(id);
  if (!project) notFound();

  return (
    <>
      <Link href="/admin" className="text-sm font-bold underline underline-offset-4">
        All projects
      </Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <h1 className="display text-4xl">{project.title}</h1>
        {project.published && (
          <Link
            href={`/work/${project.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-bold underline underline-offset-4"
          >
            Open live page
          </Link>
        )}
      </div>
      {created && (
        <p role="status" className="chamfer mt-6 bg-cobalt px-4 py-3 font-semibold text-on-cobalt">
          Created. Now add some images.
        </p>
      )}
      <div className="mt-10 grid gap-14 lg:grid-cols-[1.1fr_0.9fr]">
        <ProjectForm project={project} action={updateProject.bind(null, project.id)} submitLabel="Save changes" />
        <div className="grid content-start gap-10">
          <ImageManager
            projectId={project.id}
            images={project.images}
            coverPath={project.cover?.path ?? null}
          />
          <DeleteProjectForm action={deleteProject.bind(null, project.id)} />
        </div>
      </div>
    </>
  );
}
