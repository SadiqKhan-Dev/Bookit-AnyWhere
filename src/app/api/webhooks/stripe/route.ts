import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return new NextResponse("Missing signature", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Stripe webhook error:", err);
    return new NextResponse("Invalid signature", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const bookingId = session.metadata?.bookingId;

        if (!bookingId) break;

        const booking = await prisma.booking.update({
          where: { id: bookingId },
          data: {
            status: "CONFIRMED",
            paymentStatus: "PAID",
            stripePaymentIntentId: session.payment_intent as string,
          },
          include: { listing: true },
        });

        // Create payment record
        await prisma.payment.create({
          data: {
            bookingId,
            amount: session.amount_total || 0,
            currency: session.currency || "usd",
            status: "PAID",
            stripePaymentIntentId: session.payment_intent as string,
          },
        });

        // Notify customer
        await prisma.notification.create({
          data: {
            userId: booking.customerId,
            title: "Booking Confirmed! 🎉",
            message: `Your booking at ${booking.listing.title} is confirmed.`,
            type: "BOOKING_CONFIRMED",
            link: `/bookings/${bookingId}`,
          },
        });

        // Notify provider
        await prisma.notification.create({
          data: {
            userId: booking.listing.providerId,
            title: "New Booking Received! 💰",
            message: `You have a new booking for ${booking.listing.title}.`,
            type: "NEW_BOOKING",
            link: `/dashboard/bookings`,
          },
        });

        break;
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const bookingId = pi.metadata?.bookingId;

        if (!bookingId) break;

        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            status: "CANCELLED",
            paymentStatus: "FAILED",
          },
        });
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = charge.payment_intent as string;

        await prisma.booking.updateMany({
          where: { stripePaymentIntentId: paymentIntentId },
          data: { paymentStatus: "REFUNDED" },
        });

        await prisma.payment.updateMany({
          where: { stripePaymentIntentId: paymentIntentId },
          data: {
            status: "REFUNDED",
            refundAmount: charge.amount_refunded,
          },
        });
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook handler error:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
