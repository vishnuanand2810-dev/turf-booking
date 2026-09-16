"use client";

import React from "react";
import { useBookingStore } from "@/store/bookingStore";
import { Calendar as CalendarIcon } from "lucide-react";

const getLocalIsoDate = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function DateStrip() {
  const { selectedDate, setSelectedDate } = useBookingStore();

  // Generate next 14 days for selection
  const dateOptions = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const isoDate = getLocalIsoDate(d);

    const dayName = i === 0 ? "Today" : i === 1 ? "Tomorrow" : d.toLocaleDateString("en-US", { weekday: "short" });
    const fullDateFormatted = d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const dayNumber = d.getDate();
    const monthName = d.toLocaleDateString("en-US", { month: "short" });

    return { isoDate, dayName, fullDateFormatted, dayNumber, monthName, isToday: i === 0 };
  });

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <CalendarIcon className="w-4 h-4 text-[#F5A623]" />
        <h3 className="text-xs font-mono font-bold tracking-wider text-gray-300 uppercase">
          Select Match Date
        </h3>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
        {dateOptions.slice(0, 7).map((opt) => {
          const isSelected = selectedDate === opt.isoDate;
          return (
            <button
              key={opt.isoDate}
              type="button"
              onClick={() => setSelectedDate(opt.isoDate)}
              className={`p-3 rounded-2xl border text-center transition-all duration-200 flex flex-col items-center justify-center ${
                isSelected
                  ? "bg-[#F5A623]/15 border-[#F5A623] text-[#F5A623] shadow-[0_0_20px_rgba(245,166,35,0.2)] scale-[1.02]"
                  : "bg-[#121614] border-white/10 hover:border-white/20 text-gray-400 hover:text-white"
              }`}
            >
              <span className="text-[11px] font-medium tracking-tight">{opt.dayName}</span>
              <span className="text-lg font-mono font-bold text-white my-0.5">{opt.dayNumber}</span>
              <span className="text-[10px] text-gray-500 font-mono uppercase">{opt.monthName}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
