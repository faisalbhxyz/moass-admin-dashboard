"use client";

import { useMemo } from "react";
import { format, subDays } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { BarChart, Bar, XAxis as BarX, YAxis as BarY, CartesianGrid as BarGrid, Tooltip as BarTooltip, ResponsiveContainer as BarResponsive } from "recharts";

type Order = { total: { toString(): string }; createdAt: Date };
type Top = { product: { name: string } | undefined; quantity: number };

export function ReportsCharts({
  orders,
  days,
  topProducts,
}: {
  orders: Order[];
  days: number;
  topProducts: Top[];
}) {
  const salesData = useMemo(() => {
    const byDay: Record<string, number> = {};
    for (let i = 0; i < days; i++) {
      const d = format(subDays(new Date(), days - 1 - i), "yyyy-MM-dd");
      byDay[d] = 0;
    }
    for (const o of orders) {
      const d = format(new Date(o.createdAt), "yyyy-MM-dd");
      if (byDay[d] !== undefined) byDay[d] += Number(o.total);
    }
    return Object.entries(byDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value]) => ({ date: format(new Date(date), "MMM d"), value }));
  }, [orders, days]);

  const topData = useMemo(
    () => topProducts.map((t) => ({ name: t.product?.name ?? "Unknown", quantity: t.quantity })),
    [topProducts]
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="text-sm font-medium text-gray-900">Sales (last {days} days)</div>
        </div>
        <div className="px-6 py-4">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid stroke="#D1D5DB" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #E5E7EB", borderRadius: "6px", boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)", fontSize: "12px" }} />
                <Line type="monotone" dataKey="value" stroke="#111827" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="text-sm font-medium text-gray-900">Top products (by quantity sold)</div>
        </div>
        <div className="px-6 py-4">
          <div className="h-80">
            <BarResponsive width="100%" height="100%">
              <BarChart data={topData} layout="vertical" margin={{ left: 80 }}>
                <BarGrid stroke="#D1D5DB" />
                <BarX type="number" tick={{ fontSize: 12, fill: "#6B7280" }} />
                <BarY type="category" dataKey="name" width={70} tick={{ fontSize: 12, fill: "#6B7280" }} />
                <BarTooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #E5E7EB", borderRadius: "6px", fontSize: "12px" }} />
                <Bar dataKey="quantity" fill="#111827" />
              </BarChart>
            </BarResponsive>
          </div>
        </div>
      </div>
    </div>
  );
}
