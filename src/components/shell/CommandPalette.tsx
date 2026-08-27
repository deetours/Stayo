'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bed, BookOpen, User, Sparkles, ClipboardList, Wrench } from 'lucide-react';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { usePropertyData } from '@/lib/mock-data';
import { isRouteBuilt } from '@/lib/routes';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const { mockReservations, signatureIncident } = usePropertyData();

  // Keyboard shortcut listener (Cmd+K / Ctrl+K) — CommandDialog's own
  // cmdk-driven list already handles ↑/↓/Enter and Esc once it's open.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  const navigationItems = [
    { label: 'Go to Dashboard', href: '/app/dashboard', icon: Sparkles },
    { label: 'Go to Reservations', href: '/app/reservations', icon: BookOpen },
    { label: 'Go to Rooms', href: '/app/rooms', icon: Bed },
    { label: 'Go to Housekeeping Board', href: '/app/housekeeping', icon: Sparkles },
    { label: 'Go to Front Desk', href: '/app/front-desk', icon: BookOpen },
    { label: 'Go to Guests', href: '/app/guests', icon: User },
    { label: 'Go to Service Requests', href: '/app/service-requests', icon: ClipboardList },
    { label: 'Go to Maintenance', href: '/app/maintenance', icon: Wrench },
    { label: 'Go to Calendar', href: '/app/calendar', icon: Bed },
    { label: 'Go to AI Command Centre', href: '/app/ai', icon: Sparkles },
    { label: 'Go to Billing & Folios', href: '/app/billing', icon: BookOpen },
  ];

  const featuredReservations = mockReservations.filter((r) => r.arrivalTime || r.departureTime).slice(0, 2);

  // Dynamic detail routes StayO hasn't built yet — isRouteBuilt only knows
  // static paths, so featured guest/reservation entries stay hardcoded
  // unbuilt. The signature incident's room links to the (now-built) static
  // Maintenance list page, so it reads off the shared registry instead.
  const quickEntities = [
    ...featuredReservations.map((r) => ({
      label: r.status === 'checked-in'
        ? `${r.guestName} (Room ${r.roomNumber} – In-House)`
        : `${r.guestName} (Room ${r.roomNumber} – Arrival Today)`,
      href: r.status === 'checked-in' ? `/app/guests/${r.roomNumber}` : `/app/reservations/${r.id}`,
      icon: r.status === 'checked-in' ? User : BookOpen,
      type: r.status === 'checked-in' ? 'Guest' : 'Reservation',
      built: false,
    })),
    { label: `Room ${signatureIncident.roomNumber} (Maintenance Emergency)`, href: '/app/maintenance', icon: Bed, type: 'Room', built: isRouteBuilt('/app/maintenance') },
  ];

  const handleSelect = (href: string, built: boolean) => {
    if (!built) return;
    router.push(href);
    onOpenChange(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command, guest name, or room number..." />
      <CommandList>
        <CommandEmpty>No matching commands or records found.</CommandEmpty>
        <CommandGroup heading="Pages">
          {navigationItems.map((item) => {
            const built = isRouteBuilt(item.href);
            return (
              <CommandItem
                key={item.href}
                value={item.label}
                disabled={!built}
                onSelect={() => handleSelect(item.href, built)}
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="w-6 h-6 rounded-sm bg-surface-2 flex items-center justify-center text-muted-foreground shrink-0">
                    <item.icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-body-sm font-medium text-foreground truncate">{item.label}</span>
                </div>
                <span className="text-caption font-mono text-muted-foreground/60 px-2 py-0.5 rounded-sm bg-surface border border-border">
                  {built ? 'Page' : 'Coming soon'}
                </span>
              </CommandItem>
            );
          })}
        </CommandGroup>
        <CommandGroup heading="Guests & Reservations">
          {quickEntities.map((item) => (
            <CommandItem
              key={item.href}
              value={item.label}
              disabled={!item.built}
              onSelect={() => handleSelect(item.href, item.built)}
            >
              <div className="flex items-center gap-3 truncate">
                <div className="w-6 h-6 rounded-sm bg-surface-2 flex items-center justify-center text-muted-foreground shrink-0">
                  <item.icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-body-sm font-medium text-foreground truncate">{item.label}</span>
              </div>
              <span className="text-caption font-mono text-muted-foreground/60 px-2 py-0.5 rounded-sm bg-surface border border-border">
                {item.built ? item.type : 'Coming soon'}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
      <div className="px-4 py-2 bg-surface-2 border-t border-border flex items-center justify-between text-caption text-muted-foreground font-mono">
        <span>Navigation & Global Search</span>
        <span>StayO ⌘K</span>
      </div>
    </CommandDialog>
  );
}
