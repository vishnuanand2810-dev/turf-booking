export type SlotStatus = "available" | "booked" | "pending" | "held";

export interface Slot {
  id: string;
  date: string; // ISO date, e.g. "2026-07-23"
  startTime: string; // "18:00"
  endTime: string; // "19:00"
  price: number; // in rupees
  status: SlotStatus;
  heldBy?: string; // socket id of the user currently holding this slot
}

export interface DateOption {
  date: string; // ISO date
  label: string; // "Mon"
  dayNumber: number; // 23
  isToday: boolean;
}

export interface SelectedSlot extends Slot {
  holdExpiresAt: number; // epoch ms
}

export interface Coupon {
  code: string;
  discountPercent: number;
  label: string;
}

export interface BookingReceipt {
  bookingRef: string;
  turfName: string;
  date: string;
  slots: SelectedSlot[];
  subtotal: number;
  discount: number;
  total: number;
  coupon?: Coupon;
}

// Socket.io event payloads
export interface SlotUpdatePayload {
  slotId: string;
  status: SlotStatus;
  heldBy?: string;
}

export interface ServerToClientEvents {
  "slot:update": (payload: SlotUpdatePayload) => void;
  "slots:sync": (slots: Slot[]) => void;
}

export interface ClientToServerEvents {
  "slot:hold": (slotId: string) => void;
  "slot:release": (slotId: string) => void;
  "slots:subscribe": (turfId: string, date: string) => void;
}
