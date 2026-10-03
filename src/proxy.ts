import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Runs before every page request:
 *  1. Builds a per-request nonce-based Content-Security-Policy (OWASP A05).
 *  2. On /admin routes, refreshes the Supabase session cookie and bounces
 *     anonymous visitors to the login page. This is a convenience gate only:
 *     every admin page and Server Action re-checks auth on its own
 *     (see src/lib/auth.ts), and the database enforces RLS underneath.
 */
export async function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = process.env.NODE_ENV === "development";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseOrigin = supabaseUrl ? new URL(supabaseUrl).origin : "";
  const supabaseWs = supabaseOrigin.replace(/^https:/, "wss:");

  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    // <style> elements need the nonce; inline style *attributes* (next/image,
    // GSAP's server-safe initial states) are allowed. Attribute styles cannot
    // execute script, so this is the usual trade-off.
    // Dev tooling injects un-nonced <style> tags, so dev relaxes this.
    isDev ? `style-src 'self' 'unsafe-inline'` : `style-src 'self' 'nonce-${nonce}'`,
    `style-src-attr 'unsafe-inline'`,
    `img-src 'self' data: blob: ${supabaseOrigin}`.trim(),
    `font-src 'self'`,
    `connect-src 'self' ${supabaseOrigin} ${supabaseWs}`.trim(),
    `media-src 'self' ${supabaseOrigin}`.trim(),
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `manifest-src 'self'`,
    isDev ? "" : "upgrade-insecure-requests",
  ]
    .filter(Boolean)
    .join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  let response = NextResponse.next({ request: { headers: requestHeaders } });

  const { pathname } = request.nextUrl;
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin && supabaseUrl && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const supabase = createServerClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request: { headers: requestHeaders } });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    });

    // getUser() validates the JWT with Supabase Auth instead of trusting the cookie.
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const isPublicAdminRoute = pathname === "/admin/login";
    if (!user && !isPublicAdminRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      const redirect = NextResponse.redirect(url);
      redirect.headers.set("Content-Security-Policy", csp);
      return redirect;
    }
  }

  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico|icon.svg|seed/|brand/|.*\\.(?:png|jpg|jpeg|webp|avif|svg|pdf|woff2)$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
