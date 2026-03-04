/**
 * Cache-Control headers for public ecommerce APIs.
 * Only use on endpoints that return non-sensitive, public data.
 * Do NOT use on admin APIs, customer-specific, or auth-related endpoints.
 *
 * s-maxage: CDN cache duration (seconds)
 * stale-while-revalidate: serve stale while background revalidate
 */
export const PUBLIC_API_CACHE = {
  /** Settings, payment methods – rarely change (5 min) */
  long: "public, s-maxage=300, stale-while-revalidate=60",
  /** Categories, banners, menus, shipping – moderate (2 min) */
  medium: "public, s-maxage=120, stale-while-revalidate=60",
  /** Products list/detail – fresher data (1 min) */
  short: "public, s-maxage=60, stale-while-revalidate=30",
} as const;

export function jsonWithCache<T>(data: T, cache: keyof typeof PUBLIC_API_CACHE) {
  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": PUBLIC_API_CACHE[cache],
    },
  });
}
