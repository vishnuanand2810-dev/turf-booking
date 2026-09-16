import { create } from 'zustand';

interface TransitionState {
  clickPosition: { x: number; y: number } | null;
  isTransitioning: boolean;
  setTransitioning: (isTransitioning: boolean, pos?: { x: number; y: number }) => void;
}

export const useTransitionStore = create<TransitionState>((set) => ({
  clickPosition: null,
  isTransitioning: false,
  setTransitioning: (isTransitioning, pos) => set((state) => ({ 
    isTransitioning, 
    clickPosition: pos !== undefined ? pos : state.clickPosition 
  })),
}));
