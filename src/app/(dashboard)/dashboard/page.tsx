import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import {
  LayoutDashboard,
  TrendingUp,
  Calendar,
  Star,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDashboardStats } from "@/actions/user";
import { getProviderBookings, getUserBookings } from "@/actions/booking";
import { formatCurrency, formatDate, BOOKING_STATUS_CONFIG } from "@/lib/utils";
import { getCurrentUser } from "@/actions/user";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { RevenueChart } from "@/components/dashboard/revenue-chart";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  const [user, stats] = await Promise.all([
    getCurrentUser(),
    getDashboardStats(),
  ]);

  if (!user) redirect("/sign-in");

  const isProvider = user.role === "PROVIDER" || user.role === "ADMIN";

  const recentBookings = isProvider
    ? await getProviderBookings()
    : await getUserBookings();

  const statCards = isProvider
    ? [
        {
          title: "Total Revenue",
          value: formatCurrency(stats.totalRevenue),
          change: "+12.5%",
          icon: DollarSign,
          color: "text-emerald-500",
          bg: "bg-emerald-50",
        },
        {
          title: "Monthly Revenue",
          value: formatCurrency(stats.monthlyRevenue),
          change: "+8.2%",
          icon: TrendingUp,
          color: "text-blue-500",
          bg: "bg-blue-50",
        },
        {
          title: "Total Bookings",
          value: stats.totalBookings.toString(),
          change: "+23",
          icon: Calendar,
          color: "text-purple-500",
          bg: "bg-purple-50",
        },
        {
          title: "Avg. Rating",
          value: stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "N/A",
          change: `${stats.totalReviews} reviews`,
          icon: Star,
          color: "text-amber-500",
          bg: "bg-amber-50",
        },
      ]
    : [
        {
          title: "Total Bookings",
          value: stats.totalBookings.toString(),
          change: "All time",
          icon: Calendar,
          color: "text-blue-500",
          bg: "bg-blue-50",
        },
        {
          title: "Confirmed",
          value: stats.confirmedBookings.toString(),
          change: "Active",
          icon: CheckCircle,
          color: "text-emerald-500",
          bg: "bg-emerald-50",
        },
        {
          title: "Completed",
          value: stats.completedBookings.toString(),
          change: "Past",
          icon: Clock,
          color: "text-purple-500",
          bg: "bg-purple-50",
        },
        {
          title: "Total Spent",
          value: formatCurrency((stats as any).totalSpent || 0),
          change: "All time",
          icon: DollarSign,
          color: "text-rose-500",
          bg: "bg-rose-50",
        },
      ];

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar user={user} />

      <main className="flex-1 p-8 bg-gray-50">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Good morning, {user.firstName}! 👋
          </h1>
          <p className="text-gray-500 mt-1">
            {isProvider
              ? "Here's what's happening with your business"
              : "Here's a summary of your bookings"}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg}`}>
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <span className="text-xs font-medium text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {stat.change}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.title}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          {isProvider && (
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Revenue Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <RevenueChart />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Booking Status */}
          <div className={isProvider ? "" : "lg:col-span-3"}>
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Recent Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {recentBookings.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm">No bookings yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentBookings.slice(0, 5).map((booking) => {
                      const statusConfig = BOOKING_STATUS_CONFIG[booking.status];
                      return (
                        <div
                          key={booking.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900 truncate max-w-[180px]">
                              {booking.listing.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(booking.startDate)}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="text-sm font-semibold text-gray-900">
                              {formatCurrency(booking.totalAmount)}
                            </p>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusConfig.color}`}
                            >
                              {statusConfig.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
