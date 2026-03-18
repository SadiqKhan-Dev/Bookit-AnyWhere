"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

// ============================================================
// VALIDATE PROMO CODE (public — called from booking widget)
// ============================================================

export interface PromoValidation {
  valid: boolean;
  promoCodeId?: string;
  discountAmount?: number; // in cents
  message?: string;
}

export async function validatePromoCode(
  code: string,
  subtotal: number, // in cents
  listingId?: string
): Promise<PromoValidation> {
  if (!code.trim()) return { valid: false, message: "Enter a promo code" };

  const promo = await prisma.promoCode.findUnique({
    where: { code: code.trim().toUpperCase() },
  });

  if (!promo) return { valid: false, message: "Invalid promo code" };
  if (!promo.isActive) return { valid: false, message: "This promo code is no longer active" };
  if (promo.expiresAt && promo.expiresAt < new Date()) return { valid: false, message: "This promo code has expired" };
  if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) return { valid: false, message: "This promo code has reached its usage limit" };
  if (promo.minOrderAmount && subtotal < promo.minOrderAmount) {
    const { formatCurrency } = await import("@/lib/utils");
    return { valid: false, message: `Minimum order of ${formatCurrency(promo.minOrderAmount)} required` };
  }
  if (promo.listingId && listingId && promo.listingId !== listingId) {
    return { valid: false, message: "This code is not valid for this listing" };
  }

  const discountAmount =
    promo.discountType === "PERCENTAGE"
      ? Math.round(subtotal * (promo.discountValue / 100))
      : Math.min(promo.discountValue, subtotal); // never exceed subtotal

  return {
    valid: true,
    promoCodeId: promo.id,
    discountAmount,
    message: promo.description ?? `${promo.discountType === "PERCENTAGE" ? `${promo.discountValue}% off` : "discount"} applied!`,
  };
}

// ============================================================
// GET MY PROMO CODES (provider)
// ============================================================

export async function getMyPromoCodes() {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  return prisma.promoCode.findMany({
    where: { createdBy: userId },
    include: {
      listing: { select: { id: true, title: true } },
      _count: { select: { bookings: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

// ============================================================
// CREATE PROMO CODE
// ============================================================

export async function createPromoCode(data: {
  code: string;
  description?: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minOrderAmount?: number;
  maxUses?: number;
  expiresAt?: Date;
  listingId?: string;
}) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || (user.role !== "PROVIDER" && user.role !== "ADMIN")) {
    throw new Error("Only providers can create promo codes");
  }

  const existing = await prisma.promoCode.findUnique({
    where: { code: data.code.toUpperCase() },
  });
  if (existing) throw new Error("A promo code with this name already exists");

  await prisma.promoCode.create({
    data: {
      ...data,
      code: data.code.trim().toUpperCase(),
      createdBy: userId,
      minOrderAmount: data.minOrderAmount ? Math.round(data.minOrderAmount * 100) : undefined,
      discountValue:
        data.discountType === "FIXED"
          ? Math.round(data.discountValue * 100)
          : data.discountValue,
    },
  });

  revalidatePath("/dashboard/promo-codes");
  return { success: true };
}

// ============================================================
// TOGGLE PROMO CODE (active/inactive)
// ============================================================

export async function togglePromoCode(id: string) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  const promo = await prisma.promoCode.findUnique({ where: { id } });
  if (!promo || promo.createdBy !== userId) throw new Error("Not found");

  await prisma.promoCode.update({
    where: { id },
    data: { isActive: !promo.isActive },
  });

  revalidatePath("/dashboard/promo-codes");
  return { success: true };
}

// ============================================================
// DELETE PROMO CODE
// ============================================================

export async function deletePromoCode(id: string) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  const promo = await prisma.promoCode.findUnique({ where: { id } });
  if (!promo || promo.createdBy !== userId) throw new Error("Not found");
  if (promo.usedCount > 0) throw new Error("Cannot delete a code that has been used");

  await prisma.promoCode.delete({ where: { id } });
  revalidatePath("/dashboard/promo-codes");
  return { success: true };
}
