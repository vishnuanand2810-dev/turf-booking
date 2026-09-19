import { NextResponse } from "next/server";
import twilio from "twilio";

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export async function POST(req: Request) {
  try {
    const { phone } = await req.json(); // expects E.164 format, e.g. +919025744857
    
    if (!phone || !phone.startsWith("+")) {
      return NextResponse.json({ error: "Invalid phone number format" }, { status: 400 });
    }

    await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
      .verifications.create({ to: phone, channel: "sms" });
      
    return NextResponse.json({ sent: true });
  } catch (error: any) {
    console.error("Twilio send OTP error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send OTP" },
      { status: 500 }
    );
  }
}
