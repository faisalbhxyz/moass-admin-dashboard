import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { TopBar } from "@/components/layout/TopBar";
import { ProductForm } from "../[id]/edit/ProductForm";

export default async function NewProductPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/v2/login");
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { children: { orderBy: { sortOrder: "asc" } } },
  });
  return (
    <div className="min-h-full">
      <TopBar
        breadcrumbs={[
          { label: "Products", href: "/products" },
          { label: "Add New Product" },
        ]}
        title="Add New Product"
        description="Add a new product to your store"
      />
      <div className="p-6">
        <ProductForm categories={categories} product={null} />
      </div>
    </div>
  );
}
