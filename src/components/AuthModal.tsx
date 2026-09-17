"use client";

import React, { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { OTPInput } from "@/components/OTPInput";
import { ArrowRight, Check, Loader2, X, ShieldCheck } from "lucide-react";
import { useNav } from "@/hooks/useNav";
import { useSearchParams, useRouter } from "next/navigation";
import { AutoDismissBanner } from "./AutoDismissBanner";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: "signin" | "verify";
}

function AuthModalContent({ isOpen, onClose, mode = "signin" }: AuthModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nav = useNav();
  const callbackUrl = searchParams?.get("callbackUrl") || "/dashboard";

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [step, setStep] = useState<"phone" | "otp" | "name">("phone");
  const [otpStatus, setOtpStatus] = useState<"idle" | "verifying" | "success" | "error">("idle");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPhoneValid = phone.length === 10;
  const isNameValid = name.trim().length > 1;

  useEffect(() => {
    if (isOpen) {
      setPhone("");
      setOtp("");
      setName("");
      setStep("phone");
      setOtpStatus("idle");
      setError(null);
      setIsSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPhoneValid) {
      setStep("otp");
      setError(null);
    }
  };

  const handleOtpComplete = async (code: string) => {
    setOtp(code);
    setOtpStatus("verifying");
    setError(null);
    
    if (mode === "verify") {
      setIsSubmitLoading(true);
      try {
        const verifyRes = await fetch("/api/user/verify-phone", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, otp: code }),
        });
        const data = await verifyRes.json();
        
        setIsSubmitLoading(false);
        if (verifyRes.ok) {
          setOtpStatus("success");
          setTimeout(() => {
            if (data.linkedCount > 0) {
              window.location.href = `/dashboard?linked=${data.linkedCount}`;
            } else {
              window.location.reload();
            }
          }, 500);
        } else {
          setOtpStatus("error");
          setError(data.message || "Failed to verify phone.");
          setTimeout(() => setOtpStatus("idle"), 500);
        }
      } catch (err) {
        setIsSubmitLoading(false);
        setOtpStatus("error");
        setError("Network error occurred.");
        setTimeout(() => setOtpStatus("idle"), 500);
      }
      return;
    }

    // signin mode
    setTimeout(() => {
      // Basic mock check, replace with real logic if needed
      if (code === "123456" || process.env.NODE_ENV !== "production") {
        setOtpStatus("success");
        setTimeout(() => {
          setStep("name");
        }, 300);
      } else {
        setOtpStatus("error");
        setTimeout(() => setOtpStatus("idle"), 500);
      }
    }, 400);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isNameValid) return;
    setIsSubmitLoading(true);
    setError(null);

    try {
      const res = await signIn("mobile-otp", {
        phone,
        name: name.trim(),
        otp: otp || "123456",
        redirect: false,
      });

      if (res?.error) {
        setError("Sign in failed. Please try again.");
        setIsSubmitLoading(false);
      } else {
        setIsSuccess(true);
        // Handle auto-linking on successful sign in
        try {
          const linkRes = await fetch("/api/user/link-bookings", { method: "POST" });
          const data = await linkRes.json();
          setTimeout(() => {
            if (data.linkedCount > 0) {
              window.location.href = `/dashboard?linked=${data.linkedCount}`;
            } else {
              window.location.href = callbackUrl || "/dashboard";
            }
          }, 300);
        } catch (err) {
          setTimeout(() => {
            window.location.href = callbackUrl || "/dashboard";
          }, 300);
        }
      }
    } catch (err) {
      console.error("Sign in submission error:", err);
      setError("An unexpected error occurred. Please try again.");
      setIsSubmitLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setIsGoogleLoading(true);
    signIn("google", { callbackUrl });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="relative z-10 w-full max-w-[420px] rounded-3xl p-8 isolate"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Crystal Glass Layers */}
        <div 
          className="absolute inset-0 bg-[#0A0D0C]/90 -z-20 rounded-3xl"
          style={{ backdropFilter: 'blur(24px) saturate(160%)', WebkitBackdropFilter: 'blur(24px) saturate(160%)' }}
        />
        <div className="absolute inset-0 pointer-events-none -z-10 rounded-3xl overflow-hidden" style={{
          background: `
            linear-gradient(to bottom, rgba(255,255,255,0.12) 0px, transparent 2px),
            radial-gradient(100px circle at 0% 100%, rgba(245,166,35,0.08), transparent),
            radial-gradient(100px circle at 100% 0%, rgba(245,166,35,0.08), transparent)
          `
        }} />
        <div 
          className="absolute inset-0 rounded-3xl pointer-events-none -z-10" 
          style={{ 
            padding: '1px', 
            background: 'linear-gradient(to bottom right, rgba(255,255,255,0.25), rgba(255,255,255,0.05))',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude' 
          }} 
        />

        <div className="text-center mb-8">
          {mode === "verify" ? (
            <div className="flex flex-col items-center gap-3">
              <div className="p-2.5 bg-[#F5A623]/10 border border-[#F5A623]/30 rounded-xl text-[#F5A623]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white">Verify Phone Number</h1>
              <p className="text-xs text-gray-400 mt-1">Secure your bookings and claim guest matches</p>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-1">
                PITCH<span className="text-[#F5A623]">PRO</span>
              </h1>
              <p className="text-xs text-gray-400 mt-2">Sign in to manage your bookings</p>
            </>
          )}
        </div>

        {mode === "signin" && (
          <>
            {/* Google Sign In */}
            <motion.button
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white text-black font-medium text-sm rounded-xl transition-shadow duration-200 hover:shadow-[0_0_20px_rgba(245,166,35,0.25)] relative"
            >
              {isGoogleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  Continue with Google
                </>
              )}
            </motion.button>

            {/* OR Divider */}
            <div className="flex items-center justify-center my-8">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/15" />
              <span className="px-3 text-xs text-gray-500 font-medium lowercase">or</span>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/15" />
            </div>
          </>
        )}

        {error && (
          <div className="mb-4 text-xs text-red-400 text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">
            {error}
          </div>
        )}

        <div className="space-y-5">
          {/* Phone Input */}
          {(step === "phone" || step === "otp" || step === "name") && (
            <form onSubmit={handlePhoneSubmit}>
              <label className="block text-[11px] text-gray-400 mb-1.5 font-medium ml-1">Phone Number</label>
              <div className="relative flex items-center group">
                <div className={`absolute left-0 top-0 bottom-0 flex items-center justify-center px-4 rounded-l-xl border-r border-white/5 text-gray-400 font-mono text-sm transition-colors duration-200 ${step === 'phone' ? 'group-focus-within:border-[#F5A623]/30 group-focus-within:text-[#F5A623]' : ''}`}>
                  +91
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                    setError(null);
                  }}
                  disabled={step !== "phone"}
                  className={`w-full pl-16 pr-4 py-3.5 bg-white/[0.03] border border-white/10 rounded-xl text-sm font-mono text-white transition-all duration-200 outline-none
                    ${step === 'phone' ? 'focus:border-[#F5A623]/50 focus:shadow-[0_0_0_3px_rgba(245,166,35,0.12)]' : 'opacity-70'}
                  `}
                  placeholder="98765 43210"
                />
              </div>

              <AnimatePresence>
                {step === "phone" && isPhoneValid && (
                  <motion.button
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    type="submit"
                    className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-sm rounded-xl transition-all flex items-center justify-center gap-2 overflow-hidden"
                  >
                    Send OTP <ArrowRight className="w-4 h-4" />
                  </motion.button>
                )}
              </AnimatePresence>
            </form>
          )}

          {/* OTP Input */}
          <AnimatePresence>
            {(step === "otp" || step === "name") && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="pt-2"
              >
                {step === "otp" ? (
                  <OTPInput
                    value={otp}
                    onChange={setOtp}
                    onComplete={handleOtpComplete}
                    status={otpStatus}
                    onResend={() => console.log("Resend requested")}
                  />
                ) : (
                  <div className="flex items-center gap-2 px-4 py-3 bg-[#F5A623]/10 border border-[#F5A623]/30 rounded-xl">
                    <Check className="w-4 h-4 text-[#F5A623]" />
                    <span className="text-xs text-[#F5A623] font-medium">Mobile number verified</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Name Field & Submit */}
          <AnimatePresence>
            {step === "name" && (
              <motion.form
                initial={{ opacity: 0, y: -20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                transition={{ duration: 0.3 }}
                onSubmit={handleFinalSubmit}
                className="pt-4 space-y-5"
              >
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1.5 font-medium ml-1">Your Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3.5 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white transition-all duration-200 outline-none focus:border-[#F5A623]/50 focus:shadow-[0_0_0_3px_rgba(245,166,35,0.12)]"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={!isNameValid || isSubmitLoading || isSuccess}
                  className="w-full h-[52px] bg-[#F5A623] text-[#040A06] font-bold text-sm rounded-xl transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#FFC873] shadow-[0_0_20px_rgba(245,166,35,0.2)]"
                >
                  {isSubmitLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : isSuccess ? (
                    <motion.div
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-2"
                    >
                      <Check className="w-5 h-5" />
                      <span>Welcome!</span>
                    </motion.div>
                  ) : (
                    <span>Sign in with Mobile OTP</span>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {mode === "signin" && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={(e) => {
              onClose();
              nav.navigateToHome(e);
            }}
            className="mt-8 text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1 group mx-auto"
          >
            Continue as guest instead 
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}

export function AuthModal(props: AuthModalProps) {
  return (
    <Suspense fallback={null}>
      <AuthModalContent {...props} />
    </Suspense>
  );
}
