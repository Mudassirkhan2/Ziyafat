import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/signup", "/setup"];
const AUTH_ONLY_PATHS = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("access_token");
  const refreshToken = request.cookies.get("refresh_token");

  // Authenticated users visiting login/signup get sent to the app
  if ((accessToken || refreshToken) && AUTH_ONLY_PATHS.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Public paths don't require auth
  if (
    PUBLIC_PATHS.some((p) =>
      p === "/" ? pathname === "/" : pathname === p || pathname.startsWith(`${p}/`)
    )
  ) {
    return NextResponse.next();
  }

  // Require at least one valid token cookie — api.ts will refresh if needed
  if (!accessToken && !refreshToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
