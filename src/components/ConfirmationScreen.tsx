"use client";

import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { QRCodeCanvas } from "qrcode.react";
import { useSession } from "next-auth/react";
import { useNav } from "@/hooks/useNav";
import { CheckCircle2, Share2, ArrowRight, MessageCircle, Download } from "lucide-react";

interface ConfirmationScreenProps {
  receipt: {
    bookingRef: string;
    bookingId: string;
    groundName: string;
    date?: string;
    slotTime: string;
    totalPaid: number;
    recipientPhone?: string;
    whatsappSent?: boolean;
    groundCity?: string;
    address?: string;
    startTime?: string;
    endTime?: string;
  };
}

export function ConfirmationScreen({ receipt }: ConfirmationScreenProps) {
  const { data: session } = useSession();
  const nav = useNav();

  useEffect(() => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#F5A623", "#FFFFFF", "#FFC873"],
    });
  }, []);

  const qrPayload = JSON.stringify({
    ref: receipt.bookingRef,
    ground: receipt.groundName,
    time: receipt.slotTime,
  });

  const handleDone = () => {
    if (session?.user) {
      nav.navigateToDashboard();
    } else {
      nav.navigateToHome();
    }
  };

  let dateStr = receipt.date || "";
  let timeStr = receipt.slotTime || "";

  if (receipt.startTime && receipt.endTime) {
    const startD = new Date(receipt.startTime);
    const endD = new Date(receipt.endTime);
    dateStr = startD.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    timeStr = `${startD.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })} - ${endD.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })}`;
  } else if (receipt.slotTime) {
    const match = receipt.slotTime.match(/^(\d{4}-\d{2}-\d{2})\s*\((.*)\)$/);
    if (match) {
      const d = new Date(match[1]);
      dateStr = isNaN(d.getTime())
        ? match[1]
        : d.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
          });
      timeStr = match[2];
    }
  }

  const handleShareWhatsApp = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const passUrl = `${origin}/dashboard?ref=${receipt.bookingRef}`;

    const locationLine =
      receipt.address || receipt.groundCity
        ? `📍 *Location:* ${[receipt.address, receipt.groundCity].filter(Boolean).join(", ")}\n`
        : "";

    const message =
      `🏆 *PitchPro Stadium Match Pass* ⚽🏏\n\n` +
      `🔖 *Booking Ref:* ${receipt.bookingRef}\n` +
      `🏟️ *Venue:* ${receipt.groundName}\n` +
      locationLine +
      `📅 *Date:* ${dateStr}\n` +
      `⏰ *Slot Time:* ${timeStr}\n` +
      `💳 *Amount Paid:* ₹${receipt.totalPaid.toLocaleString("en-IN")}\n` +
      `✅ *Status:* CONFIRMED\n\n` +
      `📲 *Digital QR Pass Link:* ${passUrl}\n\n` +
      `📱 Present this digital QR pass or reference code at stadium entry turnstile!`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleDownloadQrCodeImage = () => {
    const canvas = document.getElementById("confirmation-qr-canvas") as HTMLCanvasElement;
    if (canvas) {
      try {
        const imageUri = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = imageUri;
        a.download = `QR-Pass-${receipt.bookingRef}.png`;
        a.click();
      } catch (e) {
        console.error("Error downloading QR canvas:", e);
      }
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-4 text-center">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#F5A623]/10 border border-[#F5A623]/30 rounded-full text-[#F5A623] text-xs font-mono font-bold mb-6">
        <CheckCircle2 className="w-4 h-4" />
        <span>PAYMENT VERIFIED &amp; SLOT BOOKED</span>
      </div>

      <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
        You&apos;re Ready to Play! ⚽🏏
      </h1>
      <p className="text-sm text-gray-400 mb-8">
        Your stadium slot has been locked. Show your QR pass at venue entry.
      </p>

      <div className="relative p-6 bg-[#121614] border border-[#F5A623]/30 rounded-3xl shadow-[0_0_50px_rgba(245,166,35,0.15)] text-left mb-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#F5A623]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div>
            <span className="text-[10px] text-gray-400 font-mono uppercase block">STADIUM PASS REF</span>
            <span className="text-xl font-mono font-extrabold text-[#F5A623]">
              {receipt.bookingRef}
            </span>
          </div>

          <div className="p-2 bg-white rounded-xl">
            <QRCodeCanvas
              id="confirmation-qr-canvas"
              value={qrPayload}
              size={72}
              bgColor="#FFFFFF"
              fgColor="#0A0D0C"
              level="H"
              includeMargin={true}
            />
          </div>
        </div>

        <div className="space-y-3 text-xs font-mono">
          <div className="flex justify-between">
            <span className="text-gray-400">Ground:</span>
            <span className="text-white font-bold">{receipt.groundName}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Date:</span>
            <span className="text-white font-bold">{dateStr}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Slot Time:</span>
            <span className="text-[#F5A623] font-bold">{timeStr}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Total Paid:</span>
            <span className="text-white font-bold">₹{receipt.totalPaid.toLocaleString("en-IN")}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">WhatsApp Notification:</span>
            <span className="text-[#F5A623] flex items-center gap-1 font-bold">
              <MessageCircle className="w-3.5 h-3.5" /> Dispatched
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
        <button
          onClick={handleShareWhatsApp}
          className="w-full sm:w-1/2 px-4 py-3 bg-[#F5A623] hover:bg-[#FFC873] text-black font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(245,166,35,0.3)] cursor-pointer"
        >
          <Share2 className="w-4 h-4" /> Share Pass on WhatsApp
        </button>

        <button
          onClick={handleDownloadQrCodeImage}
          className="w-full sm:w-1/2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all border border-white/15 cursor-pointer"
        >
          <Download className="w-4 h-4 text-[#F5A623]" /> Download QR Pass Image
        </button>
      </div>

      <button
        onClick={handleDone}
        className="w-full py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 border border-white/10"
      >
        <span>{session?.user ? "Go to Dashboard History" : "Return to Home Page"}</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
