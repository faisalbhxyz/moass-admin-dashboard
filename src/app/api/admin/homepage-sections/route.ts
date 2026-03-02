import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/api-auth";
import { parseSectionConfig, HOMEPAGE_SECTION_KEYS, stringifySectionConfig } from "@/lib/homepage-sections";
import { z } from "zod";

export async function GET() {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const count = await prisma.homepageSection.count();
  if (count === 0) {
    for (let i = 0; i < HOMEPAGE_SECTION_KEYS.length; i++) {
      const key = HOMEPAGE_SECTION_KEYS[i];
      await prisma.homepageSection.create({
        data: {
          key,
          type: "auto",
          title: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
          sortOrder: i,
        },
      });
    }
  }

  const rows = await prisma.homepageSection.findMany({
    orderBy: [{ sortOrder: "asc" }, { key: "asc" }],
  });

  const sections = rows.map((row) => {
    const config = parseSectionConfig(row.config);
    return {
      id: row.id,
      key: row.key,
      title: row.title ?? undefined,
      mode: config.mode,
      is_active: config.is_active,
      pinned_count: config.pinned_product_ids.length,
      max_items: config.max_items,
      auto_days: config.auto_days,
      auto_category: config.auto_category,
      config,
    };
  });

  return NextResponse.json({ sections });
}

const createSchema = z.object({
  key: z.string().min(1).max(64).regex(/^[a-z0-9_]+$/, "Only lowercase letters, numbers, underscore"),
  title: z.string().max(120).optional(),
});

export async function POST(request: NextRequest) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const body = await request.json();
  const data = createSchema.parse(body);
  const key = data.key.trim().toLowerCase();
  const existing = await prisma.homepageSection.findUnique({ where: { key } });
  if (existing) {
    return NextResponse.json({ error: "A section with this key already exists." }, { status: 400 });
  }

  const maxOrder = await prisma.homepageSection.aggregate({ _max: { sortOrder: true } });
  const sortOrder = (maxOrder._max.sortOrder ?? -1) + 1;
  const defaultConfig = stringifySectionConfig({
    mode: "auto",
    max_items: 8,
    auto_days: 30,
    auto_category: null,
    is_active: true,
    pinned_product_ids: [],
  });

  const section = await prisma.homepageSection.create({
    data: {
      key,
      type: "auto",
      title: data.title?.trim() || key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      config: defaultConfig,
      sortOrder,
    },
  });

  const config = parseSectionConfig(section.config);
  return NextResponse.json({
    section: {
      id: section.id,
      key: section.key,
      title: section.title ?? undefined,
      mode: config.mode,
      is_active: config.is_active,
      pinned_count: config.pinned_product_ids.length,
      max_items: config.max_items,
      auto_days: config.auto_days,
      auto_category: config.auto_category,
      config,
    },
  });
}
