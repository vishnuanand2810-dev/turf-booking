import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOptionalSessionUser } from "@/lib/auth";

export async function POST() {
  try {
    const user = await getOptionalSessionUser();

    if (!user || !user.id) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    if (!user.phone) {
      return NextResponse.json({ linkedCount: 0 });
    }

    // Link guest bookings where the guestPhone matches the verified user's phone,
    // and no userId has been assigned yet.
    const result = await prisma.booking.updateMany({
      where: {
        guestPhone: user.phone,
        userId: null,
      },
      data: {
        userId: user.id,
      },
    });

    if (result.count > 0) {
      console.log(`[Guest Link] Linked ${result.count} bookings to user ${user.id} (${user.phone})`);
    }

    return NextResponse.json({ linkedCount: result.count });
  } catch (error: unknown) {
    console.error("Error linking guest bookings:", error);
    return NextResponse.json({ error: "FAILED_TO_LINK_BOOKINGS" }, { status: 500 });
  }
}
