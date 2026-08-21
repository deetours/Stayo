import { create } from 'zustand';

interface UIState {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  activeDrawer: string | null;
  drawerData: any | null;
  openDrawer: (id: string, data?: any) => void;
  closeDrawer: () => void;
  
  // Ephemeral state for drag/drop
  activeDragId: string | null;
  setActiveDragId: (id: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  
  activeDrawer: null,
  drawerData: null,
  openDrawer: (id, data) => set({ activeDrawer: id, drawerData: data }),
  closeDrawer: () => set({ activeDrawer: null, drawerData: null }),
  
  activeDragId: null,
  setActiveDragId: (id) => set({ activeDragId: id })
}));
