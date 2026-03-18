import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import Link from "next/link";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/actions/user";
import { getAdminBookings } from "@/actions/admin";
import { formatCurrency, formatDate, BOOKING_STATUS_CONFIG } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin — Bookings" };

interface Props {
  searchParams: { page?: string; status?: string };
}

const STATUSES = ["", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"];

export default async function AdminBookingsPage({ searchParams }: Props) {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/dashboard");

  const page = Math.max(1, Number(searchParams.page ?? 1));
  const status = searchParams.status ?? "";
  const { bookings, total, pages } = await getAdminBookings(page, 20, status);

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
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
              <p className="text-sm text-gray-500 mt-1">{total} total bookings</p>
            </div>
          </div>

          {/* Status filter */}
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <Link
                key={s || "all"}
                href={`?status=${s}`}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  status === s
                    ? "bg-rose-500 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {s || "All"}
              </Link>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Booking</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Customer</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Date</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden xl:table-cell">Amount</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bookings.map((booking) => {
                  const statusCfg = BOOKING_STATUS_CONFIG[booking.status];
                  return (
                    <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium text-gray-900 truncate max-w-[200px]">{booking.listing.title}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Badge className={`${typeColors[booking.listing.type] ?? ""} border-0 text-xs`}>
                              {booking.listing.type}
                            </Badge>
                            <span className="text-xs text-gray-400 font-mono">{booking.id.slice(0, 8)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <p className="text-gray-700 text-xs">{booking.customer.firstName} {booking.customer.lastName}</p>
                        <p className="text-gray-400 text-xs">{booking.customer.email}</p>
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell text-gray-500 text-xs">
                        {formatDate(booking.startDate)}
                      </td>
                      <td className="px-5 py-4 hidden xl:table-cell font-semibold text-gray-900">
                        {formatCurrency(booking.totalAmount)}
                      </td>
                      <td className="px-5 py-4">
                        <Badge className={`${statusCfg.color} border-0 text-xs`}>
                          {statusCfg.label}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {bookings.length === 0 && (
              <div className="p-12 text-center text-gray-500 text-sm">No bookings found.</div>
            )}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center gap-2">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <a
                  key={p}
                  href={`?page=${p}${status ? `&status=${status}` : ""}`}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    p === page
                      ? "bg-rose-500 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {p}
                </a>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
