"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import type { CreateListingInput, UpdateListingInput } from "@/validations";
import type { SearchInput } from "@/validations";
import type { ListingType } from "@prisma/client";

// ============================================================
// CREATE LISTING
// ============================================================

export async function createListing(data: CreateListingInput) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || (user.role !== "PROVIDER" && user.role !== "ADMIN")) {
    throw new Error("Only providers can create listings");
  }

  const slug = slugify(data.title) + "-" + Date.now();

  const listing = await prisma.listing.create({
    data: {
      ...data,
      slug,
      priceFrom: Math.round(data.priceFrom * 100), // convert to cents
      providerId: userId,
    },
  });

  revalidatePath("/dashboard/listings");
  revalidatePath(`/${data.type.toLowerCase()}s`);

  return { success: true, listing };
}

// ============================================================
// UPDATE LISTING
// ============================================================

export async function updateListing(listingId: string, data: UpdateListingInput) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) throw new Error("Listing not found");
  if (listing.providerId !== userId) throw new Error("Forbidden");

  const updated = await prisma.listing.update({
    where: { id: listingId },
    data: {
      ...data,
      priceFrom: data.priceFrom ? Math.round(data.priceFrom * 100) : undefined,
    },
  });

  revalidatePath(`/listings/${updated.slug}`);
  revalidatePath("/dashboard/listings");

  return { success: true, listing: updated };
}

// ============================================================
// DELETE LISTING
// ============================================================

export async function deleteListing(listingId: string) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) throw new Error("Listing not found");
  if (listing.providerId !== userId) throw new Error("Forbidden");

  await prisma.listing.delete({ where: { id: listingId } });

  revalidatePath("/dashboard/listings");
  return { success: true };
}

// ============================================================
// GET LISTING BY SLUG
// ============================================================

export async function getListingBySlug(slug: string) {
  return prisma.listing.findUnique({
    where: { slug, isActive: true },
    include: {
      provider: true,
      services: { where: { isActive: true }, orderBy: { price: "asc" } },
      rooms: { where: { isAvailable: true }, orderBy: { pricePerNight: "asc" } },
      doctors: { where: { isAvailable: true } },
      flightRoutes: { include: { seats: { orderBy: { pricePerSeat: "asc" } } } },
      cruiseCabins: { where: { isAvailable: true }, orderBy: { pricePerNight: "asc" } },
      amenities: { include: { amenity: true } },
      availability: { orderBy: { dayOfWeek: "asc" } },
      reviews: {
        include: { author: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      _count: { select: { bookings: true, reviews: true } },
    },
  });
}

// ============================================================
// SEARCH LISTINGS
// ============================================================

export async function searchListings(input: Partial<SearchInput>) {
  const {
    type,
    query,
    city,
    minPrice,
    maxPrice,
    rating,
    page = 1,
    pageSize = 12,
    sortBy = "relevance",
  } = input;

  const where: any = { isActive: true };

  if (type) where.type = type as ListingType;
  if (city) where.city = { contains: city, mode: "insensitive" };
  if (query) {
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
      { city: { contains: query, mode: "insensitive" } },
    ];
  }
  if (minPrice) where.priceFrom = { gte: Math.round(minPrice * 100) };
  if (maxPrice) where.priceFrom = { ...where.priceFrom, lte: Math.round(maxPrice * 100) };
  if (rating) where.rating = { gte: rating };

  const orderBy: any =
    sortBy === "price_asc"
      ? { priceFrom: "asc" }
      : sortBy === "price_desc"
      ? { priceFrom: "desc" }
      : sortBy === "rating"
      ? { rating: "desc" }
      : sortBy === "newest"
      ? { createdAt: "desc" }
      : { isFeatured: "desc" };

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        provider: { select: { id: true, firstName: true, lastName: true, imageUrl: true } },
        amenities: { include: { amenity: true } },
        _count: { select: { reviews: true } },
      },
    }),
    prisma.listing.count({ where }),
  ]);

  return {
    data: listings,
    total,
    page,
    pageSize,
    hasMore: page * pageSize < total,
  };
}

// ============================================================
// GET PROVIDER LISTINGS
// ============================================================

export async function getProviderListings() {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  return prisma.listing.findMany({
    where: { providerId: userId },
    include: {
      _count: { select: { bookings: true, reviews: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

// ============================================================
// TOGGLE LISTING STATUS
// ============================================================

export async function toggleListingStatus(listingId: string) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing || listing.providerId !== userId) throw new Error("Forbidden");

  const updated = await prisma.listing.update({
    where: { id: listingId },
    data: { isActive: !listing.isActive },
  });

  revalidatePath("/dashboard/listings");
  return { success: true, isActive: updated.isActive };
}
