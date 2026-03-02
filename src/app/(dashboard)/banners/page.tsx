import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { bannerToJson } from "@/lib/banner";
import { TopBar } from "@/components/layout/TopBar";
import { BannersClient } from "./BannersClient";

export default async function BannersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/v2/login");

  let banners: { id: string; title: string | null; image: string; link: string | null; sortOrder: number; active: boolean }[] = [];
  try {
    const rows = await prisma.banner.findMany({
      orderBy: { sortOrder: "asc" },
    });
    banners = rows.map(bannerToJson);
  } catch (e) {
    console.error("Banners page: failed to load banners", e);
  }

  return (
    <div className="min-h-full">
      <TopBar breadcrumbs={[{ label: "Banners" }]} />
      <div className="p-6">
        <BannersClient initialBanners={banners} />
      </div>
    </div>
  );
}
