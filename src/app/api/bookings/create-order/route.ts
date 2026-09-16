import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOptionalSessionUser } from "@/lib/auth";
import Razorpay from "razorpay";

export async function POST(req: NextRequest) {
  try {
    const user = await getOptionalSessionUser();
    const body = await req.json();
    const { bookingId, couponCode } = body;

    if (!bookingId) {
      return NextResponse.json({ error: "BOOKING_ID_REQUIRED" }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { slot: true, ground: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "BOOKING_NOT_FOUND" }, { status: 404 });
    }

    if (booking.userId && user?.id && booking.userId !== user.id) {
      return NextResponse.json({ error: "UNAUTHORIZED_ORDER" }, { status: 403 });
    }

    if (booking.slot.lockedUntil && booking.slot.lockedUntil < new Date()) {
      return NextResponse.json(
        { error: "HOLD_EXPIRED", message: "Your 5-minute hold on this slot has expired. Please select a slot again." },
        { status: 410 }
      );
    }

    let discountPercent = 0;
    let validCouponCode: string | null = null;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.trim().toUpperCase() },
      });
      if (coupon && coupon.active) {
        discountPercent = coupon.discountPercent;
        validCouponCode = coupon.code;
      }
    }

    const rawPaise = booking.totalPaise > 0 ? booking.totalPaise : booking.slot.pricePaise;
    const discountPaise = Math.round((rawPaise * discountPercent) / 100);
    const finalTotalPaise = rawPaise - discountPaise;

    let razorpayOrderId: string;

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (keyId && keySecret && !keyId.includes("your-razorpay")) {
      const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
      const order = await razorpay.orders.create({
        amount: finalTotalPaise,
        currency: "INR",
        receipt: `receipt_${booking.id}`,
        notes: {
          bookingId: booking.id,
          groundName: booking.ground.name,
        },
      });
      razorpayOrderId = order.id;
    } else {
      razorpayOrderId = `order_demo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    }

    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        totalPaise: finalTotalPaise,
        discountPaise,
        couponCode: validCouponCode,
        razorpayOrderId,
      },
    });

    return NextResponse.json({
      success: true,
      orderId: razorpayOrderId,
      amount: finalTotalPaise,
      currency: "INR",
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_pitchpro123",
      bookingId: booking.id,
      discountPaise,
      finalTotalPaise,
    });
  } catch (error: unknown) {
    console.error("Error creating Razorpay order:", error);
    return NextResponse.json({ error: "FAILED_TO_CREATE_ORDER" }, { status: 500 });
  }
}
