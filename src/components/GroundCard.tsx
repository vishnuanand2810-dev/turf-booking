"use client";

import React, { useState } from "react";
import { useNav } from "@/hooks/useNav";
import { Star, MapPin, ChevronRight } from "lucide-react";

export interface GroundData {
  id: string;
  name: string;
  description: string;
  city: string;
  address: string;
  price: number;
  amenities: string[];
  images: string[];
  rating: number;
}

const DEFAULT_TURF_IMAGE = "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=1200&q=80";

export function GroundCard({ ground, isSelected = false }: { ground: GroundData; isSelected?: boolean }) {
  const nav = useNav();
  const rawImage = ground.images && ground.images.length > 0 ? ground.images[0] : DEFAULT_TURF_IMAGE;
  const [imgSrc, setImgSrc] = useState(rawImage);
  const [isHovered, setIsHovered] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mediaQuery.matches);
    if (navigator.hardwareConcurrency < 4) setReduceMotion(true);
  }, []);

  return (
    <div
      tabIndex={0}
      role="button"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => nav.navigateToBooking(ground.id, e)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          nav.navigateToBooking(ground.id, e as any);
        }
      }}
      className={`group relative rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer flex flex-col h-full isolate turf-card-glow-wrapper ${
        isSelected ? "is-selected" : ""
      }`}
    >
      {/* Animated Rotating Amber Border Light (Active on Hover & Focus/Selected) */}
      <div className="turf-card-border-light" aria-hidden="true" />

      {/* Cheap Fallback Background */}
      <div className="absolute inset-0 bg-[#121614] -z-20" />
      <div className="absolute inset-0 bg-white/5 -z-20 transition-opacity duration-300 opacity-100 group-hover:opacity-0" />
      <div className="absolute inset-0 border border-white/10 rounded-2xl -z-10 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none" />

      {/* Crystal Glass Hover Surface */}
      {isHovered && !reduceMotion && (
        <>
          <div 
            className="absolute inset-0 bg-[#0A0D0C]/40 -z-20"
            style={{ backdropFilter: 'blur(28px) saturate(160%)', WebkitBackdropFilter: 'blur(28px) saturate(160%)' }}
          />
          <div className="absolute inset-0 pointer-events-none -z-10" style={{
            background: `
              linear-gradient(to bottom, rgba(255,255,255,0.12) 0px, transparent 2px),
              radial-gradient(80px circle at 0% 100%, rgba(245,166,35,0.12), transparent),
              radial-gradient(80px circle at 100% 0%, rgba(245,166,35,0.12), transparent)
            `
          }} />
          <div 
            className="absolute inset-0 rounded-2xl pointer-events-none -z-10" 
            style={{ 
              padding: '1px', 
              background: 'linear-gradient(to bottom right, rgba(255,255,255,0.25), rgba(255,255,255,0.05))',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude' 
            }} 
          />
        </>
      )}
      
      {/* Fallback Hover for low-end / reduced motion */}
      {isHovered && reduceMotion && (
        <div className="absolute inset-0 border border-[#F5A623]/50 rounded-2xl pointer-events-none -z-10 shadow-[0_8px_32px_rgba(245,166,35,0.15)]" />
      )}

      <div className="relative h-48 w-full overflow-hidden bg-black/40">
        <img
          src={imgSrc}
          alt={ground.name}
          onError={() => setImgSrc(DEFAULT_TURF_IMAGE)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121614] via-transparent to-black/20" />

        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-xs font-semibold text-white">
          <Star className="w-3.5 h-3.5 fill-[#F5A623] text-[#F5A623]" />
          <span>{ground.rating.toFixed(1)}</span>
        </div>

        <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[11px] font-medium text-gray-300">
          {ground.city}
        </div>
      </div>

      <div className="p-5 flex flex-col justify-between flex-1">
        <div>
          <h3 className="text-lg font-bold text-white group-hover:text-[#F5A623] transition-colors line-clamp-1">
            {ground.name}
          </h3>
          <p className="flex items-center gap-1 text-xs text-gray-400 mt-1 line-clamp-1">
            <MapPin className="w-3.5 h-3.5 text-gray-500 shrink-0" />
            {ground.address}
          </p>

          <p className="text-xs text-gray-400 mt-2.5 line-clamp-2 leading-relaxed">
            {ground.description}
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-white/5">
          <div className="flex flex-wrap gap-1.5 mb-4">
            {ground.amenities.slice(0, 3).map((amenity, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 bg-white/5 border border-white/5 rounded text-[10px] text-gray-300"
              >
                {amenity}
              </span>
            ))}
            {ground.amenities.length > 3 && (
              <span className="px-2 py-0.5 bg-white/5 text-[10px] text-gray-400">
                +{ground.amenities.length - 3} more
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-mono tracking-wider block">HOURLY RATE</span>
              <div className="text-lg font-mono font-bold text-[#F5A623]">
                ₹{ground.price.toLocaleString("en-IN")}
                <span className="text-xs text-gray-400 font-sans font-normal"> / hr</span>
              </div>
            </div>

            <button className="px-3.5 py-2 bg-[#F5A623]/10 group-hover:bg-[#F5A623] border border-[#F5A623]/30 text-[#F5A623] group-hover:text-black font-semibold text-xs rounded-xl transition-all duration-300 flex items-center gap-1">
              Book Slot <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
