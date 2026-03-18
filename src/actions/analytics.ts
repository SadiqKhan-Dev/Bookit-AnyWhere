"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// ============================================================
// PROVIDER ANALYTICS
// ============================================================

export async function getProviderAnalytics() {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || (user.role !== "PROVIDER" && user.role !== "ADMIN")) {
    throw new Error("Provider access required");
  }

  // ── Monthly revenue for last 6 months ──────────────────────
  const months: { label: string; revenue: number; bookings: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setDate(1);
    date.setHours(0, 0, 0, 0);
    date.setMonth(date.getMonth() - i);
    const end = new Date(date);
    end.setMonth(end.getMonth() + 1);

    const agg = await prisma.booking.aggregate({
      where: {
        listing: { providerId: userId },
        paymentStatus: "PAID",
        createdAt: { gte: date, lt: end },
      },
      _sum: { totalAmount: true },
      _count: { id: true },
    });

    months.push({
      label: date.toLocaleString("default", { month: "short" }),
      revenue: agg._sum.totalAmount ?? 0,
      bookings: agg._count.id,
    });
  }

  // ── Bookings by status ──────────────────────────────────────
  const byStatus = await prisma.booking.groupBy({
    by: ["status"],
    where: { listing: { providerId: userId } },
    _count: { id: true },
  });

  // ── Top 5 listings by bookings ──────────────────────────────
  const topListings = await prisma.listing.findMany({
    where: { providerId: userId },
    include: {
      _count: { select: { bookings: true, reviews: true } },
    },
    orderBy: { bookings: { _count: "desc" } },
    take: 5,
  });

  const topRevenue = await Promise.all(
    topListings.map(async (l) => {
      const rev = await prisma.booking.aggregate({
        where: { listingId: l.id, paymentStatus: "PAID" },
        _sum: { totalAmount: true },
      });
      return {
        id: l.id,
        title: l.title,
        type: l.type,
        bookings: l._count.bookings,
        reviews: l._count.reviews,
        rating: l.rating,
        revenue: rev._sum.totalAmount ?? 0,
      };
    })
  );

  // ── Recent 7 days booking trend ─────────────────────────────
  const dailyTrend: { label: string; bookings: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date();
    day.setDate(day.getDate() - i);
    day.setHours(0, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);

    const count = await prisma.booking.count({
      where: {
        listing: { providerId: userId },
        createdAt: { gte: day, lte: dayEnd },
      },
    });

    dailyTrend.push({
      label: day.toLocaleString("default", { weekday: "short" }),
      bookings: count,
    });
  }

  // ── Overall totals ──────────────────────────────────────────
  const [totalRevenue, totalBookings, avgRating, listingCount] = await Promise.all([
    prisma.booking.aggregate({
      where: { listing: { providerId: userId }, paymentStatus: "PAID" },
      _sum: { totalAmount: true },
    }),
    prisma.booking.count({ where: { listing: { providerId: userId } } }),
    prisma.review.aggregate({
      where: { listing: { providerId: userId } },
      _avg: { rating: true },
    }),
    prisma.listing.count({ where: { providerId: userId } }),
  ]);

  return {
    months,
    byStatus: byStatus.map((s) => ({ status: s.status, count: s._count.id })),
    topListings: topRevenue,
    dailyTrend,
    totals: {
      revenue: totalRevenue._sum.totalAmount ?? 0,
      bookings: totalBookings,
      avgRating: avgRating._avg.rating ?? 0,
      listings: listingCount,
    },
  };
}
