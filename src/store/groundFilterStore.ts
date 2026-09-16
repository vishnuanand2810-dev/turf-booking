import { create } from "zustand";
import { persist } from "zustand/middleware";

interface GroundFilterState {
  cityFilter: string;
  search: string;
  setCityFilter: (city: string) => void;
  setSearch: (search: string) => void;
  resetFilters: () => void;
}

export const useGroundFilterStore = create<GroundFilterState>()(
  persist(
    (set) => ({
      cityFilter: "All",
      search: "",
      setCityFilter: (city) => set({ cityFilter: city }),
      setSearch: (search) => set({ search }),
      resetFilters: () => set({ cityFilter: "All", search: "" }),
    }),
    {
      name: "pitchpro-ground-filter-storage",
      partialize: (state) => ({ cityFilter: state.cityFilter }), // Only persist cityFilter to localStorage
    }
  )
);
