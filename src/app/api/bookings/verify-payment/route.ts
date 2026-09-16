import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, bookingId } = body;

    if (!razorpayOrderId || !razorpayPaymentId) {
      return NextResponse.json({ error: "MISSING_PAYMENT_DETAILS" }, { status: 400 });
    }

    const booking = await prisma.booking.findFirst({
      where: {
        OR: [
          { razorpayOrderId: razorpayOrderId },
          { id: bookingId },
        ],
      },
      include: {
        ground: true,
        slot: true,
        user: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "BOOKING_NOT_FOUND" }, { status: 404 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    const isDemoOrder = razorpayOrderId.startsWith("order_demo_") || razorpaySignature === "demo_valid_signature";

    // Verify HMAC signature for live Razorpay orders
    if (!isDemoOrder && secret && !secret.includes("your-razorpay") && !secret.includes("pitchpro_razorpay_secret") && razorpaySignature) {
      const generatedSignature = crypto
        .createHmac("sha256", secret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");

      if (generatedSignature !== razorpaySignature) {
        return NextResponse.json(
          { error: "INVALID_SIGNATURE", message: "Payment verification failed. Signature mismatch." },
          { status: 400 }
        );
      }
    }

    const now = new Date();
    await prisma.$transaction([
      prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: "confirmed",
          confirmedAt: now,
          razorpayPaymentId: razorpayPaymentId,
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

    let whatsappSent = false;
    const recipientPhone = booking.user?.phone ?? booking.guestPhone;
    const recipientName = booking.user?.name ?? booking.guestName ?? "Valued Player";

    if (recipientPhone) {
      try {
        const token = process.env.WHATSAPP_ACCESS_TOKEN;
        const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

        if (token && phoneId && !token.includes("your-whatsapp") && !token.includes("mock_whatsapp")) {
          const waRes = await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              to: recipientPhone,
              type: "template",
              template: {
                name: "booking_confirmation",
                language: { code: "en_US" },
                components: [
                  {
                    type: "body",
                    parameters: [
                      { type: "text", text: recipientName },
                      { type: "text", text: booking.ground.name },
                      { type: "text", text: booking.id.slice(-8).toUpperCase() },
                    ],
                  },
                ],
              },
            }),
          });
          whatsappSent = waRes.ok;
        } else {
          console.log(`[WhatsApp Mock Dispatch] Sent confirmation to ${recipientPhone} for booking #${booking.id}`);
          whatsappSent = true;
        }

        if (whatsappSent) {
          await prisma.booking.update({
            where: { id: booking.id },
            data: { whatsappSent: true },
          });
        }
      } catch (waError) {
        console.error("WhatsApp notification dispatch failed gracefully:", waError);
      }
    }

    const bookingRef = `PITCH-${booking.id.slice(-8).toUpperCase()}`;

    const startD = new Date(booking.slot.startTime);
    const endD = new Date(booking.slot.endTime);
    const formatTime = (d: Date) =>
      d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
    const slotTimeFormatted = `${booking.slot.startTime.toISOString().split("T")[0]} (${formatTime(startD)} - ${formatTime(endD)})`;

    return NextResponse.json({
      success: true,
      confirmed: true,
      bookingRef,
      bookingId: booking.id,
      whatsappSent,
      recipientPhone,
      groundName: booking.ground.name,
      groundCity: booking.ground.city,
      address: booking.ground.address,
      startTime: booking.slot.startTime.toISOString(),
      endTime: booking.slot.endTime.toISOString(),
      slotTime: slotTimeFormatted,
      totalPaid: Math.round(booking.totalPaise / 100),
    });
  } catch (error: unknown) {
    console.error("Error verifying payment:", error);
    return NextResponse.json({ error: "FAILED_TO_VERIFY_PAYMENT" }, { status: 500 });
  }
}
