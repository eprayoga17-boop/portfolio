import Link from "next/link";
import { createProject } from "@/app/admin/actions";
import { ProjectForm } from "@/components/admin/ProjectForm";

export default function NewProjectPage() {
  return (
    <>
      <Link href="/admin" className="text-sm font-bold underline underline-offset-4">
        All projects
      </Link>
      <h1 className="display mt-4 text-4xl">New project</h1>
      <p className="mt-2 text-muted">Save first, then add images on the next screen.</p>
      <div className="mt-8">
        <ProjectForm action={createProject} submitLabel="Create project" />
      </div>
    </>
  );
}
