"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createStripeCustomer } from "@/lib/stripe";
import type { UpdateProfileInput } from "@/validations";

// ============================================================
// SYNC USER FROM CLERK
// ============================================================

export async function syncUser() {
  const { userId } = auth();
  if (!userId) return null;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const user = await prisma.user.upsert({
    where: { id: userId },
    update: {
      email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl,
    },
    create: {
      id: userId,
      email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl,
      role: "CUSTOMER",
    },
  });

  return user;
}

// ============================================================
// GET CURRENT USER
// ============================================================

export async function getCurrentUser() {
  const { userId } = auth();
  if (!userId) return null;

  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      _count: {
        select: { bookings: true, listings: true, reviews: true },
      },
    },
  });
}

// ============================================================
// UPDATE PROFILE
// ============================================================

export async function updateProfile(data: UpdateProfileInput) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  const updated = await prisma.user.update({
    where: { id: userId },
    data,
  });

  revalidatePath("/settings");
  return { success: true, user: updated };
}

// ============================================================
// BECOME PROVIDER
// ============================================================

export async function becomeProvider() {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  if (user.role === "PROVIDER" || user.role === "ADMIN") {
    return { success: true, message: "Already a provider" };
  }

  // Create Stripe customer if not exists
  let stripeCustomerId = user.stripeCustomerId;
  if (!stripeCustomerId) {
    const customer = await createStripeCustomer(
      user.email,
      `${user.firstName} ${user.lastName}`.trim()
    );
    stripeCustomerId = customer.id;
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: "PROVIDER", stripeCustomerId },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

// ============================================================
// GET NOTIFICATIONS
// ============================================================

export async function getNotifications() {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

// ============================================================
// MARK NOTIFICATIONS READ
// ============================================================

export async function markNotificationsRead() {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });

  revalidatePath("/");
  return { success: true };
}

// ============================================================
// GET DASHBOARD STATS
// ============================================================

export async function getDashboardStats() {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  if (user.role === "PROVIDER" || user.role === "ADMIN") {
    // Provider stats
    const [bookings, revenue] = await Promise.all([
      prisma.booking.groupBy({
        by: ["status"],
        where: { listing: { providerId: userId } },
        _count: { id: true },
      }),
      prisma.booking.aggregate({
        where: {
          listing: { providerId: userId },
          paymentStatus: "PAID",
        },
        _sum: { totalAmount: true },
      }),
    ]);

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const monthlyRevenue = await prisma.booking.aggregate({
      where: {
        listing: { providerId: userId },
        paymentStatus: "PAID",
        createdAt: { gte: monthStart },
      },
      _sum: { totalAmount: true },
    });

    const reviews = await prisma.review.aggregate({
      where: { listing: { providerId: userId } },
      _avg: { rating: true },
      _count: { id: true },
    });

    const statusMap = Object.fromEntries(
      bookings.map((b) => [b.status, b._count.id])
    );

    return {
      totalBookings: Object.values(statusMap).reduce((a, b) => a + b, 0),
      pendingBookings: statusMap.PENDING || 0,
      confirmedBookings: statusMap.CONFIRMED || 0,
      completedBookings: statusMap.COMPLETED || 0,
      totalRevenue: revenue._sum.totalAmount || 0,
      monthlyRevenue: monthlyRevenue._sum.totalAmount || 0,
      averageRating: reviews._avg.rating || 0,
      totalReviews: reviews._count.id,
    };
  } else {
    // Customer stats
    const bookings = await prisma.booking.groupBy({
      by: ["status"],
      where: { customerId: userId },
      _count: { id: true },
    });

    const spent = await prisma.booking.aggregate({
      where: { customerId: userId, paymentStatus: "PAID" },
      _sum: { totalAmount: true },
    });

    const statusMap = Object.fromEntries(
      bookings.map((b) => [b.status, b._count.id])
    );

    return {
      totalBookings: Object.values(statusMap).reduce((a, b) => a + b, 0),
      pendingBookings: statusMap.PENDING || 0,
      confirmedBookings: statusMap.CONFIRMED || 0,
      completedBookings: statusMap.COMPLETED || 0,
      totalRevenue: 0,
      monthlyRevenue: 0,
      totalSpent: spent._sum.totalAmount || 0,
      averageRating: 0,
      totalReviews: 0,
    };
  }
}
