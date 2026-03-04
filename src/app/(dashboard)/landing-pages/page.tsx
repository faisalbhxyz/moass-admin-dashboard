import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { TopBar } from "@/components/layout/TopBar";
import { LandingPagesClient } from "./LandingPagesClient";

export default async function LandingPagesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/v2/login");

  const [landingPages, settingsRows, products] = await Promise.all([
    prisma.productLandingPage.findMany({
      orderBy: { createdAt: "desc" },
      include: { product: { select: { id: true, name: true, slug: true } } },
    }),
    prisma.setting.findMany(),
    prisma.product.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      take: 200,
      select: { id: true, name: true, slug: true },
    }),
  ]);

  const settings: Record<string, string> = {};
  for (const r of settingsRows) settings[r.key] = r.value;
  const storefrontBaseUrl = settings.storefront_base_url ?? process.env.STOREFRONT_ORIGIN ?? "";

  return (
    <div className="min-h-full">
      <TopBar
        breadcrumbs={[{ label: "Landing Page" }]}
        title="Product Landing Pages"
        description="Create landing page links for products. Share these links for one-page order flow."
      />
      <div className="p-6">
        <LandingPagesClient
          initialLandingPages={landingPages}
          products={products}
          storefrontBaseUrl={storefrontBaseUrl}
        />
      </div>
    </div>
  );
}
