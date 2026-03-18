"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createCheckoutSession, calculateFees } from "@/lib/stripe";
import { getAppUrl, getNightCount, formatCurrency, formatDate } from "@/lib/utils";
import { sendBookingCancelledEmail } from "@/lib/emails";
import type { HotelBookingInput, SalonBookingInput, MedicalBookingInput, AirportBookingInput, FlightBookingInput, CruiseBookingInput } from "@/validations";

// Helper: increment promo code usage
async function incrementPromoUsage(promoCodeId?: string) {
  if (!promoCodeId) return;
  await prisma.promoCode.update({
    where: { id: promoCodeId },
    data: { usedCount: { increment: 1 } },
  }).catch(() => {}); // non-blocking
}

// ============================================================
// CREATE HOTEL BOOKING
// ============================================================

export async function createHotelBooking(data: HotelBookingInput) {
  const { userId } = auth();
  if (!userId) throw new Error("Please sign in to book");

  const room = await prisma.room.findUnique({
    where: { id: data.roomId },
    include: { listing: true },
  });
  if (!room) throw new Error("Room not found");

  // Check availability
  const conflictingBooking = await prisma.booking.findFirst({
    where: {
      roomId: data.roomId,
      status: { in: ["CONFIRMED", "PENDING"] },
      OR: [
        { startDate: { lte: data.checkOut }, endDate: { gte: data.checkIn } },
      ],
    },
  });
  if (conflictingBooking) throw new Error("Room is not available for selected dates");

  const nights = getNightCount(data.checkIn, data.checkOut);
  const subtotal = room.pricePerNight * nights;
  const { platformFee, taxes, total } = calculateFees(subtotal);
  const discountAmount = data.discountAmount ?? 0;
  const finalTotal = Math.max(100, total - discountAmount);

  const booking = await prisma.booking.create({
    data: {
      listingId: room.listing.id,
      customerId: userId,
      roomId: data.roomId,
      startDate: data.checkIn,
      endDate: data.checkOut,
      guestCount: data.guests,
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      guestPhone: data.guestPhone,
      notes: data.notes,
      subtotal,
      taxes,
      platformFee,
      discountAmount,
      totalAmount: finalTotal,
      promoCodeId: data.promoCodeId,
      status: "PENDING",
      paymentStatus: "PENDING",
    },
  });

  // Create Stripe checkout session
  await incrementPromoUsage(data.promoCodeId);

  const session = await createCheckoutSession({
    bookingId: booking.id,
    listingTitle: `${room.listing.title} - ${room.name}`,
    amount: finalTotal,
    successUrl: `${getAppUrl()}/bookings/${booking.id}/confirmation`,
    cancelUrl: `${getAppUrl()}/hotels/${room.listing.slug}`,
  });

  // Update booking with session ID
  await prisma.booking.update({
    where: { id: booking.id },
    data: { stripeSessionId: session.id },
  });

  return { success: true, checkoutUrl: session.url };
}

// ============================================================
// CREATE SALON BOOKING
// ============================================================

export async function createSalonBooking(data: SalonBookingInput) {
  const { userId } = auth();
  if (!userId) throw new Error("Please sign in to book");

  const service = await prisma.service.findUnique({
    where: { id: data.serviceId },
    include: { listing: true },
  });
  if (!service) throw new Error("Service not found");

  // Check time slot availability
  const bookingDate = new Date(data.date);
  const [hour, min] = data.time.split(":").map(Number);
  const startDate = new Date(bookingDate);
  startDate.setHours(hour, min, 0, 0);
  const endDate = new Date(startDate.getTime() + service.durationMin * 60 * 1000);

  const conflict = await prisma.booking.findFirst({
    where: {
      listingId: service.listing.id,
      status: { in: ["CONFIRMED", "PENDING"] },
      startDate: { lte: endDate },
      endDate: { gte: startDate },
    },
  });
  if (conflict) throw new Error("This time slot is no longer available");

  const { platformFee, taxes, total } = calculateFees(service.price);
  const discountAmount = data.discountAmount ?? 0;
  const finalTotal = Math.max(100, total - discountAmount); // min $1

  const booking = await prisma.booking.create({
    data: {
      listingId: service.listing.id,
      customerId: userId,
      serviceId: data.serviceId,
      startDate,
      endDate,
      startTime: data.time,
      endTime: `${Math.floor((hour * 60 + min + service.durationMin) / 60).toString().padStart(2, "0")}:${((min + service.durationMin) % 60).toString().padStart(2, "0")}`,
      guestCount: 1,
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      guestPhone: data.guestPhone,
      notes: data.notes,
      subtotal: service.price,
      taxes,
      platformFee,
      discountAmount,
      totalAmount: finalTotal,
      promoCodeId: data.promoCodeId,
      status: "PENDING",
      paymentStatus: "PENDING",
    },
  });

  await incrementPromoUsage(data.promoCodeId);

  const session = await createCheckoutSession({
    bookingId: booking.id,
    listingTitle: `${service.listing.title} - ${service.name}`,
    amount: finalTotal,
    successUrl: `${getAppUrl()}/bookings/${booking.id}/confirmation`,
    cancelUrl: `${getAppUrl()}/salons/${service.listing.slug}`,
  });

  await prisma.booking.update({
    where: { id: booking.id },
    data: { stripeSessionId: session.id },
  });

  return { success: true, checkoutUrl: session.url };
}

