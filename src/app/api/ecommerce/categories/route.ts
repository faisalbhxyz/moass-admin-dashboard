import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Public API for storefront – list categories (for nav/filter).
 * No auth required.
 */
export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      parent: true,
      children: true,
      _count: { select: { products: true } },
    },
  });
  return NextResponse.json(categories);
}
