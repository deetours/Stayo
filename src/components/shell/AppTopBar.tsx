'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Bell,
  Sparkles,
  ChevronDown,
  Building2,
  Check,
  Menu,
} from 'lucide-react';
import Link from 'next/link';
import { hasDevSession, hasPreviewSession } from '@/lib/session';
import { useUIStore } from '@/lib/store';
import { gsap } from '@/lib/gsap';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { usePropertyStore } from '@/lib/property-store';
import { propertyDatasets, type PropertyMeta } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

// The shell's popovers/banner used to animate with Framer Motion while
// Kanban/Dashboard reflows used GSAP — two runtimes for the app shell.
// GSAP is the one the shell can't drop (Flip has no Framer equivalent), so
// these simple enter fades move onto it instead, consistent with every
// other reduced-motion-gated animation in this codebase.
function useEnterFade(ref: React.RefObject<HTMLElement | null>, open: boolean, prefersReducedMotion: boolean) {
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    tweenRef.current?.kill();
    if (!open || !ref.current || prefersReducedMotion) return;
    tweenRef.current = gsap.fromTo(
      ref.current,
      { opacity: 0, y: 4 },
      { opacity: 1, y: 0, duration: 0.15, ease: 'power2.out' }
    );
    return () => {
      tweenRef.current?.kill();
    };
  }, [open, prefersReducedMotion, ref]);
}

interface AppTopBarProps {
  onOpenCmdK: () => void;
  onOpenAskStayO: () => void;
}

export function AppTopBar({ onOpenCmdK, onOpenAskStayO }: AppTopBarProps) {
  const setMobileSidebarOpen = useUIStore((s) => s.setMobileSidebarOpen);
  const activePropertyId = usePropertyStore((s) => s.activePropertyId);
  const setActiveProperty = usePropertyStore((s) => s.setActiveProperty);
  const properties = Object.values(propertyDatasets).map((d) => d.meta);
  const activeProperty = propertyDatasets[activePropertyId].meta;
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const [isPreviewOnly, setIsPreviewOnly] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const bannerRef = useRef<HTMLDivElement>(null);

  useEnterFade(bannerRef, !!bannerMessage, prefersReducedMotion);

  useEffect(() => {
    setIsPreviewOnly(hasPreviewSession() && !hasDevSession());
  }, []);

  const handleSelectProperty = (prop: PropertyMeta) => {
    setActiveProperty(prop.id);
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
      <header className="h-14 bg-surface border-b border-border px-4 flex items-center justify-between shrink-0 z-20 gap-2">
        {/* Mobile: Sidebar drawer trigger */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden -ml-1 shrink-0"
            >
              <Menu className="w-4.5 h-4.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Open navigation</TooltipContent>
        </Tooltip>

        {/* Left: Property Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-surface-2 border border-border hover:border-muted-foreground/40 text-foreground transition-all cursor-pointer group min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <div className="w-5 h-5 rounded-sm bg-accent/20 text-accent flex items-center justify-center text-[10px] font-bold shrink-0">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <div className="text-left leading-none">
                <span className="font-semibold text-body-sm block text-foreground truncate max-w-[160px] md:max-w-[200px]">
                  {activeProperty.name}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors ml-0.5 shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            <DropdownMenuLabel className="border-b border-border mb-1">Select Property Context</DropdownMenuLabel>
            {properties.map((prop) => (
              <DropdownMenuItem key={prop.id} onSelect={() => handleSelectProperty(prop)} className="justify-between">
                <div>
                  <div className="font-medium text-body-sm text-foreground">{prop.name}</div>
                  <div className="text-caption text-muted-foreground font-mono">
                    {prop.type} • {propertyDatasets[prop.id].totalRooms} Rooms
                  </div>
                </div>
                {prop.id === activePropertyId && <Check className="w-4 h-4 text-accent shrink-0" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Center: Global Search Bar Trigger (Cmd+K) — collapses to an icon
            below md so search is never lost, only reshaped. */}
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
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onOpenCmdK}
              className="md:hidden ml-auto shrink-0"
            >
              <Search className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Search</TooltipContent>
        </Tooltip>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2.5">
          {/* Agent Activity Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-status-info/10 border border-status-info/20 text-caption font-mono text-status-info">
            <span className="w-2 h-2 rounded-full bg-status-info animate-pulse" />
            <span>AI Agents Active</span>
          </div>

          {/* Notifications Bell */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors relative cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-status-warn" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-2 space-y-2">
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
            </DropdownMenuContent>
          </DropdownMenu>

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
      {bannerMessage && (
        <div
          ref={bannerRef}
          className="bg-accent/15 border-b border-accent/30 text-accent px-4 py-1.5 text-center text-body-sm font-medium"
        >
          {bannerMessage}
        </div>
      )}
    </>
  );
}