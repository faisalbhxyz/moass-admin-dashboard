import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/api-auth";
import { startOfDay, subDays, format } from "date-fns";

export async function GET(request: NextRequest) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const { searchParams } = new URL(request.url);
  const days = Math.min(90, Math.max(7, parseInt(searchParams.get("days") || "30", 10)));
  const start = startOfDay(subDays(new Date(), days));
  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: start } },
    select: { total: true, createdAt: true },
  });
  const byDay: Record<string, number> = {};
  for (let i = 0; i < days; i++) {
    const d = format(subDays(new Date(), days - 1 - i), "yyyy-MM-dd");
    byDay[d] = 0;
  }
  for (const o of orders) {
    const d = format(o.createdAt, "yyyy-MM-dd");
    if (byDay[d] !== undefined) byDay[d] += Number(o.total);
  }
  const chart = Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value }));
  return NextResponse.json({ chart });
}
