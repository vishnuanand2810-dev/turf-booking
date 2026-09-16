"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { X, CheckCircle2, AlertCircle } from "lucide-react";

interface AutoDismissBannerProps {
  message: React.ReactNode;
  type?: "success" | "error" | "warning";
  onDismiss: () => void;
  autoDismissSeconds?: number;
  className?: string;
}

export function AutoDismissBanner({
  message,
  type = "success",
  onDismiss,
  autoDismissSeconds = 10,
  className = "",
}: AutoDismissBannerProps) {
  const [isHovered, setIsHovered] = useState(false);
  const progressRef = useRef(100);
  const [progress, setProgress] = useState(100);
  const lastTimeRef = useRef(performance.now());
  const rafRef = useRef<number>();

  useEffect(() => {
    lastTimeRef.current = performance.now();

    const tick = (time: number) => {
      const delta = time - lastTimeRef.current;
      lastTimeRef.current = time;

      if (!isHovered) {
        progressRef.current -= (delta / (autoDismissSeconds * 1000)) * 100;
        
        if (progressRef.current <= 0) {
          progressRef.current = 0;
          onDismiss();
        }
        setProgress(progressRef.current);
      }

      if (progressRef.current > 0) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isHovered, autoDismissSeconds, onDismiss]);

  const Icon = type === "error" ? AlertCircle : type === "warning" ? AlertCircle : CheckCircle2;
  
  const colors = {
    success: { container: "bg-[#F5A623]/10 border-[#F5A623]/30 text-[#F5A623]", progress: "bg-[#F5A623]/50" },
    error: { container: "bg-red-500/10 border-red-500/30 text-red-400", progress: "bg-red-500/50" },
    warning: { container: "bg-amber-500/10 border-amber-500/30 text-amber-300", progress: "bg-amber-500/50" },
  };

  const currentColors = colors[type];

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`overflow-hidden ${className}`}
    >
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
        className={`relative p-3.5 sm:p-4 border rounded-xl flex items-start sm:items-center gap-3 overflow-hidden ${currentColors.container}`}
        role="region"
        aria-live="polite"
      >
        <Icon className="w-5 h-5 shrink-0 mt-0.5 sm:mt-0" />
        <div className="flex-1 text-xs font-mono pr-2">{message}</div>
        <button
          onClick={onDismiss}
          className="p-1 hover:bg-white/10 rounded-lg transition-colors shrink-0"
          aria-label="Dismiss message"
        >
          <X className="w-4 h-4" />
        </button>
        
        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-transparent">
          <div
            className={`h-full ${currentColors.progress}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </motion.div>
  );
}
