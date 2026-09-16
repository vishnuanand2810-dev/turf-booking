"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useBookingStore, MatchDurationHours } from "@/store/bookingStore";
import { Clock, Lock, CheckCircle2, AlertCircle, Loader2, Timer } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { DurationSelector } from "./DurationSelector";
import { AnimatedPrice } from "./AnimatedPrice";
import { AutoDismissBanner } from "./AutoDismissBanner";

interface SlotApiData {
  id: string;
  startTime: string;
  endTime: string;
  fullStartTime?: string;
  fullEndTime?: string;
  price: number;
  status: "available" | "pending" | "booked" | "expired";
  lockedUntil: number | null;
}

interface CombinedSlotBlock {
  primarySlotId: string;
  slotIds: string[];
  startTime: string;
  endTime: string;
  price: number;
  status: "available" | "pending" | "booked" | "expired" | "unavailable";
  holdExpiresAt: number | null;
}

export function SlotGrid({ groundId }: { groundId: string }) {
  const { data: session } = useSession();
  const {
    selectedDate,
    durationHours,
    setDurationHours,
    selected,
    setSelectedSlot,
    setBookingId,
    guestInfo,
    setError,
    error,
    isHolding,
    setIsHolding,
    setStep,
  } = useBookingStore();

  const [slots, setSlots] = useState<SlotApiData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [guestError, setGuestError] = useState<string | null>(null);

  const fetchSlots = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/grounds/${groundId}/slots?date=${selectedDate}`);
      const data = await res.json();
      if (data.slots) {
        setSlots(data.slots);
      }
    } catch (err) {
      console.error("Failed to fetch slots:", err);
    } finally {
      setIsLoading(false);
    }
  }, [groundId, selectedDate]);

  useEffect(() => {
    fetchSlots();
    const interval = setInterval(fetchSlots, 15000);
    return () => clearInterval(interval);
  }, [fetchSlots]);

  const calculateCombinedBlocks = useCallback((): CombinedSlotBlock[] => {
    if (!slots || slots.length === 0) return [];

    const now = new Date();
    const durationMinutes = Math.round(durationHours * 60);

    const slotIntervals = slots.map((s) => {
      const [sh, sm] = s.startTime.split(":").map(Number);
      const [eh, em] = s.endTime.split(":").map(Number);
      
      return {
        slot: s,
        startMin: sh * 60 + sm,
        endMin: eh * 60 + em,
        fullStartD: s.fullStartTime ? new Date(s.fullStartTime) : null,
      };
    });

    const blocks: CombinedSlotBlock[] = [];

    for (let i = 0; i < slotIntervals.length; i++) {
      const startInterval = slotIntervals[i];
      let currentEndMin = startInterval.startMin;
      const targetEndMin = startInterval.startMin + durationMinutes;
      
      const overlappingIntervals = [];
      let isValidBlock = false;

      for (let j = i; j < slotIntervals.length; j++) {
        const nextInterval = slotIntervals[j];
        if (nextInterval.startMin !== currentEndMin) break; 
        
        overlappingIntervals.push(nextInterval);
        currentEndMin = nextInterval.endMin;
        
        if (currentEndMin === targetEndMin) {
          isValidBlock = true;
          break;
        }
        if (currentEndMin > targetEndMin) break;
      }

      if (!isValidBlock) continue;

      const primaryInterval = overlappingIntervals[0];
      const startSlot = primaryInterval.slot;

      if (primaryInterval.fullStartD && primaryInterval.fullStartD < now) {
        continue;
      }

      let blockStatus: CombinedSlotBlock["status"] = "available";
      let holdExpiresAt: number | null = null;

      for (const si of overlappingIntervals) {
        if (si.slot.status === "booked") {
          blockStatus = "booked";
          break;
        }
        if (si.slot.status === "pending") {
          blockStatus = "pending";
          holdExpiresAt = si.slot.lockedUntil;
          break;
        }
        if (si.slot.status === "expired") {
          blockStatus = "expired";
          break;
        }
      }

      const formatTimeStr = (totalMins: number) => {
        const h = Math.floor(totalMins / 60);
        const m = totalMins % 60;
        const displayH = h % 24;
        const isNextDay = h >= 24;
        return `${String(displayH).padStart(2, "0")}:${String(m).padStart(2, "0")}${isNextDay ? ' +1' : ''}`;
      };

      blocks.push({
        primarySlotId: startSlot.id,
        slotIds: overlappingIntervals.map((si) => si.slot.id),
        startTime: formatTimeStr(startInterval.startMin),
        endTime: formatTimeStr(targetEndMin),
        price: Math.round(startSlot.price * durationHours),
        status: blockStatus,
        holdExpiresAt,
      });
    }

    return blocks;
  }, [slots, durationHours]);

  const handleSelectBlock = async (block: CombinedSlotBlock) => {
    if (block.status === "booked" || block.status === "expired" || block.status === "unavailable") return;

    if (!session?.user && (!guestInfo.name || !guestInfo.phone)) {
      setGuestError("Please fill in your Guest Name & Mobile Number above before selecting a slot!");
      return;
    }

    setGuestError(null);
    setError(null);
    setIsHolding(true);

    try {
      const res = await fetch("/api/bookings/hold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId: block.primarySlotId,
          slotIds: block.slotIds,
          durationHours,
          calculatedPrice: block.price,
          guestName: guestInfo.name,
          guestPhone: guestInfo.phone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to hold slot duration. Try another time.");
        fetchSlots();
        return;
      }

      setSelectedSlot({
        id: block.primarySlotId,
        slotIds: block.slotIds,
        startTime: block.startTime,
        endTime: block.endTime,
        price: block.price,
        durationHours,
        holdExpiresAt: data.lockedUntil,
      });

      setBookingId(data.bookingId);
      setStep(1);
      fetchSlots();
    } catch (err: unknown) {
      console.error("Error holding slot block:", err);
      setError("Network error while holding slot.");
    } finally {
      setIsHolding(false);
    }
  };

  const combinedBlocks = calculateCombinedBlocks();
  const basePrice = slots.length > 0 ? slots[0].price : 0;
  
  const morningBlocks = combinedBlocks.filter(b => {
    const startHour = parseInt(b.startTime.split(':')[0], 10);
    return startHour >= 6 && startHour < 12;
  });
  
  const afternoonBlocks = combinedBlocks.filter(b => {
    const startHour = parseInt(b.startTime.split(':')[0], 10);
    return startHour >= 12 && startHour < 17;
  });
  
  const eveningBlocks = combinedBlocks.filter(b => {
    const startHour = parseInt(b.startTime.split(':')[0], 10);
    return startHour >= 17 && startHour < 21;
  });
  
  const nightBlocks = combinedBlocks.filter(b => {
    const startHour = parseInt(b.startTime.split(':')[0], 10);
    return startHour >= 21 || startHour < 6;
  });

  const SECTIONS = [
    { title: "Morning (6 AM - 12 PM)", blocks: morningBlocks },
    { title: "Afternoon (12 PM - 5 PM)", blocks: afternoonBlocks },
    { title: "Evening (5 PM - 9 PM)", blocks: eveningBlocks },
    { title: "Night (9 PM - Close)", blocks: nightBlocks },
  ];

  const renderCard = (block: CombinedSlotBlock) => {
    const isSelected = selected?.id === block.primarySlotId;
    const isBooked = block.status === "booked";
    const isPending = block.status === "pending" && !isSelected;

    let cardClasses = "";
    if (isSelected) {
      cardClasses = "bg-[#F5A623] border-[#F5A623] text-black shadow-[0_0_20px_rgba(245,166,35,0.4)] scale-[1.02] z-10";
    } else if (isBooked) {
      cardClasses = "bg-red-500/5 border-red-500/30 text-red-500/50 cursor-not-allowed opacity-60";
    } else if (isPending) {
      cardClasses = "bg-amber-500/10 border-amber-500/50 text-amber-300 cursor-not-allowed animate-pulse";
    } else {
      cardClasses = "bg-white/5 border-amber-500/30 hover:border-[#F5A623] hover:bg-white/10 text-white shadow-sm hover:shadow-[0_0_15px_rgba(245,166,35,0.15)]";
    }

    return (
      <button
        key={block.primarySlotId}
        disabled={isBooked || isHolding}
        onClick={() => handleSelectBlock(block)}
        className={`relative p-4 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between h-28 ${cardClasses}`}
        style={!isSelected && !isBooked && !isPending ? { backdropFilter: 'blur(12px)' } : {}}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold">
            {block.startTime} - {block.endTime}
          </span>
          {isSelected ? (
            <CheckCircle2 className="w-5 h-5 text-black" />
          ) : isBooked ? (
            <Lock className="w-4 h-4 text-red-500/50" />
          ) : isPending ? (
            <span className="text-[9px] font-mono uppercase bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-500">
              IN USE
            </span>
          ) : null}
        </div>

        <div className="flex items-end justify-between mt-2">
          <span
            className={`text-sm font-mono font-bold ${
              isSelected ? "text-black" : isBooked ? "text-red-500/50" : "text-[#F5A623]"
            }`}
          >
            ₹<AnimatedPrice value={block.price} />
          </span>
          <span
            className={`text-[10px] uppercase font-mono tracking-wider ${
              isSelected ? "text-black/80 font-bold" : isBooked ? "text-red-500/50" : isPending ? "text-amber-500/70" : "text-gray-400"
            }`}
          >
            {isBooked ? "Sold Out" : isSelected ? "Selected" : isPending ? "Hold" : "Available"}
          </span>
        </div>
      </button>
    );
  };

  if (isLoading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-3">
        <Loader2 className="w-8 h-8 text-[#F5A623] animate-spin" />
        <span className="text-xs font-mono">FETCHING LIVE STADIUM SLOTS...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Sticky Duration Selector */}
      <div 
        className="z-30 sticky top-4 mb-6 bg-[#121614]/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/10 flex flex-col items-start gap-4"
      >
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#F5A623]/10 border border-[#F5A623]/30 rounded-xl text-[#F5A623]">
            <Timer className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold tracking-wider text-gray-300 uppercase">
              Select Match Duration
            </h3>
            <p className="text-[11px] text-gray-400 font-mono">
              Choose play duration to alter schedule &amp; pricing
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
          {/* Quick-Select Chips (Crystal Glass Layout) */}
          <div className="flex rounded-xl p-1.5 gap-1 overflow-x-auto custom-scrollbar w-full sm:w-auto relative">
            <div className="absolute inset-0 bg-[#0A0D0C]/80 rounded-xl -z-10" style={{ backdropFilter: 'blur(24px) saturate(160%)' }} />
            <div className="absolute inset-0 border border-white/10 rounded-xl pointer-events-none -z-10" />
            
            {[1, 2, 3].map((hr) => {
              const hrTyped = hr as MatchDurationHours;
              const isSelected = durationHours === hr;
              return (
                <button
                  key={hr}
                  onClick={() => setDurationHours(hrTyped)}
                  className={`flex-shrink-0 px-4 py-2.5 rounded-lg text-xs font-mono transition-all relative flex-1 sm:flex-none border ${
                    isSelected
                      ? "bg-[#F5A623] text-black font-bold shadow-[0_0_15px_rgba(245,166,35,0.3)] border-[#F5A623]"
                      : "bg-transparent text-gray-300 hover:text-white hover:bg-white/5 border-transparent"
                  }`}
                >
                  {hr} Hour{hr > 1 ? "s" : ""}
                  {basePrice > 0 && (
                    <span className={`block mt-0.5 text-[10px] ${isSelected ? "text-black/70 font-semibold" : "text-gray-500"}`}>
                      · ₹{(basePrice * hr).toLocaleString("en-IN")}
                    </span>
                  )}
                </button>
              );
            })}
            
            <div className="shrink-0 flex items-center">
              <div className="w-px h-6 bg-white/10 mx-1"></div>
              <DurationSelector value={durationHours} onChange={setDurationHours} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#F5A623]" />
          <h3 className="text-xs font-mono font-bold tracking-wider text-gray-300 uppercase">
            {durationHours} HR MATCH SLOTS
          </h3>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono bg-white/5 px-3 py-2 rounded-xl border border-white/10">
          <span className="flex items-center gap-1.5 text-gray-300">
            <span className="w-2.5 h-2.5 rounded-full bg-white/5 border border-amber-500/30"></span> Available
          </span>
          <span className="flex items-center gap-1.5 text-gray-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/30 border border-amber-500"></span> On Hold
          </span>
          <span className="flex items-center gap-1.5 text-gray-300">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/30"></span> Booked
          </span>
        </div>
      </div>

      <AnimatePresence>
        {guestError && (
          <AutoDismissBanner
            key="guest-error"
            className="mb-4"
            message={guestError}
            type="warning"
            onDismiss={() => setGuestError(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <AutoDismissBanner
            key="slot-error"
            className="mb-4"
            message={error}
            type="error"
            onDismiss={() => setError(null)}
          />
        )}
      </AnimatePresence>

      {combinedBlocks.length === 0 ? (
        <div className="py-12 px-6 bg-[#121614] border border-amber-500/30 rounded-3xl text-center shadow-xl">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl w-12 h-12 flex items-center justify-center mx-auto mb-3 text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-white mb-1">No Available {durationHours} Hr Slots Remaining</h4>
          <p className="text-xs text-gray-400 max-w-md mx-auto mb-6">
            All match slots for this date have passed or cannot fit a {durationHours} hr match block.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setDurationHours(1)}
              className="px-4 py-2 bg-[#F5A623]/10 text-[#F5A623] hover:bg-[#F5A623]/20 border border-[#F5A623]/30 rounded-xl text-xs font-mono font-bold transition-colors"
            >
              Try 1 Hour instead
            </button>
            <button
              onClick={() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                const yyyy = tomorrow.getFullYear();
                const mm = String(tomorrow.getMonth() + 1).padStart(2, "0");
                const dd = String(tomorrow.getDate()).padStart(2, "0");
                useBookingStore.getState().setSelectedDate(`${yyyy}-${mm}-${dd}`);
              }}
              className="px-4 py-2 bg-white/5 text-white hover:bg-white/10 border border-white/10 rounded-xl text-xs font-mono font-bold transition-colors"
            >
              Jump to Tomorrow
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-8 pb-8">
          {SECTIONS.map((section) => {
            if (section.blocks.length === 0) return null;

            const allBooked = section.blocks.every((b) => b.status === "booked");

            if (allBooked) {
              return (
                <div key={section.title}>
                  <h4 className="text-sm font-bold text-white mb-4 border-b border-white/10 pb-2">
                    {section.title}
                  </h4>
                  <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 flex items-center justify-between opacity-60">
                    <span className="text-xs font-mono text-gray-400">{section.title.split(' ')[0]} fully booked</span>
                    <Lock className="w-4 h-4 text-red-500/50" />
                  </div>
                </div>
              );
            }

            return (
              <div key={section.title}>
                <h4 className="text-sm font-bold text-white mb-4 border-b border-white/10 pb-2">
                  {section.title}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {section.blocks.map(renderCard)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
