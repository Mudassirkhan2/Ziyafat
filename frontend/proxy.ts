import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/setup"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    PUBLIC_PATHS.some((p) =>
      p === "/" ? pathname === "/" : pathname === p || pathname.startsWith(`${p}/`)
    )
  ) {
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("access_token");
  if (!accessToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname !== "/setup") {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
      const setupRes = await fetch(`${apiUrl}/api/v1/setup/status`);
      const { completed } = await setupRes.json();
      if (!completed) {
        return NextResponse.redirect(new URL("/setup", request.url));
      }
    } catch {
      // If API is unreachable, proceed
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
