"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ChevronDown, Search, Check } from "lucide-react";
import { TN_DISTRICTS } from "@/constants/districts";
import { useFloating, offset, flip, shift, autoUpdate } from "@floating-ui/react";

interface DistrictSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const POPULAR_DISTRICTS = ["CHENNAI", "COIMBATORE", "MADURAI", "SALEM", "TIRUCHIRAPPALLI"];

export function DistrictSelector({ value, onChange }: DistrictSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const mediaQuery = window.matchMedia("(max-width: 640px)");
    setIsMobile(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const { x, y, strategy, refs } = useFloating({
    placement: "bottom-start",
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset(8), flip(), shift({ padding: 16 })],
    whileElementsMounted: autoUpdate,
  });

  const selectedDisplay = value === "All" ? "All 38 TN Districts" : value;

  // Handle click outside to close (only for desktop)
  useEffect(() => {
    if (!isOpen || isMobile) return;
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as Node;
      const isInsideTrigger = refs.domReference.current?.contains(target);
      const isInsidePanel = refs.floating.current?.contains(target);
      
      if (!isInsideTrigger && !isInsidePanel) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleDocumentClick);
    return () => document.removeEventListener("mousedown", handleDocumentClick);
  }, [isOpen, refs.domReference, refs.floating, isMobile]);

  const filteredDistricts = search === "" 
    ? [] 
    : TN_DISTRICTS.filter(d => d.toLowerCase().includes(search.toLowerCase()));

  // Visible items for keyboard navigation
  const visibleItems = search === ""
    ? [...POPULAR_DISTRICTS, "All", ...TN_DISTRICTS]
    : filteredDistricts;

  // Reset focus when search changes or panel opens
  useEffect(() => {
    setFocusedIndex(0);
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [search, isOpen]);

  // Keyboard Navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex(prev => (prev < visibleItems.length - 1 ? prev + 1 : prev));
      scrollToFocused(focusedIndex + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex(prev => (prev > 0 ? prev - 1 : 0));
      scrollToFocused(focusedIndex - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (visibleItems[focusedIndex]) {
        onChange(visibleItems[focusedIndex]);
        setIsOpen(false);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const scrollToFocused = (index: number) => {
    if (!listRef.current) return;
    const buttons = listRef.current.querySelectorAll("button");
    const target = buttons[index];
    if (target) {
      target.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  };

  const panelContent = (
    <>
      {/* Crystal Glass Background Layers */}
      <div 
        className="absolute inset-0 bg-[#0A0D0C]/80 -z-20 sm:rounded-2xl rounded-t-2xl"
        style={{ backdropFilter: 'blur(24px) saturate(160%)', WebkitBackdropFilter: 'blur(24px) saturate(160%)' }}
      />
      <div className="absolute inset-0 pointer-events-none -z-10 sm:rounded-2xl rounded-t-2xl overflow-hidden" style={{
        background: `
          linear-gradient(to bottom, rgba(255,255,255,0.08) 0px, transparent 1px),
          radial-gradient(100px circle at 100% 0%, rgba(245,166,35,0.12), transparent)
        `
      }} />
      <div 
        className="absolute inset-0 pointer-events-none -z-10 sm:rounded-2xl rounded-t-2xl" 
        style={{ 
          padding: '1px', 
          background: 'linear-gradient(to bottom right, rgba(255,255,255,0.2), rgba(255,255,255,0.02))',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude' 
        }} 
      />

      {isMobile && (
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 rounded-full bg-white/20" />
        </div>
      )}

      {/* Search Input */}
      <div className="p-3 sm:p-2 border-b border-white/10 relative z-10 bg-black/20">
        <div className="relative">
          <Search className="absolute left-3 top-3 sm:top-2.5 w-4 h-4 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search districts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pl-9 pr-3 py-2.5 sm:py-2 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 outline-none focus:border-[#F5A623]/50 focus:bg-white/[0.06] transition-colors"
          />
        </div>
      </div>

      {/* Scrollable List */}
      <div 
        ref={listRef}
        className="max-h-[50vh] sm:max-h-[300px] overflow-y-auto custom-scrollbar p-1 relative z-10"
      >
        {search === "" && (
          <>
            <div className="px-3 sm:px-2 py-2 sm:py-1.5 text-[10px] font-mono text-gray-500 uppercase tracking-wider">
              Popular
            </div>
            <div className="space-y-0.5">
              {POPULAR_DISTRICTS.map((district, idx) => (
                <DistrictOption 
                  key={`popular-${district}`} 
                  name={district} 
                  isSelected={value === district}
                  isFocused={focusedIndex === idx}
                  onSelect={() => { onChange(district); setIsOpen(false); }}
                />
              ))}
            </div>
            <div className="h-px bg-white/10 my-2 mx-3 sm:mx-2" />
            <div className="px-3 sm:px-2 py-2 sm:py-1.5 text-[10px] font-mono text-gray-500 uppercase tracking-wider">
              All Districts (38)
            </div>
            <div className="space-y-0.5">
              <DistrictOption 
                name="All" 
                displayName="All 38 TN Districts"
                isSelected={value === "All"}
                isFocused={focusedIndex === POPULAR_DISTRICTS.length}
                onSelect={() => { onChange("All"); setIsOpen(false); }}
              />
              {TN_DISTRICTS.map((district, idx) => (
                <DistrictOption 
                  key={district} 
                  name={district} 
                  isSelected={value === district}
                  isFocused={focusedIndex === POPULAR_DISTRICTS.length + 1 + idx}
                  onSelect={() => { onChange(district); setIsOpen(false); }}
                />
              ))}
            </div>
          </>
        )}

        {search !== "" && (
          <div className="space-y-0.5">
            {filteredDistricts.length > 0 ? (
              filteredDistricts.map((district, idx) => (
                <DistrictOption 
                  key={district} 
                  name={district} 
                  isSelected={value === district}
                  isFocused={focusedIndex === idx}
                  onSelect={() => { onChange(district); setIsOpen(false); }}
                />
              ))
            ) : (
              <div className="py-8 text-center text-sm text-gray-400">
                No districts match "{search}"
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Trigger Button */}
      <button
        ref={refs.setReference}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-black/60 border rounded-xl transition-all duration-200 outline-none
          ${isOpen 
            ? "border-[#F5A623] shadow-[0_0_0_2px_rgba(245,166,35,0.15)]" 
            : "border-[#F5A623]/30 hover:border-[#F5A623]/50"
          }
        `}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <MapPin className="w-4 h-4 text-[#F5A623] shrink-0" />
          <span className="text-sm font-semibold text-white truncate">
            {selectedDisplay}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="shrink-0"
        >
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </motion.div>
      </button>

      {/* Dropdown Panel in Portal */}
      {mounted && createPortal(
        <AnimatePresence>
          {isOpen && !isMobile && (
            <motion.div
              ref={refs.setFloating}
              style={{
                position: strategy,
                top: y ?? 0,
                left: x ?? 0,
                zIndex: 100,
                width: refs.domReference.current ? (refs.domReference.current as HTMLElement).offsetWidth : "auto",
                transformOrigin: "top"
              }}
              initial={{ opacity: 0, scale: 0.96, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -4 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] border border-white/10 isolate"
            >
              {panelContent}
            </motion.div>
          )}

          {isOpen && isMobile && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 bg-black/60 z-[90] backdrop-blur-sm"
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed bottom-0 left-0 right-0 z-[100] border-t border-white/10 shadow-[0_-20px_40px_rgba(0,0,0,0.5)] isolate"
              >
                {panelContent}
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

function DistrictOption({ 
  name, 
  displayName,
  isSelected,
  isFocused,
  onSelect 
}: { 
  name: string, 
  displayName?: string,
  isSelected: boolean,
  isFocused: boolean,
  onSelect: () => void 
}) {
  const turfCount = name === "All" ? 342 : (name.length % 15) + 5;

  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center justify-between px-3 sm:px-3 py-3 sm:py-2 rounded-lg text-sm transition-colors text-left group
        ${isSelected 
          ? "bg-[#F5A623]/10 border-l-[3px] border-[#F5A623] pl-[9px] sm:pl-[9px]" 
          : "text-gray-300 hover:bg-[#F5A623]/[0.08] hover:text-white border-l-[3px] border-transparent"
        }
        ${isFocused && !isSelected ? "bg-[#F5A623]/[0.08] text-white" : ""}
      `}
    >
      <div className="flex items-center gap-2.5">
        <MapPin className={`w-4 h-4 sm:w-3.5 sm:h-3.5 ${isSelected ? "fill-[#F5A623] text-[#F5A623]" : "text-[#F5A623] opacity-70 group-hover:opacity-100"}`} />
        <span className={isSelected ? "font-semibold text-white" : "font-medium"}>
          {displayName || name}
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono text-gray-500">{turfCount} turfs</span>
        {isSelected && <Check className="w-4 h-4 text-[#F5A623]" />}
      </div>
    </button>
  );
}
