'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Bell,
  Sparkles,
  ChevronDown,
  Building2,
  Check,
  Bot,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { hasDevSession, hasPreviewSession } from '@/lib/session';

interface AppTopBarProps {
  onOpenCmdK: () => void;
  onOpenAskStayO: () => void;
}

const mockProperties = [
  { id: 'p1', name: 'Off The Trail — Dalhousie', type: 'Boutique Resort', rooms: 24, active: true },
  { id: 'p2', name: 'Pine & Peaks Homestay', type: 'Homestay', rooms: 6, active: false },
  { id: 'p3', name: 'Wildflower Valley Cabin', type: 'Cabin Villa', rooms: 4, active: false },
];

export function AppTopBar({ onOpenCmdK, onOpenAskStayO }: AppTopBarProps) {
  const [propertyOpen, setPropertyOpen] = useState(false);
  const [activeProperty, setActiveProperty] = useState(mockProperties[0]);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isPreviewOnly, setIsPreviewOnly] = useState(false);

  useEffect(() => {
    setIsPreviewOnly(hasPreviewSession() && !hasDevSession());
  }, []);

  const handleSelectProperty = (prop: typeof mockProperties[0]) => {
    setActiveProperty(prop);
    setPropertyOpen(false);
    setBannerMessage(`You are now viewing ${prop.name}`);
  };

  useEffect(() => {
    if (bannerMessage) {
      const t = setTimeout(() => setBannerMessage(null), 4000);
      return () => clearTimeout(t);
    }
  }, [bannerMessage]);

  return (
    <>
      {isPreviewOnly && (
        <div className="bg-accent/15 border-b border-accent/30 text-accent px-4 py-1.5 flex items-center justify-center gap-2 text-center text-body-sm font-medium shrink-0">
          <span>You&apos;re viewing a live preview — sign up to save your property&apos;s data.</span>
          <Link href="/register" className="underline hover:no-underline font-semibold">
            Register
          </Link>
        </div>
      )}
      <header className="h-14 bg-surface border-b border-border px-4 flex items-center justify-between shrink-0 z-20">
        {/* Left: Property Switcher */}
        <div className="relative">
          <button
            onClick={() => setPropertyOpen(!propertyOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-surface-2 border border-border hover:border-muted-foreground/40 text-foreground transition-all cursor-pointer group"
          >
            <div className="w-5 h-5 rounded-sm bg-accent/20 text-accent flex items-center justify-center text-[10px] font-bold">
              <Building2 className="w-3.5 h-3.5" />
            </div>
            <div className="text-left leading-none">
              <span className="font-semibold text-body-sm block text-foreground truncate max-w-[160px] md:max-w-[200px]">
                {activeProperty.name}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors ml-0.5" />
          </button>

          {/* Property Dropdown */}
          <AnimatePresence>
            {propertyOpen && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="absolute top-full left-0 mt-1.5 w-64 bg-surface border border-border rounded-md shadow-[var(--shadow-e2)] p-1 z-50"
              >
                <div className="px-2.5 py-1.5 text-caption uppercase tracking-wider text-muted-foreground font-semibold border-b border-border">
                  Select Property Context
                </div>
                <div className="py-1 space-y-0.5">
                  {mockProperties.map((prop) => (
                    <button
                      key={prop.id}
                      onClick={() => handleSelectProperty(prop)}
                      className="w-full flex items-center justify-between p-2 rounded-sm text-left hover:bg-surface-2 transition-colors cursor-pointer"
                    >
                      <div>
                        <div className="font-medium text-body-sm text-foreground">{prop.name}</div>
                        <div className="text-caption text-muted-foreground font-mono">
                          {prop.type} • {prop.rooms} Rooms
                        </div>
                      </div>
                      {prop.id === activeProperty.id && (
                        <Check className="w-4 h-4 text-accent" />
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Center: Global Search Bar Trigger (Cmd+K) */}
        <button
          onClick={onOpenCmdK}
          className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-md bg-surface-2 border border-border hover:border-muted-foreground/40 text-muted-foreground text-body-sm transition-all w-80 cursor-pointer"
        >
          <Search className="w-4 h-4 text-muted-foreground" />
          <span className="flex-1 text-left">Search guests, rooms, bookings...</span>
          <span className="font-mono text-caption px-1.5 py-0.5 rounded-sm bg-surface border border-border">
            ⌘K
          </span>
        </button>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2.5">
          {/* Agent Activity Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-caption font-mono text-accent">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span>AI Agents Active</span>
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors relative cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-status-warn" />
            </button>

            {/* Notification Popover */}
            <AnimatePresence>
              {notificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="absolute top-full right-0 mt-1.5 w-80 bg-surface border border-border rounded-md shadow-[var(--shadow-e2)] p-2 z-50 space-y-2"
                >
                  <div className="flex items-center justify-between pb-1.5 border-b border-border px-1">
                    <span className="font-semibold text-body-sm text-foreground">Notifications</span>
                    <span className="text-caption text-accent font-mono">3 Unread</span>
                  </div>

                  <div className="space-y-1.5 text-body-sm">
                    <div className="p-2 bg-surface-2 rounded-sm space-y-0.5">
                      <div className="font-medium text-foreground text-[13px]">Room 204 Maintenance Reported</div>
                      <div className="text-caption text-muted-foreground">Bathroom leak reported by guest. Flagged emergency.</div>
                    </div>
                    <div className="p-2 bg-surface-2 rounded-sm space-y-0.5">
                      <div className="font-medium text-foreground text-[13px]">Direct Booking #8923 Confirmed</div>
                      <div className="text-caption text-muted-foreground">Vikram Mehta · Pine Suite · WhatsApp Concierge</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Ask StayO Quick Agent Trigger */}
          <button
            onClick={onOpenAskStayO}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-accent text-accent-foreground text-body-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ask StayO</span>
          </button>
        </div>
      </header>

      {/* Property Switch Transient Banner */}
      <AnimatePresence>
        {bannerMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-accent/15 border-b border-accent/30 text-accent px-4 py-1.5 text-center text-body-sm font-medium"
          >
            {bannerMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}