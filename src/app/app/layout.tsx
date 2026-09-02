'use client';

import React, { useState } from 'react';
import { Toaster } from 'sonner';
import { AppSidebar } from '@/components/shell/AppSidebar';
import { AppTopBar } from '@/components/shell/AppTopBar';
import { MobileBottomNav } from '@/components/shell/MobileBottomNav';
import { CommandPalette } from '@/components/shell/CommandPalette';
import { AskStayOPanel } from '@/components/shell/AskStayOPanel';
import { useUIStore } from '@/lib/store';
import { usePropertyStore } from '@/lib/property-store';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [cmdKOpen, setCmdKOpen] = useState(false);
  const askStayOOpen = useUIStore((s) => s.askStayOOpen);
  const setAskStayOOpen = useUIStore((s) => s.setAskStayOOpen);
  const hasHydrated = usePropertyStore((s) => s.hasHydrated);

  if (!hasHydrated) {
    return <div className="flex h-screen w-screen bg-background" />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground font-sans">
      {/* Collapsible Left Sidebar */}
      <AppSidebar />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Global Top Bar */}
        <AppTopBar
          onOpenCmdK={() => setCmdKOpen(true)}
          onOpenAskStayO={() => setAskStayOOpen(true)}
        />

        {/* Content Viewport */}
        {/* Reduced padding on mobile and added bottom padding to clear the MobileBottomNav */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8 bg-background">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Global Modals & Panels */}
      <CommandPalette open={cmdKOpen} onOpenChange={setCmdKOpen} />
      <AskStayOPanel open={askStayOOpen} onOpenChange={setAskStayOOpen} />
      <Toaster theme="dark" richColors position="bottom-right" />
    </div>
  );
}