// ============================================================
// CREATE MEDICAL BOOKING
// ============================================================

export async function createMedicalBooking(data: MedicalBookingInput) {
  const { userId } = auth();
  if (!userId) throw new Error("Please sign in to book");

  const service = await prisma.service.findUnique({
    where: { id: data.serviceId },
    include: { listing: true },
  });
  if (!service) throw new Error("Service not found");

  const bookingDate = new Date(data.date);
  const [hour, min] = data.time.split(":").map(Number);
  const startDate = new Date(bookingDate);
  startDate.setHours(hour, min, 0, 0);
  const endDate = new Date(startDate.getTime() + service.durationMin * 60 * 1000);

  const { platformFee, taxes, total } = calculateFees(service.price);
  const discountAmount = data.discountAmount ?? 0;
  const finalTotal = Math.max(100, total - discountAmount);

  const booking = await prisma.booking.create({
    data: {
      listingId: service.listing.id,
      customerId: userId,
      serviceId: data.serviceId,
      doctorId: data.doctorId,
      startDate,
      endDate,
      startTime: data.time,
      guestCount: 1,
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      guestPhone: data.guestPhone,
      notes: data.notes,
      subtotal: service.price,
      taxes,
      platformFee,
      discountAmount,
      totalAmount: finalTotal,
      promoCodeId: data.promoCodeId,
      status: "PENDING",
      paymentStatus: "PENDING",
    },
  });

  await incrementPromoUsage(data.promoCodeId);

  const session = await createCheckoutSession({
    bookingId: booking.id,
    listingTitle: `${service.listing.title} - ${service.name}`,
    amount: finalTotal,
    successUrl: `${getAppUrl()}/bookings/${booking.id}/confirmation`,
    cancelUrl: `${getAppUrl()}/doctors/${service.listing.slug}`,
  });

  await prisma.booking.update({
    where: { id: booking.id },
    data: { stripeSessionId: session.id },
  });

  return { success: true, checkoutUrl: session.url };
}

// ============================================================
// GET USER BOOKINGS
// ============================================================

export async function getUserBookings(status?: string) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  return prisma.booking.findMany({
    where: {
      customerId: userId,
      ...(status ? { status: status as any } : {}),
    },
    include: {
      listing: true,
      service: true,
      room: true,
      doctor: true,
      payment: true,
      review: true,
    },
    orderBy: { startDate: "desc" },
  });
}

// ============================================================
// GET BOOKING BY ID
// ============================================================

export async function getBookingById(bookingId: string) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      listing: { include: { provider: true } },
      customer: true,
      service: true,
      room: true,
      doctor: true,
      payment: true,
      review: true,
    },
  });

  if (!booking) throw new Error("Booking not found");
  if (booking.customerId !== userId && booking.listing.providerId !== userId) {
    throw new Error("Unauthorized");
  }

  return booking;
}

// ============================================================
// CANCEL BOOKING
// ============================================================

export async function cancelBooking(bookingId: string) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { payment: true, listing: true },
  });

  if (!booking) throw new Error("Booking not found");
  if (booking.customerId !== userId) throw new Error("Unauthorized");
  if (booking.status === "CANCELLED") throw new Error("Booking is already cancelled");
  if (booking.status === "COMPLETED") throw new Error("Cannot cancel completed booking");

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
  });

  // Handle refund if paid
  if (booking.paymentStatus === "PAID" && booking.stripePaymentIntentId) {
    const { refundPayment } = await import("@/lib/stripe");
    await refundPayment(booking.stripePaymentIntentId);
    await prisma.booking.update({
      where: { id: bookingId },
      data: { paymentStatus: "REFUNDED" },
    });
  }

  // Create notification
  await prisma.notification.create({
    data: {
      userId,
      title: "Booking Cancelled",
      message: `Your booking has been cancelled and a refund will be processed if applicable.`,
      type: "BOOKING_CANCELLED",
      link: `/bookings/${bookingId}`,
    },
  });

  // Send cancellation email
  await sendBookingCancelledEmail({
    to: booking.guestEmail ?? "",
    guestName: booking.guestName ?? "Guest",
    listingTitle: booking.listing.title,
    bookingId: booking.id,
    isPaid: booking.paymentStatus === "PAID",
  }).catch(console.error);

  revalidatePath("/bookings");
  return { success: true };
}

