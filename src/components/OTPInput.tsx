"use client";

import React, { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete: (value: string) => void;
  status: 'idle' | 'verifying' | 'success' | 'error';
  onResend: () => void;
  initialCooldown?: number;
}

export function OTPInput({
  value,
  onChange,
  onComplete,
  status,
  onResend,
  initialCooldown = 30,
}: OTPInputProps) {
  const [cooldown, setCooldown] = useState(initialCooldown);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const containerControls = useAnimation();
  const boxControls = useAnimation();

  // Handle countdown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Handle error shake and success cascade
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const animateError = async () => {
      if (!prefersReducedMotion) {
        await containerControls.start({
          x: [-6, 6, -6, 6, -6, 6, 0],
          transition: { duration: 0.4 },
        });
      }
      onChange('');
      if (inputRefs.current[0]) inputRefs.current[0].focus();
    };

    if (status === 'error') {
      animateError();
    } else if (status === 'success' && !prefersReducedMotion) {
      boxControls.start((i) => ({
        backgroundColor: "rgba(245,166,35,0.4)",
        boxShadow: "0 0 15px rgba(245,166,35,0.8)",
        transition: { delay: i * 0.04, duration: 0.2, repeat: 1, repeatType: "reverse" as const },
      }));
    }
  }, [status, containerControls, boxControls, onChange]);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const digit = e.target.value.replace(/\D/g, '').slice(-1);
    if (!digit && e.target.value !== '') return;

    const newOtp = value.split('');
    newOtp[index] = digit;
    const combined = newOtp.join('');
    onChange(combined);

    // Pulse animation
    if (digit) {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!prefersReducedMotion) {
        const el = inputRefs.current[index];
        if (el) {
          el.animate([
            { transform: 'scale(1)' },
            { transform: 'scale(1.15)' },
            { transform: 'scale(1)' }
          ], { duration: 120, easing: 'ease-out' });
        }
      }

      // Auto-advance
      if (index < 5 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1]?.focus();
      }
    }

    if (combined.length === 6 && !combined.includes(' ') && digit) {
      onComplete(combined);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      // Focus previous and clear
      const newOtp = value.split('');
      newOtp[index - 1] = '';
      onChange(newOtp.join(''));
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData) {
      onChange(pastedData);
      if (pastedData.length === 6) {
        inputRefs.current[5]?.focus();
        onComplete(pastedData);
      } else {
        inputRefs.current[pastedData.length]?.focus();
      }
    }
  };

  return (
    <div className="w-full space-y-3">
      <motion.div 
        animate={containerControls}
        className="flex items-center justify-between gap-2"
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.input
            key={i}
            custom={i}
            animate={boxControls}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            maxLength={1}
            value={value[i] || ''}
            onChange={(e) => handleChange(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            disabled={status === 'verifying' || status === 'success'}
            className={`w-12 h-14 text-center text-xl font-mono font-bold rounded-xl transition-colors duration-200 focus:outline-none
              ${status === 'error' 
                ? 'bg-red-500/15 border-red-500/50 text-red-400' 
                : 'bg-white/[0.03] border-white/10 text-white focus:border-[#F5A623] focus:shadow-[0_0_0_3px_rgba(245,166,35,0.12)]'
              }
              border
            `}
            style={{
              // Fallback transition for the error state if reduced motion
              transition: 'background-color 0.3s, border-color 0.2s, box-shadow 0.2s'
            }}
          />
        ))}
      </motion.div>

      <div className="flex justify-between items-center text-xs">
        {status === 'error' ? (
          <span className="text-red-400">Incorrect OTP. Please try again.</span>
        ) : (
          <span className="text-gray-400">Enter the 6-digit code</span>
        )}
        
        {cooldown > 0 ? (
          <span className="text-gray-500 font-mono">
            Resend in 0:{String(cooldown).padStart(2, '0')}
          </span>
        ) : (
          <button
            type="button"
            onClick={() => {
              setCooldown(30);
              onChange('');
              onResend();
              inputRefs.current[0]?.focus();
            }}
            className="text-[#F5A623] hover:text-[#FFC873] transition-colors"
          >
            Resend OTP
          </button>
        )}
      </div>
    </div>
  );
}
