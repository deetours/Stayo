'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUIStore } from '@/lib/store';
import { LayoutDashboard, ConciergeBell, Sparkles, Menu } from 'lucide-react';
import { usePropertyData } from '@/lib/mock-data';

export function MobileBottomNav() {
  const pathname = usePathname();
  const setMobileSidebarOpen = useUIStore((s) => s.setMobileSidebarOpen);
  const { mockHousekeepingTasks } = usePropertyData();
  
  const hskpCount = mockHousekeepingTasks.length;

  const navItems = [
    {
      label: 'Home',
      href: '/app/dashboard',
      icon: LayoutDashboard,
      isActive: pathname === '/app/dashboard',
    },
    {
      label: 'Front Desk',
      href: '/app/front-desk',
      icon: ConciergeBell,
      isActive: pathname.startsWith('/app/front-desk') || pathname.startsWith('/app/reservations'),
    },
    {
      label: 'Rooms',
      href: '/app/housekeeping',
      icon: Sparkles,
      isActive: pathname.startsWith('/app/housekeeping') || pathname.startsWith('/app/rooms'),
      badge: hskpCount > 0 ? hskpCount : null,
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                item.isActive ? 'text-accent' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${item.isActive ? 'stroke-[2.5]' : ''}`} />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2 bg-status-warn text-[9px] font-bold text-black w-4 h-4 rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium tracking-wide">
                {item.label}
              </span>
            </Link>
          );
        })}
        
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="flex flex-col items-center justify-center w-full h-full space-y-1 text-muted-foreground hover:text-foreground focus:outline-none"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-wide">Menu</span>
        </button>
      </div>
    </div>
  );
}
