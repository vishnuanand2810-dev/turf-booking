import React from "react";
import { motion } from "framer-motion";

export function PremiumSpinner({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <div className={`relative rounded-full flex items-center justify-center p-[2px] overflow-hidden ${className}`}>
      {/* Rotating Conic Gradient */}
      <motion.div
        className="absolute inset-[-50%] w-[200%] h-[200%]"
        style={{
          background: "conic-gradient(from 0deg, transparent 0%, transparent 60%, #F5A623 100%)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1.2, ease: "linear", repeat: Infinity }}
      />
      {/* Inner Mask to create the ring effect */}
      <div className="absolute inset-1 bg-[#121614] rounded-full z-10" />
    </div>
  );
}
