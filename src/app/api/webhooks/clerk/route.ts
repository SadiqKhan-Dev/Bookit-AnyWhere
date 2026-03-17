import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    return new NextResponse("Webhook secret not configured", { status: 500 });
  }

  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse("Missing svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: any;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new NextResponse("Invalid webhook signature", { status: 400 });
  }

  const { type, data } = evt;

  try {
    switch (type) {
      case "user.created":
        await prisma.user.create({
          data: {
            id: data.id,
            email: data.email_addresses[0]?.email_address ?? "",
            firstName: data.first_name,
            lastName: data.last_name,
            imageUrl: data.image_url,
            role: "CUSTOMER",
          },
        });
        break;

      case "user.updated":
        await prisma.user.update({
          where: { id: data.id },
          data: {
            email: data.email_addresses[0]?.email_address ?? "",
            firstName: data.first_name,
            lastName: data.last_name,
            imageUrl: data.image_url,
          },
        });
        break;

      case "user.deleted":
        await prisma.user.delete({
          where: { id: data.id },
        }).catch(() => {
          // User may not exist yet
        });
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
