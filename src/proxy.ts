import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/",
  "/auth/v2/login",
  "/auth/v2/register",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/validate",
  "/api/upload",
  "/api/debug-log",
];

const CORS_PATHS = ["/api/ecommerce", "/api/image", "/api/banner-image"];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

/** Production storefront domains allowed for CORS (API calls from storefront). */
const ALLOWED_STOREFRONT_ORIGINS = [
  "https://swift-e-shop.vercel.app",
  "https://www.moassfashion.com",
  "https://moassfashion.com",
];

function getAllowedOrigins(): string[] {
  const fromEnv = (process.env.STOREFRONT_ORIGIN || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  const localhost = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:3003",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:3002",
    "http://127.0.0.1:3003",
  ];
  return [...new Set([...ALLOWED_STOREFRONT_ORIGINS, ...fromEnv, ...localhost])];
}

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = getAllowedOrigins();
  const allowOrigin =
    origin && allowed.includes(origin) ? origin : allowed[0] || "*";
  const credentials = allowOrigin !== "*";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    ...(credentials ? { "Access-Control-Allow-Credentials": "true" } : {}),
  };
}

export function proxy(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

    // CORS for storefront API (localhost + STOREFRONT_ORIGIN)
    const isCorsPath = CORS_PATHS.some((p) => pathname.startsWith(p));
    if (isCorsPath) {
      const origin = request.headers.get("origin");
      if (request.method === "OPTIONS") {
        return new NextResponse(null, {
          status: 204,
          headers: {
            ...corsHeaders(origin),
            "Access-Control-Max-Age": "86400",
          },
        });
      }
      const res = NextResponse.next();
      Object.entries(corsHeaders(origin)).forEach(([k, v]) =>
        res.headers.set(k, v)
      );
      return res;
    }

    // Skip auth for Next.js static assets and internals (matcher may not exclude in all cases)
    if (
      pathname.startsWith("/_next/") ||
      pathname.startsWith("/favicon") ||
      pathname.startsWith("/api/")
    )
      return NextResponse.next();

    // Auth guard for dashboard pages
    if (isPublic(pathname)) return NextResponse.next();

    const token = request.cookies.get("ecomdash_session")?.value;
    if (!token) {
      // #region agent log
      fetch("http://127.0.0.1:7547/ingest/99499ef2-17dc-45b2-bd71-46407300a8b4",{method:"POST",headers:{"Content-Type":"application/json","X-Debug-Session-Id":"91330f"},body:JSON.stringify({sessionId:"91330f",location:"proxy:no token",message:"redirect to login no cookie",data:{pathname},timestamp:Date.now(),hypothesisId:"E"})}).catch(()=>{});
      // #endregion
      const login = new URL("/", request.url);
      login.searchParams.set("from", pathname);
      return NextResponse.redirect(login);
    }
    return NextResponse.next();
  } catch (err) {
    console.error("[proxy] error:", err);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/api/ecommerce/:path*",
    "/api/image/:path*",
    "/api/banner-image/:path*",
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};
