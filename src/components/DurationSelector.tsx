"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { useFloating, offset, flip, shift, autoUpdate } from "@floating-ui/react";
import { MatchDurationHours } from "@/store/bookingStore";

interface DurationSelectorProps {
  value: MatchDurationHours;
  onChange: (value: MatchDurationHours) => void;
}

const DURATION_OPTIONS: { label: string; hours: MatchDurationHours }[] = [
  { label: "4 Hours (Tournament)", hours: 4 },
  { label: "5 Hours (Tournament)", hours: 5 },
];

export function DurationSelector({ value, onChange }: DurationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);

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

  const selectedOption = DURATION_OPTIONS.find((opt) => opt.hours === value);
  const selectedDisplay = selectedOption ? selectedOption.label : "More durations";

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

  // Keyboard Navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }
    
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex(prev => (prev < DURATION_OPTIONS.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const opt = DURATION_OPTIONS[focusedIndex];
      if (opt) {
        onChange(opt.hours);
        setIsOpen(false);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  // Reset focus index when opening based on current selection
  useEffect(() => {
    if (isOpen) {
      const currentIndex = DURATION_OPTIONS.findIndex(opt => opt.hours === value);
      setFocusedIndex(currentIndex >= 0 ? currentIndex : 0);
    }
  }, [isOpen, value]);

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

      {/* Scrollable List */}
      <div 
        ref={listRef}
        className="max-h-[50vh] sm:max-h-[300px] overflow-y-auto custom-scrollbar p-2 relative z-10"
      >
        <div className="space-y-0.5">
          {DURATION_OPTIONS.map((opt, idx) => (
            <DurationOption 
              key={opt.hours}
              label={opt.label}
              isSelected={value === opt.hours}
              isFocused={focusedIndex === idx}
              onSelect={() => { onChange(opt.hours); setIsOpen(false); }}
            />
          ))}
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Trigger Button */}
      <button
        ref={refs.setReference}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 transition-all duration-200 outline-none rounded-lg text-xs font-mono
          ${selectedOption
            ? "bg-[#F5A623] text-black font-bold shadow-[0_0_15px_rgba(245,166,35,0.3)] border border-[#F5A623]" 
            : "bg-transparent text-gray-300 hover:text-white hover:bg-white/5 border border-transparent"
          }
          ${isOpen && !selectedOption ? "bg-white/10 text-white" : ""}
        `}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <span>⏱️</span>
          <span className="truncate">{selectedDisplay}</span>
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

function DurationOption({ 
  label, 
  isSelected,
  isFocused,
  onSelect 
}: { 
  label: string;
  isSelected: boolean;
  isFocused: boolean;
  onSelect: () => void 
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors text-left group
        ${isSelected 
          ? "bg-[#F5A623]/10 border-l-[3px] border-[#F5A623] pl-[9px]" 
          : "text-gray-300 hover:bg-[#F5A623]/[0.08] hover:text-white border-l-[3px] border-transparent"
        }
        ${isFocused && !isSelected ? "bg-[#F5A623]/[0.08] text-white" : ""}
      `}
    >
      <div className="flex items-center gap-2.5">
        <span className={isSelected ? "font-semibold text-white font-mono text-xs" : "font-medium font-mono text-xs"}>
          ⏱️ {label}
        </span>
      </div>
      
      <div className="flex items-center">
        {isSelected && <Check className="w-4 h-4 text-[#F5A623]" />}
      </div>
    </button>
  );
}
