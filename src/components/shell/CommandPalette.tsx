'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bed, BookOpen, User, Sparkles, ArrowRight, X } from 'lucide-react';
import { durations, eases } from '@/lib/motion';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  // Keyboard shortcut listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // Controlled by parent
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Mock search results
  const navigationItems = [
    { label: 'Go to Front Desk', href: '/app/front-desk', icon: BookOpen, type: 'Page' },
    { label: 'Go to Calendar', href: '/app/calendar', icon: Bed, type: 'Page' },
    { label: 'Go to Housekeeping Board', href: '/app/housekeeping', icon: Sparkles, type: 'Page' },
    { label: 'Go to AI Command Centre', href: '/app/ai', icon: Sparkles, type: 'Page' },
    { label: 'Go to Billing & Folios', href: '/app/billing', icon: BookOpen, type: 'Page' },
  ];

  const quickEntities = [
    { label: 'Aarav Sharma (Room 102 ï¿½ In-House)', href: '/app/guests/102', icon: User, type: 'Guest' },
    { label: 'Elena Rostova (Room 204 ï¿½ Arrival Today)', href: '/app/reservations/8922', icon: BookOpen, type: 'Reservation' },
    { label: 'Room 204 (Maintenance Emergency)', href: '/app/maintenance', icon: Bed, type: 'Room' },
  ];

  const allItems = [...navigationItems, ...quickEntities];
  const filtered = query
    ? allItems.filter((i) => i.label.toLowerCase().includes(query.toLowerCase()))
    : allItems;

  const handleSelect = (href: string) => {
    router.push(href);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-xs"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: durations.fast, ease: eases.decelerate }}
            className="relative z-10 w-full max-w-xl bg-surface border border-border rounded-lg shadow-[var(--shadow-e3)] overflow-hidden"
          >
            {/* Search Input Bar */}
            <div className="flex items-center px-4 py-3.5 border-b border-border bg-surface-2/50">
              <Search className="w-4 h-4 text-muted-foreground mr-3 shrink-0" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command, guest name, or room number..."
                className="w-full bg-transparent text-body-md text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <span className="font-mono text-caption px-1.5 py-0.5 rounded-sm bg-surface border border-border text-muted-foreground uppercase">
                ESC
              </span>
            </div>

            {/* Results List */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {filtered.length === 0 ? (
                <div className="p-6 text-center text-body-sm text-muted-foreground">
                  No matching commands or records found for "{query}".
                </div>
              ) : (
                filtered.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelect(item.href)}
                      className="w-full flex items-center justify-between p-2.5 rounded-sm hover:bg-surface-2 transition-colors text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <div className="w-6 h-6 rounded-sm bg-surface-2 flex items-center justify-center text-muted-foreground group-hover:text-accent shrink-0">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-body-sm font-medium text-foreground truncate">
                          {item.label}
                        </span>
                      </div>
                      <span className="text-caption font-mono text-muted-foreground/60 px-2 py-0.5 rounded-sm bg-surface border border-border">
                        {item.type}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-surface-2 border-t border-border flex items-center justify-between text-caption text-muted-foreground font-mono">
              <span>Navigation & Global Search</span>
              <span>StayO ?K</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}


