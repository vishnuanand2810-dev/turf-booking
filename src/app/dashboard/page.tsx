"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/Navbar";
import { useNav } from "@/hooks/useNav";
import { QRCodeCanvas } from "qrcode.react";
import { useBookingStore } from "@/store/bookingStore";
import { BookingSummaryModal } from "@/components/BookingSummaryModal";
import { AuthModal } from "@/components/AuthModal";
import { calculateRefund } from "@/lib/cancellation";
import { AnimatePresence } from "framer-motion";
import { AutoDismissBanner } from "@/components/AutoDismissBanner";
import Script from "next/script";
import {
  Calendar,
  MapPin,
  MessageCircle,
  CheckCircle2,
  Loader2,
  ChevronRight,
  ShieldCheck,
  XCircle,
  AlertTriangle,
  Share2,
  X,
  QrCode,
  Download,
  CreditCard,
  Clock,
} from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface UserBooking {
  id: string;
  bookingRef: string;
  status: string;
  groundId?: string;
  slotId?: string;
  groundName: string;
  groundCity: string;
  address: string;
  startTime: string;
  endTime: string;
  totalPaid: number;
  refundPaise?: number;
  lockedUntil?: number | null;
  whatsappSent: boolean;
  createdAt: string;
}

function BookingCardItem({
  booking,
  handleConfirmPendingBooking,
  setSelectedQrBooking,
  handleWhatsAppAction,
  setConfirmCancelBooking,
  resendingId,
}: {
  booking: UserBooking;
  handleConfirmPendingBooking: (b: UserBooking) => void;
  setSelectedQrBooking: (b: UserBooking) => void;
  handleWhatsAppAction: (b: UserBooking) => void;
  setConfirmCancelBooking: (b: UserBooking) => void;
  resendingId: string | null;
}) {
  const startD = new Date(booking.startTime);
  const endD = new Date(booking.endTime);
  const dateStr = startD.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeStr = `${startD.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })} - ${endD.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })}`;

  const isPending = booking.status.toLowerCase() === "pending";
  const isConfirmed = booking.status.toLowerCase() === "confirmed";
  const isCancelled = booking.status.toLowerCase() === "cancelled";

  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [hasExpired, setHasExpired] = useState(false);
  const [showExpiredMessage, setShowExpiredMessage] = useState(false);

  useEffect(() => {
    if (!isPending || !booking.lockedUntil) return;
    
    const calcTime = () => Math.max(0, booking.lockedUntil! - Date.now());
    const initialTime = calcTime();
    
    if (initialTime === 0) {
      setHasExpired(true);
      setShowExpiredMessage(true);
      return;
    }
    
    setTimeLeft(initialTime);
    const timer = setInterval(() => {
      const remaining = calcTime();
      setTimeLeft(remaining);
      if (remaining === 0) {
        clearInterval(timer);
        setHasExpired(true);
        setTimeout(() => setShowExpiredMessage(true), 1500);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isPending, booking.lockedUntil]);

  const isUrgent = timeLeft !== null && timeLeft < 60000 && !hasExpired;

  if (showExpiredMessage) {
    return (
      <div className="p-6 bg-[#121614] border border-red-500/20 rounded-3xl transition-all flex flex-col justify-center items-center text-center h-full min-h-[250px]">
        <div className="p-3 bg-red-500/10 rounded-full mb-3 text-red-400">
          <Clock className="w-6 h-6" />
        </div>
        <h3 className="text-white font-bold mb-2">Hold Expired</h3>
        <p className="text-gray-400 text-sm mb-4">This hold expired and the slot was released.</p>
        <button 
          onClick={() => window.location.href = '/turfs'}
          className="text-amber-500 text-sm font-semibold hover:text-amber-400"
        >
          Browse turfs &rarr;
        </button>
      </div>
    );
  }

  return (
    <div
      className={`p-6 bg-[#121614] border rounded-3xl transition-all flex flex-col justify-between ${
        isPending
          ? isUrgent
            ? "border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)] animate-pulse-subtle"
            : "border-amber-500/40 hover:border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.1)]"
          : isCancelled 
            ? "border-red-500/20 opacity-80"
            : "border-white/10 hover:border-[#F5A623]/40"
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="px-2.5 py-1 bg-[#F5A623]/10 border border-[#F5A623]/30 text-[#F5A623] font-mono font-bold text-xs rounded-lg">
            {booking.bookingRef}
          </span>

          <div className="flex items-center gap-2">
            {isPending ? (
              <>
                <button
                  onClick={() => handleConfirmPendingBooking(booking)}
                  disabled={hasExpired}
                  title="Click to complete payment & confirm booking"
                  className={`px-2.5 py-1 text-[11px] font-mono rounded-full uppercase border font-bold transition-all flex items-center gap-1 ${
                    hasExpired
                      ? "bg-gray-500/20 text-gray-400 border-gray-500/30 cursor-not-allowed"
                      : "bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30 cursor-pointer animate-pulse"
                  }`}
                >
                  <span>PENDING (Confirm)</span>
                </button>
                {timeLeft !== null && (
                  <div 
                    className={`px-2.5 py-1 flex items-center gap-1.5 text-[11px] font-mono rounded-full font-bold border transition-colors ${
                      isUrgent
                        ? "bg-red-500/10 text-red-400 border-red-500/30 animate-pulse-subtle"
                        : hasExpired 
                        ? "bg-red-500/10 text-red-500 border-red-500/30"
                        : "bg-[#F5A623]/10 text-[#F5A623] border-[#F5A623]/30"
                    }`}
                    aria-live={isUrgent ? "polite" : "off"}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {hasExpired 
                        ? "Hold expired" 
                        : `${Math.floor(timeLeft / 60000)}:${String(Math.floor((timeLeft % 60000) / 1000)).padStart(2, "0")}`}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <span className={`px-2.5 py-1 text-[11px] font-mono rounded-full uppercase border font-bold ${
                isCancelled ? "bg-red-500/10 text-red-500 border-red-500/30" : "bg-[#F5A623]/20 text-[#F5A623] border-[#F5A623]/40"
              }`}>
                {booking.status}
              </span>
            )}
          </div>
        </div>

        <h3 className="text-lg font-bold text-white mb-1">{booking.groundName}</h3>
        <p className="flex items-center gap-1 text-xs text-gray-400 mb-4">
          <MapPin className="w-3.5 h-3.5 text-gray-500" />
          {booking.address}, {booking.groundCity}
        </p>

        <div className="p-3 bg-black/40 border border-white/5 rounded-xl text-xs font-mono space-y-1.5 mb-6">
          <div className="flex justify-between text-gray-400">
            <span>Date:</span>
            <span className="text-white">{dateStr}</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Slot Time:</span>
            <span className={isCancelled ? "text-gray-500 line-through" : "text-[#F5A623]"}>{timeStr}</span>
          </div>
          {isCancelled ? (
            <div className="flex justify-between text-gray-400">
              <span>Refunded:</span>
              <span className="text-red-400 font-bold">₹{((booking.refundPaise || 0) / 100).toLocaleString("en-IN", {minimumFractionDigits: 2})}</span>
            </div>
          ) : (
            <div className="flex justify-between text-gray-400">
              <span>Amount Payable:</span>
              <span className="text-white font-bold">₹{booking.totalPaid.toLocaleString("en-IN")}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2 pt-4 border-t border-white/10">
        {isPending && (
          <button
            onClick={() => handleConfirmPendingBooking(booking)}
            disabled={hasExpired}
            className={`w-full py-2.5 px-3 font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2 mb-2 ${
              hasExpired
                ? "bg-gray-500/20 text-gray-400 border border-gray-500/30 cursor-not-allowed"
                : "bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)] cursor-pointer"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>{hasExpired ? "Slot released — book again" : "Complete Payment & Confirm Booking"}</span>
          </button>
        )}

        {isConfirmed && (
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => setSelectedQrBooking(booking)}
              className="py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-medium rounded-xl transition-colors flex-1 flex items-center justify-center gap-1.5"
            >
              <QrCode className="w-3.5 h-3.5 text-[#F5A623]" />
              <span>View QR Pass</span>
            </button>

            <button
              onClick={() => handleWhatsAppAction(booking)}
              disabled={resendingId === booking.id}
              className="py-2 px-3 bg-[#F5A623]/10 hover:bg-[#F5A623]/20 border border-[#F5A623]/30 text-[#F5A623] text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 flex-1"
            >
              {resendingId === booking.id ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <MessageCircle className="w-3.5 h-3.5" />
              )}
              <span>WhatsApp</span>
            </button>
          </div>
        )}

        {/* Cancel Booking Action */}
        {!isCancelled && (
          <button
            onClick={() => setConfirmCancelBooking(booking)}
            disabled={hasExpired}
            className={`w-full py-2 px-3 border text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 ${
               hasExpired
                  ? "bg-gray-500/10 border-gray-500/30 text-gray-500 cursor-not-allowed"
                  : "bg-red-500/10 hover:bg-red-500/20 border-red-500/30 text-red-400"
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancel Booking</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const nav = useNav();

  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [confirmCancelBooking, setConfirmCancelBooking] = useState<UserBooking | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedQrBooking, setSelectedQrBooking] = useState<UserBooking | null>(null);
  const [summaryBooking, setSummaryBooking] = useState<UserBooking | null>(null);

  useEffect(() => {
    async function fetchUserBookings() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/user/bookings");
        const data = await res.json();
        if (data.bookings) {
          setBookings(data.bookings);
        }
      } catch {
        console.error("Error fetching user bookings");
      } finally {
        setIsLoading(false);
      }
    }

    if (session?.user) {
      fetchUserBookings();
      
      // Check for auto-linked bookings query param
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        const linked = url.searchParams.get("linked");
        if (linked) {
          setNotice(`We found ${linked} bookings from your guest visits — added to your account.`);
          url.searchParams.delete("linked");
          window.history.replaceState({}, "", url.toString());
        }
      }
    } else if (status === "unauthenticated") {
      setIsLoading(false);
    }
  }, [session, status]);

  const getWhatsAppShareUrl = (booking: UserBooking) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const passUrl = `${origin}/dashboard?ref=${booking.bookingRef}`;

    const startD = new Date(booking.startTime);
    const endD = new Date(booking.endTime);
    const dateStr = startD.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const timeStr = `${startD.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })} - ${endD.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })}`;

    const message =
      `🏆 *PitchPro Stadium Match Pass* ⚽🏏\n\n` +
      `🔖 *Booking Ref:* ${booking.bookingRef}\n` +
      `🏟️ *Venue:* ${booking.groundName}\n` +
      `📍 *Location:* ${booking.address}, ${booking.groundCity}\n` +
      `📅 *Date:* ${dateStr}\n` +
      `⏰ *Slot Time:* ${timeStr}\n` +
      `💳 *Amount Paid:* ₹${booking.totalPaid.toLocaleString("en-IN")}\n` +
      `✅ *Status:* ${booking.status.toUpperCase()}\n\n` +
      `📲 *Digital QR Pass Link:* ${passUrl}\n\n` +
      `📱 Present this digital pass or reference code at stadium entry turnstile!`;

    return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
  };

  const handleResendWhatsApp = async (bookingId: string) => {
    setResendingId(bookingId);
    setNotice(null);
    try {
      const res = await fetch("/api/user/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      const data = await res.json();
      if (res.ok) {
        setNotice("WhatsApp confirmation dispatched successfully!");
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, whatsappSent: true } : b))
        );
      } else {
        setNotice(data.message || "Failed to resend confirmation.");
      }
    } catch {
      setNotice("Failed to resend confirmation.");
    } finally {
      setResendingId(null);
    }
  };

  const handleWhatsAppAction = (booking: UserBooking) => {
    const url = getWhatsAppShareUrl(booking);
    window.open(url, "_blank", "noopener,noreferrer");
    handleResendWhatsApp(booking.id);
  };

  const handleDownloadQr = (booking: UserBooking) => {
    const canvas = document.getElementById(`qr-canvas-${booking.id}`) as HTMLCanvasElement;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `QR-Pass-${booking.bookingRef}.png`;
    a.click();
  };



  const handleConfirmPendingBooking = (booking: UserBooking) => {
    const startD = new Date(booking.startTime);
    const endD = new Date(booking.endTime);

    const formatTime = (d: Date) =>
      d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });

    useBookingStore.setState({
      groundId: booking.groundId || null,
      groundName: booking.groundName,
      bookingId: booking.id,
      selectedDate: startD.toISOString().split("T")[0],
      selected: {
        id: booking.slotId || booking.id,
        startTime: formatTime(startD),
        endTime: formatTime(endD),
        price: booking.totalPaid,
        holdExpiresAt: booking.lockedUntil || Date.now() + 5 * 60 * 1000,
      },
      step: 2, // 2: Summary & Payment step
      guestInfo: {
        name: session?.user?.name || "",
        phone: session?.user?.phone || "",
      },
      coupon: null,
      error: null,
    });

    setSummaryBooking(booking);
  };

  const handleSummaryPaymentSuccess = (receipt: unknown) => {
    if (!summaryBooking) return;
    const confirmedBooking: UserBooking = {
      ...summaryBooking,
      status: "confirmed",
      whatsappSent: true,
    };

    setBookings((prev) =>
      prev.map((b) => (b.id === summaryBooking.id ? confirmedBooking : b))
    );
    setNotice(`Match Pass #${summaryBooking.bookingRef} confirmed successfully! Status updated to CONFIRMED.`);
    setSummaryBooking(null);
    setSelectedQrBooking(confirmedBooking);
  };

  const handleCancelBooking = async () => {
    if (!confirmCancelBooking) return;

    const bookingId = confirmCancelBooking.id;
    setCancellingId(bookingId);
    setNotice(null);

    try {
      const res = await fetch("/api/bookings/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });

      const data = await res.json();

      if (res.ok) {
        setNotice(data.message || "Booking cancelled successfully.");
        setBookings((prev) => 
          prev.map((b) => 
            b.id === bookingId ? { ...b, status: "cancelled", refundPaise: data.refundPaise } : b
          )
        );
      } else {
        alert(data.message || "Failed to cancel booking.");
      }
    } catch {
      alert("Error cancelling booking.");
    } finally {
      setCancellingId(null);
      setConfirmCancelBooking(null);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0D0C] text-white">
        <Navbar />
        <div className="max-w-7xl mx-auto py-20 px-4 text-center">
          <Loader2 className="w-10 h-10 text-[#F5A623] animate-spin mx-auto mb-4" />
          <p className="text-xs font-mono text-gray-400">LOADING YOUR PLAYER DASHBOARD...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-[#0A0D0C] text-white">
        <Navbar />
        <div className="max-w-xl mx-auto py-20 px-4 text-center">
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl mb-6">
            <ShieldCheck className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <h2 className="text-lg font-bold text-white">Sign In Required</h2>
            <p className="text-xs text-gray-400 mt-1">
              Guest bookings are verified via immediate QR pass &amp; WhatsApp. Sign in to track your complete match history.
            </p>
          </div>
          <button
            onClick={() => nav.navigateToHome()}
            className="px-6 py-3 bg-[#F5A623] text-black font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(245,166,35,0.3)]"
          >
            Explore Stadium Grounds
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0D0C] text-white selection:bg-[#F5A623] selection:text-black">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-10">
        {/* User Profile Header */}
        <div className="p-6 bg-[#121614] border border-white/10 rounded-3xl mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#F5A623]/20 border border-[#F5A623]/40 text-[#F5A623] flex items-center justify-center text-xl font-bold font-mono">
              {session.user.name?.[0]?.toUpperCase() || "P"}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">{session.user.name}</h1>
              <p className="text-xs text-gray-400 font-mono">
                {session.user.email || session.user.phone || "PitchPro Registered Player"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 bg-black/40 border border-white/10 rounded-xl text-xs font-mono text-[#F5A623]">
              Active Bookings: {bookings.length}
            </div>
            <button
              onClick={() => nav.navigateToHome()}
              className="py-2 px-4 bg-[#F5A623] text-black font-semibold text-xs rounded-xl hover:bg-[#FFC873] transition-all flex items-center gap-1"
            >
              Book New Pitch <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {notice && (
            <AutoDismissBanner
              key="dashboard-notice"
              className="mb-6"
              message={notice}
              type={notice.toLowerCase().includes("failed") ? "error" : "success"}
              onDismiss={() => setNotice(null)}
            />
          )}
        </AnimatePresence>

        {/* Google User Verify Phone Banner */}
        {session.user && !session.user.phone && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-amber-500">Missing Phone Number</h3>
                <p className="text-xs text-amber-500/70 mt-1">Have a guest booking? Verify your phone to link it to your account.</p>
              </div>
            </div>
            <button 
              onClick={() => setShowVerifyModal(true)}
              className="py-2 px-4 bg-amber-500 text-black text-xs font-bold rounded-lg shrink-0 hover:bg-amber-400 transition-colors"
            >
              Verify Phone
            </button>
          </div>
        )}

        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#F5A623]" /> My Match History
        </h2>

        {bookings.length === 0 ? (
          <div className="py-16 text-center text-gray-400 border border-white/5 rounded-3xl bg-white/[0.02]">
            <p className="text-sm">No active match bookings found under your account.</p>
            <button
              onClick={() => nav.navigateToHome()}
              className="mt-4 px-5 py-2.5 bg-[#F5A623] text-black text-xs font-bold rounded-xl"
            >
              Book Your First Pitch
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((booking) => (
              <BookingCardItem
                key={booking.id}
                booking={booking}
                handleConfirmPendingBooking={handleConfirmPendingBooking}
                setSelectedQrBooking={setSelectedQrBooking}
                handleWhatsAppAction={handleWhatsAppAction}
                setConfirmCancelBooking={setConfirmCancelBooking}
                resendingId={resendingId}
              />
            ))}
          </div>
        )}
      </main>

      {/* Confirmation Modal for Booking Cancellation */}
      {confirmCancelBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md p-6 bg-[#121614] border border-red-500/40 rounded-3xl text-left text-white shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Cancel Booking?</h3>
                <p className="text-xs font-mono text-red-400">{confirmCancelBooking.bookingRef}</p>
              </div>
            </div>
            
            {(() => {
              const refund = calculateRefund(confirmCancelBooking.startTime, confirmCancelBooking.totalPaid * 100);
              const startD = new Date(confirmCancelBooking.startTime);
              const hoursLeft = Math.max(0, (startD.getTime() - Date.now()) / (1000 * 60 * 60));
              const isNonRefundable = refund.refundPercent === 0;
              
              let tierText = "";
              if (refund.refundPercent === 90) tierText = "90% refund (>24h window)";
              else if (refund.refundPercent === 50) tierText = "50% refund (12-24h window)";
              else if (refund.refundPercent === 25) tierText = "25% refund (2-12h window)";
              else tierText = "No refund (<2h window)";
              
              return (
                <>
                  <p className="text-xs text-gray-300 leading-relaxed mb-4">
                    Your slot at <strong className="text-white">{confirmCancelBooking.groundName}</strong> is in {Math.floor(hoursLeft)} hours. 
                    Cancelling now qualifies for a <strong>{tierText}</strong>.
                  </p>
                  
                  <div className="p-4 bg-black/50 border border-white/10 rounded-xl text-xs space-y-2.5 mb-6 font-mono">
                    <div className="flex justify-between text-gray-400">
                      <span>You Paid:</span>
                      <span className="text-white font-bold">₹{confirmCancelBooking.totalPaid.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Cancellation Fee:</span>
                      <span className="text-red-400 font-bold">₹{(refund.feePaise / 100).toLocaleString("en-IN", {minimumFractionDigits: 2})}</span>
                    </div>
                    <div className="border-t border-white/10 pt-2.5 flex justify-between">
                      <span className="text-gray-300">You'll Receive:</span>
                      <span className="text-amber-500 font-bold text-sm">₹{(refund.refundPaise / 100).toLocaleString("en-IN", {minimumFractionDigits: 2})}</span>
                    </div>
                  </div>
                  
                  {isNonRefundable && (
                    <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <p className="text-xs text-red-400 font-bold text-center">
                        This slot starts in under 2 hours. Cancelling now is non-refundable.
                      </p>
                    </div>
                  )}
                </>
              );
            })()}

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmCancelBooking(null)}
                className="py-2.5 px-4 bg-white/10 hover:bg-white/20 text-xs font-semibold rounded-xl text-white transition-colors"
              >
                Keep my booking
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={cancellingId === confirmCancelBooking.id}
                className="py-2.5 px-4 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.4)]"
              >
                {cancellingId === confirmCancelBooking.id ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Confirm cancellation</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal Drawer */}
      {selectedQrBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm p-6 bg-[#121614] border border-[#F5A623]/30 rounded-3xl text-center text-white shadow-2xl">
            <button
              onClick={() => setSelectedQrBooking(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-2 bg-[#F5A623]/10 border border-[#F5A623]/30 rounded-2xl w-12 h-12 flex items-center justify-center mx-auto mb-3 text-[#F5A623]">
              <QrCode className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold mb-0.5">Stadium Entry QR Code</h3>
            <p className="text-xs font-mono text-[#F5A623] mb-4">{selectedQrBooking.bookingRef}</p>

            <div className="p-4 bg-white rounded-2xl inline-block mb-4 shadow-[0_0_25px_rgba(255,255,255,0.2)]">
              <QRCodeCanvas
                id={`qr-canvas-${selectedQrBooking.id}`}
                value={JSON.stringify({
                  ref: selectedQrBooking.bookingRef,
                  ground: selectedQrBooking.groundName,
                  id: selectedQrBooking.id,
                })}
                size={180}
                bgColor="#FFFFFF"
                fgColor="#0A0D0C"
                level="H"
                includeMargin={true}
              />
            </div>

            <p className="text-xs text-gray-400 mb-5">
              Present or share this QR code for venue turnstile entry.
            </p>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleDownloadQr(selectedQrBooking)}
                className="w-full py-2.5 bg-[#F5A623] hover:bg-[#FFC873] text-black font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,166,35,0.3)]"
              >
                <Download className="w-4 h-4" />
                <span>Download QR Pass Image</span>
              </button>

              <button
                onClick={() => setSelectedQrBooking(null)}
                className="w-full py-2 bg-white/10 hover:bg-white/20 text-xs font-semibold rounded-xl text-white transition-colors"
              >
                Close Pass
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Script for Razorpay */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      {/* Summary & Payment Modal for Pending Booking */}
      <BookingSummaryModal
        isOpen={!!summaryBooking}
        onClose={() => setSummaryBooking(null)}
        onPaymentSuccess={handleSummaryPaymentSuccess}
      />
      
      {/* Verify Phone Modal for Google users */}
      <AuthModal 
        isOpen={showVerifyModal} 
        onClose={() => setShowVerifyModal(false)}
        mode="verify" 
      />
    </div>
  );
}
