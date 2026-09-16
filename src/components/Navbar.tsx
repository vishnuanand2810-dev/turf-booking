"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useNav } from "@/hooks/useNav";
import { createPortal } from "react-dom";
import { useFloating, offset, shift, flip, autoUpdate } from "@floating-ui/react";
import { AuthModal } from "@/components/AuthModal";
import { User, LogOut, Calendar, Zap, LayoutDashboard } from "lucide-react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { name: "Turfs", path: "/", icon: Zap },
  { name: "My Bookings", path: "/dashboard", icon: Calendar },
];

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const nav = useNav();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mediaQuery.matches);
    if (navigator.hardwareConcurrency < 4) setReduceMotion(true);
  }, []);

  const { refs, x, y, strategy } = useFloating({
    placement: "bottom-end",
    open: isMenuOpen,
    onOpenChange: setIsMenuOpen,
    middleware: [offset(8), flip(), shift({ padding: 16 })],
    whileElementsMounted: autoUpdate,
  });

  return (
    <>
      <header className="sticky top-0 z-40 w-full">
        {/* Layer 1: Base blur */}
        <div 
          className="absolute inset-0 bg-[#0A0D0C]/70"
          style={{ backdropFilter: 'blur(24px) saturate(160%)', WebkitBackdropFilter: 'blur(24px) saturate(160%)' }}
        />
        
        {/* Layer 2 & 3: Crystal Glass Highlights and Refraction Glows */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: `
            linear-gradient(to bottom, rgba(255,255,255,0.12) 0px, transparent 2px),
            radial-gradient(60px circle at 0% 100%, rgba(245,166,35,0.08), transparent),
            radial-gradient(60px circle at 100% 0%, rgba(245,166,35,0.08), transparent)
          `,
          borderBottom: '1px solid transparent',
          borderImage: 'linear-gradient(to bottom right, rgba(255,255,255,0.25), rgba(255,255,255,0.05)) 1'
        }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div
            onClick={(e) => nav.navigateToHome(e)}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="p-2 bg-[#F5A623]/10 border border-[#F5A623]/30 rounded-xl group-hover:bg-[#F5A623]/20 transition-all duration-300">
              <Zap className="w-5 h-5 text-[#F5A623]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1">
                PITCH<span className="text-[#F5A623]">PRO</span>
              </span>
              <span className="text-[10px] font-mono tracking-widest text-[#F5A623]/80 uppercase -mt-1">
                STADIUM TURF BOOKING
              </span>
            </div>
          </div>

          {/* Central Navigation - Liquid Active Link */}
          <div className="hidden md:flex items-center relative h-10 px-2">
            {!reduceMotion && (
              <div 
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{ filter: "url(#goo)" }}
              >
                {NAV_LINKS.map(link => {
                  const isActive = pathname === link.path;
                  if (!isActive) return null;
                  return (
                    <motion.div
                      key="active-bg"
                      layoutId="nav-active-blob"
                      className="absolute inset-y-1 bg-[#F5A623] rounded-full w-full"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 180,
                        damping: 14,
                        mass: 0.8
                      }}
                      style={{
                        width: 'calc(100% - 16px)',
                        left: '8px'
                      }}
                    />
                  );
                })}
              </div>
            )}
            
            <nav className="flex items-center gap-2 relative z-10">
              {NAV_LINKS.map(link => {
                const isActive = pathname === link.path;
                return (
                  <button
                    key={link.path}
                    onClick={(e) => link.path === '/' ? nav.navigateToHome(e) : nav.navigateToDashboard(e)}
                    className={`relative px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                      isActive ? "text-[#FFC873]" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {reduceMotion && isActive && (
                      <div className="absolute inset-0 bg-[#F5A623]/10 border border-[#F5A623]/20 rounded-full" />
                    )}
                    <link.icon className="w-4 h-4" />
                    <span className="relative z-10">{link.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {session?.user ? (
              <>
                <button
                  ref={refs.setReference}
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-2 py-1.5 px-3 bg-white/5 border border-white/10 rounded-xl hover:border-[#F5A623]/40 transition-all outline-none focus:border-[#F5A623]/50"
                >
                  <div className="w-6 h-6 rounded-full bg-[#F5A623]/20 border border-[#F5A623]/40 text-[#F5A623] flex items-center justify-center font-bold text-xs">
                    {session.user.name?.[0]?.toUpperCase() || "P"}
                  </div>
                  <span className="text-xs font-medium max-w-[100px] truncate text-gray-200">
                    {session.user.name || "Player"}
                  </span>
                </button>

                {mounted && createPortal(
                  <AnimatePresence>
                    {isMenuOpen && (
                      <motion.div
                        ref={refs.setFloating}
                        style={{
                          position: strategy,
                          top: y ?? 0,
                          left: x ?? 0,
                          zIndex: 100
                        }}
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="w-48 py-2 bg-[#121614] border border-white/10 rounded-xl shadow-2xl isolate"
                      >
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            signOut({ callbackUrl: '/' });
                          }}
                          className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-white/5 text-gray-300 hover:text-red-400 text-xs font-medium"
                        >
                          <LogOut className="w-4 h-4 text-red-500" /> Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>,
                  document.body
                )}
              </>
            ) : (
               <div className="flex items-center gap-2">
                <span className="hidden sm:inline-block text-[11px] text-gray-400 px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg">
                  Guest Mode Active
                </span>
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="py-1.5 px-3.5 bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-medium rounded-xl text-white transition-all flex items-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5 text-[#F5A623]" /> Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
