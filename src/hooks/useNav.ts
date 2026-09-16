"use client";

import { useRouter } from "next/navigation";
import { useBookingStore } from "@/store/bookingStore";
import { useTransitionStore } from "@/store/transitionStore";

export function useNav() {
  const router = useRouter();
  const resetBookingStore = useBookingStore((state: { reset: () => void }) => state.reset);
  const setTransitioning = useTransitionStore(state => state.setTransitioning);

  const triggerTransition = (href: string, e?: React.MouseEvent | MouseEvent) => {
    // If the browser prefers reduced motion, or it's a low end device, skip animation
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isLowEnd = navigator.hardwareConcurrency < 4;

    if (prefersReduced || isLowEnd) {
      router.push(href);
      return;
    }

    let pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    if (e && 'clientX' in e) {
      pos = { x: e.clientX, y: e.clientY };
    }

    setTransitioning(true, pos);
    
    // Expand takes 300ms, hold for 50ms, then push route.
    // The new page's template.tsx will handle the contract phase.
    setTimeout(() => {
      router.push(href);
    }, 350);
  };

  const pushAndReset = (href: string, e?: React.MouseEvent) => {
    resetBookingStore();
    triggerTransition(href, e);
  };

  const navigateToBooking = (groundId: string, e?: React.MouseEvent) => {
    resetBookingStore();
    triggerTransition(`/turfs/${groundId}`, e);
  };

  const navigateToHome = (e?: React.MouseEvent) => {
    resetBookingStore();
    triggerTransition("/", e);
  };

  const navigateToDashboard = (e?: React.MouseEvent) => {
    resetBookingStore();
    triggerTransition("/dashboard", e);
  };

  return {
    push: pushAndReset,
    navigateToBooking,
    navigateToHome,
    navigateToDashboard,
    back: () => router.back(),
  };
}
