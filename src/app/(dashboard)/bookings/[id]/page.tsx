import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  Calendar, Clock, MapPin, User, Mail, Phone,
  ArrowLeft, Star, CheckCircle2, Circle, XCircle,
  Receipt, Building2,
} from "lucide-react";
import { Navbar } from "@/components/shared/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CancelBookingButton } from "@/components/bookings/cancel-booking-button";
import { getBookingById } from "@/actions/booking";
import {
  formatCurrency,
  formatDate,
  formatTime12h,
  BOOKING_STATUS_CONFIG,
  LISTING_TYPE_CONFIG,
} from "@/lib/utils";

export const metadata: Metadata = { title: "Booking Details" };

interface BookingDetailPageProps {
  params: { id: string };
}

const STATUS_STEPS = [
  { key: "PENDING",   label: "Pending",   desc: "Awaiting confirmation" },
  { key: "CONFIRMED", label: "Confirmed", desc: "Your booking is confirmed" },
  { key: "COMPLETED", label: "Completed", desc: "All done!" },
] as const;

export default async function BookingDetailPage({ params }: BookingDetailPageProps) {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  const booking = await getBookingById(params.id).catch(() => null);
  if (!booking) notFound();

  const statusConfig = BOOKING_STATUS_CONFIG[booking.status];
  const typeConfig   = LISTING_TYPE_CONFIG[booking.listing.type as keyof typeof LISTING_TYPE_CONFIG];
  const isCancelled  = booking.status === "CANCELLED";
  const isCompleted  = booking.status === "COMPLETED";
  const canCancel    = ["PENDING", "CONFIRMED"].includes(booking.status);
  const isPaid       = booking.paymentStatus === "PAID";

  // Which step index is active
  const activeStep = isCancelled
    ? -1
    : STATUS_STEPS.findIndex((s) => s.key === booking.status);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Back */}
        <Link
          href="/bookings"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to My Bookings
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Booking Details</h1>
            <p className="text-sm text-gray-500 font-mono mt-0.5">
              #{booking.id.slice(-8).toUpperCase()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
            {canCancel && (
              <CancelBookingButton bookingId={booking.id} isPaid={isPaid} />
            )}
          </div>
        </div>

        <div className="space-y-4">
          {/* Listing card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex gap-4 p-5">
              <div className="relative h-20 w-28 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                <Image
                  src={booking.listing.coverImage}
                  alt={booking.listing.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeConfig.bgColor} ${typeConfig.textColor}`}>
                    {typeConfig.label}
                  </span>
                </div>
                <h2 className="font-semibold text-gray-900 text-lg leading-tight">
                  {booking.listing.title}
                </h2>
                <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {booking.listing.address}, {booking.listing.city}, {booking.listing.state}
                </div>
              </div>
            </div>
          </div>

          {/* Status tracker */}
          {!isCancelled ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Booking Progress</h3>
              <div className="flex items-center gap-0">
                {STATUS_STEPS.map((step, i) => {
                  const done    = i < activeStep;
                  const current = i === activeStep;
                  const future  = i > activeStep;
                  return (
                    <div key={step.key} className="flex items-center flex-1 last:flex-none">
                      <div className="flex flex-col items-center gap-1.5 min-w-0">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors ${
                          done    ? "bg-emerald-500 border-emerald-500" :
                          current ? "bg-white border-rose-500" :
                                    "bg-white border-gray-200"
                        }`}>
                          {done ? (
                            <CheckCircle2 className="h-5 w-5 text-white" />
                          ) : current ? (
                            <div className="h-3 w-3 rounded-full bg-rose-500" />
                          ) : (
                            <Circle className="h-4 w-4 text-gray-300" />
                          )}
                        </div>
                        <div className="text-center">
                          <p className={`text-xs font-semibold ${current ? "text-rose-600" : done ? "text-emerald-600" : "text-gray-400"}`}>
                            {step.label}
                          </p>
                          <p className="text-xs text-gray-400 hidden sm:block">{step.desc}</p>
                        </div>
                      </div>
                      {i < STATUS_STEPS.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-2 mb-7 rounded-full ${i < activeStep ? "bg-emerald-400" : "bg-gray-200"}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-5 flex items-center gap-3">
              <XCircle className="h-6 w-6 text-red-500 shrink-0" />
              <div>
                <p className="font-semibold text-red-700">Booking Cancelled</p>
                <p className="text-sm text-red-500">
                  {isPaid ? "A refund has been initiated to your original payment method." : "This booking was cancelled before payment."}
                </p>
              </div>
            </div>
          )}

          {/* Booking info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Booking Info</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Date</p>
                <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  {formatDate(booking.startDate)}
                </div>
              </div>
              {booking.startTime && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Time</p>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
                    <Clock className="h-4 w-4 text-gray-400" />
                    {formatTime12h(booking.startTime)}
                  </div>
                </div>
              )}
              {booking.endDate && booking.startDate.toDateString() !== booking.endDate.toDateString() && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Check-out</p>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {formatDate(booking.endDate)}
                  </div>
                </div>
              )}
              {booking.guestCount > 1 && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Guests</p>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
                    <User className="h-4 w-4 text-gray-400" />
                    {booking.guestCount} guests
                  </div>
                </div>
              )}
            </div>

            {(booking.service || booking.room || booking.doctor) && (
              <>
                <Separator />
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                    {booking.service ? "Service" : booking.room ? "Room" : "Doctor"}
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {booking.service?.name ?? booking.room?.name ?? booking.doctor?.name}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Guest info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Guest Details</h3>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <User className="h-4 w-4 text-gray-400" /> {booking.guestName}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Mail className="h-4 w-4 text-gray-400" /> {booking.guestEmail}
            </div>
            {booking.guestPhone && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Phone className="h-4 w-4 text-gray-400" /> {booking.guestPhone}
              </div>
            )}
          </div>

          {/* Price breakdown */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">Price Summary</h3>
              <Badge className={isPaid ? "bg-emerald-100 text-emerald-700 border-0" : "bg-amber-100 text-amber-700 border-0"}>
                {isPaid ? "Paid" : booking.paymentStatus === "REFUNDED" ? "Refunded" : "Pending"}
              </Badge>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>{formatCurrency(booking.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Platform fee</span>
                <span>{formatCurrency(booking.platformFee)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Taxes</span>
                <span>{formatCurrency(booking.taxes)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-gray-900 text-base">
                <span>Total</span>
                <span>{formatCurrency(booking.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            {isCompleted && !booking.review && (
              <Link href={`/bookings/${booking.id}/review`} className="flex-1">
                <Button className="w-full gap-2 bg-amber-500 hover:bg-amber-600 text-white">
                  <Star className="h-4 w-4" /> Leave a Review
                </Button>
              </Link>
            )}
            <Link href={`/${typeConfig.href}`} className={isCompleted && !booking.review ? "" : "flex-1"}>
              <Button variant="outline" className="w-full gap-2">
                <Building2 className="h-4 w-4" /> Book again
              </Button>
            </Link>
            <Link href="/bookings" className="flex-1">
              <Button variant="outline" className="w-full gap-2">
                <Receipt className="h-4 w-4" /> All bookings
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
