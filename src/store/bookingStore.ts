import { create } from "zustand";

export type MatchDurationHours = 1 | 2 | 3 | 4 | 5;

export interface SelectedSlotHold {
  id: string;
  slotIds?: string[];
  startTime: string;
  endTime: string;
  price: number;
  durationHours?: MatchDurationHours;
  holdExpiresAt: number; // Epoch timestamp ms
}

export interface CouponData {
  code: string;
  discountPercent: number;
  label: string;
}

export interface GuestInfo {
  name: string;
  phone: string;
}

export interface BookingReceiptData {
  bookingRef: string;
  bookingId: string;
  groundName: string;
  date: string;
  slotTime: string;
  totalPaid: number;
  discount: number;
  recipientPhone?: string;
  whatsappSent: boolean;
}

interface BookingState {
  groundId: string | null;
  groundName: string | null;
  selectedDate: string; // ISO date format "YYYY-MM-DD"
  durationHours: MatchDurationHours;
  selected: SelectedSlotHold | null;
  bookingId: string | null;
  step: number; // 0: Select, 1: Guest Info, 2: Summary & Payment, 3: Confirmation
  guestInfo: GuestInfo;
  coupon: CouponData | null;
  receipt: BookingReceiptData | null;
  error: string | null;
  isHolding: boolean;

  // Actions
  setGround: (id: string, name: string) => void;
  setSelectedDate: (date: string) => void;
  setDurationHours: (duration: MatchDurationHours) => void;
  setSelectedSlot: (slot: SelectedSlotHold | null) => void;
  setBookingId: (bookingId: string | null) => void;
  setStep: (step: number) => void;
  setGuestInfo: (info: GuestInfo) => void;
  setCoupon: (coupon: CouponData | null) => void;
  setReceipt: (receipt: BookingReceiptData | null) => void;
  setError: (error: string | null) => void;
  setIsHolding: (isHolding: boolean) => void;
  reset: () => void;
}

const getTodayIsoDate = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const initialState = {
  groundId: null,
  groundName: null,
  selectedDate: getTodayIsoDate(),
  durationHours: 1 as MatchDurationHours,
  selected: null,
  bookingId: null,
  step: 0,
  guestInfo: { name: "", phone: "" },
  coupon: null,
  receipt: null,
  error: null,
  isHolding: false,
};

export const useBookingStore = create<BookingState>((set) => ({
  ...initialState,

  setGround: (id, name) => set({ groundId: id, groundName: name }),
  setSelectedDate: (date) => set({ selectedDate: date, selected: null, bookingId: null, step: 0 }),
  setDurationHours: (durationHours) => set({ durationHours, selected: null, bookingId: null, step: 0 }),
  setSelectedSlot: (slot) => set({ selected: slot }),
  setBookingId: (bookingId) => set({ bookingId }),
  setStep: (step) => set({ step }),
  setGuestInfo: (info) => set({ guestInfo: info }),
  setCoupon: (coupon) => set({ coupon }),
  setReceipt: (receipt) => set({ receipt }),
  setError: (error) => set({ error }),
  setIsHolding: (isHolding) => set({ isHolding }),
  reset: () => set({ ...initialState, selectedDate: getTodayIsoDate() }),
}));
