import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/AuthForms";
import { Wordmark } from "@/components/site/Wordmark";
import { getAdminState } from "@/lib/auth";

export default async function LoginPage() {
  const state = await getAdminState();
  if (state.status === "ok") redirect("/admin");
  if (state.status === "needs_mfa") redirect("/admin/mfa");
  return (
    <main className="mx-auto grid min-h-[100dvh] max-w-md place-items-center px-4">
      <div className="w-full">
        <Wordmark />
        <h1 className="display mt-6 text-4xl">Admin</h1>
        <LoginForm />
      </div>
    </main>
  );
}
