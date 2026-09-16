"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useBookingStore } from "@/store/bookingStore";
import { X, Tag, ShieldCheck, CreditCard, Check, AlertCircle, Loader2 } from "lucide-react";

interface PaymentVerificationPayload {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  bookingId: string;
}

interface BookingSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (receipt: unknown) => void;
}

export function BookingSummaryModal({
  isOpen,
  onClose,
  onPaymentSuccess,
}: BookingSummaryModalProps) {
  const { data: session } = useSession();
  const {
    groundName,
    selectedDate,
    selected,
    bookingId,
    guestInfo,
    coupon,
    setCoupon,
  } = useBookingStore();

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const [reduceMotion, setReduceMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mediaQuery.matches);
    const lowEnd = navigator.hardwareConcurrency < 4;
    if (lowEnd) setReduceMotion(true);
  }, []);

  if (!isOpen || !selected || !bookingId) return null;

  const basePrice = selected.price;
  const discountPercent = coupon?.discountPercent || 0;
  const discountAmount = Math.round((basePrice * discountPercent) / 100);
  const finalPrice = basePrice - discountAmount;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setIsValidatingCoupon(true);
    setCouponError(null);
    setCouponSuccess(null);

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setCouponError(data.message || "Invalid coupon code");
      } else {
        setCoupon(data.coupon);
        setCouponSuccess(`Coupon ${data.coupon.code} applied! (${data.coupon.discountPercent}% OFF)`);
      }
    } catch {
      setCouponError("Failed to validate coupon");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleCheckout = async () => {
    setIsProcessingPayment(true);
    try {
      const orderRes = await fetch("/api/bookings/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          couponCode: coupon?.code,
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        alert(orderData.message || "Failed to initiate payment. Please try again.");
        setIsProcessingPayment(false);
        return;
      }

      const hasRazorpayWindow = typeof window !== "undefined" && "Razorpay" in window;

      if (hasRazorpayWindow && orderData.orderId && !orderData.orderId.includes("order_demo_")) {
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "PitchPro Stadiums",
          description: `Booking for ${groundName}`,
          order_id: orderData.orderId,
          handler: async function (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
            await verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              bookingId,
            });
          },
          prefill: {
            name: session?.user?.name || guestInfo.name,
            contact: session?.user?.phone || guestInfo.phone,
          },
          theme: {
            color: "#F5A623",
          },
        };
        const RazorpayClass = (window as unknown as { Razorpay: new (opts: unknown) => { open: () => void } }).Razorpay;
        const rzp = new RazorpayClass(options);
        rzp.open();
      } else {
        console.log("[Demo Mode] Verifying test payment directly...");
        await verifyPayment({
          razorpayOrderId: orderData.orderId || `order_demo_${Date.now()}`,
          razorpayPaymentId: `pay_demo_${Date.now()}`,
          razorpaySignature: "demo_valid_signature",
          bookingId,
        });
      }
    } catch (err: unknown) {
      console.error("Checkout error:", err);
      alert("Error initiating payment checkout.");
      setIsProcessingPayment(false);
    }
  };

  const verifyPayment = async (payload: PaymentVerificationPayload) => {
    try {
      const verifyRes = await fetch("/api/bookings/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const verifyData = await verifyRes.json();

      if (verifyData.success) {
        onPaymentSuccess(verifyData);
      } else {
        alert(verifyData.message || "Payment verification failed.");
      }
    } catch (err: unknown) {
      console.error("Verification error:", err);
      alert("Payment verification failed.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background Dim */}
      <div 
        className="absolute inset-0 bg-black/60 transition-opacity" 
        onClick={onClose}
        style={{ backdropFilter: 'blur(8px)' }}
      />

      {/* Crystal Glass Modal Surface */}
      <div className="relative w-full max-w-lg p-6 rounded-2xl shadow-2xl text-white overflow-hidden isolate">
        
        {/* Layer 1: Base blur */}
        <div 
          className="absolute inset-0 bg-[#0A0D0C]/50 -z-10"
          style={{ backdropFilter: 'blur(24px) saturate(160%)', WebkitBackdropFilter: 'blur(24px) saturate(160%)' }}
        />

        {/* Layer 2 & 3: Crystal Glass Highlights and Refraction Glows */}
        <div className="absolute inset-0 pointer-events-none -z-10" style={{
          background: `
            linear-gradient(to bottom, rgba(255,255,255,0.12) 0px, transparent 2px),
            radial-gradient(60px circle at 0% 100%, rgba(245,166,35,0.08), transparent),
            radial-gradient(60px circle at 100% 0%, rgba(245,166,35,0.08), transparent)
          `,
          border: '1px solid transparent',
          borderImage: 'linear-gradient(to bottom right, rgba(255,255,255,0.25), rgba(255,255,255,0.05)) 1'
        }} />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="p-2.5 bg-[#F5A623]/10 border border-[#F5A623]/30 rounded-xl text-[#F5A623]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Booking Summary</h2>
            <p className="text-xs text-gray-400">Review your slot details &amp; complete payment</p>
          </div>
        </div>

        <div className="p-3.5 bg-black/20 border border-white/5 rounded-xl text-xs space-y-1 mb-5 relative z-10 shadow-inner">
          <div className="flex justify-between text-gray-400">
            <span>Stadium Turf:</span>
            <span className="text-white font-medium">{groundName}</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Match Date &amp; Time:</span>
            <span className="text-[#FFC873] font-mono font-medium">
              {selectedDate} ({selected.startTime} - {selected.endTime})
            </span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Contact Player:</span>
            <span className="text-white font-medium">
              {session?.user?.name || guestInfo.name} (+91 {session?.user?.phone || guestInfo.phone})
            </span>
          </div>
        </div>

        <div className="mb-5 relative z-10">
          <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase">
            HAVE A PROMO CODE? (Try &quot;PITCH20&quot;)
          </label>
          <form onSubmit={handleApplyCoupon} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="PITCH20"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2 bg-black/30 border border-white/10 rounded-xl text-xs font-mono tracking-wider text-white uppercase focus:outline-none focus:border-[#F5A623] transition-colors"
              />
              {coupon && (
                <Check className="w-4 h-4 text-[#F5A623] absolute right-3 top-2.5" />
              )}
            </div>
            <button
              type="submit"
              disabled={isValidatingCoupon || !couponInput}
              className="py-2 px-4 bg-white/10 hover:bg-white/20 text-xs font-semibold rounded-xl text-white transition-colors flex items-center gap-1.5"
            >
              {isValidatingCoupon ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Apply"}
            </button>
          </form>

          {couponError && (
            <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> {couponError}
            </p>
          )}
          {couponSuccess && (
            <p className="mt-1.5 text-xs text-[#F5A623] flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" /> {couponSuccess}
            </p>
          )}
        </div>

        <div className="p-4 bg-black/40 border border-white/10 rounded-xl font-mono text-xs space-y-2 mb-6 relative z-10 shadow-inner">
          <div className="flex justify-between text-gray-400">
            <span>Subtotal (1 Hour Slot)</span>
            <span>₹{basePrice.toLocaleString("en-IN")}</span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-[#F5A623]">
              <span>Coupon Discount ({coupon?.code})</span>
              <span>-₹{discountAmount.toLocaleString("en-IN")}</span>
            </div>
          )}

          <div className="flex justify-between text-gray-400">
            <span>Platform Service Fee</span>
            <span className="text-[#F5A623]">FREE</span>
          </div>

          <div className="pt-2.5 border-t border-white/10 flex justify-between items-center text-sm font-bold text-white">
            <span>TOTAL AMOUNT PAYABLE</span>
            <span className="text-xl text-[#F5A623]">₹{finalPrice.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <button
          onClick={handleCheckout}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          disabled={isProcessingPayment}
          className="relative w-full py-3.5 text-black font-bold text-sm rounded-xl shadow-[0_0_25px_rgba(245,166,35,0.35)] transition-all duration-300 overflow-hidden z-10 group"
        >
          <div 
            className="absolute -inset-4 bg-[#F5A623] transition-colors duration-300 group-hover:bg-[#FFC873]"
            style={!reduceMotion && isHovered ? { filter: 'url(#liquid-hover)' } : {}}
          />
          <div className="relative z-10 flex items-center justify-center gap-2">
            {isProcessingPayment ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>Verifying Razorpay Order...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                <span>Pay ₹{finalPrice.toLocaleString("en-IN")} via Razorpay</span>
              </>
            )}
          </div>
        </button>
      </div>
    </div>
  );
}
