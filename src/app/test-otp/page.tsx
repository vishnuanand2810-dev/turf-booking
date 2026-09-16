"use client";

import React, { useState } from 'react';
import { OTPInput } from '@/components/OTPInput';

export default function TestOTPPage() {
  const [otp, setOtp] = useState('');
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');

  const handleComplete = (val: string) => {
    setStatus('verifying');
    // Simulate verification
    setTimeout(() => {
      if (val === '123456') {
        setStatus('success');
      } else {
        setStatus('error');
        // Reset back to idle after error animation (0.4s + buffer)
        setTimeout(() => setStatus('idle'), 600);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#0A0D0C] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full p-8 bg-[#121614] border border-white/10 rounded-3xl shadow-2xl space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-2">Isolated OTP Review</h2>
          <p className="text-xs text-gray-400">
            Type <strong>123456</strong> for success flash.<br/>
            Type anything else for error shake.
          </p>
        </div>

        <OTPInput 
          value={otp} 
          onChange={setOtp} 
          onComplete={handleComplete}
          status={status}
          onResend={() => console.log("Resend requested")}
        />
        
        <div className="text-center pt-4 border-t border-white/10">
           <button 
             onClick={() => { setOtp(''); setStatus('idle'); }}
             className="text-xs text-[#F5A623] hover:underline"
           >
             Reset Component State
           </button>
        </div>
      </div>
    </div>
  );
}
