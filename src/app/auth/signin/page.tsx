"use client";

import React, { Suspense } from "react";
import { AuthModal } from "@/components/AuthModal";
import { useNav } from "@/hooks/useNav";
import { Loader2 } from "lucide-react";

function SignInContent() {
  const nav = useNav();
  return (
    <div className="min-h-screen bg-[#0A0D0C]">
      <AuthModal isOpen={true} onClose={() => nav.navigateToHome()} mode="signin" />
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0A0D0C]">
        <Loader2 className="w-6 h-6 animate-spin text-[#F5A623]" />
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
