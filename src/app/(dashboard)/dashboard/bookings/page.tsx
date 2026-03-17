import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { Calendar, CheckCircle, XCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { ProviderBookingActions } from "@/components/dashboard/provider-booking-actions";
import { getProviderBookings } from "@/actions/booking";
import { getCurrentUser } from "@/actions/user";
import { formatCurrency, formatDate, formatTime12h, BOOKING_STATUS_CONFIG } from "@/lib/utils";

export const metadata: Metadata = { title: "Manage Bookings" };

export default async function ProviderBookingsPage() {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  const user = await getCurrentUser();
  if (!user || (user.role !== "PROVIDER" && user.role !== "ADMIN")) redirect("/dashboard");

  const allBookings = await getProviderBookings();

  const pending = allBookings.filter((b) => b.status === "PENDING");
  const confirmed = allBookings.filter((b) => b.status === "CONFIRMED");
  const completed = allBookings.filter((b) => b.status === "COMPLETED");
  const cancelled = allBookings.filter((b) => b.status === "CANCELLED");

  const BookingRow = ({ booking }: { booking: (typeof allBookings)[0] }) => {
    const statusConfig = BOOKING_STATUS_CONFIG[booking.status];
    return (
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-gray-100 hover:shadow-sm transition-all">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-gray-900 truncate">{booking.listing.title}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            by <strong>{booking.customer.firstName} {booking.customer.lastName}</strong>
            {" · "}{booking.customer.email}
          </p>
          <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" /> {formatDate(booking.startDate)}
            </span>
            {booking.startTime && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> {formatTime12h(booking.startTime)}
              </span>
            )}
            {booking.service && <span>· {booking.service.name}</span>}
            {booking.room && <span>· {booking.room.name}</span>}
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <p className="font-bold text-gray-900">{formatCurrency(booking.totalAmount)}</p>
          <ProviderBookingActions booking={booking} />
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar user={user} />

      <main className="flex-1 p-8 bg-gray-50">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Manage Bookings</h1>
          <p className="text-gray-500 mt-1">Review and manage customer bookings</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Pending", count: pending.length, color: "text-yellow-600 bg-yellow-50", icon: Clock },
            { label: "Confirmed", count: confirmed.length, color: "text-blue-600 bg-blue-50", icon: CheckCircle },
            { label: "Completed", count: completed.length, color: "text-green-600 bg-green-50", icon: CheckCircle },
            { label: "Cancelled", count: cancelled.length, color: "text-red-600 bg-red-50", icon: XCircle },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className={`flex items-center gap-3 p-4 rounded-xl ${stat.color}`}>
                <Icon className="h-5 w-5 shrink-0" />
                <div>
                  <p className="text-2xl font-bold">{stat.count}</p>
                  <p className="text-xs font-medium opacity-80">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        <Tabs defaultValue="pending">
          <TabsList className="mb-6">
            <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed ({confirmed.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
            <TabsTrigger value="all">All ({allBookings.length})</TabsTrigger>
          </TabsList>

          {(["pending", "confirmed", "completed", "all"] as const).map((tab) => {
            const bookings =
              tab === "pending" ? pending
              : tab === "confirmed" ? confirmed
              : tab === "completed" ? completed
              : allBookings;

            return (
              <TabsContent key={tab} value={tab} className="space-y-3">
                {bookings.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                    <Calendar className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500">No {tab === "all" ? "" : tab} bookings</p>
                  </div>
                ) : (
                  bookings.map((b) => <BookingRow key={b.id} booking={b} />)
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </main>
    </div>
  );
}
