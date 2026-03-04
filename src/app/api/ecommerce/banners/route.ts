import { NextResponse } from "next/server";
import { getCachedBanners } from "@/lib/ecommerce-public-data";
import { PUBLIC_API_CACHE } from "@/lib/api-cache-headers";

/**
 * Public API for storefront – active banners only.
 * No auth required.
 */
export async function GET() {
  const banners = await getCachedBanners();
  return NextResponse.json(banners, {
    headers: { "Cache-Control": PUBLIC_API_CACHE.medium },
  });
}
