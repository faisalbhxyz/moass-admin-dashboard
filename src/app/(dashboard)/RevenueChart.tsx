"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, subDays } from "date-fns";

type Order = { total: { toString(): string }; createdAt: Date };

export function RevenueChart({ orders, days }: { orders: Order[]; days: number }) {
  const data = useMemo(() => {
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

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="text-sm font-medium text-gray-900">
          Revenue (last {days} days)
        </div>
      </div>
      <div className="px-6 py-4">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#D1D5DB" strokeDasharray="0" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: "#6B7280" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#6B7280" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `৳${v}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #E5E7EB",
                  borderRadius: "6px",
                  boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
                  fontSize: "12px",
                }}
                formatter={(value: number) => [`৳${value?.toLocaleString()}`, "Revenue"]}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#111827"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
