import { getCurrentUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { TopBar } from "@/components/layout/TopBar";
import { ProductForm } from "./ProductForm";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/v2/login");
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!product) notFound();
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return (
    <div className="min-h-full">
      <TopBar
        breadcrumbs={[
          { label: "Products", href: "/products" },
          { label: product.name },
        ]}
      />
      <div className="p-6">
        <ProductForm categories={categories} product={product} />
      </div>
    </div>
  );
}
