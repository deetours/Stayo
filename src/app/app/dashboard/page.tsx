'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Users,
  Bed,
  Check,
  ChevronRight,
  ShieldAlert,
  Bot,
  DollarSign,
} from 'lucide-react';
import { useOptimisticAction } from '@/hooks/useOptimisticAction';

interface NeedsAttentionItem {
  id: string;
  title: string;
  count: number;
  category: string;
  urgency: 'crit' | 'warn' | 'info';
  link: string;
  linkLabel: string;
}

const initialNeedsAttention: NeedsAttentionItem[] = [
  {
    id: 'na-1',
    title: '3 rooms awaiting inspection',
    count: 3,
    category: 'Housekeeping',
    urgency: 'warn',
    link: '/app/housekeeping',
    linkLabel: 'Housekeeping →',
  },
  {
    id: 'na-2',
    title: '₹32,400 outstanding across 4 folios',
    count: 4,
    category: 'Billing',
    urgency: 'warn',
    link: '/app/billing',
    linkLabel: 'Billing →',
  },
  {
    id: 'na-3',
    title: '2 guest requests waiting > 20 min',
    count: 2,
    category: 'Service requests',
    urgency: 'crit',
    link: '/app/service-requests',
    linkLabel: 'Service requests →',
  },
  {
    id: 'na-4',
    title: '1 maintenance emergency — Room 204 (Bathroom leak)',
    count: 1,
    category: 'Maintenance',
    urgency: 'crit',
    link: '/app/maintenance',
    linkLabel: 'Maintenance →',
  },
  {
    id: 'na-5',
    title: '1 booking requires manual confirmation',
    count: 1,
    category: 'Reservations',
    urgency: 'info',
    link: '/app/reservations',
    linkLabel: 'Reservations →',
  },
];

