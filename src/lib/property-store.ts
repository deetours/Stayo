'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PropertyId = 'off-the-trail' | 'pine-peaks' | 'wildflower-valley';

interface PropertyState {
  activePropertyId: PropertyId;
  setActiveProperty: (id: PropertyId) => void;
  hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
}

export const usePropertyStore = create<PropertyState>()(
  persist(
    (set) => ({
      activePropertyId: 'off-the-trail',
      setActiveProperty: (id) => set({ activePropertyId: id }),
      hasHydrated: false,
      setHasHydrated: (v) => set({ hasHydrated: v }),
    }),
    {
      name: 'stayo-active-property',
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    }
  )
);
