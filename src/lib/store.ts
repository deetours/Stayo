import { create } from 'zustand';

interface UIState {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Below md the persistent sidebar becomes a Sheet-based drawer — this is
  // that drawer's open state, separate from the desktop collapse toggle.
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;

  activeDrawer: string | null;
  drawerData: any | null;
  openDrawer: (id: string, data?: any) => void;
  closeDrawer: () => void;

  // Ephemeral state for drag/drop
  activeDragId: string | null;
  setActiveDragId: (id: string | null) => void;

  // Ask StayO panel — global so pages outside the layout (e.g. the
  // dashboard's AI recommendation card) can open it without prop-drilling
  // through AppLayout.
  askStayOOpen: boolean;
  setAskStayOOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  mobileSidebarOpen: false,
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),

  activeDrawer: null,
  drawerData: null,
  openDrawer: (id, data) => set({ activeDrawer: id, drawerData: data }),
  closeDrawer: () => set({ activeDrawer: null, drawerData: null }),

  activeDragId: null,
  setActiveDragId: (id) => set({ activeDragId: id }),

  askStayOOpen: false,
  setAskStayOOpen: (open) => set({ askStayOOpen: open }),
}));
