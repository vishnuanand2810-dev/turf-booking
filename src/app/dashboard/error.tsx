"use client";

import React, { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard Error caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0A0D0C] text-white">
      <Navbar />
      <div className="max-w-xl mx-auto py-20 px-4 text-center">
        <div className="p-6 bg-[#121614] border border-red-500/30 rounded-3xl shadow-2xl">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-white mb-2">Dashboard Reload</h2>
          <p className="text-xs text-gray-400 mb-6">
            Unable to load player match history right now.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => reset()}
              className="py-2.5 px-5 bg-[#F5A623] text-black font-bold text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-[#FFC873] transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
