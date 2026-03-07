import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const cookiesToSet: { name: string; value: string; options: object }[] = [];

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookies) {
            cookiesToSet.push(...cookies);
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      const redirectPath = profile?.role === "admin" ? "/mn/admin" : "/mn";
      const redirectResponse = NextResponse.redirect(`${origin}${redirectPath}`);
      cookiesToSet.forEach(({ name, value, options }) =>
        redirectResponse.cookies.set(name, value, options as Parameters<typeof redirectResponse.cookies.set>[2])
      );
      return redirectResponse;
    }
  }

  return NextResponse.redirect(`${origin}/mn?error=oauth`);
}
