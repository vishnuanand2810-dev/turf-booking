"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import React from "react";

interface MotionWrapperProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
}

export function MotionWrapper({
  children,
  initial = { opacity: 0, y: 20 },
  whileInView = { opacity: 1, y: 0 },
  transition = { duration: 0.5, ease: "easeOut" },
  viewport = { once: true, margin: "-50px" },
  className = "",
  ...props
}: MotionWrapperProps) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={initial}
      animate={whileInView}
      transition={transition}
      viewport={viewport}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
