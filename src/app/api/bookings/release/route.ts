import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOptionalSessionUser } from "@/lib/auth";

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

    if (booking.userId && user?.id && booking.userId !== user.id) {
      return NextResponse.json({ error: "UNAUTHORIZED_RELEASE" }, { status: 404 });
    }

    if (booking.status === "pending") {
      await prisma.$transaction([
        prisma.slot.update({
          where: { id: booking.slotId },
          data: {
            status: "available",
            lockedUntil: null,
          },
        }),
        prisma.booking.update({
          where: { id: bookingId },
          data: {
            status: "cancelled",
          },
        }),
      ]);
    }

    return NextResponse.json({ success: true, releasedBookingId: bookingId });
  } catch (error: unknown) {
    console.error("Error releasing booking:", error);
    return NextResponse.json({ error: "FAILED_TO_RELEASE_BOOKING" }, { status: 500 });
  }
}
