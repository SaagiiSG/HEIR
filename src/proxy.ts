import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const intlMiddleware = createMiddleware(routing);

const AUTH_REQUIRED = ["/checkout", "/account"];
const ADMIN_REQUIRED = ["/admin"];

function getRouteWithoutLocale(pathname: string): string {
  return pathname.replace(/^\/(mn|en)/, "") || "/";
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const routePath = getRouteWithoutLocale(pathname);
  const locale = pathname.split("/")[1] || "mn";

  // Refresh session and check auth
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const needsAuth = AUTH_REQUIRED.some((p) => routePath.startsWith(p));
  const needsAdmin = ADMIN_REQUIRED.some((p) => routePath.startsWith(p));

  if ((needsAuth || needsAdmin) && !user) {
    return NextResponse.redirect(
      new URL(`/${locale}/login?next=${pathname}`, request.url)
    );
  }

  if (needsAdmin && user) {
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role !== "admin") {
      return NextResponse.redirect(new URL(`/${locale}`, request.url));
    }
  }

  // Run intl middleware and forward any refreshed session cookies
  const intlResponse = intlMiddleware(request);
  response.cookies.getAll().forEach(({ name, value, ...opts }) => {
    intlResponse.cookies.set(name, value, opts);
  });
  return intlResponse;
}

export default proxy;

export const config = {
  matcher: [
    "/((?!api|auth|_next/static|_next/image|favicon.ico|.*\\..*).*)","/(mn|en)/:path*",
  ],
};
