"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@prisma/client";

// ============================================================
// GUARD
// ============================================================

async function requireAdmin() {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "ADMIN") throw new Error("Admin access required");

  return userId;
}

// ============================================================
// PLATFORM STATS
// ============================================================

export async function getAdminStats() {
  await requireAdmin();

  const [
    totalUsers,
    totalListings,
    totalBookings,
    revenue,
    revenueThisMonth,
    pendingBookings,
    totalReviews,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.listing.count(),
    prisma.booking.count(),
    prisma.booking.aggregate({
      where: { paymentStatus: "PAID" },
      _sum: { totalAmount: true },
    }),
    prisma.booking.aggregate({
      where: {
        paymentStatus: "PAID",
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
      _sum: { totalAmount: true },
    }),
    prisma.booking.count({ where: { status: "PENDING" } }),
    prisma.review.count(),
  ]);

  const usersByRole = await prisma.user.groupBy({
    by: ["role"],
    _count: { id: true },
  });

  const bookingsByStatus = await prisma.booking.groupBy({
    by: ["status"],
    _count: { id: true },
  });

  const listingsByType = await prisma.listing.groupBy({
    by: ["type"],
    _count: { id: true },
  });

  return {
    totalUsers,
    totalListings,
    totalBookings,
    totalRevenue: revenue._sum.totalAmount ?? 0,
    monthlyRevenue: revenueThisMonth._sum.totalAmount ?? 0,
    pendingBookings,
    totalReviews,
    usersByRole: Object.fromEntries(usersByRole.map((r) => [r.role, r._count.id])),
    bookingsByStatus: Object.fromEntries(bookingsByStatus.map((r) => [r.status, r._count.id])),
    listingsByType: Object.fromEntries(listingsByType.map((r) => [r.type, r._count.id])),
  };
}

// ============================================================
// USERS
// ============================================================

export async function getAdminUsers(page = 1, pageSize = 20, search = "") {
  await requireAdmin();

  const where = search
    ? {
        OR: [
          { email: { contains: search, mode: "insensitive" as const } },
          { firstName: { contains: search, mode: "insensitive" as const } },
          { lastName: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        _count: { select: { bookings: true, listings: true, reviews: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total, pages: Math.ceil(total / pageSize) };
}

export async function updateUserRole(targetUserId: string, role: UserRole) {
  await requireAdmin();

  await prisma.user.update({
    where: { id: targetUserId },
    data: { role },
  });

  revalidatePath("/admin/users");
  return { success: true };
}

// ============================================================
// LISTINGS
// ============================================================

export async function getAdminListings(page = 1, pageSize = 20, search = "") {
  await requireAdmin();

  const where = search
    ? {
        OR: [
          { title: { contains: search, mode: "insensitive" as const } },
          { city: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: {
        provider: { select: { id: true, firstName: true, lastName: true, email: true } },
        _count: { select: { bookings: true, reviews: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.listing.count({ where }),
  ]);

  return { listings, total, pages: Math.ceil(total / pageSize) };
}

export async function toggleListingActive(listingId: string) {
  await requireAdmin();

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) throw new Error("Listing not found");

  await prisma.listing.update({
    where: { id: listingId },
    data: { isActive: !listing.isActive },
  });

  revalidatePath("/admin/listings");
  return { success: true };
}

export async function toggleListingFeatured(listingId: string) {
  await requireAdmin();

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) throw new Error("Listing not found");

  await prisma.listing.update({
    where: { id: listingId },
    data: { isFeatured: !listing.isFeatured },
  });

  revalidatePath("/admin/listings");
  return { success: true };
}

// ============================================================
// BOOKINGS
// ============================================================

export async function getAdminBookings(page = 1, pageSize = 20, status = "") {
  await requireAdmin();

  const where = status ? { status: status as any } : {};

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: {
        listing: { select: { id: true, title: true, type: true, coverImage: true } },
        customer: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.booking.count({ where }),
  ]);

  return { bookings, total, pages: Math.ceil(total / pageSize) };
}

// ============================================================
// REVIEWS (moderation)
// ============================================================

export async function getAdminReviews(page = 1, pageSize = 20) {
  await requireAdmin();

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      include: {
        listing: { select: { id: true, title: true, type: true } },
        author: { select: { id: true, firstName: true, lastName: true, email: true, imageUrl: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.review.count(),
  ]);

  return { reviews, total, pages: Math.ceil(total / pageSize) };
}

export async function deleteReview(reviewId: string) {
  await requireAdmin();

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: { listing: true },
  });
  if (!review) throw new Error("Review not found");

  await prisma.review.delete({ where: { id: reviewId } });

  // Recalculate listing rating
  const stats = await prisma.review.aggregate({
    where: { listingId: review.listingId },
    _avg: { rating: true },
    _count: { id: true },
  });

  await prisma.listing.update({
    where: { id: review.listingId },
    data: {
      rating: stats._avg.rating ?? 0,
      reviewCount: stats._count.id,
    },
  });

  revalidatePath("/admin/reviews");
  return { success: true };
}
