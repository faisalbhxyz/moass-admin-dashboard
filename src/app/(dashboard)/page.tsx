import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { DashboardStats } from "./DashboardStats";
import { CombinedBudgetChart } from "./CombinedBudgetChart";
import { AnalyticsPanel } from "./AnalyticsPanel";
import { RecentOrdersTable } from "./RecentOrdersTable";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/v2/login");

  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const [
    totalOrders,
    totalRevenue,
    completedOrders,
    cancelledOrders,
    productCount,
    ordersForChart,
    recentOrders,
    inStockCount,
    outStockCount,
  ] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: oneYearAgo } } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { createdAt: { gte: oneYearAgo } } }),
    prisma.order.count({ where: { status: "delivered", createdAt: { gte: oneYearAgo } } }),
    prisma.order.count({ where: { status: "cancelled", createdAt: { gte: oneYearAgo } } }),
    prisma.product.count(),
    prisma.order.findMany({
      where: { createdAt: { gte: oneYearAgo } },
      select: { total: true, createdAt: true },
    }),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { customer: true, items: { take: 1, include: { product: true } } },
    }),
    prisma.product.count({ where: { stock: { gt: 0 }, published: true } }),
    prisma.product.count({ where: { OR: [{ stock: 0 }, { published: false }] } }),
  ]);

  const revenue = Number(totalRevenue._sum.total ?? 0);

  return (
    <div className="min-h-full">
      <TopBar
        breadcrumbs={[{ label: "Dashboard" }]}
        title="Welcome Back!"
        description="Some explanation here on dashboard overview"
      />
      <div className="space-y-6 p-6">
        <DashboardStats
          totalRevenue={revenue}
          productSales={totalOrders}
          completedOrder={completedOrders}
          cancelledOrder={cancelledOrders}
        />
        <div className="grid gap-6 lg:grid-cols-2">
          <CombinedBudgetChart orders={ordersForChart} />
          <AnalyticsPanel
            inStockCount={inStockCount}
            outStockCount={outStockCount}
            totalProducts={productCount}
            totalOrders={totalOrders}
          />
        </div>
        <RecentOrdersTable orders={recentOrders} />
      </div>
    </div>
  );
}
