import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { PUBLIC_API_CACHE } from "@/lib/api-cache-headers";

/**
 * Public API for storefront – list all content pages (slug, title) for links.
 * No auth. Full HTML is available via GET /api/ecommerce/pages/[slug].
 */
export async function GET() {
  const pages = await prisma.contentPage.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    select: { id: true, slug: true, title: true },
  });
  return NextResponse.json(pages, {
    headers: { "Cache-Control": PUBLIC_API_CACHE.medium },
  });
}
