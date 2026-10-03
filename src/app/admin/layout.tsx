import type { Metadata } from "next";
import { Wordmark } from "@/components/site/Wordmark";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured) {
    return (
      <main className="mx-auto grid min-h-[100dvh] max-w-xl place-items-center px-4">
        <div className="chamfer-lg bg-surface-2 p-8">
          <Wordmark />
          <h1 className="display mt-6 text-3xl">Admin isn&apos;t connected</h1>
          <p className="mt-4 text-muted">
            The public site is running on bundled seed content. To manage projects here, create a Supabase project, run
            the migration in <code className="font-mono">supabase/migrations</code>, and set the environment variables
            listed in the README.
          </p>
        </div>
      </main>
    );
  }
  return <div className="min-h-[100dvh] bg-paper">{children}</div>;
}
