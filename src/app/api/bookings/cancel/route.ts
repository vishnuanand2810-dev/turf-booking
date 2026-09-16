import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOptionalSessionUser } from "@/lib/auth";
import { calculateRefund } from "@/lib/cancellation";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getOptionalSessionUser();
    const body = await req.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json({ error: "BOOKING_ID_REQUIRED" }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { slot: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "BOOKING_NOT_FOUND" }, { status: 404 });
    }

    // Ownership check for logged in users, or guest phone matching
    if (booking.userId) {
      if (!user?.id || booking.userId !== user.id) {
        return NextResponse.json({ error: "UNAUTHORIZED_CANCEL" }, { status: 403 });
      }
    } else if (booking.guestPhone) {
      // If it's a guest booking, the client must send the phone number to cancel,
      // OR they must be logged in with that verified phone number.
      const clientPhone = body.guestPhone || user?.phone;
      if (booking.guestPhone !== clientPhone) {
        return NextResponse.json({ error: "UNAUTHORIZED_CANCEL_GUEST" }, { status: 403 });
      }
    } else {
      return NextResponse.json({ error: "UNAUTHORIZED_CANCEL" }, { status: 403 });
    }

    if (booking.status !== "confirmed") {
      return NextResponse.json({ error: "ONLY_CONFIRMED_CAN_BE_CANCELLED", message: "Only confirmed bookings can be cancelled." }, { status: 400 });
    }

    const refundDetails = calculateRefund(booking.slot.startTime, booking.totalPaise);

    // Call Mock Razorpay refund if refund is applicable
    if (refundDetails.refundPaise > 0 && booking.razorpayPaymentId) {
      console.log(`[Razorpay Refund] Mocking refund of ${refundDetails.refundPaise} paise for payment ${booking.razorpayPaymentId}`);
      // razorpay.payments.refund(booking.razorpayPaymentId, { amount: refundDetails.refundPaise })
    }

    // Atomically cancel booking & release slot
    await prisma.$transaction([
      prisma.booking.update({
        where: { id: bookingId },
        data: { 
          status: "cancelled",
          refundPaise: refundDetails.refundPaise,
          refundPercent: refundDetails.refundPercent,
          cancelledAt: new Date(),
        },
      }),
      prisma.slot.update({
        where: { id: booking.slotId },
        data: {
          status: "available",
          lockedUntil: null,
        },
      }),
    ]);

    console.log(`[Booking Cancelled] Booking #${bookingId} cancelled and slot #${booking.slotId} released back to available.`);

    // 6. Emit socket slot-update
    try {
      // Assuming the socket server has a REST endpoint for emitting events
      await fetch("http://localhost:8080/api/emit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "slot:release", data: booking.slotId }),
      }).catch(() => {
         // Silently ignore if socket server is mock/down
      });
    } catch (e) {
      // Ignore
    }

    return NextResponse.json({
      success: true,
      cancelledBookingId: bookingId,
      refundPaise: refundDetails.refundPaise,
      message: `Booking cancelled successfully. ₹${(refundDetails.refundPaise / 100).toFixed(2)} will be refunded to your original payment method within 5-7 business days.`,
    });
  } catch (error: unknown) {
    console.error("Error cancelling booking:", error);
    return NextResponse.json({ error: "FAILED_TO_CANCEL_BOOKING" }, { status: 500 });
  }
}
