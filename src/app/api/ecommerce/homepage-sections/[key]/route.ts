import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseSectionConfig } from "@/lib/homepage-sections";
import { resolveSectionProducts, getSectionTitle } from "@/lib/resolve-homepage-section";

/**
 * স্টোরফ্রন্টের জন্য একক সেকশন – পাবলিক, অথেন্টিকেশন লাগে না।
 * সেকশন active না থাকলে 404।
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  const section = await prisma.homepageSection.findUnique({
    where: { key },
  });
  if (!section) {
    return NextResponse.json({ error: "Section not found" }, { status: 404 });
  }

  const config = parseSectionConfig(section.config);
  if (!config.is_active) {
    return NextResponse.json({ error: "Section is not active" }, { status: 404 });
  }

  const products = await resolveSectionProducts(prisma, section);

  return NextResponse.json({
    key: section.key,
    title: getSectionTitle(section),
    products,
  });
}
