"use client";

import React, { useEffect, Suspense } from 'react';
import { useTransitionStore } from '@/store/transitionStore';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useSearchParams } from 'next/navigation';

function LiquidTransitionOverlayContent() {
  const { isTransitioning, clickPosition, setTransitioning } = useTransitionStore();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isTransitioning) {
      // The page has changed, trigger the contract animation
      const timer = setTimeout(() => {
        setTransitioning(false);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams, isTransitioning, setTransitioning]);

  return (
    <AnimatePresence>
      {isTransitioning && clickPosition && (
        <motion.div
          key="liquid-overlay"
          initial={{ 
            clipPath: `circle(0px at ${clickPosition.x}px ${clickPosition.y}px)` 
          }}
          animate={{ 
            clipPath: `circle(150vw at ${clickPosition.x}px ${clickPosition.y}px)` 
          }}
          exit={{ 
            clipPath: `circle(0px at ${clickPosition.x}px ${clickPosition.y}px)` 
          }}
          transition={{ 
            duration: 0.35,
            ease: [0.7, 0, 0.3, 1] 
          }}
          className="fixed inset-0 z-[100] bg-[#0A0D0C]"
          style={{ filter: 'url(#goo)' }} // Goo filter adds the liquid edge effect to the circle
        />
      )}
    </AnimatePresence>
  );
}

export function LiquidTransitionOverlay() {
  return (
    <Suspense fallback={null}>
      <LiquidTransitionOverlayContent />
    </Suspense>
  );
}
