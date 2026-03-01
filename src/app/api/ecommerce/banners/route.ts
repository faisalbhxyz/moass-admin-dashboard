import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Public API for storefront – active banners only.
 * No auth required.
 */
export async function GET() {
  const banners = await prisma.banner.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(banners);
}
