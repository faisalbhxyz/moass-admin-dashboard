import { NextResponse } from "next/server";
import { getCachedCategories } from "@/lib/ecommerce-public-data";
import { PUBLIC_API_CACHE } from "@/lib/api-cache-headers";

/**
 * Public API for storefront – list categories (for nav/filter).
 * No auth required.
 */
export async function GET() {
  const categories = await getCachedCategories();
  return NextResponse.json(categories, {
    headers: { "Cache-Control": PUBLIC_API_CACHE.medium },
  });
}
