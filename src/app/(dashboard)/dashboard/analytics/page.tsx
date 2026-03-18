import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import Link from "next/link";
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Star,
  Building2,
  ArrowUpRight,
} from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/actions/user";
import { getProviderAnalytics } from "@/actions/analytics";
import { formatCurrency, BOOKING_STATUS_CONFIG, LISTING_TYPE_CONFIG } from "@/lib/utils";

export const metadata: Metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role === "CUSTOMER") redirect("/dashboard");

  const data = await getProviderAnalytics();

  const maxRevenue = Math.max(...data.months.map((m) => m.revenue), 1);
  const maxBookings = Math.max(...data.dailyTrend.map((d) => d.bookings), 1);
  const totalStatusCount = data.byStatus.reduce((a, b) => a + b.count, 0) || 1;

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-400",
    CONFIRMED: "bg-blue-400",
    COMPLETED: "bg-emerald-400",
    CANCELLED: "bg-red-400",
    NO_SHOW: "bg-gray-400",
  };

  const typeColors: Record<string, string> = {
    SALON: "bg-pink-100 text-pink-700",
    HOTEL: "bg-blue-100 text-blue-700",
    MEDICAL: "bg-emerald-100 text-emerald-700",
    AIRPORT: "bg-sky-100 text-sky-700",
    FLIGHT: "bg-violet-100 text-violet-700",
    CRUISE: "bg-teal-100 text-teal-700",
  };

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar user={user} />
      <main className="flex-1 p-8 bg-gray-50">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-sm text-gray-500 mt-1">Performance overview for your listings</p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Revenue", value: formatCurrency(data.totals.revenue), icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-50" },
              { label: "Total Bookings", value: data.totals.bookings, icon: Calendar, color: "text-blue-500", bg: "bg-blue-50" },
              { label: "Avg Rating", value: data.totals.avgRating.toFixed(1), icon: Star, color: "text-amber-500", bg: "bg-amber-50" },
              { label: "Listings", value: data.totals.listings, icon: Building2, color: "text-violet-500", bg: "bg-violet-50" },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className={`${bg} rounded-2xl p-5 flex items-center gap-4`}>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm shrink-0">
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Revenue Chart + Bookings by Status */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Monthly Revenue Bar Chart */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-semibold text-gray-900">Monthly Revenue</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Last 6 months</p>
                </div>
                <TrendingUp className="h-5 w-5 text-emerald-500" />
              </div>
              <div className="flex items-end gap-3 h-40">
                {data.months.map((m) => {
                  const pct = maxRevenue > 0 ? (m.revenue / maxRevenue) * 100 : 0;
                  return (
                    <div key={m.label} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full relative group flex-1 flex items-end">
                        <div
                          className="w-full rounded-t-lg bg-emerald-400 hover:bg-emerald-500 transition-colors cursor-default"
                          style={{ height: `${Math.max(4, pct)}%` }}
                        />
                        {/* Tooltip */}
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          {formatCurrency(m.revenue)}
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">{m.label}</span>
                    </div>
                  );
                })}
              </div>
              {/* Bookings count below */}
              <div className="flex gap-3 mt-2">
                {data.months.map((m) => (
                  <div key={m.label} className="flex-1 text-center">
                    <span className="text-xs text-gray-400">{m.bookings}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 text-center mt-1">bookings per month</p>
            </div>

            {/* Bookings by Status */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-6">Bookings by Status</h2>
              {/* Stacked bar */}
              <div className="flex h-3 rounded-full overflow-hidden mb-4 gap-0.5">
                {data.byStatus.map((s) => (
                  <div
                    key={s.status}
                    className={`${statusColors[s.status] ?? "bg-gray-300"} transition-all`}
                    style={{ width: `${(s.count / totalStatusCount) * 100}%` }}
                  />
                ))}
              </div>
              <div className="space-y-3">
                {data.byStatus.map((s) => {
                  const cfg = BOOKING_STATUS_CONFIG[s.status as keyof typeof BOOKING_STATUS_CONFIG];
                  const pct = Math.round((s.count / totalStatusCount) * 100);
                  return (
                    <div key={s.status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${statusColors[s.status] ?? "bg-gray-300"}`} />
                        <span className="text-sm text-gray-600">{cfg?.label ?? s.status}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">{s.count}</span>
                        <span className="text-xs text-gray-400 w-8 text-right">{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Daily Trend + Top Listings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* 7-day booking trend */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-semibold text-gray-900">Bookings this week</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Last 7 days</p>
                </div>
              </div>
              <div className="flex items-end gap-2 h-28">
                {data.dailyTrend.map((d) => {
                  const pct = maxBookings > 0 ? (d.bookings / maxBookings) * 100 : 0;
                  return (
                    <div key={d.label} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full relative group flex-1 flex items-end">
                        <div
                          className="w-full rounded-t-lg bg-blue-400 hover:bg-blue-500 transition-colors cursor-default"
                          style={{ height: `${Math.max(4, pct)}%` }}
                        />
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          {d.bookings}
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">{d.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Listings */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Top Listings</h2>
              {data.topListings.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No listings yet</p>
              ) : (
                <div className="space-y-3">
                  {data.topListings.map((listing, i) => (
                    <div key={listing.id} className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-300 w-4">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-medium text-gray-900 truncate">{listing.title}</p>
                          <Badge className={`${typeColors[listing.type] ?? ""} border-0 text-xs shrink-0`}>
                            {listing.type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs text-gray-400">{listing.bookings} bookings</span>
                          <span className="text-xs text-gray-400">★ {listing.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-gray-900">{formatCurrency(listing.revenue)}</p>
                        <Link
                          href={`/dashboard/listings`}
                          className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-0.5 justify-end"
                        >
                          View <ArrowUpRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
