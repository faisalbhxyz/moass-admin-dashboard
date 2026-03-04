import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { TopBar } from "@/components/layout/TopBar";
import { TransactionsTable } from "./TransactionsTable";
import Link from "next/link";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/v2/login");

  const { status, page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page ?? "1", 10));
  const pageSize = 10;

  // Only orders with a non-COD payment method (Cash on Delivery does not appear in transactions)
  const baseWhere = {
    paymentMethodId: { not: null },
    paymentMethod: { type: { not: "COD" } },
  };
  const statusFilter = status === "verified" ? "paid" : status === "pending" ? "pending" : undefined;
  const where = {
    ...baseWhere,
    ...(statusFilter ? { status: statusFilter } : {}),
  };

  const [transactions, totalCount, pendingCount, verifiedCount] = await Promise.all([
    prisma.order.findMany({
      where,
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        customer: true,
        paymentMethod: true,
        items: { take: 1, include: { product: true } },
      },
    }),
    prisma.order.count({ where }),
    prisma.order.count({ where: { ...baseWhere, status: "pending" } }),
    prisma.order.count({ where: { ...baseWhere, status: "paid" } }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className="min-h-full">
      <TopBar
        breadcrumbs={[{ label: "Transactions" }]}
        title="Transactions"
        description="Verify payments for orders. Pending transactions need admin verification to complete."
        actions={
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            View all orders
          </Link>
        }
      />
      <div className="p-6">
        <TransactionsTable
          transactions={transactions}
          currentStatus={status ?? "all"}
          summary={{ pendingCount, verifiedCount, totalCount }}
          pagination={{ currentPage, totalPages, totalCount }}
        />
      </div>
    </div>
  );
}
