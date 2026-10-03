# Erik Prayoga, portfolio

Multi-page portfolio with a small CMS. Next.js 16 (App Router), Tailwind v4, GSAP + Lenis for motion, Supabase for database, auth and image storage. Built for Vercel.

- `docs/BRAND.md`: colours, type, logo and voice pulled from the PDF portfolio
- `docs/JOURNEY.md`: site map, visitor paths, and how the ZZZ reference was translated
- `SECURITY.md`: OWASP Top 10, UU PDP and SOC 2 mapping, plus the settings you must change yourself

## Run it locally

```bash
npm install
npm run dev        # http://localhost:3000
```

With no env vars, the public site runs on the bundled seed content (28 projects rendered from the PDF, in `public/seed`). The admin shows a setup notice.

## Connect Supabase (about 15 minutes)

1. Create a project at supabase.com. Pick region **Southeast Asia (Singapore)**.
2. SQL Editor: run `supabase/migrations/20261003000000_init.sql`, then `supabase/seed.sql` to import the portfolio.
3. Authentication > Users > **Add user** with your email and a strong password.
4. SQL Editor, to make that user an admin:
   ```sql
   insert into public.admins (user_id) select id from auth.users where email = 'eprayoga17@gmail.com';
   ```
5. Authentication settings: **disable new sign-ups**, make sure **TOTP MFA** is enabled.
6. Copy `.env.example` to `.env.local` and fill it in (Project Settings > API for the URL and keys; `openssl rand -hex 32` for the two secrets).
7. `npm run dev`, open `/admin`, sign in, scan the QR code with an authenticator app. Done.

## Deploy to Vercel

1. Push this folder to a GitHub repo, then **Import** it in Vercel (framework is detected automatically).
2. Add the same env vars in Project Settings > Environment Variables. Set `NEXT_PUBLIC_SITE_URL` to your real domain.
3. Deploy. `vercel.json` registers the daily data-retention cron (02:17 WIB). Vercel sends `CRON_SECRET` automatically.

## Updating projects

`/admin` lists every project. In a project you can edit text, publish or unpublish, feature it on the home page "Pick a brand" selector, change sort order, upload images (converted to WebP in your browser, metadata stripped), write alt text, reorder, pick the cover, or delete. Changes show on the live site straight away.

Featured projects (max 8) appear in the home selector. Industry decides which filter a project sits under; "Side quests" go to `/side-quests` instead of `/work`.

## Checks

```bash
npm run lint && npm run typecheck && npm run build
npm audit --omit=dev
```

`supabase/tests/` holds a Postgres test that applies the migration and seed and proves the RLS rules. CI runs it on every push (`.github/workflows/ci.yml`).

## Where things live

```
src/app/(site)/        public pages
src/app/admin/         CMS pages and Server Actions
src/components/motion/ boot loader, page curtain, smooth scroll, scroll reveals
src/components/home/   hero, marquee, manifesto, case selector, stats, industries
src/lib/seed/          seed content (edit, then `npm run seed:sql`)
src/proxy.ts           per-request CSP nonce, admin session refresh
supabase/              migration, seed, RLS tests
```
