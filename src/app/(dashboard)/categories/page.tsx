import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { TopBar } from "@/components/layout/TopBar";
import { CategoriesClient } from "./CategoriesClient";

export default async function CategoriesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/v2/login");
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { parent: true, _count: { select: { products: true } } },
  });
  return (
    <div className="min-h-full">
      <TopBar breadcrumbs={[{ label: "Categories" }]} />
      <div className="p-6">
        <CategoriesClient initialCategories={categories} />
      </div>
    </div>
  );
}
