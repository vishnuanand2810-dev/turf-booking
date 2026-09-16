"use client";

import React, { useEffect, useState } from "react";
import { useBookingStore } from "@/store/bookingStore";
import { Clock, ShieldCheck, ChevronRight, X } from "lucide-react";

export function RunningTotalBar({ onProceed }: { onProceed: () => void }) {
  const { selected, groundName, reset, coupon } = useBookingStore();
  const [timeLeftMs, setTimeLeftMs] = useState<number>(0);

  useEffect(() => {
    if (!selected?.holdExpiresAt) return;

    const updateTimer = () => {
      const remaining = selected.holdExpiresAt - Date.now();
      if (remaining <= 0) {
        setTimeLeftMs(0);
        reset(); // Release state if expired
      } else {
        setTimeLeftMs(remaining);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [selected?.holdExpiresAt, reset]);

  const [isHovered, setIsHovered] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mediaQuery.matches);
    if (navigator.hardwareConcurrency < 4) setReduceMotion(true);
  }, []);

  if (!selected) return null;

  const minutes = Math.floor(timeLeftMs / 60000);
  const seconds = Math.floor((timeLeftMs % 60000) / 1000);
  const formattedTimer = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const basePrice = selected.price;
  const discountAmount = coupon ? Math.round((basePrice * coupon.discountPercent) / 100) : 0;
  const finalPrice = basePrice - discountAmount;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      {/* Layer 1: Base blur */}
      <div 
        className="absolute inset-0 bg-[#0A0D0C]/70 -z-10"
        style={{ backdropFilter: 'blur(24px) saturate(160%)', WebkitBackdropFilter: 'blur(24px) saturate(160%)' }}
      />
      
      {/* Layer 2 & 3: Crystal Glass Highlights and Refraction Glows */}
      <div className="absolute inset-0 pointer-events-none -z-10" style={{
        background: `
          linear-gradient(to top, rgba(255,255,255,0.12) 0px, transparent 2px),
          radial-gradient(120px circle at 0% 0%, rgba(245,166,35,0.12), transparent),
          radial-gradient(120px circle at 100% 0%, rgba(245,166,35,0.12), transparent)
        `,
        borderTop: '1px solid transparent',
        borderImage: 'linear-gradient(to top right, rgba(255,255,255,0.25), rgba(255,255,255,0.05)) 1'
      }} />

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left Slot Details & Hold Timer */}
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl font-mono text-xs font-bold animate-pulse">
            <Clock className="w-4 h-4" />
            <span>HOLD LOCK: {formattedTimer}</span>
          </div>

          <div>
            <div className="text-xs text-gray-400 font-mono">
              {groundName} &bull; {selected.startTime} - {selected.endTime}
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <span>Selected Slot</span>
              <ShieldCheck className="w-4 h-4 text-[#F5A623]" />
            </div>
          </div>
        </div>

        {/* Right Pricing & Proceed Button */}
        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-white/10">
          <div className="text-right">
            <span className="text-[10px] text-gray-400 font-mono uppercase block">TOTAL PAYABLE</span>
            <div className="text-xl font-mono font-bold text-[#F5A623]">
              ₹{finalPrice.toLocaleString("en-IN")}
              {discountAmount > 0 && (
                <span className="text-xs text-gray-400 line-through ml-2 font-normal">
                  ₹{basePrice}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={reset}
              className="p-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl text-xs transition-colors"
              title="Cancel Selection"
            >
              <X className="w-4 h-4" />
            </button>

            <button
              onClick={onProceed}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="relative py-3 px-6 text-black font-bold text-sm rounded-xl shadow-[0_0_25px_rgba(245,166,35,0.35)] transition-all duration-300 flex items-center gap-2 overflow-hidden group"
            >
              <div 
                className="absolute -inset-4 bg-[#F5A623] transition-colors duration-300 group-hover:bg-[#FFC873]" 
                style={!reduceMotion && isHovered ? { filter: 'url(#liquid-hover)' } : {}}
              />
              <div className="relative z-10 flex items-center justify-center gap-2">
                Summary & Payment <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