export default function DashboardPage() {
  const [dateStr, setDateStr] = useState('Today, 21 Aug 2026');

  // Optimistic Needs Attention feed
  const { state: needsAttention, performAction } = useOptimisticAction(initialNeedsAttention);

  const handleDismissAttention = (id: string) => {
    performAction(
      (prev) => prev.filter((item) => item.id !== id),
      async () => {
        // Mock API call
        await new Promise((res) => setTimeout(res, 400));
      }
    );
  };

  return (
    <div className="space-y-8 font-sans">
      {/* 1. Header: Active property + today's date */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
        <div>
          <h1 className="text-display-md font-bold text-foreground tracking-tight">
            Off The Trail — Dalhousie
          </h1>
          <p className="text-body-sm text-muted-foreground mt-0.5">
            Command Centre • {dateStr}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/app/front-desk"
            className="px-3.5 py-1.5 rounded-sm bg-accent text-accent-foreground text-body-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Open Front Desk Shift
          </Link>
        </div>
      </div>

      {/* 2. KPI Strip (5 Numbers Max - Ticking numbers) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <Link
          href="/app/calendar"
          className="p-4 rounded-md bg-surface border border-border hover:border-muted-foreground/40 transition-all shadow-e0 group"
        >
          <div className="text-caption uppercase tracking-wider text-muted-foreground font-medium">
            Occupancy
          </div>
          <div className="font-mono text-display-md font-bold text-foreground mt-1 group-hover:text-accent transition-colors">
            72%
          </div>
          <div className="text-caption text-status-ok font-mono mt-0.5">18 of 25 Rooms</div>
        </Link>

        <Link
          href="/app/reservations?filter=arrivals"
          className="p-4 rounded-md bg-surface border border-border hover:border-muted-foreground/40 transition-all shadow-e0 group"
        >
          <div className="text-caption uppercase tracking-wider text-muted-foreground font-medium">
            Arrivals Today
          </div>
          <div className="font-mono text-display-md font-bold text-foreground mt-1 group-hover:text-accent transition-colors">
            14
          </div>
          <div className="text-caption text-muted-foreground font-mono mt-0.5">6 Checked In</div>
        </Link>

        <Link
          href="/app/reservations?filter=departures"
          className="p-4 rounded-md bg-surface border border-border hover:border-muted-foreground/40 transition-all shadow-e0 group"
        >
          <div className="text-caption uppercase tracking-wider text-muted-foreground font-medium">
            Departures Today
          </div>
          <div className="font-mono text-display-md font-bold text-foreground mt-1 group-hover:text-accent transition-colors">
            11
          </div>
          <div className="text-caption text-muted-foreground font-mono mt-0.5">9 Completed</div>
        </Link>

        <Link
          href="/app/guests"
          className="p-4 rounded-md bg-surface border border-border hover:border-muted-foreground/40 transition-all shadow-e0 group"
        >
          <div className="text-caption uppercase tracking-wider text-muted-foreground font-medium">
            In-House Guests
          </div>
          <div className="font-mono text-display-md font-bold text-foreground mt-1 group-hover:text-accent transition-colors">
            42
          </div>
          <div className="text-caption text-accent font-mono mt-0.5">4 VIP Guests</div>
        </Link>

        <Link
          href="/app/revenue"
          className="p-4 rounded-md bg-surface border border-border hover:border-muted-foreground/40 transition-all shadow-e0 group col-span-2 sm:col-span-1"
        >
          <div className="text-caption uppercase tracking-wider text-muted-foreground font-medium">
            Revenue Today
          </div>
          <div className="font-mono text-display-md font-bold text-accent mt-1">
            ₹1.84L
          </div>
          <div className="text-caption text-status-ok font-mono mt-0.5 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +18% vs yesterday
          </div>
        </Link>
      </div>

      {/* Two Column Operational Hub: Left = Needs Attention | Right = StayO AI & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Needs Attention Feed (Section 3) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-heading-sm font-semibold text-foreground">
                Needs Attention
              </h3>
              <span className="font-mono text-caption px-2 py-0.5 rounded-full bg-status-crit/15 text-status-crit font-bold">
                {needsAttention.length}
              </span>
            </div>
            <span className="text-caption text-muted-foreground font-mono">
              Ranked by urgency
            </span>
          </div>

          <div className="space-y-2">
            {needsAttention.map((item) => {
              const urgencyDot =
                item.urgency === 'crit'
                  ? 'bg-status-crit'
                  : item.urgency === 'warn'
                  ? 'bg-status-warn'
                  : 'bg-status-info';

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-md bg-surface border border-border flex items-center justify-between gap-3 hover:border-muted-foreground/40 transition-colors shadow-e0"
                >
                  <div className="flex items-center gap-3 truncate">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${urgencyDot}`} />
                    <span className="font-medium text-body-md text-foreground truncate">
                      {item.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={item.link}
                      className="text-body-sm font-medium text-accent hover:underline px-2 py-1"
                    >
                      {item.linkLabel}
                    </Link>
                    <button
                      onClick={() => handleDismissAttention(item.id)}
                      className="p-1 rounded-sm text-muted-foreground hover:text-foreground hover:bg-surface-2 cursor-pointer"
                      title="Mark resolved"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}

            {needsAttention.length === 0 && (
              <div className="p-8 text-center bg-surface border border-dashed border-border rounded-md text-muted-foreground text-body-sm">
                ✓ All immediate operational alerts resolved!
              </div>
            )}
          </div>

          {/* Section 4: Today's Operations Mini-Tabs */}
          <div className="pt-4 space-y-3">
            <h4 className="text-heading-sm font-semibold text-foreground">
              Today's Key Shifts & Stays
            </h4>
            <div className="bg-surface border border-border rounded-md divide-y divide-border overflow-hidden">
              <div className="p-3 flex items-center justify-between text-body-sm">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-caption px-2 py-0.5 rounded-sm bg-accent/15 text-accent font-semibold">
                    14:00 ARRIVAL
                  </span>
                  <span className="font-medium text-foreground">Elena Rostova</span>
                  <span className="font-mono text-muted-foreground text-caption">Room 204</span>
                </div>
                <span className="text-caption text-status-warn font-medium">Room Being Cleaned</span>
              </div>

              <div className="p-3 flex items-center justify-between text-body-sm">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-caption px-2 py-0.5 rounded-sm bg-accent/15 text-accent font-semibold">
                    15:30 ARRIVAL
                  </span>
                  <span className="font-medium text-foreground">Aarav Sharma</span>
                  <span className="text-caption px-1.5 py-0.2 rounded-full bg-accent/20 text-accent font-bold">
                    VIP
                  </span>
                  <span className="font-mono text-muted-foreground text-caption">Room 102</span>
                </div>
                <span className="text-caption text-status-ok font-medium">Room Ready ✓</span>
              </div>

              <div className="p-3 flex items-center justify-between text-body-sm">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-caption px-2 py-0.5 rounded-sm bg-surface-2 text-muted-foreground font-semibold">
                    11:00 DEPARTURE
                  </span>
                  <span className="font-medium text-foreground">Sarah Jenkins</span>
                  <span className="font-mono text-muted-foreground text-caption">Room 105</span>
                </div>
                <span className="text-caption text-muted-foreground">Checked Out</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: StayO AI & Room Status Strip (Sections 5, 6, 7, 8) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Section 5: Room Status Strip */}
          <div className="p-4 bg-surface border border-border rounded-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-body-sm font-semibold text-foreground">
                Live Room Status
              </span>
              <Link href="/app/rooms" className="text-caption text-accent hover:underline">
                Manage Rooms →
              </Link>
            </div>

            <div className="grid grid-cols-5 gap-2 text-center">
              <Link href="/app/rooms?status=available" className="p-2 bg-surface-2 rounded-sm hover:bg-border transition-colors">
                <div className="font-mono font-bold text-body-lg text-status-ok">6</div>
                <div className="text-[10px] text-muted-foreground uppercase">Available</div>
              </Link>
              <Link href="/app/rooms?status=occupied" className="p-2 bg-surface-2 rounded-sm hover:bg-border transition-colors">
                <div className="font-mono font-bold text-body-lg text-foreground">14</div>
                <div className="text-[10px] text-muted-foreground uppercase">Occupied</div>
              </Link>
              <Link href="/app/rooms?status=dirty" className="p-2 bg-surface-2 rounded-sm hover:bg-border transition-colors">
                <div className="font-mono font-bold text-body-lg text-status-warn">3</div>
                <div className="text-[10px] text-muted-foreground uppercase">Dirty</div>
              </Link>
              <Link href="/app/rooms?status=cleaning" className="p-2 bg-surface-2 rounded-sm hover:bg-border transition-colors">
                <div className="font-mono font-bold text-body-lg text-status-info">2</div>
                <div className="text-[10px] text-muted-foreground uppercase">Cleaning</div>
              </Link>
              <Link href="/app/rooms?status=maintenance" className="p-2 bg-surface-2 rounded-sm hover:bg-border transition-colors">
                <div className="font-mono font-bold text-body-lg text-status-crit">1</div>
                <div className="text-[10px] text-muted-foreground uppercase">Blocked</div>
              </Link>
            </div>
          </div>

          {/* Section 7: StayO AI Recommendations */}
          <div className="p-4 bg-surface border border-accent/40 rounded-md space-y-3 shadow-e0">
            <div className="flex items-center gap-2 text-accent">
              <Bot className="w-4 h-4" />
              <span className="font-semibold text-body-sm">StayO AI Recommendations</span>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-sm bg-surface-2 border border-border space-y-2">
                <div className="flex justify-between items-start">
                  <div className="font-semibold text-body-sm text-foreground">
                    Pine Suite Weekend Surge
                  </div>
                  <span className="text-caption font-mono text-accent">+₹24k Gain</span>
                </div>
                <p className="text-body-sm text-muted-foreground">
                  3 comp set hotels are fully booked. Increase weekend base rate from ₹8,500 to ₹10,200.
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => alert('Surge Rate Applied to Calendar')}
                    className="px-2.5 py-1 rounded-sm bg-accent text-accent-foreground text-caption font-semibold hover:opacity-90 cursor-pointer"
                  >
                    Approve Rate
                  </button>
                  <Link
                    href="/app/ai"
                    className="px-2.5 py-1 rounded-sm bg-surface border border-border text-caption text-foreground hover:bg-border"
                  >
                    Review in AI Workspace
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Section 8: Live Activity Feed */}
          <div className="p-4 bg-surface border border-border rounded-md space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-body-sm font-semibold text-foreground">
                Recent Operations Feed
              </span>
              <span className="text-caption font-mono text-muted-foreground">Live</span>
            </div>

            <div className="space-y-2.5 text-body-sm">
              <div className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-status-ok mt-2 shrink-0" />
                <div>
                  <span className="font-medium text-foreground">Reservation #8923 created</span>
                  <span className="text-muted-foreground"> by Concierge Agent via WhatsApp</span>
                  <div className="text-[11px] font-mono text-muted-foreground/60">4 min ago</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-status-info mt-2 shrink-0" />
                <div>
                  <span className="font-medium text-foreground">Room 101 cleaning completed</span>
                  <span className="text-muted-foreground"> by Sunita D.</span>
                  <div className="text-[11px] font-mono text-muted-foreground/60">18 min ago</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-status-warn mt-2 shrink-0" />
                <div>
                  <span className="font-medium text-foreground">Folio #442 updated</span>
                  <span className="text-muted-foreground"> with ₹2,200 Restaurant charge</span>
                  <div className="text-[11px] font-mono text-muted-foreground/60">32 min ago</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}