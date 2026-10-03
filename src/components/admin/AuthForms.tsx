"use client";
import { useActionState, useState, useTransition } from "react";
import Image from "next/image";
import { signIn, startEnroll, verifyMfa, type EnrollState, type FormState } from "@/app/admin/auth-actions";

const input =
  "w-full bg-surface px-4 py-3 text-ink outline-none ring-[1.5px] ring-muted focus:ring-[3px] focus:ring-cobalt";

function ErrorBox({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p role="alert" className="chamfer bg-orange px-4 py-3 font-semibold text-on-orange">
      {msg}
    </p>
  );
}

export function LoginForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(signIn, {});
  return (
    <form action={action} className="mt-8 grid gap-5">
      <ErrorBox msg={state.error} />
      <div>
        <label htmlFor="email" className="mb-2 block font-bold">Email</label>
        <input id="email" name="email" type="email" autoComplete="username" required className={input} />
      </div>
      <div>
        <label htmlFor="password" className="mb-2 block font-bold">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={input} />
      </div>
      <button className="btn btn-primary chamfer justify-center" disabled={pending}>
        {pending ? "Checking..." : "Continue"}
      </button>
    </form>
  );
}

export function MfaForm({ enrolled }: { enrolled: boolean }) {
  const [enroll, setEnroll] = useState<EnrollState | null>(null);
  const [starting, startTransition] = useTransition();
  const [state, action, pending] = useActionState<FormState, FormData>(verifyMfa, {});

  if (!enrolled && !enroll?.factorId) {
    return (
      <div className="mt-8 grid gap-5">
        <ErrorBox msg={enroll?.error} />
        <p className="text-muted">
          Admin access needs a second factor. Install an authenticator app (Google Authenticator, 1Password, Authy),
          then set it up here. You only do this once.
        </p>
        <button
          type="button"
          className="btn btn-primary chamfer justify-center"
          disabled={starting}
          onClick={() => startTransition(async () => setEnroll(await startEnroll()))}
        >
          {starting ? "Preparing..." : "Set up authenticator"}
        </button>
      </div>
    );
  }

  return (
    <form action={action} className="mt-8 grid gap-5">
      <ErrorBox msg={state.error} />
      {enroll?.qr && (
        <div className="grid gap-3">
          <p className="text-muted">Scan this with your authenticator app, then enter the 6-digit code it shows.</p>
          <div className="chamfer w-fit bg-white p-3">
            <Image src={enroll.qr} alt="QR code for your authenticator app" width={180} height={180} unoptimized />
          </div>
          <p className="text-sm text-muted">
            Can&apos;t scan? Enter this key manually: <code className="break-all font-mono text-ink">{enroll.secret}</code>
          </p>
          <input type="hidden" name="factorId" value={enroll.factorId} />
        </div>
      )}
      <div>
        <label htmlFor="code" className="mb-2 block font-bold">6-digit code</label>
        <input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" pattern="\d{6}" maxLength={6} required className={`${input} font-mono text-2xl tracking-[0.4em]`} />
      </div>
      <button className="btn btn-primary chamfer justify-center" disabled={pending}>
        {pending ? "Verifying..." : "Verify"}
      </button>
    </form>
  );
}
