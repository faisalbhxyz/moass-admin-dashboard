import { NextResponse } from "next/server";
import { getCachedPublicSettings } from "@/lib/ecommerce-public-data";
import { PUBLIC_API_CACHE } from "@/lib/api-cache-headers";

/**
 * Public API for storefront – public settings (site name, currency).
 * No auth required.
 */
export async function GET() {
  const settings = await getCachedPublicSettings();
  return NextResponse.json(settings, {
    headers: { "Cache-Control": PUBLIC_API_CACHE.long },
  });
}
