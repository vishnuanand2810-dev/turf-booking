"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useBookingStore } from "@/store/bookingStore";
import { User, UserCheck, Phone, CheckCircle2, AlertCircle } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { AutoDismissBanner } from "./AutoDismissBanner";

export function GuestInfoForm() {
  const { data: session } = useSession();
  const { guestInfo, setGuestInfo } = useBookingStore();

  const [name, setName] = useState(guestInfo.name || "");
  const [phone, setPhone] = useState(guestInfo.phone || "");
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(!!guestInfo.phone);

  // If logged in, automatically populate from session
  if (session?.user) {
    return (
      <div className="mb-6 p-4 bg-[#F5A623]/10 border border-[#F5A623]/30 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#F5A623]/20 rounded-xl text-[#F5A623]">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-[#F5A623] uppercase tracking-wider font-mono">
              LOGGED IN CHECKOUT ACTIVE
            </div>
            <div className="text-sm font-medium text-white">
              Booking as <span className="font-bold">{session.user.name || "PitchPro User"}</span>
            </div>
          </div>
        </div>
        <span className="px-3 py-1 bg-black/40 border border-[#F5A623]/30 text-xs font-mono text-[#F5A623] rounded-full">
          Account Synced
        </span>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, "");
    if (!name.trim()) {
      setError("Please enter your name for booking confirmation.");
      return;
    }
    if (cleanPhone.length !== 10) {
      setError("Please enter a valid 10-digit mobile phone number.");
      return;
    }

    setError(null);
    setGuestInfo({ name: name.trim(), phone: cleanPhone });
    setIsSaved(true);
  };

  return (
    <div className="mb-6 p-5 bg-[#121614] border border-white/10 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#F5A623]/10 border border-[#F5A623]/30 rounded-xl text-[#F5A623]">
            <Phone className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Guest Checkout Details</h3>
            <p className="text-xs text-gray-400">Required for WhatsApp confirmation & venue check-in</p>
          </div>
        </div>

        {isSaved && (
          <span className="flex items-center gap-1 text-xs font-medium text-[#F5A623] bg-[#F5A623]/10 px-3 py-1 rounded-full border border-[#F5A623]/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Details Locked
          </span>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <AutoDismissBanner
            key="guest-info-error"
            className="mb-3"
            message={error}
            type="error"
            onDismiss={() => setError(null)}
          />
        )}
      </AnimatePresence>

      <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1 font-medium">Your Name</label>
          <input
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setIsSaved(false);
            }}
            className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#F5A623]"
            required
          />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1 font-medium">10-Digit Mobile Number</label>
          <div className="flex items-center gap-1.5">
            <span className="px-2.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs font-mono text-gray-400">
              +91
            </span>
            <input
              type="tel"
              maxLength={10}
              placeholder="9876543210"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setIsSaved(false);
              }}
              className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm font-mono focus:outline-none focus:border-[#F5A623]"
              required
            />
          </div>
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition-all ${
              isSaved
                ? "bg-white/10 text-gray-300 border border-white/10 hover:bg-white/20"
                : "bg-[#F5A623] text-black hover:bg-[#FFC873] shadow-[0_0_15px_rgba(245,166,35,0.3)]"
            }`}
          >
            {isSaved ? "Update Guest Info" : "Confirm Guest Details"}
          </button>
        </div>
      </form>
    </div>
  );
}
