import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseSectionConfig } from "@/lib/homepage-sections";
import { resolveSectionProducts, getSectionTitle } from "@/lib/resolve-homepage-section";
import { PUBLIC_API_CACHE } from "@/lib/api-cache-headers";

/**
 * স্টোরফ্রন্টের জন্য পাবলিক API – অথেন্টিকেশন লাগে না।
 * শুধু active সেকশনগুলো রিটার্ন করে, প্রতিটায় key, title ও resolved products।
 */
export async function GET() {
  const rows = await prisma.homepageSection.findMany({
    orderBy: [{ sortOrder: "asc" }, { key: "asc" }],
  });

  const activeRows = rows.filter((row) => {
    const config = parseSectionConfig(row.config);
    return config.is_active;
  });

  const sections = await Promise.all(
    activeRows.map(async (row) => ({
      key: row.key,
      title: getSectionTitle(row),
      products: await resolveSectionProducts(prisma, row),
    }))
  );

  return NextResponse.json({ sections }, {
    headers: { "Cache-Control": PUBLIC_API_CACHE.short },
  });
}
