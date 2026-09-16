import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOptionalSessionUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getOptionalSessionUser();
    const body = await req.json();
    const { slotId, slotIds, guestName, guestPhone, calculatedPrice } = body;

    if (!slotId) {
      return NextResponse.json({ error: "SLOT_ID_REQUIRED" }, { status: 400 });
    }

    const userId = user?.id ?? null;
    const effectivePhone = user?.phone ?? guestPhone ?? null;
    const effectiveName = user?.name ?? guestName ?? null;

    if (!userId && !effectivePhone) {
      return NextResponse.json(
        { error: "GUEST_PHONE_REQUIRED", message: "Guest name and phone number are required for unauthenticated bookings." },
        { status: 400 }
      );
    }

    const now = new Date();
    const lockDurationMs = 5 * 60 * 1000;
    const lockedUntil = new Date(now.getTime() + lockDurationMs);

    const targetSlotIds: string[] = (Array.isArray(slotIds) && slotIds.length > 0) ? slotIds : [slotId];

    const slotsToHold = await prisma.slot.findMany({
      where: { id: { in: targetSlotIds } },
      include: { ground: true },
    });

    if (slotsToHold.length === 0) {
      return NextResponse.json({ error: "SLOT_NOT_FOUND" }, { status: 404 });
    }

    const primarySlot = slotsToHold.find((s) => s.id === slotId) || slotsToHold[0];

    for (const s of slotsToHold) {
      if (new Date(s.endTime) <= now || new Date(s.startTime) < now) {
        return NextResponse.json(
          { error: "SLOT_EXPIRED", message: "One or more required time slots have already passed." },
          { status: 400 }
        );
      }
      if (s.status === "booked") {
        return NextResponse.json({ error: "SLOT_UNAVAILABLE", message: "One or more required slots are already booked." }, { status: 409 });
      }
      if (s.status === "pending" && s.lockedUntil && s.lockedUntil > now) {
        return NextResponse.json({ error: "SLOT_UNAVAILABLE", message: "One or more required slots are currently on hold by another player." }, { status: 409 });
      }
    }

    await prisma.booking.deleteMany({
      where: {
        slotId: primarySlot.id,
        status: "pending",
      },
    });

    await prisma.slot.updateMany({
      where: { id: { in: targetSlotIds } },
      data: {
        status: "pending",
        lockedUntil,
      },
    });

    const finalPaise = calculatedPrice ? Math.round(calculatedPrice * 100) : primarySlot.pricePaise;

    const booking = await prisma.booking.create({
      data: {
        userId,
        guestName: userId ? null : effectiveName,
        guestPhone: userId ? null : effectivePhone,
        groundId: primarySlot.groundId,
        slotId: primarySlot.id,
        status: "pending",
        totalPaise: finalPaise,
      },
    });

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      lockedUntil: lockedUntil.getTime(),
      groundName: primarySlot.ground.name,
      slot: {
        id: primarySlot.id,
        startTime: primarySlot.startTime,
        endTime: primarySlot.endTime,
        price: Math.round(finalPaise / 100),
      },
    });
  } catch (error: unknown) {
    console.error("Error holding slot:", error);
    return NextResponse.json({ error: "FAILED_TO_HOLD_SLOT" }, { status: 500 });
  }
}
