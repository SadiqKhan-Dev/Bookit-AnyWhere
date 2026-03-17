"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { CreateReviewInput } from "@/validations";

export async function createReview(data: CreateReviewInput) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  // Verify booking exists and belongs to user
  const booking = await prisma.booking.findUnique({
    where: { id: data.bookingId },
    include: { listing: true, review: true },
  });

  if (!booking) throw new Error("Booking not found");
  if (booking.customerId !== userId) throw new Error("Unauthorized");
  if (booking.status !== "COMPLETED") throw new Error("Can only review completed bookings");
  if (booking.review) throw new Error("You have already reviewed this booking");

  const review = await prisma.review.create({
    data: {
      ...data,
      authorId: userId,
    },
  });

  // Update listing rating
  const stats = await prisma.review.aggregate({
    where: { listingId: data.listingId },
    _avg: { rating: true },
    _count: { id: true },
  });

  await prisma.listing.update({
    where: { id: data.listingId },
    data: {
      rating: Math.round((stats._avg.rating || 0) * 10) / 10,
      reviewCount: stats._count.id,
    },
  });

  // Notify provider
  await prisma.notification.create({
    data: {
      userId: booking.listing.providerId,
      title: "New Review Received",
      message: `You received a ${data.rating}-star review for ${booking.listing.title}`,
      type: "REVIEW_RECEIVED",
      link: `/dashboard/reviews`,
    },
  });

  revalidatePath(`/listings/${booking.listing.slug}`);
  revalidatePath("/bookings");

  return { success: true, review };
}

export async function respondToReview(reviewId: string, response: string) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: { listing: true },
  });

  if (!review) throw new Error("Review not found");
  if (review.listing.providerId !== userId) throw new Error("Unauthorized");

  const updated = await prisma.review.update({
    where: { id: reviewId },
    data: { response },
  });

  revalidatePath(`/listings/${review.listing.slug}`);
  return { success: true, review: updated };
}
