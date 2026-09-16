"use client";

import React, { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0A0D0C] text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-3xl max-w-md w-full shadow-2xl">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
        <p className="text-xs text-gray-400 leading-relaxed mb-6">
          A temporary error occurred while rendering this page. You can try refreshing the view.
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="py-2.5 px-5 bg-[#F5A623] text-black font-bold text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-[#FFC873] transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
          <a
            href="/"
            className="py-2.5 px-5 bg-white/10 text-white font-semibold text-xs rounded-xl hover:bg-white/20 transition-all"
          >
            Return Home
          </a>
        </div>
      </div>
    </div>
  );
}
