/**
 * In-memory rate limiter (per IP).
 * Protects against brute-force (login) and fraud orders.
 * Per IP: limits apply per visitor; whole site not limited.
 */

type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();

const WINDOW_MS = 60 * 1000; // 1 minute

function cleanup() {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) store.delete(key);
  }
}
// Occasional cleanup to prevent memory leak
if (typeof setInterval !== "undefined") {
  setInterval(cleanup, 60_000);
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(
  identifier: string,
  limit: number
): RateLimitResult {
  const now = Date.now();
  const key = identifier;
  let entry = store.get(key);
  if (!entry || entry.resetAt < now) {
    entry = { count: 0, resetAt: now + WINDOW_MS };
    store.set(key, entry);
  }
  entry.count += 1;
  const remaining = Math.max(0, limit - entry.count);
  const ok = entry.count <= limit;
  return { ok, remaining, resetAt: entry.resetAt };
}

/** Stricter limits for fraud protection (Bangladesh context) */
export const LIMITS = {
  /** Admin login – brute force protection */
  ADMIN_LOGIN: 3,
  /** Customer (storefront) login */
  CUSTOMER_LOGIN: 3,
  /** Customer registration – spam prevention */
  CUSTOMER_REGISTER: 2,
  /** Order placement – fraud protection (real user rarely places 3 orders/min) */
  ORDER_PLACE: 3,
} as const;

export function withRateLimit(
  request: Request,
  limit: number
): { ok: true } | { ok: false; response: Response } {
  const ip = getClientIp(request);
  const result = checkRateLimit(ip, limit);
  if (result.ok) return { ok: true };
  return {
    ok: false,
    response: new Response(
      JSON.stringify({
        error: "বহুবার চেষ্টা করা হয়েছে। কয়েক মিনিট পরে আবার চেষ্টা করুন।",
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(Math.ceil((result.resetAt - Date.now()) / 1000)),
          "X-RateLimit-Remaining": String(result.remaining),
        },
      }
    ),
  };
}
