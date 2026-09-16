"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { GroundCard, GroundData } from "@/components/GroundCard";
import { MotionWrapper } from "@/components/MotionWrapper";
import { VideoBackground } from "@/components/VideoBackground";
import { InteractiveMeshBg } from "@/components/InteractiveMeshBg";
import { FlowDivider } from "@/components/FlowDivider";
import { DistrictSelector } from "@/components/DistrictSelector";
import { useGroundFilterStore } from "@/store/groundFilterStore";
import { TN_DISTRICTS } from "@/constants/districts";
import { Search, MapPin, Zap, ShieldCheck, Sparkles, ChevronDown } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";

export default function HomePage() {
  const { cityFilter, setCityFilter, search, setSearch } = useGroundFilterStore();
  const [grounds, setGrounds] = useState<GroundData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const prefersReducedMotion = useReducedMotion();

  // 3D Parallax State
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 150 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothMouseY, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(smoothMouseX, [-0.5, 0.5], [-10, 10]);

  // Default popular districts for quick filter pills
  const popularDistricts = ["All", "CHENNAI", "COIMBATORE", "MADURAI", "SALEM", "TIRUCHIRAPPALLI"];

  useEffect(() => {
    async function fetchGrounds() {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (cityFilter && cityFilter !== "All") queryParams.set("city", cityFilter);
        if (search) queryParams.set("search", search);

        const res = await fetch(`/api/grounds?${queryParams.toString()}`);
        const data = await res.json();
        if (data.grounds) {
          setGrounds(data.grounds);
        }
      } catch (err) {
        console.error("Failed to fetch grounds:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchGrounds();
  }, [cityFilter, search]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      mouseX.set(e.clientX / innerWidth - 0.5);
      mouseY.set(e.clientY / innerHeight - 0.5);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [prefersReducedMotion, mouseX, mouseY]);

  return (
    <div className="min-h-screen bg-[#0A0D0C] text-white selection:bg-[#F5A623] selection:text-black">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 overflow-hidden" style={{ perspective: 1200 }}>
        <VideoBackground src="/hero-bg.mp4" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-[#F5A623]/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <MotionWrapper initial={{ opacity: 0, y: -20 }} whileInView={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#F5A623]/10 border border-[#F5A623]/30 rounded-full text-[#F5A623] text-xs font-mono font-bold mb-6 animate-float">
              <Sparkles className="w-3.5 h-3.5" />
              <span>TAMIL NADU DISTRICT TURF BOOKINGS</span>
            </div>
          </MotionWrapper>

          <MotionWrapper initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.1]">
              Book Premier Floodlit <span className="text-[#F5A623] hero-text-glow">Stadium Turfs</span> Across Tamil Nadu
            </h1>
          </MotionWrapper>

          <MotionWrapper initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
            <p className="mt-6 text-base sm:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Explore floodlit night pitches across all 38 districts of Tamil Nadu. Instant hourly holds &amp; WhatsApp match passes.
            </p>
          </MotionWrapper>

          {/* 3D Depth Layer for Badges */}
          <motion.div 
            style={{ 
              rotateX: prefersReducedMotion ? 0 : rotateX, 
              rotateY: prefersReducedMotion ? 0 : rotateY, 
              transformStyle: "preserve-3d" 
            }}
            className="flex items-center justify-center gap-4 mt-8 flex-wrap perspective-container"
          >
            <motion.div 
              style={{ translateZ: prefersReducedMotion ? 0 : 40 }}
              className="px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl flex items-center gap-2 text-xs font-mono shadow-xl"
            >
              <Zap className="w-4 h-4 text-[#F5A623]" />
              <span>38 TN Districts Supported</span>
            </motion.div>
            <motion.div 
              style={{ translateZ: prefersReducedMotion ? 0 : 60 }}
              className="px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl flex items-center gap-2 text-xs font-mono shadow-2xl"
            >
              <ShieldCheck className="w-4 h-4 text-[#F5A623]" />
              <span>Instant Guest &amp; Member Checkout</span>
            </motion.div>
          </motion.div>

          {/* Glassmorphism Search with Interactive Mesh */}
          <motion.div 
            style={{ 
              rotateX: prefersReducedMotion ? 0 : rotateX, 
              rotateY: prefersReducedMotion ? 0 : rotateY, 
              transformStyle: "preserve-3d" 
            }}
            className="mt-10 max-w-4xl mx-auto relative"
          >
            <motion.div style={{ translateZ: prefersReducedMotion ? 0 : -20 }} className="absolute -inset-10 rounded-[3rem] overflow-hidden pointer-events-none z-0">
              <InteractiveMeshBg />
            </motion.div>

            <motion.div style={{ translateZ: prefersReducedMotion ? 0 : 20 }} className="relative z-10 p-4 bg-[#0A0D0C]/60 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.4)] space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="Search arena, town, or sport (cricket, football)..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#F5A623]/50 text-white transition-colors hover:bg-black/80"
                  />
                </div>

                {/* 38 Districts Select Dropdown */}
                <div className="relative w-full sm:w-64 z-20">
                  <DistrictSelector value={cityFilter} onChange={setCityFilter} />
                </div>
              </div>

              {/* Popular District Chips */}
              <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-white/10">
                <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider mr-1">
                  POPULAR DISTRICTS:
                </span>
                {popularDistricts.map((district) => (
                  <button
                    key={district}
                    onClick={() => setCityFilter(district)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      cityFilter === district
                        ? "bg-[#F5A623] text-black shadow-[0_0_15px_rgba(245,166,35,0.3)]"
                        : "bg-black/40 border border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20"
                    }`}
                  >
                    {district === "All" ? "All Districts" : district}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <FlowDivider />

      {/* Featured Arenas Section */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
              Tamil Nadu Turf Stadiums <span className="text-xs font-mono text-[#F5A623] font-normal">({grounds.length})</span>
            </h2>
            <p className="text-xs text-gray-400 mt-1">High-definition LED floodlit pitches with FIFA &amp; pro box cricket turf netting</p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-gray-300 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-default">
            <MapPin className="w-3.5 h-3.5 text-[#F5A623]" />
            <span>District: <strong className="text-[#F5A623]">{cityFilter}</strong></span>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 bg-white/5 rounded-2xl animate-pulse border border-white/5" />
            ))}
          </div>
        ) : grounds.length === 0 ? (
          <div className="py-16 text-center text-gray-400 border border-white/5 rounded-2xl bg-white/[0.02]">
            <p className="text-sm">No stadium grounds found in <span className="text-[#F5A623] font-bold">{cityFilter}</span> district.</p>
            <p className="text-xs text-gray-500 mt-1">Try switching to &quot;All 38 TN Districts&quot; or search another location.</p>
            <button
              onClick={() => {
                setCityFilter("All");
                setSearch("");
              }}
              className="mt-4 px-4 py-2 bg-[#F5A623]/10 border border-[#F5A623]/30 text-[#F5A623] text-xs font-semibold rounded-xl hover:bg-[#F5A623]/20 transition-colors"
            >
              Reset District Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {grounds.map((ground, idx) => (
              <MotionWrapper key={ground.id} transition={{ delay: idx * 0.05, duration: 0.3 }}>
                <GroundCard ground={ground} />
              </MotionWrapper>
            ))}
          </div>
        )}
      </section>

      <FlowDivider />

      {/* How it works */}
      <section className="py-16 px-4 bg-black/40 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-2xl font-bold text-white">How PitchPro Works in Tamil Nadu</h2>
            <p className="text-xs text-gray-400 mt-1">Guest &amp; logged-in checkout across all districts</p>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Animated Connector Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-[2px] bg-white/10 z-0">
              <motion.div
                className="h-full bg-gradient-to-r from-transparent via-[#F5A623] to-transparent w-1/3"
                initial={{ x: "-100%" }}
                whileInView={{ x: "300%" }}
                viewport={{ once: true, amount: 0.8 }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
            </div>

            {[
              {
                step: "01",
                title: "Select District & Hourly Slot",
                desc: "Choose from 38 Tamil Nadu districts. Live slot selection locks your pitch exclusively for 5 minutes."
              },
              {
                step: "02",
                title: "Instant Guest or Member Checkout",
                desc: "No mandatory registration. Input guest details or sign in to use promo codes like TN30 or PITCH20."
              },
              {
                step: "03",
                title: "WhatsApp Pass & Venue Entry",
                desc: "Server-verified Razorpay payment generates your digital QR pass sent directly via WhatsApp."
              }
            ].map((item, i) => (
              <MotionWrapper key={item.step} transition={{ delay: i * 0.2 }} className="relative z-10">
                <div className="p-6 bg-[#121614] border border-white/10 rounded-2xl h-full shadow-lg hover:border-white/20 transition-colors">
                  <div className="w-12 h-12 mx-auto md:mx-0 rounded-xl bg-black border border-[#F5A623]/30 text-[#F5A623] flex items-center justify-center font-mono font-bold text-lg mb-6 relative overflow-hidden shadow-[0_0_15px_rgba(245,166,35,0.1)]">
                    {/* Inner glowing pulse */}
                    <motion.div
                      className="absolute inset-0 bg-[#F5A623]/20"
                      initial={{ scale: 0.5, opacity: 0 }}
                      whileInView={{ scale: 1.5, opacity: [0, 0.5, 0] }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.2 + 0.5, duration: 1 }}
                    />
                    <span className="relative z-10">{item.step}</span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2 text-center md:text-left">{item.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed text-center md:text-left">
                    {item.desc}
                  </p>
                </div>
              </MotionWrapper>
            ))}
          </div>
        </div>
      </section>

      <FlowDivider />

      {/* Footer */}
      <footer className="py-8 px-4 text-center text-xs font-mono text-gray-500">
        <p>&copy; {new Date().getFullYear()} PitchPro Stadiums. Tamil Nadu Night Turf Platform.</p>
      </footer>
    </div>
  );
}
