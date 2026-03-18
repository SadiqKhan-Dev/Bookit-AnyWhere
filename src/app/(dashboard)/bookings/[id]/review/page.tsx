import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Star } from "lucide-react";
import { Navbar } from "@/components/shared/navbar";
import { ReviewForm } from "@/components/bookings/review-form";
import { getBookingById } from "@/actions/booking";

export const metadata: Metadata = { title: "Leave a Review" };

interface ReviewPageProps {
  params: { id: string };
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  const booking = await getBookingById(params.id).catch(() => null);
  if (!booking) notFound();
  if (booking.customerId !== userId) notFound();
  if (booking.status !== "COMPLETED") redirect(`/bookings/${params.id}`);
  if (booking.review) redirect(`/bookings/${params.id}`);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-lg">
        <Link
          href={`/bookings/${params.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to booking
        </Link>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
              <Star className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Leave a Review</h1>
              <p className="text-sm text-gray-500">Share your experience with others</p>
            </div>
          </div>

          <ReviewForm
            bookingId={booking.id}
            listingId={booking.listingId}
            listingTitle={booking.listing.title}
          />
        </div>
      </div>
    </div>
  );
}
