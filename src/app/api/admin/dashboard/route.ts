import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/api-auth";

export async function GET() {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const [
    totalOrders,
    totalRevenue,
    pendingOrders,
    totalCustomers,
    lowStockCount,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { total: true } }),
    prisma.order.count({ where: { status: "pending" } }),
    prisma.customer.count(),
    prisma.setting.findUnique({ where: { key: "low_stock_threshold" } }).then(async (s) => {
      const t = parseInt(s?.value ?? "5", 10);
      return prisma.product.count({ where: { stock: { lte: t }, published: true } });
    }),
  ]);
  const revenue = Number(totalRevenue._sum.total ?? 0);
  return NextResponse.json({
    totalOrders,
    totalRevenue: revenue,
    pendingOrders,
    totalCustomers,
    lowStockCount,
  });
}
