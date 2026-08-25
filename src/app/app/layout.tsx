'use client';

import React, { useState } from 'react';
import { AppSidebar } from '@/components/shell/AppSidebar';
import { AppTopBar } from '@/components/shell/AppTopBar';
import { CommandPalette } from '@/components/shell/CommandPalette';
import { AskStayOPanel } from '@/components/shell/AskStayOPanel';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [cmdKOpen, setCmdKOpen] = useState(false);
  const [askStayOOpen, setAskStayOOpen] = useState(false);

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
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-background">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Global Modals & Panels */}
      <CommandPalette open={cmdKOpen} onOpenChange={setCmdKOpen} />
      <AskStayOPanel open={askStayOOpen} onOpenChange={setAskStayOOpen} />
    </div>
  );
}