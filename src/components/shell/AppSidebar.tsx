'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUIStore } from '@/lib/store';
import {
  LayoutDashboard,
  Calendar,
  ConciergeBell,
  BookOpen,
  Users,
  BedDouble,
  Sparkles,
  Wrench,
  MessageSquare,
  ClipboardList,
  UtensilsCrossed,
  Compass,
  Receipt,
  CreditCard,
  Percent,
  TrendingUp,
  BarChart3,
  Bot,
  Cpu,
  UserCog,
  Globe2,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  built?: boolean;
}

interface NavGroup {
  groupName: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    groupName: 'Overview',
    items: [
      { label: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard, built: true },
      { label: 'Calendar', href: '/app/calendar', icon: Calendar },
    ],
  },
  {
    groupName: 'Operations',
    items: [
      { label: 'Front Desk', href: '/app/front-desk', icon: ConciergeBell, badge: '3' },
      { label: 'Reservations', href: '/app/reservations', icon: BookOpen, built: true },
      { label: 'Guests', href: '/app/guests', icon: Users },
    ],
  },
  {
    groupName: 'Property',
    items: [
      { label: 'Rooms', href: '/app/rooms', icon: BedDouble, built: true },
      { label: 'Housekeeping', href: '/app/housekeeping', icon: Sparkles, badge: '5', built: true },
      { label: 'Maintenance', href: '/app/maintenance', icon: Wrench, badge: '1' },
    ],
  },
  {
    groupName: 'Guest Experience',
    items: [
      { label: 'Communications', href: '/app/communications', icon: MessageSquare, badge: '2' },
      { label: 'Service Requests', href: '/app/service-requests', icon: ClipboardList },
      { label: 'Restaurant', href: '/app/restaurant', icon: UtensilsCrossed },
      { label: 'Experiences', href: '/app/experiences', icon: Compass },
    ],
  },
  {
    groupName: 'Revenue',
    items: [
      { label: 'Billing', href: '/app/billing', icon: Receipt },
      { label: 'Payments', href: '/app/payments', icon: CreditCard },
      { label: 'Rates', href: '/app/rates', icon: Percent },
      { label: 'Revenue', href: '/app/revenue', icon: TrendingUp },
      { label: 'Reports', href: '/app/reports', icon: BarChart3 },
    ],
  },
  {
    groupName: 'AI & Automation',
    items: [
      { label: 'AI Command', href: '/app/ai', icon: Bot, badge: 'AI' },
      { label: 'Automations', href: '/app/automations', icon: Cpu },
    ],
  },
  {
    groupName: 'Admin',
    items: [
      { label: 'Staff', href: '/app/staff', icon: UserCog },
      { label: 'Channels', href: '/app/channels', icon: Globe2 },
      { label: 'Settings', href: '/app/settings', icon: Settings },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, setSidebarCollapsed } = useUIStore();

  return (
    <aside
      className={`bg-surface border-r border-border flex flex-col justify-between transition-all duration-standard shrink-0 z-30 select-none ${
        sidebarCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Top Logo & Collapse Toggle */}
      <div>
        <div className="h-14 px-4 flex items-center justify-between border-b border-border">
          <Link href="/app/dashboard" className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center text-accent-foreground font-bold font-mono text-body-sm shadow-e1 shrink-0">
              S
            </div>
            {!sidebarCollapsed && (
              <span className="font-bold text-body-md tracking-tight text-foreground truncate">
                StayO <span className="text-[10px] font-mono text-accent ml-1 font-normal">OS</span>
              </span>
            )}
          </Link>

          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1 rounded-sm text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors cursor-pointer"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation List */}
        <div className="p-2 space-y-4 overflow-y-auto max-h-[calc(100vh-8rem)]">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {!sidebarCollapsed && (
                <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60 font-semibold">
                  {group.groupName}
                </div>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const isBuilt = item.built === true;

                // Render as link if built, otherwise a visually disabled div
                const innerContent = (
                  <>
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-accent' : 'text-muted-foreground group-hover:text-foreground'}`} />
                    {!sidebarCollapsed && (
                      <span className="truncate flex-1">{item.label}</span>
                    )}
                    {!sidebarCollapsed && item.badge && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                          item.badge === 'AI'
                            ? 'bg-accent/20 text-accent font-bold'
                            : 'bg-surface-2 border border-border text-muted-foreground'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                );

                const commonClasses = `flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-body-sm font-medium transition-all group ${
                  sidebarCollapsed ? 'justify-center px-0' : ''
                } ${
                  !isBuilt 
                    ? 'opacity-40 pointer-events-none'
                    : isActive
                      ? 'bg-accent/15 text-accent border border-accent/30 shadow-xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-surface-2'
                }`;

                if (isBuilt) {
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={sidebarCollapsed ? item.label : undefined}
                      className={commonClasses}
                    >
                      {innerContent}
                    </Link>
                  );
                } else {
                  return (
                    <div
                      key={item.href}
                      title={sidebarCollapsed ? `${item.label} (Coming Soon)` : undefined}
                      className={commonClasses}
                    >
                      {innerContent}
                    </div>
                  );
                }
              })}
            </div>
          ))}
        </div>
      </div>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-border bg-surface-2/40 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/40 text-accent font-bold font-mono flex items-center justify-center text-body-sm shrink-0">
          OT
        </div>
        {!sidebarCollapsed && (
          <div className="overflow-hidden flex-1 leading-tight">
            <div className="font-semibold text-body-sm text-foreground truncate">
              Off The Trail
            </div>
            <div className="text-caption text-muted-foreground font-mono truncate">
              General Manager
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
