import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { menuGroupToJson } from "@/lib/menu";
import {
  getCachedPublicSettings,
  getCachedCategories,
  getCachedBanners,
} from "@/lib/ecommerce-public-data";
import { PUBLIC_API_CACHE } from "@/lib/api-cache-headers";

/**
 * Bootstrap API – single request for storefront first load.
 * Returns settings, categories, banners, menus, payment methods, shipping, pages.
 * Reduces multiple round trips to one. No auth required.
 */
export async function GET() {
  const [
    settings,
    categories,
    banners,
    menuGroups,
    paymentMethods,
    shippingZones,
    pages,
  ] = await Promise.all([
    getCachedPublicSettings(),
    getCachedCategories(),
    getCachedBanners(),
    prisma.menuGroup.findMany({
      orderBy: { sortOrder: "asc" },
      include: { items: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.paymentMethod.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        type: true,
        instructions: true,
        accountNumber: true,
        logoUrl: true,
      },
    }),
    prisma.shippingZone.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.contentPage.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
      select: { id: true, slug: true, title: true },
    }),
  ]);

  const menus = menuGroups.map(menuGroupToJson);
  const payment_methods = paymentMethods.map((m) => ({
    id: m.id,
    name: m.name,
    type: m.type,
    instructions: m.instructions,
    account_number: m.accountNumber,
    logo_url: m.logoUrl,
  }));

  return NextResponse.json(
    {
      settings,
      categories,
      banners,
      menus,
      payment_methods,
      shipping: shippingZones,
      pages,
    },
    { headers: { "Cache-Control": PUBLIC_API_CACHE.short } }
  );
}
