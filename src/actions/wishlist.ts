"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

// ============================================================
// TOGGLE WISHLIST (add / remove)
// ============================================================

export async function toggleWishlist(listingId: string) {
  const { userId } = auth();
  if (!userId) throw new Error("Please sign in to save listings");

  const existing = await prisma.wishlist.findUnique({
    where: { userId_listingId: { userId, listingId } },
  });

  if (existing) {
    await prisma.wishlist.delete({ where: { id: existing.id } });
    revalidatePath("/wishlist");
    return { saved: false };
  } else {
    await prisma.wishlist.create({ data: { userId, listingId } });
    revalidatePath("/wishlist");
    return { saved: true };
  }
}

// ============================================================
// GET USER WISHLIST
// ============================================================

export async function getUserWishlist() {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  return prisma.wishlist.findMany({
    where: { userId },
    include: {
      listing: {
        select: {
          id: true,
          slug: true,
          type: true,
          title: true,
          city: true,
          state: true,
          coverImage: true,
          priceFrom: true,
          rating: true,
          reviewCount: true,
          tags: true,
          isFeatured: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

// ============================================================
// GET SAVED LISTING IDs (for current user — used to pre-fill hearts)
// ============================================================

export async function getSavedListingIds(): Promise<string[]> {
  const { userId } = auth();
  if (!userId) return [];

  const wishlists = await prisma.wishlist.findMany({
    where: { userId },
    select: { listingId: true },
  });

  return wishlists.map((w) => w.listingId);
}
