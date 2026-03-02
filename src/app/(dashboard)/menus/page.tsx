import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { menuGroupToJson } from "@/lib/menu";
import { TopBar } from "@/components/layout/TopBar";
import { MenusClient } from "./MenusClient";

export default async function MenusPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/v2/login");

  let groups: Awaited<ReturnType<typeof menuGroupToJson>>[] = [];
  let categories: { id: string; name: string; slug: string }[] = [];
  try {
    const [rows, catRows] = await Promise.all([
      prisma.menuGroup.findMany({
        orderBy: { sortOrder: "asc" },
        include: { items: { orderBy: { sortOrder: "asc" } } },
      }),
      prisma.category.findMany({
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        select: { id: true, name: true, slug: true },
      }),
    ]);
    groups = rows.map(menuGroupToJson);
    categories = catRows;
  } catch (e) {
    console.error("Menus page: failed to load", e);
  }

  return (
    <div className="min-h-full">
      <TopBar
        breadcrumbs={[{ label: "Menus" }]}
        title="Footer & Header Menus"
        description="Manage menu groups (e.g. CATEGORY, QUICK LINKS) and their links. These appear on the storefront footer/header."
      />
      <div className="p-6">
        <MenusClient initialGroups={groups} initialCategories={categories} />
      </div>
    </div>
  );
}
