"use client";

import { useMemo } from "react";
import { format, subDays } from "date-fns";

// Simple bar chart without an external chart library
export function RevenueChart() {
  const data = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      return {
        date: format(date, "EEE"),
        revenue: Math.floor(Math.random() * 80000) + 20000,
      };
    });
  }, []);

  const maxRevenue = Math.max(...data.map((d) => d.revenue));

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-end gap-2 h-32">
        {data.map((d) => {
          const height = (d.revenue / maxRevenue) * 100;
          return (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
              <div className="relative w-full group">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-rose-500 to-pink-400 transition-all hover:from-rose-600 hover:to-pink-500"
                  style={{ height: `${(height / 100) * 120}px` }}
                />
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 hidden group-hover:block text-xs bg-gray-900 text-white px-1.5 py-0.5 rounded whitespace-nowrap">
                  ${(d.revenue / 100).toFixed(0)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-2">
        {data.map((d) => (
          <div key={d.date} className="flex-1 text-center text-xs text-gray-400">
            {d.date}
          </div>
        ))}
      </div>
    </div>
  );
}
