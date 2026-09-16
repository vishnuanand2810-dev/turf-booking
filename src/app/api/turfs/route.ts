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
    if (city && city !== "All") whereClause.city = city;
    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const grounds = await prisma.ground.findMany({ where: whereClause });
    return NextResponse.json(grounds);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "FAILED" }, { status: 500 });
  }
}
