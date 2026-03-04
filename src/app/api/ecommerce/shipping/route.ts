import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { PUBLIC_API_CACHE } from "@/lib/api-cache-headers";

/**
 * Public API for storefront – shipping zones (for checkout).
 * No auth required.
 */
export async function GET() {
  const zones = await prisma.shippingZone.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(zones, {
    headers: { "Cache-Control": PUBLIC_API_CACHE.medium },
  });
}
