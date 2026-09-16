import React from "react";
import { motion } from "framer-motion";

export function FlowDivider() {
  return (
    <div className="relative h-[1px] w-full bg-white/5 overflow-hidden">
      <motion.div
        className="absolute top-0 left-0 h-full w-1/4"
        style={{
          background: "linear-gradient(90deg, transparent 0%, #F5A623 50%, transparent 100%)",
          opacity: 0.5,
        }}
        animate={{
          x: ["-100%", "400%"],
        }}
        transition={{
          duration: 3,
          ease: "linear",
          repeat: Infinity,
        }}
      />
    </div>
  );
}
