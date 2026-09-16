"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { DateStrip } from "@/components/DateStrip";
import { SlotGrid } from "@/components/SlotGrid";
import { GuestInfoForm } from "@/components/GuestInfoForm";
import { RunningTotalBar } from "@/components/RunningTotalBar";
import { BookingSummaryModal } from "@/components/BookingSummaryModal";
import { ConfirmationScreen } from "@/components/ConfirmationScreen";
import { GroundData } from "@/components/GroundCard";
import { ThreeParticleField } from "@/components/ThreeParticleField";
import { PremiumSpinner } from "@/components/ui/PremiumSpinner";
import { useBookingStore, BookingReceiptData } from "@/store/bookingStore";
import { useNav } from "@/hooks/useNav";
import { MapPin, Star, ShieldCheck, ChevronLeft } from "lucide-react";

export default function TurfBookingPage() {
  const params = useParams();
  const turfId = params.id as string;
  const nav = useNav();

  const {
    setGround,
    step,
    setStep,
    receipt,
    setReceipt,
  } = useBookingStore();

  const [ground, setGroundData] = useState<GroundData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSummaryOpen, setIsSummaryOpen] = useState(step === 2);

  useEffect(() => {
    async function fetchGround() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/grounds/${turfId}`);
        const data = await res.json();
        if (data.ground) {
          setGroundData(data.ground);
          setGround(data.ground.id, data.ground.name);
        }
      } catch (err) {
        console.error("Failed to fetch ground:", err);
      } finally {
        setIsLoading(false);
      }
    }
    if (turfId) fetchGround();
  }, [turfId, setGround]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0D0C] text-white">
        <Navbar />
        <div className="max-w-7xl mx-auto py-20 px-4 text-center flex flex-col items-center justify-center">
          <PremiumSpinner className="w-12 h-12 mb-4" />
          <p className="text-xs font-mono text-gray-400">LOADING STADIUM ARENA...</p>
        </div>
      </div>
    );
  }

  if (!ground) {
    return (
      <div className="min-h-screen bg-[#0A0D0C] text-white">
        <Navbar />
        <div className="max-w-7xl mx-auto py-20 px-4 text-center">
          <h2 className="text-xl font-bold text-white mb-2">Ground Not Found</h2>
          <button
            onClick={() => nav.navigateToHome()}
            className="mt-4 px-4 py-2 bg-[#F5A623] text-black font-semibold text-xs rounded-xl"
          >
            Back to Grounds
          </button>
        </div>
      </div>
    );
  }

  if (step === 3 && receipt) {
    return (
      <div className="min-h-screen bg-[#0A0D0C] text-white">
        <Navbar />
        <ConfirmationScreen receipt={receipt} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0D0C] text-white selection:bg-[#F5A623] selection:text-black pb-28">
      <Navbar />

      <div className="bg-black/60 border-b border-white/5 py-3 px-4 sticky top-16 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => nav.navigateToHome()}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Grounds
          </button>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${step >= 0 ? "bg-[#F5A623]" : "bg-white/20"}`} />
              <span className="text-[11px] font-mono text-gray-300 hidden sm:inline">1. Select Slot</span>
            </div>
            <span className="w-4 h-px bg-white/20" />
            <div className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${step >= 1 ? "bg-[#F5A623]" : "bg-white/20"}`} />
              <span className="text-[11px] font-mono text-gray-300 hidden sm:inline">2. Summary</span>
            </div>
            <span className="w-4 h-px bg-white/20" />
            <div className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${step >= 3 ? "bg-[#F5A623]" : "bg-white/20"}`} />
              <span className="text-[11px] font-mono text-gray-300 hidden sm:inline">3. Confirmed</span>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <div className="lg:col-span-2">
            <div className="relative h-72 sm:h-96 rounded-3xl overflow-hidden border border-white/10 mb-6 bg-[#0A0D0C]">
              <img
                src={ground.images[0] || "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=1200&q=80"}
                alt={ground.name}
                className="w-full h-full object-cover opacity-60"
              />
              <ThreeParticleField />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D0C] via-transparent to-transparent z-10" />

              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-xs text-[#F5A623] font-mono font-bold mb-2">
                    <Star className="w-3.5 h-3.5 fill-[#F5A623]" /> {ground.rating.toFixed(1)} Stadium Rating
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-extrabold text-white">{ground.name}</h1>
                  <p className="flex items-center gap-1.5 text-xs text-gray-300 mt-1">
                    <MapPin className="w-4 h-4 text-[#F5A623]" /> {ground.address}, {ground.city}
                  </p>
                </div>

                <div className="text-right hidden sm:block">
                  <span className="text-[10px] text-gray-400 font-mono uppercase block">HOURLY RATE</span>
                  <span className="text-2xl font-mono font-bold text-[#F5A623]">
                    ₹{ground.price.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-300 leading-relaxed mb-6">
              {ground.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              {ground.amenities.map((amenity, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-[#121614] border border-white/10 rounded-xl text-xs text-gray-300 font-medium"
                >
                  ⚡ {amenity}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-[#121614] border border-white/10 rounded-3xl p-6 h-fit">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#F5A623]" /> PitchPro Venue Rules
            </h3>
            <ul className="space-y-3 text-xs text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-[#F5A623] font-bold">&bull;</span>
                <span>Arrive 10 minutes prior to slot start time for QR scan verification.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#F5A623] font-bold">&bull;</span>
                <span>Only non-marking studs or turf footwear allowed on pitch.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#F5A623] font-bold">&bull;</span>
                <span>Automated floodlights activate 5 minutes before match start time.</span>
              </li>
            </ul>
          </div>
        </div>

        <GuestInfoForm />
        <DateStrip />
        <SlotGrid groundId={ground.id} />
      </main>

      <RunningTotalBar onProceed={() => setIsSummaryOpen(true)} />

      <BookingSummaryModal
        isOpen={isSummaryOpen || step === 2}
        onClose={() => {
          setIsSummaryOpen(false);
          if (step === 2) setStep(0);
        }}
        onPaymentSuccess={(rec) => {
          setIsSummaryOpen(false);
          setReceipt(rec as BookingReceiptData);
          setStep(3);
        }}
      />
    </div>
  );
}