// ============================================================
// GET PROVIDER BOOKINGS
// ============================================================

export async function getProviderBookings(status?: string) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  return prisma.booking.findMany({
    where: {
      listing: { providerId: userId },
      ...(status ? { status: status as any } : {}),
    },
    include: {
      listing: true,
      customer: true,
      service: true,
      room: true,
      doctor: true,
      payment: true,
    },
    orderBy: { startDate: "asc" },
  });
}

// ============================================================
// CONFIRM BOOKING (provider action)
// ============================================================

export async function confirmBooking(bookingId: string) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { listing: true },
  });

  if (!booking) throw new Error("Booking not found");
  if (booking.listing.providerId !== userId) throw new Error("Unauthorized");

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CONFIRMED" },
  });

  // Notify customer
  await prisma.notification.create({
    data: {
      userId: booking.customerId,
      title: "Booking Confirmed!",
      message: `Your booking at ${booking.listing.title} has been confirmed.`,
      type: "BOOKING_CONFIRMED",
      link: `/bookings/${bookingId}`,
    },
  });

  revalidatePath("/dashboard/bookings");
  return { success: true };
}

// ============================================================
// GET AVAILABLE SLOTS
// ============================================================

export async function getAvailableSlots(listingId: string, date: Date) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: {
      availability: true,
      services: { take: 1, orderBy: { durationMin: "asc" } },
    },
  });

  if (!listing) throw new Error("Listing not found");

  const dayNames = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  const dayOfWeek = dayNames[date.getDay()];

  const rule = listing.availability.find((r) => r.dayOfWeek === dayOfWeek && r.isOpen);
  if (!rule) return [];

  const { generateTimeSlots } = await import("@/lib/utils");
  const slots = generateTimeSlots(rule.openTime, rule.closeTime, rule.slotDurationMin);

  // Get existing bookings for this date
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const existingBookings = await prisma.booking.findMany({
    where: {
      listingId,
      status: { in: ["CONFIRMED", "PENDING"] },
      startDate: { gte: startOfDay, lte: endOfDay },
    },
  });

  const takenTimes = existingBookings.map((b) => b.startTime).filter(Boolean);

  return slots.map((time) => ({
    time,
    isAvailable: true,
    isTaken: takenTimes.includes(time),
  }));
}

// ============================================================
// CREATE AIRPORT BOOKING
// ============================================================

export async function createAirportBooking(data: AirportBookingInput) {
  const { userId } = auth();
  if (!userId) throw new Error("Please sign in to book");

  const service = await prisma.service.findUnique({
    where: { id: data.serviceId },
    include: { listing: true },
  });
  if (!service) throw new Error("Service not found");

  const { platformFee, taxes, total } = calculateFees(service.price);
  const discountAmount = data.discountAmount ?? 0;
  const finalTotal = Math.max(100, total - discountAmount);

  const endHour = new Date(data.date);
  endHour.setMinutes(endHour.getMinutes() + service.durationMin);
  const endTime = `${endHour.getHours().toString().padStart(2, "0")}:${endHour.getMinutes().toString().padStart(2, "0")}`;

  const booking = await prisma.booking.create({
    data: {
      listingId: service.listing.id,
      customerId: userId,
      serviceId: data.serviceId,
      startDate: data.date,
      endDate: data.date,
      startTime: data.time,
      endTime,
      guestCount: data.passengers,
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      guestPhone: data.guestPhone,
      notes: data.flightNumber ? `Flight: ${data.flightNumber}. ${data.notes || ""}`.trim() : data.notes,
      subtotal: service.price,
      taxes,
      platformFee,
      discountAmount,
      totalAmount: finalTotal,
      promoCodeId: data.promoCodeId,
      status: "PENDING",
      paymentStatus: "PENDING",
    },
  });

  await incrementPromoUsage(data.promoCodeId);

  const session = await createCheckoutSession({
    bookingId: booking.id,
    listingTitle: `${service.listing.title} — ${service.name}`,
    amount: finalTotal,
    successUrl: `${getAppUrl()}/bookings/${booking.id}/confirmation`,
    cancelUrl: `${getAppUrl()}/airports/${service.listing.slug}`,
  });

  await prisma.booking.update({
    where: { id: booking.id },
    data: { stripeSessionId: session.id },
  });

  return { success: true, checkoutUrl: session.url };
}

