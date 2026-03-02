import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseSectionConfig } from "@/lib/homepage-sections";
import { resolveSectionProducts, getSectionTitle } from "@/lib/resolve-homepage-section";

/**
 * স্টোরফ্রন্টের জন্য পাবলিক API – অথেন্টিকেশন লাগে না।
 * শুধু active সেকশনগুলো রিটার্ন করে, প্রতিটায় key, title ও resolved products।
 */
export async function GET() {
  const rows = await prisma.homepageSection.findMany({
    orderBy: [{ sortOrder: "asc" }, { key: "asc" }],
  });

  const sections: { key: string; title: string; products: Awaited<ReturnType<typeof resolveSectionProducts>> }[] = [];

  for (const row of rows) {
    const config = parseSectionConfig(row.config);
    if (!config.is_active) continue;

    const products = await resolveSectionProducts(prisma, row);
    sections.push({
      key: row.key,
      title: getSectionTitle(row),
      products,
    });
  }

  return NextResponse.json({ sections });
}
