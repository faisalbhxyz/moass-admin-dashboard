import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { TopBar } from "@/components/layout/TopBar";
import { CustomersTable } from "./CustomersTable";

const PAGE_SIZE = 20;

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/v2/login");

  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page ?? "1", 10));
  const search = params.search?.trim() || undefined;

  const where = search
    ? {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
        ],
      }
    : {};

  const [customers, totalCount] = await Promise.all([
    prisma.customer.findMany({
      where,
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: { createdAt: "desc" },
    }),
    prisma.customer.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;

  return (
    <div className="min-h-full">
      <TopBar
        breadcrumbs={[{ label: "Customers" }]}
        title="Customers"
        description="Search by name or email."
      />
      <div className="p-6">
        <CustomersTable
          customers={customers}
          currentSearch={search ?? ""}
          pagination={{ currentPage, totalPages, totalCount }}
        />
      </div>
    </div>
  );
}
