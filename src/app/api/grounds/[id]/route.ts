import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ground = await prisma.ground.findUnique({
      where: { id: params.id },
    });

    if (!ground) {
      return NextResponse.json({ error: "GROUND_NOT_FOUND" }, { status: 404 });
    }

    return NextResponse.json({
      ground: {
        ...ground,
        amenities: JSON.parse(ground.amenities || "[]"),
        images: JSON.parse(ground.images || "[]"),
        price: Math.round(ground.pricePaise / 100),
      },
    });
  } catch (error: unknown) {
    console.error("Error fetching ground:", error);
    return NextResponse.json({ error: "FAILED_TO_FETCH_GROUND" }, { status: 500 });
  }
}
