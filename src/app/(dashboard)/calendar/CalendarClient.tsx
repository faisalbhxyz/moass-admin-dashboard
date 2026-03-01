"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Event = { id: string; title: string; date: string; status: string };

export function CalendarClient({ events }: { events: Event[] }) {
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [year, m] = month.split("-").map(Number);
  const first = new Date(year, m - 1, 1);
  const last = new Date(year, m, 0);
  const startPad = first.getDay();
  const daysInMonth = last.getDate();
  const byDate = useMemo(() => {
    const map: Record<string, Event[]> = {};
    for (const e of events) {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    }
    return map;
  }, [events]);

  const cells: (Event[] | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const date = `${year}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push(byDate[date] ?? []);
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-4 flex items-center gap-4">
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
        />
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="font-medium text-gray-500">{d}</div>
        ))}
        {cells.map((dayEvents, i) => (
          <div key={i} className="min-h-24 rounded-md border border-gray-100 p-2">
            {dayEvents === null ? null : (
              <>
                <span className="text-gray-500">{i - startPad + 1}</span>
                <ul className="mt-1 space-y-0.5">
                  {dayEvents.slice(0, 3).map((e) => (
                    <li key={e.id}>
                      <Link
                        href={`/orders/${e.id}`}
                        className="block truncate rounded-md bg-gray-100 px-1 py-0.5 text-xs text-gray-900 hover:bg-gray-200"
                      >
                        {e.title}
                      </Link>
                    </li>
                  ))}
                  {dayEvents.length > 3 && (
                    <li className="text-xs text-gray-400">+{dayEvents.length - 3} more</li>
                  )}
                </ul>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
