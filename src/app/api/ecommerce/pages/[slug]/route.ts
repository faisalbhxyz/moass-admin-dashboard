import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Public API for storefront – get one content page by slug.
 * Returns title + content (HTML). Storefront should render content as HTML
 * (e.g. dangerouslySetInnerHTML in React) so the same design appears.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const page = await prisma.contentPage.findFirst({
    where: { slug, active: true },
    select: { id: true, slug: true, title: true, content: true, updatedAt: true },
  });
  if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 });
  return NextResponse.json(page);
}
