"use client"

import { useEffect, useState } from "react"
import { Slot, SelectedSlot } from "@/types/booking"
import { cn, formatCurrency } from "@/lib/utils"
import { motion } from "framer-motion"
import { Clock } from "lucide-react"

interface SlotCardProps {
  slot: Slot;
  selectedData?: SelectedSlot;
  onToggle: (slot: Slot) => void;
}

export function SlotCard({ slot, selectedData, onToggle }: SlotCardProps) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!selectedData) {
      setTimeLeft(null);
      return;
    }
    
    const interval = setInterval(() => {
      const remaining = selectedData.holdExpiresAt - Date.now();
      if (remaining <= 0) {
        clearInterval(interval);
        setTimeLeft(0);
      } else {
        setTimeLeft(Math.floor(remaining / 1000));
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [selectedData]);

  const isSelected = !!selectedData;
  const isHeldByOther = slot.status === "held" && !isSelected;
  const isBooked = slot.status === "booked";
  const disabled = isBooked || isHeldByOther;

  return (
    <motion.button
      whileTap={!disabled ? { scale: 0.95 } : undefined}
      onClick={() => { if (!disabled) onToggle(slot) }}
      disabled={disabled}
      className={cn(
        "relative flex flex-col p-4 rounded-xl border text-left transition-all duration-300 overflow-hidden group min-h-[100px]",
        isSelected && "bg-primary/20 border-primary shadow-[0_0_20px_rgba(0,230,118,0.2)]",
        !isSelected && slot.status === "available" && "bg-white/5 border-white/10 hover:border-primary/50 hover:bg-white/10",
        disabled && "bg-white/5 border-white/5 opacity-50 cursor-not-allowed"
      )}
    >
      <div className="flex justify-between items-start mb-2 w-full">
        <span className={cn(
          "font-bold text-lg",
          isSelected ? "text-primary" : "text-white"
        )}>{slot.startTime}</span>
        <span className="text-xs font-medium text-white/50">{slot.endTime}</span>
      </div>
      
      <div className="flex justify-between items-end mt-auto w-full">
        <span className={cn(
          "font-medium",
          isSelected ? "text-white" : "text-white/70"
        )}>
          {formatCurrency(slot.price)}
        </span>
        
        {isSelected && timeLeft !== null && (
          <span className="text-xs font-bold text-primary flex items-center bg-primary/10 px-2 py-1 rounded">
            <Clock className="w-3 h-3 mr-1" />
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </span>
        )}
        
        {isBooked && <span className="text-xs font-bold text-red-400">Booked</span>}
        {isHeldByOther && <span className="text-xs font-bold text-yellow-500">Held</span>}
      </div>
    </motion.button>
  )
}
