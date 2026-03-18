import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import {
  Users,
  Building2,
  Calendar,
  DollarSign,
  Star,
  TrendingUp,
  Clock,
} from "lucide-react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/actions/user";
import { getAdminStats } from "@/actions/admin";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin — Overview" };

export default async function AdminPage() {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/dashboard");

  const stats = await getAdminStats();

  const statCards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Total Listings", value: stats.totalListings, icon: Building2, color: "text-violet-500", bg: "bg-violet-50" },
    { label: "Total Bookings", value: stats.totalBookings, icon: Calendar, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Total Revenue", value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: "text-rose-500", bg: "bg-rose-50" },
    { label: "Monthly Revenue", value: formatCurrency(stats.monthlyRevenue), icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-50" },
    { label: "Pending Bookings", value: stats.pendingBookings, icon: Clock, color: "text-orange-500", bg: "bg-orange-50" },
    { label: "Total Reviews", value: stats.totalReviews, icon: Star, color: "text-yellow-500", bg: "bg-yellow-50" },
  ];

  const roleLabels: Record<string, string> = { CUSTOMER: "Customers", PROVIDER: "Providers", ADMIN: "Admins" };
  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    CONFIRMED: "bg-blue-100 text-blue-700",
    COMPLETED: "bg-emerald-100 text-emerald-700",
    CANCELLED: "bg-red-100 text-red-700",
    NO_SHOW: "bg-gray-100 text-gray-700",
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
      <AdminSidebar />
      <main className="flex-1 p-8 bg-gray-50">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
            <p className="text-sm text-gray-500 mt-1">All metrics across BookIt</p>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {statCards.map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className={`${bg} rounded-2xl p-4 flex items-center gap-3`}>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm shrink-0">
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-bold text-gray-900 truncate">{value}</p>
                  <p className="text-xs text-gray-500 truncate">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Breakdown row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Users by role */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Users by Role</h2>
              <div className="space-y-3">
                {Object.entries(stats.usersByRole).map(([role, count]) => (
                  <div key={role} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{roleLabels[role] ?? role}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-rose-400 rounded-full"
                          style={{ width: `${Math.min(100, (count / stats.totalUsers) * 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 w-6 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bookings by status */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Bookings by Status</h2>
              <div className="space-y-2">
                {Object.entries(stats.bookingsByStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <Badge className={`${statusColors[status] ?? "bg-gray-100 text-gray-700"} border-0 text-xs`}>
                      {status}
                    </Badge>
                    <span className="text-sm font-semibold text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Listings by type */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Listings by Type</h2>
              <div className="space-y-2">
                {Object.entries(stats.listingsByType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <Badge className={`${typeColors[type] ?? "bg-gray-100 text-gray-700"} border-0 text-xs`}>
                      {type}
                    </Badge>
                    <span className="text-sm font-semibold text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
