import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
  typescript: true,
});

export const PLATFORM_FEE_PERCENT = 0.1; // 10% platform fee

export function calculateFees(subtotal: number) {
  const platformFee = Math.round(subtotal * PLATFORM_FEE_PERCENT);
  const taxes = Math.round(subtotal * 0.08); // 8% tax
  const total = subtotal + platformFee + taxes;

  return { platformFee, taxes, total };
}

export async function createPaymentIntent(
  amount: number,
  currency: string = "usd",
  metadata: Record<string, string> = {}
) {
  return stripe.paymentIntents.create({
    amount,
    currency,
    metadata,
    automatic_payment_methods: {
      enabled: true,
    },
  });
}

export async function createCheckoutSession(params: {
  bookingId: string;
  listingTitle: string;
  amount: number;
  customerId?: string;
  successUrl: string;
  cancelUrl: string;
}) {
  return stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: params.listingTitle,
          },
          unit_amount: params.amount,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    customer: params.customerId,
    metadata: {
      bookingId: params.bookingId,
    },
  });
}

export async function createStripeCustomer(email: string, name: string) {
  return stripe.customers.create({ email, name });
}

export async function refundPayment(paymentIntentId: string, amount?: number) {
  return stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount,
  });
}
