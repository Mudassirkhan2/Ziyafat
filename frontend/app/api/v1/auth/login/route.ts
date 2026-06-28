import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8000";

function reemitCookies(backendRes: Response, res: NextResponse) {
  const setCookies = backendRes.headers.getSetCookie?.() ?? [];
  for (const cookie of setCookies) {
    const parts = cookie.split(";").map((s) => s.trim());
    const eqIdx = parts[0].indexOf("=");
    const name = parts[0].slice(0, eqIdx);
    const value = parts[0].slice(eqIdx + 1);
    let maxAge: number | undefined;
    for (const attr of parts.slice(1)) {
      if (attr.toLowerCase().startsWith("max-age=")) {
        maxAge = parseInt(attr.split("=")[1]);
      }
    }
    res.cookies.set(name, value, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      ...(maxAge !== undefined && { maxAge }),
    });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const backendRes = await fetch(`${BACKEND}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await backendRes.json();
  const res = NextResponse.json(data, { status: backendRes.status });
  if (backendRes.ok) reemitCookies(backendRes, res);
  return res;
}
