"use client";

import React, { useRef, useEffect } from "react";
import { useReducedMotion, useInView } from "framer-motion";

interface VideoBackgroundProps {
  src: string;
  poster?: string;
}

export function VideoBackground({ src, poster = "/videos/heroPosterJpg.jpg" }: VideoBackgroundProps) {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Pause when scrolled out of view to save GPU/battery
  const isInView = useInView(containerRef, { margin: "100px 0px 100px 0px" });

  useEffect(() => {
    if (!videoRef.current || prefersReducedMotion) return;

    if (isInView) {
      // Small timeout to ensure video is ready and avoid DOMException
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log("Autoplay prevented:", error);
        });
      }
    } else {
      videoRef.current.pause();
    }
  }, [isInView, prefersReducedMotion]);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
      {/* Dark gradient overlay to ensure text remains readable: linear-gradient from rgba(10,13,12,0.85) at the bottom to rgba(10,13,12,0.4) at the top */}
      <div 
        className="absolute inset-0 z-10" 
        style={{ background: "linear-gradient(to top, rgba(10,13,12,0.85) 0%, rgba(10,13,12,0.4) 100%)" }}
      />
      
      {prefersReducedMotion ? (
        <img
          src={poster}
          alt="Hero Background Poster"
          className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto object-cover -translate-x-1/2 -translate-y-1/2"
        />
      ) : (
        <video
          ref={videoRef}
          loop
          muted
          playsInline
          preload="none"
          poster={poster}
          className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto object-cover -translate-x-1/2 -translate-y-1/2"
        >
          <source src={src} type="video/mp4" />
          <source src={src.replace('.mp4', '.webm')} type="video/webm" />
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
}