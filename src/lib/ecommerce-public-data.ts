/**
 * Cached public data fetchers for ecommerce storefront APIs.
 * Used by individual routes and bootstrap API.
 * Only non-sensitive, public data – never customer/admin data.
 */
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { bannerToJson } from "@/lib/banner";

const PUBLIC_KEYS = ["site_name", "currency"];

async function getPublicSettingsRaw() {
  const rows = await prisma.setting.findMany({
    where: { key: { in: PUBLIC_KEYS } },
  });
  const settings: Record<string, string> = {};
  for (const r of rows) settings[r.key] = r.value;
  return settings;
}

async function getCategoriesRaw() {
  return prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      parent: true,
      children: true,
      _count: { select: { products: true } },
    },
  });
}

async function getBannersRaw() {
  const rows = await prisma.banner.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });
  return rows.map(bannerToJson);
}

export const getCachedPublicSettings = unstable_cache(
  getPublicSettingsRaw,
  ["ecommerce-public-settings"],
  { revalidate: 300 }
);

export const getCachedCategories = unstable_cache(
  getCategoriesRaw,
  ["ecommerce-categories"],
  { revalidate: 120 }
);

export const getCachedBanners = unstable_cache(
  getBannersRaw,
  ["ecommerce-banners"],
  { revalidate: 120 }
);
