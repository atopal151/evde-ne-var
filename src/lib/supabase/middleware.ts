import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  localeCookieOptions,
  resolveInitialLocale,
} from "@/lib/i18n/locale-cookie";

const PUBLIC_PATHS = ["/login", "/register", "/auth"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

  if (useMock || !url || !key) {
    return applyLocaleCookie(request, NextResponse.next({ request }));
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublic = isPublicPath(pathname);
  const isApi = pathname.startsWith("/api");

  if (!user && !isPublic && !isApi) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname);
    return applyLocaleCookie(
      request,
      NextResponse.redirect(redirectUrl)
    );
  }

  if (user && (pathname === "/login" || pathname === "/register")) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/";
    return applyLocaleCookie(
      request,
      NextResponse.redirect(redirectUrl)
    );
  }

  return applyLocaleCookie(request, supabaseResponse);
}

function applyLocaleCookie(
  request: NextRequest,
  response: NextResponse
): NextResponse {
  if (!request.cookies.get(localeCookieOptions.name)) {
    const locale = resolveInitialLocale(
      undefined,
      request.headers.get("accept-language")
    );
    response.cookies.set(
      localeCookieOptions.name,
      locale,
      localeCookieOptions
    );
  }

  return response;
}
