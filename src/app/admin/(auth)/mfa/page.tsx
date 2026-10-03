import { redirect } from "next/navigation";
import { MfaForm } from "@/components/admin/AuthForms";
import { Wordmark } from "@/components/site/Wordmark";
import { getAdminState } from "@/lib/auth";

export default async function MfaPage() {
  const state = await getAdminState();
  if (state.status === "ok") redirect("/admin");
  if (state.status !== "needs_mfa") redirect("/admin/login");
  return (
    <main className="mx-auto grid min-h-[100dvh] max-w-md place-items-center px-4">
      <div className="w-full">
        <Wordmark />
        <h1 className="display mt-6 text-4xl">{state.enrolled ? "Two-step check" : "Set up 2FA"}</h1>
        <MfaForm enrolled={state.enrolled} />
      </div>
    </main>
  );
}
