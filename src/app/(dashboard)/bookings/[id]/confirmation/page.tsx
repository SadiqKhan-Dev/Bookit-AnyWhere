import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { CheckCircle, Calendar, MapPin, Clock, Download, Home } from "lucide-react";
import { Navbar } from "@/components/shared/navbar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getBookingById } from "@/actions/booking";
import { formatCurrency, formatDate, formatTime12h } from "@/lib/utils";

interface ConfirmationPageProps {
  params: { id: string };
}

export default async function ConfirmationPage({ params }: ConfirmationPageProps) {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  const booking = await getBookingById(params.id).catch(() => null);
  if (!booking) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-12 max-w-2xl">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 mb-4">
            <CheckCircle className="h-10 w-10 text-emerald-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-500">
            Your booking has been confirmed. We've sent a confirmation to {booking.guestEmail}.
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
            <p className="text-sm font-medium opacity-80">Booking Reference</p>
            <p className="text-2xl font-mono font-bold tracking-wider mt-1">
              #{booking.id.slice(-8).toUpperCase()}
            </p>
          </div>

          <div className="p-6 space-y-5">
            {/* Listing */}
            <div>
              <h2 className="font-semibold text-gray-900 text-lg">{booking.listing.title}</h2>
              <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                <MapPin className="h-3.5 w-3.5" />
                {booking.listing.address}, {booking.listing.city}
              </div>
            </div>

            <Separator />

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Date</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <p className="font-medium text-gray-900">{formatDate(booking.startDate)}</p>
                </div>
              </div>
              {booking.startTime && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Time</p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <p className="font-medium text-gray-900">{formatTime12h(booking.startTime)}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Service/Room */}
            {booking.service && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Service</p>
                <p className="font-medium text-gray-900">{booking.service.name}</p>
              </div>
            )}
            {booking.room && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Room</p>
                <p className="font-medium text-gray-900">{booking.room.name}</p>
              </div>
            )}

            <Separator />

            {/* Guest Info */}
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Guest Details</p>
              <p className="font-medium text-gray-900">{booking.guestName}</p>
              <p className="text-sm text-gray-500">{booking.guestEmail}</p>
              {booking.guestPhone && (
                <p className="text-sm text-gray-500">{booking.guestPhone}</p>
              )}
            </div>

            <Separator />

            {/* Price Summary */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(booking.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Platform fee</span>
                <span>{formatCurrency(booking.platformFee)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Taxes</span>
                <span>{formatCurrency(booking.taxes)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-gray-900">
                <span>Total paid</span>
                <span>{formatCurrency(booking.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Button variant="outline" className="flex-1 gap-2">
            <Download className="h-4 w-4" />
            Download receipt
          </Button>
          <Link href="/bookings" className="flex-1">
            <Button className="w-full gap-2 bg-rose-500 hover:bg-rose-600">
              View all bookings
            </Button>
          </Link>
        </div>

        <div className="text-center mt-4">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 inline-flex items-center gap-1">
            <Home className="h-3.5 w-3.5" />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
