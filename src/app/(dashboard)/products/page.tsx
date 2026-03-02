import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { ProductsTable } from "./ProductsTable";

const PAGE_SIZE = 20;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const [user, params] = await Promise.all([getCurrentUser(), searchParams]);
  if (!user) redirect("/auth/v2/login");

  const currentPage = Math.max(1, parseInt(params.page ?? "1", 10));
  const search = params.search?.trim() || undefined;

  const where = search
    ? {
        OR: [
          { name: { contains: search } },
          { sku: { contains: search } },
        ],
      }
    : {};

  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: { categories: true },
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;

  return (
    <div className="min-h-full">
      <TopBar
        breadcrumbs={[{ label: "Products" }]}
        title="Products"
        description="Manage your catalog. Search by name or SKU."
        actions={
          <Link
            href="/products/new"
            className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-gray-700"
          >
            New product
          </Link>
        }
      />
      <div className="p-6">
        <ProductsTable
          products={products}
          currentSearch={search ?? ""}
          pagination={{ currentPage, totalPages, totalCount }}
        />
      </div>
    </div>
  );
}
