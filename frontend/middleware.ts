import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/setup"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Pass through Next.js internals and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check setup status first — fresh installs redirect everyone to /setup
  if (pathname !== "/setup") {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
      const setupRes = await fetch(`${apiUrl}/api/v1/setup/status`);
      if (setupRes.ok) {
        const { completed } = await setupRes.json();
        if (!completed) {
          return NextResponse.redirect(new URL("/setup", request.url));
        }
      }
    } catch {
      // API unreachable — allow through so the UI can show an error
    }
  }

  // Public paths don't require auth
  if (
    PUBLIC_PATHS.some((p) =>
      p === "/" ? pathname === "/" : pathname === p || pathname.startsWith(`${p}/`)
    )
  ) {
    return NextResponse.next();
  }

  // All other paths require an access token cookie
  const accessToken = request.cookies.get("access_token");
  if (!accessToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