// ============================================================
// CREATE FLIGHT BOOKING
// ============================================================

export async function createFlightBooking(data: FlightBookingInput) {
  const { userId } = auth();
  if (!userId) throw new Error("Please sign in to book");

  const seat = await prisma.flightSeat.findUnique({
    where: { id: data.flightSeatId },
    include: { flightRoute: { include: { listing: true } } },
  });
  if (!seat) throw new Error("Flight seat not found");
  if (seat.availableSeats < data.passengers) throw new Error("Not enough seats available");

  const subtotal = seat.pricePerSeat * data.passengers;
  const { platformFee, taxes, total } = calculateFees(subtotal);
  const discountAmount = data.discountAmount ?? 0;
  const finalTotal = Math.max(100, total - discountAmount);

  const booking = await prisma.booking.create({
    data: {
      listingId: seat.flightRoute.listing.id,
      customerId: userId,
      flightSeatId: data.flightSeatId,
      startDate: data.departureDate,
      endDate: data.departureDate,
      startTime: seat.flightRoute.departureTime,
      endTime: seat.flightRoute.arrivalTime,
      guestCount: data.passengers,
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      guestPhone: data.guestPhone,
      notes: data.notes,
      subtotal,
      taxes,
      platformFee,
      discountAmount,
      totalAmount: finalTotal,
      promoCodeId: data.promoCodeId,
      status: "PENDING",
      paymentStatus: "PENDING",
    },
  });

  // Decrement available seats
  await prisma.flightSeat.update({
    where: { id: data.flightSeatId },
    data: { availableSeats: { decrement: data.passengers } },
  });

  await incrementPromoUsage(data.promoCodeId);

  const session = await createCheckoutSession({
    bookingId: booking.id,
    listingTitle: `${seat.flightRoute.airline} ${seat.flightRoute.flightNumber} — ${seat.name}`,
    amount: finalTotal,
    successUrl: `${getAppUrl()}/bookings/${booking.id}/confirmation`,
    cancelUrl: `${getAppUrl()}/flights/${seat.flightRoute.listing.slug}`,
  });

  await prisma.booking.update({
    where: { id: booking.id },
    data: { stripeSessionId: session.id },
  });

  return { success: true, checkoutUrl: session.url };
}

// ============================================================
// CREATE CRUISE BOOKING
// ============================================================

export async function createCruiseBooking(data: CruiseBookingInput) {
  const { userId } = auth();
  if (!userId) throw new Error("Please sign in to book");

  const cabin = await prisma.cruiseCabin.findUnique({
    where: { id: data.cruiseCabinId },
    include: { listing: true },
  });
  if (!cabin) throw new Error("Cabin not found");
  if (!cabin.isAvailable) throw new Error("Cabin is not available");

  const nights = getNightCount(data.checkIn, data.checkOut);
  if (nights <= 0) throw new Error("Disembarkation must be after embarkation");

  // Check for conflicting cruise booking on same cabin
  const conflict = await prisma.booking.findFirst({
    where: {
      cruiseCabinId: data.cruiseCabinId,
      status: { in: ["CONFIRMED", "PENDING"] },
      OR: [{ startDate: { lte: data.checkOut }, endDate: { gte: data.checkIn } }],
    },
  });
  if (conflict) throw new Error("Cabin is not available for selected dates");

  const subtotal = cabin.pricePerNight * nights;
  const { platformFee, taxes, total } = calculateFees(subtotal);
  const discountAmount = data.discountAmount ?? 0;
  const finalTotal = Math.max(100, total - discountAmount);

  const booking = await prisma.booking.create({
    data: {
      listingId: cabin.listing.id,
      customerId: userId,
      cruiseCabinId: data.cruiseCabinId,
      startDate: data.checkIn,
      endDate: data.checkOut,
      guestCount: data.guests,
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      guestPhone: data.guestPhone,
      notes: data.notes,
      subtotal,
      taxes,
      platformFee,
      discountAmount,
      totalAmount: finalTotal,
      promoCodeId: data.promoCodeId,
      status: "PENDING",
      paymentStatus: "PENDING",
    },
  });

  await incrementPromoUsage(data.promoCodeId);

  const session = await createCheckoutSession({
    bookingId: booking.id,
    listingTitle: `${cabin.listing.title} — ${cabin.name}`,
    amount: finalTotal,
    successUrl: `${getAppUrl()}/bookings/${booking.id}/confirmation`,
    cancelUrl: `${getAppUrl()}/cruises/${cabin.listing.slug}`,
  });

  await prisma.booking.update({
    where: { id: booking.id },
    data: { stripeSessionId: session.id },
  });

  return { success: true, checkoutUrl: session.url };
}
