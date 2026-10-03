# Security and privacy

What this codebase does, mapped to the frameworks you asked about. Read the last section too: some of this is on you, not the code.

## OWASP Top 10 (2021)

| Risk | Controls in this repo | Where |
| --- | --- | --- |
| A01 Broken access control | Postgres Row Level Security on every table. Writes require membership in `public.admins` **and** an MFA-verified (`aal2`) session, enforced in the database by `is_admin()`. Every admin page and Server Action re-checks auth itself; the proxy redirect is only a convenience. Storage writes limited to admins and the `projects/` folder. | `supabase/migrations`, `src/lib/auth.ts`, `src/app/admin/actions.ts` |
| A02 Cryptographic failures | HTTPS only (HSTS preload). Passwords and TOTP handled by Supabase Auth. IPs stored only as HMAC-SHA256 with a server secret. Secrets live in env vars, server-only modules import `server-only`. | `next.config.ts`, `src/lib/security.ts` |
| A03 Injection | All queries through supabase-js (parameterised). Zod allowlist schemas on every input. No `dangerouslySetInnerHTML` with data. DB `CHECK` constraints repeat the rules (slug regex, https-only links, hex colours, lengths). Strict CSP with per-request nonces and `strict-dynamic`. | `src/lib/validation.ts`, `src/proxy.ts` |
| A04 Insecure design | Rate limits (Postgres-backed) on login, MFA and the contact form. Honeypot on the contact form. Uploads go straight to Storage with a bucket-level MIME allowlist (no SVG) and 8 MB cap, then are verified server-side before use. | `check_rate_limit()`, `ImageManager.tsx` |
| A05 Security misconfiguration | CSP, HSTS, `X-Frame-Options: DENY`, `frame-ancestors 'none'`, `nosniff`, strict referrer, Permissions-Policy, COOP. `x-powered-by` off. `/admin` is `noindex` and `no-store`. Server Actions body limit 200 KB. | `next.config.ts`, `src/proxy.ts` |
| A06 Vulnerable components | CI runs `npm audit --omit=dev --audit-level=high`. Dependabot weekly. Lockfile committed. | `.github/` |
| A07 Identification and auth failures | Mandatory TOTP MFA for admins. Generic login errors (no account enumeration). Throttling per IP and per email. `getUser()` validates the JWT with Supabase instead of trusting the cookie. | `src/app/admin/auth-actions.ts` |
| A08 Software and data integrity | Server Actions have built-in Origin checks (CSRF). Bound action arguments are encrypted by Next. Uploaded images are re-encoded to WebP in the browser, which also strips EXIF/GPS. | |
| A09 Logging and monitoring failures | Append-only `audit_log`: DB triggers record every content change with the real actor; sign-in, MFA, throttling and retention runs are logged too. Nobody, including the admin, can update or delete log rows through the API. Personal data is never copied into the log. | migration, `/admin/audit` |
| A10 SSRF | The server never fetches user-supplied URLs. External links are stored and rendered, not requested. | |

Run the database tests locally or in CI: `supabase/tests/rls_test.sql` checks that anon, non-admins and non-MFA admins are blocked, that the audit log can't be edited, that storage paths are confined, and that retention deletes the right rows.

## UU PDP (Indonesia, UU No. 27/2022)

I read "ppda" as Indonesia's Personal Data Protection law, since the site is run from Surabaya. Clients in Singapore and Malaysia have similar PDPA laws; the same controls cover the basics there.

| Principle | Implementation |
| --- | --- |
| Lawful basis and consent | Unticked consent checkbox on the contact form, required server-side. Consent version stored with each message. |
| Purpose limitation, minimisation | Only name, email, optional company, topic, message. No analytics, no tracking cookies, so no cookie banner is needed. IP is hashed, not stored. |
| Transparency | `/privacy` notice in plain language: controller, data, purpose, processors, transfer, retention, rights. |
| Storage limitation | Messages auto-deleted after `INQUIRY_RETENTION_DAYS` (default 365) by a daily Vercel Cron job. |
| Data subject rights | Admin can erase any message in one click (`/admin/inquiries`). Requests come in by email. |
| Cross-border transfer | Disclosed in the notice. Pick Supabase region **Singapore (ap-southeast-1)** to keep latency and distance low. |
| Breach notification | See the incident steps below. UU PDP requires written notice to data subjects and the authority, within 3 x 24 hours (Art. 46). Confirm the current wording with a lawyer. |

## SOC 2

SOC 2 is an audit of an **organisation's** controls by a CPA firm, over months. A website can't "be SOC 2 compliant" on its own. What this repo gives you are controls that map to the Trust Services Criteria, plus vendors who already hold SOC 2 Type II reports (Supabase, Vercel, GitHub):

| Criteria | Control |
| --- | --- |
| CC6 Logical access | MFA, RLS least privilege, service-role key used in 3 places only, admin allowlist table |
| CC7 System operations | Audit log, structured server logs in Vercel, retention job |
| CC8 Change management | Changes via pull request, CI must pass (lint, types, build, audit, RLS tests) |
| A1 Availability | Vercel edge + Supabase managed Postgres with daily backups (enable PITR on a paid plan if needed) |
| C1 Confidentiality | TLS everywhere, encryption at rest by both vendors, secrets in env vars |
| P Privacy | The UU PDP controls above |

## Things you have to do (the code can't)

1. **Supabase Auth settings:** turn off public sign-ups after creating your account (Authentication > Sign In / Providers > "Allow new users to sign up"). Enable TOTP MFA. Set minimum password length to 12+. Keep JWT expiry at 1 hour.
2. Never put `SUPABASE_SERVICE_ROLE_KEY` in a `NEXT_PUBLIC_` variable or commit it.
3. Turn on GitHub branch protection for `main` (require CI, no force pushes) and 2FA on GitHub, Vercel and Supabase accounts.
4. Turn on Vercel's Firewall/Bot protection if spam gets past the honeypot.
5. Have a lawyer review `/privacy` before relying on it.

## Incident response (short version)

1. Rotate the affected keys (Supabase service role and anon keys, `IP_HASH_SECRET`, `CRON_SECRET`) and redeploy.
2. Revoke sessions: Supabase dashboard > Authentication > Users > sign out user. Re-enrol MFA.
3. Read `/admin/audit` and Vercel logs to scope what happened.
4. If personal data was involved, notify affected people and the authority in writing (see UU PDP above).
5. Write down what happened and what changed.

Report a vulnerability: eprayoga17@gmail.com
