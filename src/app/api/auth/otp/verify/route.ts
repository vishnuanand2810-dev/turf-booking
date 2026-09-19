import { NextResponse } from "next/server";
import twilio from "twilio";

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export async function POST(req: Request) {
  try {
    const { phone, otp } = await req.json();
    
    if (!phone || !otp) {
      return NextResponse.json({ error: "Missing phone or otp" }, { status: 400 });
    }

    const check = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
      .verificationChecks.create({ to: phone, code: otp });

    if (check.status !== "approved") {
      return NextResponse.json({ verified: false }, { status: 400 });
    }
    return NextResponse.json({ verified: true });
  } catch (error: any) {
    console.error("Twilio verify OTP error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify OTP" },
      { status: 500 }
    );
  }
}
