import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city");
    const search = searchParams.get("search");

    const whereClause: Prisma.GroundWhereInput = {};

    if (city && city !== "All") {
      whereClause.city = {
        equals: city,
      };
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { address: { contains: search } },
      ];
    }

    const grounds = await prisma.ground.findMany({
      where: whereClause,
      orderBy: { rating: "desc" },
    });

    const formattedGrounds = grounds.map((g) => ({
      ...g,
      amenities: JSON.parse(g.amenities || "[]"),
      images: JSON.parse(g.images || "[]"),
      price: Math.round(g.pricePaise / 100),
    }));

    return NextResponse.json({ grounds: formattedGrounds });
  } catch (error: unknown) {
    console.error("Error fetching grounds:", error);
    return NextResponse.json({ error: "FAILED_TO_FETCH_GROUNDS" }, { status: 500 });
  }
}
