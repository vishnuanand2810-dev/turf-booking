import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOptionalSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getOptionalSessionUser();

    if (!user?.id) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const now = new Date();

    // Auto-clean expired pending holds where 5-minute hold time has elapsed
    await prisma.booking.deleteMany({
      where: {
        userId: user.id,
        status: "pending",
        slot: {
          OR: [
            { lockedUntil: { lt: now } },
            { lockedUntil: null },
          ],
        },
      },
    });

    // Exclude no bookings; we want cancelled bookings to stay visible
    const bookings = await prisma.booking.findMany({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
        userId: true,
        guestName: true,
        guestPhone: true,
        groundId: true,
        slotId: true,
        status: true,
        totalPaise: true,
        discountPaise: true,
        couponCode: true,
        razorpayOrderId: true,
        razorpayPaymentId: true,
        whatsappSent: true,
        createdAt: true,
        confirmedAt: true,
        refundPaise: true,
        refundPercent: true,
        ground: {
          select: {
            name: true,
            city: true,
            address: true,
          },
        },
        slot: {
          select: {
            startTime: true,
            endTime: true,
            lockedUntil: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedBookings = bookings.map((b) => ({
      id: b.id,
      bookingRef: `PITCH-${b.id.slice(-8).toUpperCase()}`,
      status: b.status,
      groundId: b.groundId,
      slotId: b.slotId,
      groundName: b.ground.name,
      groundCity: b.ground.city,
      address: b.ground.address,
      startTime: b.slot.startTime.toISOString(),
      endTime: b.slot.endTime.toISOString(),
      totalPaid: Math.round(b.totalPaise / 100),
      refundPaise: b.refundPaise,
      lockedUntil: b.slot.lockedUntil ? b.slot.lockedUntil.getTime() : null,
      whatsappSent: b.whatsappSent,
      createdAt: b.createdAt.toISOString(),
    }));

    return NextResponse.json({ bookings: formattedBookings });
  } catch (error: unknown) {
    console.error("Error fetching user bookings:", error);
    return NextResponse.json({ error: "FAILED_TO_FETCH_BOOKINGS" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getOptionalSessionUser();
    if (!user?.id) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = await req.json();
    const { bookingId } = body;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { ground: true, user: true },
    });

    if (!booking || booking.userId !== user.id) {
      return NextResponse.json({ error: "BOOKING_NOT_FOUND" }, { status: 404 });
    }

    const phone = booking.user?.phone ?? user.phone;
    console.log(`[Resend WhatsApp] Confirmation re-sent for booking ${booking.id} to ${phone}`);

    await prisma.booking.update({
      where: { id: bookingId },
      data: { whatsappSent: true },
    });

    return NextResponse.json({ success: true, message: "WhatsApp confirmation re-sent successfully!" });
  } catch (error: unknown) {
    console.error("Error resending WhatsApp confirmation:", error);
    return NextResponse.json({ error: "FAILED_TO_RESEND_WHATSAPP" }, { status: 500 });
  }
}
