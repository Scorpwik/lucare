import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { env, isDemoMode, supabaseConfigured } from "@/lib/env";

const DEMO_COOKIE = "lucare-demo-session";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const pathname = request.nextUrl.pathname;
  const isPublic =
    pathname.startsWith("/login") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/manifest") ||
    pathname === "/favicon.ico" ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$/i.test(pathname);

  if (isDemoMode()) {
    const hasDemo = request.cookies.get(DEMO_COOKIE)?.value === "1";
    const isApp =
      pathname.startsWith("/hoy") ||
      pathname.startsWith("/gym") ||
      pathname.startsWith("/gimnasio") ||
      pathname.startsWith("/cuidado") ||
      pathname.startsWith("/cuidado-personal") ||
      pathname.startsWith("/cuerpo") ||
      pathname.startsWith("/sueno-habitos") ||
      pathname.startsWith("/mente") ||
      pathname.startsWith("/agenda") ||
      pathname.startsWith("/ajustes") ||
      pathname.startsWith("/habitos-mente");

    if (isApp && !hasDemo && pathname !== "/login") {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    if (pathname === "/login" && hasDemo) {
      const url = request.nextUrl.clone();
      url.pathname = "/hoy";
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  }

  if (!supabaseConfigured()) {
    if (pathname === "/" || pathname.startsWith("/hoy")) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL!,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const protectedPrefixes = [
    "/hoy",
    "/gym",
    "/gimnasio",
    "/cuidado",
    "/cuidado-personal",
    "/cuerpo",
    "/sueno-habitos",
    "/mente",
    "/agenda",
    "/ajustes",
    "/habitos-mente",
  ];
  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));

  if (!user && isProtected && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/hoy";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export { DEMO_COOKIE };