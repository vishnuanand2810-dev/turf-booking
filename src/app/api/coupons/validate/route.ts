import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "COUPON_CODE_REQUIRED" }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!coupon || !coupon.active) {
      return NextResponse.json(
        { error: "INVALID_COUPON", message: "Invalid or expired coupon code." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        code: coupon.code,
        discountPercent: coupon.discountPercent,
        label: coupon.label,
      },
    });
  } catch (error: unknown) {
    console.error("Error validating coupon:", error);
    return NextResponse.json({ error: "FAILED_TO_VALIDATE_COUPON" }, { status: 500 });
  }
}
