import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import type { Metadata } from "next";
import { Calendar, Clock, MapPin, Star } from "lucide-react";
import { Navbar } from "@/components/shared/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUserBookings } from "@/actions/booking";
import { formatCurrency, formatDate, formatTime12h, BOOKING_STATUS_CONFIG, LISTING_TYPE_CONFIG } from "@/lib/utils";

export const metadata: Metadata = {
  title: "My Bookings",
};

export default async function BookingsPage() {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  const allBookings = await getUserBookings();

  const upcoming = allBookings.filter((b) =>
    ["PENDING", "CONFIRMED"].includes(b.status)
  );
  const past = allBookings.filter((b) =>
    ["COMPLETED", "CANCELLED", "NO_SHOW"].includes(b.status)
  );

  const BookingCard = ({ booking }: { booking: (typeof allBookings)[0] }) => {
    const statusConfig = BOOKING_STATUS_CONFIG[booking.status];
    const typeConfig = LISTING_TYPE_CONFIG[booking.listing.type as keyof typeof LISTING_TYPE_CONFIG];

    return (
      <div className="flex flex-col md:flex-row gap-4 p-6 rounded-2xl border border-gray-100 bg-white hover:shadow-md transition-shadow">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${typeConfig.bgColor}`}>
          <span className={typeConfig.textColor}>✓</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="font-semibold text-gray-900">{booking.listing.title}</h3>
              {booking.service && (
                <p className="text-sm text-gray-500">{booking.service.name}</p>
              )}
              {booking.room && (
                <p className="text-sm text-gray-500">{booking.room.name}</p>
              )}
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(booking.startDate)}
            </span>
            {booking.startTime && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatTime12h(booking.startTime)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {booking.listing.city}, {booking.listing.state}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          <p className="font-bold text-gray-900 text-lg">{formatCurrency(booking.totalAmount)}</p>
          <div className="flex gap-2">
            <Link href={`/bookings/${booking.id}`}>
              <Button variant="outline" size="sm">View details</Button>
            </Link>
            {booking.status === "COMPLETED" && !booking.review && (
              <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
                <Star className="h-3.5 w-3.5 mr-1" />
                Review
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Bookings</h1>

        <Tabs defaultValue="upcoming">
          <TabsList className="mb-6">
            <TabsTrigger value="upcoming">
              Upcoming ({upcoming.length})
            </TabsTrigger>
            <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcoming.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <Calendar className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">No upcoming bookings</h3>
                <p className="text-gray-500 mb-6">Start exploring and book your next experience</p>
                <Link href="/">
                  <Button className="bg-rose-500 hover:bg-rose-600">Explore now</Button>
                </Link>
              </div>
            ) : (
              upcoming.map((b) => <BookingCard key={b.id} booking={b} />)
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {past.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <Calendar className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">No past bookings</h3>
                <p className="text-gray-500">Your completed bookings will appear here</p>
              </div>
            ) : (
              past.map((b) => <BookingCard key={b.id} booking={b} />)
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
