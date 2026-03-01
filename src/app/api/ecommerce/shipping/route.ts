import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Public API for storefront – shipping zones (for checkout).
 * No auth required.
 */
export async function GET() {
  const zones = await prisma.shippingZone.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(zones);
}
