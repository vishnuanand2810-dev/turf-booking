"use client";

import React, { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

export function InteractiveMeshBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Use a smaller internal resolution to save fill-rate on mobile/large screens
    const scale = window.devicePixelRatio > 1 ? 1 : 0.5;
    let width = canvas.width = window.innerWidth * scale;
    let height = canvas.height = window.innerHeight * scale;
    
    // Scale canvas back up via CSS
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    const handleResize = () => {
      width = canvas.width = window.innerWidth * scale;
      height = canvas.height = window.innerHeight * scale;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };
    window.addEventListener("resize", handleResize);

    const blobs = [
      { x: width * 0.2, y: height * 0.2, r: 400 * scale, color: "rgba(57, 255, 136, 0.15)", vx: 0.5 * scale, vy: 0.3 * scale, tx: 0, ty: 0 }, // Accent Green
      { x: width * 0.8, y: height * 0.3, r: 500 * scale, color: "rgba(13, 148, 136, 0.15)", vx: -0.4 * scale, vy: 0.5 * scale, tx: 0, ty: 0 }, // Teal
      { x: width * 0.5, y: height * 0.8, r: 450 * scale, color: "rgba(245, 158, 11, 0.1)", vx: 0.3 * scale, vy: -0.4 * scale, tx: 0, ty: 0 }, // Amber
    ];

    let mouseX = width / 2;
    let mouseY = height / 2;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX * scale;
      mouseY = e.clientY * scale;
    };
    window.addEventListener("mousemove", handleMouseMove);

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Spring physics params (Damped spring approximation)
      const stiffness = 0.05; 
      const damping = 0.8; 
      const maxDisplacement = 80 * scale;

      blobs.forEach((blob) => {
        // Base roaming movement
        blob.x += blob.vx;
        blob.y += blob.vy;

        // Bounce off walls
        if (blob.x <= -blob.r || blob.x >= width + blob.r) blob.vx *= -1;
        if (blob.y <= -blob.r || blob.y >= height + blob.r) blob.vy *= -1;

        // Magnetic attraction to mouse
        const dx = mouseX - blob.x;
        const dy = mouseY - blob.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const effectRadius = 500 * scale;

        // Target displacement
        let targetTx = 0;
        let targetTy = 0;
        if (dist < effectRadius && dist > 0) {
          const pull = (effectRadius - dist) / effectRadius; // 0 to 1
          targetTx = (dx / dist) * maxDisplacement * pull;
          targetTy = (dy / dist) * maxDisplacement * pull;
        }

        // Spring physics for displacement
        const ax = (targetTx - blob.tx) * stiffness;
        const ay = (targetTy - blob.ty) * stiffness;
        
        blob.tx += ax;
        blob.ty += ay;
        blob.tx *= damping;
        blob.ty *= damping;

        // Draw blob with radial gradient
        ctx.beginPath();
        const drawX = blob.x + blob.tx;
        const drawY = blob.y + blob.ty;
        
        const gradient = ctx.createRadialGradient(
          drawX, drawY, 0,
          drawX, drawY, blob.r
        );
        gradient.addColorStop(0, blob.color);
        gradient.addColorStop(1, "transparent");
        
        ctx.fillStyle = gradient;
        ctx.arc(drawX, drawY, blob.r, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle at 20% 20%, rgba(57, 255, 136, 0.1) 0%, transparent 40%), radial-gradient(circle at 80% 30%, rgba(13, 148, 136, 0.1) 0%, transparent 50%), radial-gradient(circle at 50% 80%, rgba(245, 158, 11, 0.05) 0%, transparent 50%)"
        }}
      />
    );
  }

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 pointer-events-none z-0 mix-blend-screen"
      style={{ filter: "blur(60px)" }} // Extra smooth blending for the blobs
    />
  );
}
