import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date");

    if (!dateStr) {
      return NextResponse.json({ error: "DATE_REQUIRED" }, { status: 400 });
    }

    const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);

    const now = new Date();

    await prisma.slot.updateMany({
      where: {
        groundId: params.id,
        status: "pending",
        lockedUntil: {
          lt: now,
        },
      },
      data: {
        status: "available",
        lockedUntil: null,
      },
    });

    await prisma.booking.updateMany({
      where: {
        groundId: params.id,
        status: "pending",
        slot: {
          lockedUntil: {
            lt: now,
          },
        },
      },
      data: {
        status: "cancelled",
      },
    });

    let slots = await prisma.slot.findMany({
      where: {
        groundId: params.id,
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: { startTime: "asc" },
    });

    if (slots.length === 0) {
      const ground = await prisma.ground.findUnique({ where: { id: params.id } });
      if (ground) {
        const slotsToCreate = [];
        for (let hour = 6; hour < 23; hour++) {
          const startTime = new Date(`${dateStr}T${String(hour).padStart(2, "0")}:00:00.000Z`);
          const endTime = new Date(`${dateStr}T${String(hour + 1).padStart(2, "0")}:00:00.000Z`);
          slotsToCreate.push({
            groundId: ground.id,
            startTime,
            endTime,
            pricePaise: ground.pricePaise,
            status: "available",
          });
        }
        await prisma.slot.createMany({
          data: slotsToCreate,
        });

        slots = await prisma.slot.findMany({
          where: {
            groundId: params.id,
            startTime: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          orderBy: { startTime: "asc" },
        });
      }
    }

    const formattedSlots = slots.map((s) => {
      const isExpiredPending = s.status === "pending" && s.lockedUntil && s.lockedUntil < now;
      let currentStatus = isExpiredPending ? "available" : s.status;

      const start = new Date(s.startTime);
      const end = new Date(s.endTime);

      if (end <= now || start < now) {
        currentStatus = "expired";
      }

      const formatTime = (d: Date) =>
        d.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });

      return {
        id: s.id,
        groundId: s.groundId,
        date: dateStr,
        startTime: formatTime(start),
        endTime: formatTime(end),
        fullStartTime: s.startTime.toISOString(),
        fullEndTime: s.endTime.toISOString(),
        price: Math.round(s.pricePaise / 100),
        status: currentStatus,
        lockedUntil: s.lockedUntil ? s.lockedUntil.getTime() : null,
      };
    });

    return NextResponse.json({ slots: formattedSlots });
  } catch (error: unknown) {
    console.error("Error fetching slots:", error);
    return NextResponse.json({ error: "FAILED_TO_FETCH_SLOTS" }, { status: 500 });
  }
}
