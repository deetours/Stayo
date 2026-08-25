'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bed, BookOpen, User, Sparkles } from 'lucide-react';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { mockReservations, room204Alert } from '@/lib/mock-data';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();

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
    { label: 'Go to Front Desk', href: '/app/front-desk', icon: BookOpen },
    { label: 'Go to Calendar', href: '/app/calendar', icon: Bed },
    { label: 'Go to Housekeeping Board', href: '/app/housekeeping', icon: Sparkles },
    { label: 'Go to AI Command Centre', href: '/app/ai', icon: Sparkles },
    { label: 'Go to Billing & Folios', href: '/app/billing', icon: BookOpen },
  ];

  const aarav = mockReservations.find((r) => r.id === 'RES-8921')!;
  const elena = mockReservations.find((r) => r.id === 'RES-8922')!;

  const quickEntities = [
    { label: `${aarav.guestName} (Room ${aarav.roomNumber} – In-House)`, href: `/app/guests/${aarav.roomNumber}`, icon: User, type: 'Guest' },
    { label: `${elena.guestName} (Room ${elena.roomNumber} – Arrival Today)`, href: '/app/reservations/8922', icon: BookOpen, type: 'Reservation' },
    { label: `Room ${room204Alert.roomNumber} (Maintenance Emergency)`, href: '/app/maintenance', icon: Bed, type: 'Room' },
  ];

  const handleSelect = (href: string) => {
    router.push(href);
    onOpenChange(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command, guest name, or room number..." />
      <CommandList>
        <CommandEmpty>No matching commands or records found.</CommandEmpty>
        <CommandGroup heading="Pages">
          {navigationItems.map((item) => (
            <CommandItem key={item.href} value={item.label} onSelect={() => handleSelect(item.href)}>
              <div className="flex items-center gap-3 truncate">
                <div className="w-6 h-6 rounded-sm bg-surface-2 flex items-center justify-center text-muted-foreground shrink-0">
                  <item.icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-body-sm font-medium text-foreground truncate">{item.label}</span>
              </div>
              <span className="text-caption font-mono text-muted-foreground/60 px-2 py-0.5 rounded-sm bg-surface border border-border">
                Page
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Guests & Reservations">
          {quickEntities.map((item) => (
            <CommandItem key={item.href} value={item.label} onSelect={() => handleSelect(item.href)}>
              <div className="flex items-center gap-3 truncate">
                <div className="w-6 h-6 rounded-sm bg-surface-2 flex items-center justify-center text-muted-foreground shrink-0">
                  <item.icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-body-sm font-medium text-foreground truncate">{item.label}</span>
              </div>
              <span className="text-caption font-mono text-muted-foreground/60 px-2 py-0.5 rounded-sm bg-surface border border-border">
                {item.type}
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
