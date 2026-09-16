import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const bodyText = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (webhookSecret && !webhookSecret.includes("your-razorpay") && signature) {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(bodyText)
        .digest("hex");

      if (expectedSignature !== signature) {
        return NextResponse.json({ error: "INVALID_WEBHOOK_SIGNATURE" }, { status: 400 });
      }
    }

    const payload = JSON.parse(bodyText);
    const event = payload.event;

    if (event === "order.paid" || event === "payment.authorized" || event === "payment.captured") {
      const paymentEntity = payload.payload.payment?.entity || payload.payload.order?.entity;
      const orderId = paymentEntity?.order_id || paymentEntity?.id;
      const paymentId = paymentEntity?.id;

      if (orderId) {
        const booking = await prisma.booking.findUnique({
          where: { razorpayOrderId: orderId },
        });

        if (booking && booking.status !== "confirmed") {
          await prisma.$transaction([
            prisma.booking.update({
              where: { id: booking.id },
              data: {
                status: "confirmed",
                confirmedAt: new Date(),
                razorpayPaymentId: paymentId ?? booking.razorpayPaymentId,
              },
            }),
            prisma.slot.update({
              where: { id: booking.slotId },
              data: {
                status: "booked",
                lockedUntil: null,
              },
            }),
          ]);
          console.log(`[Razorpay Webhook] Successfully confirmed booking ${booking.id} via order.paid event.`);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    console.error("Error processing Razorpay webhook:", error);
    return NextResponse.json({ error: "WEBHOOK_PROCESSING_FAILED" }, { status: 500 });
  }
}
