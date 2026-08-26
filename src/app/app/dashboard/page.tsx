'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
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
import { roomStatusCounts, TOTAL_ROOMS, room204Alert } from '@/lib/mock-data';
import { gsap, useGSAP, Flip } from '@/lib/gsap';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { useUIStore } from '@/lib/store';
import { SmartLink } from '@/components/shared/SmartLink';
import { ApprovalFlow, ApprovalItem } from '@/components/patterns/ApprovalFlow';

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
    title: `1 ${room204Alert.title}`,
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

const initialRecommendations: ApprovalItem[] = [
  {
    id: 'ai-rate-1',
    title: 'Pine Suite Weekend Surge',
    sourceAgent: 'Revenue Agent',
    reason: '3 comp set hotels are fully booked this weekend.',
    timestamp: 'Just now',
    confidence: 0.87,
    diffs: [{ label: 'Weekend Base Rate', before: '₹8,500', after: '₹10,200' }],
    impactSummary: '+₹24k projected weekend gain',
  },
];

export default function DashboardPage() {
  const [dateStr, setDateStr] = useState('Today, 21 Aug 2026');
  const setAskStayOOpen = useUIStore((s) => s.setAskStayOOpen);

  // Optimistic Needs Attention feed
  const { state: needsAttention, performAction } = useOptimisticAction(initialNeedsAttention);

  const { state: recommendations, performAction: performRecommendationAction } =
    useOptimisticAction(initialRecommendations);

  const handleApproveRecommendation = (id: string) => {
    performRecommendationAction(
      (prev) => prev.filter((item) => item.id !== id),
      async () => {
        await new Promise((res) => setTimeout(res, 300));
      }
    );
    toast.success('Surge rate applied to calendar');
  };

  const handleAdjustRecommendation = () => {
    setAskStayOOpen(true);
  };

  const handleDismissRecommendation = (id: string) => {
    performRecommendationAction(
      (prev) => prev.filter((item) => item.id !== id),
      async () => {
        await new Promise((res) => setTimeout(res, 300));
      }
    );
    toast('Recommendation dismissed');
  };

  const attentionListRef = useRef<HTMLDivElement>(null);
  const attentionFlipStateRef = useRef<Flip.FlipState | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const kpiStripRef = useRef<HTMLDivElement>(null);
  const kpiValueRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const occupancyPct = Math.round((roomStatusCounts.occupied / TOTAL_ROOMS) * 100);
  const kpiTargets = [
    { value: occupancyPct, decimals: 0, format: (v: number) => `${Math.round(v)}%` },
    { value: 14, decimals: 0, format: (v: number) => `${Math.round(v)}` },
    { value: 11, decimals: 0, format: (v: number) => `${Math.round(v)}` },
    { value: 42, decimals: 0, format: (v: number) => `${Math.round(v)}` },
    { value: 1.84, decimals: 2, format: (v: number) => `₹${v.toFixed(2)}L` },
  ];

  // First-paint polish, added last on purpose — an animated number is only
  // trustworthy once the card it's on reliably goes somewhere (Waves 1-3).
  useGSAP(
    () => {
      if (prefersReducedMotion) return;

      gsap.from('[data-kpi-card]', {
        opacity: 0,
        y: 12,
        duration: 0.4,
        stagger: 0.06,
        ease: 'power2.out',
      });

      kpiTargets.forEach((target, i) => {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target.value,
          duration: 0.8,
          delay: 0.1 + i * 0.06,
          ease: 'power2.out',
          onUpdate: () => {
            const el = kpiValueRefs.current[i];
            if (el) el.textContent = target.format(obj.val);
          },
        });
      });

      const attentionRows = attentionListRef.current?.querySelectorAll('[data-flip-id]');
      if (attentionRows?.length) {
        gsap.from(attentionRows, { opacity: 0, y: 8, duration: 0.3, stagger: 0.05, ease: 'power2.out' });
      }
    },
    { scope: kpiStripRef, dependencies: [] }
  );

  const handleDismissAttention = (id: string) => {
    if (!prefersReducedMotion && attentionListRef.current) {
      attentionFlipStateRef.current = Flip.getState(attentionListRef.current.querySelectorAll('[data-flip-id]'));
    }
    performAction(
      (prev) => prev.filter((item) => item.id !== id),
      async () => {
        // Mock API call
        await new Promise((res) => setTimeout(res, 400));
      }
    );
  };

  // The dismissed row leaves and the remaining rows resettle upward,
  // giving useOptimisticAction's instant state update a visual payoff.
  useGSAP(
    () => {
      if (attentionFlipStateRef.current) {
        Flip.from(attentionFlipStateRef.current, {
          duration: 0.35,
          ease: 'power2.inOut',
          absolute: true,
          onLeave: (els) => gsap.to(els, { opacity: 0, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0, duration: 0.25 }),
        });
        attentionFlipStateRef.current = null;
      }
    },
    { dependencies: [needsAttention], scope: attentionListRef }
  );

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
          <SmartLink
            href="/app/front-desk"
            className="px-3.5 py-1.5 rounded-sm bg-accent text-accent-foreground text-body-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Open Front Desk Shift
          </SmartLink>
        </div>
      </div>

      {/* 2. KPI Strip (5 Numbers Max - Ticking numbers) */}
      <div ref={kpiStripRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <SmartLink
          href="/app/calendar"
          data-kpi-card
          className="p-4 rounded-md bg-surface border border-border hover:border-muted-foreground/40 transition-all shadow-e0 group"
        >
          <div className="text-caption uppercase tracking-wider text-muted-foreground font-medium">
            Occupancy
          </div>
          <div className="font-mono text-display-md font-bold text-foreground mt-1 group-hover:text-accent transition-colors">
            <span ref={(el) => { kpiValueRefs.current[0] = el; }}>
              {prefersReducedMotion ? kpiTargets[0].format(kpiTargets[0].value) : kpiTargets[0].format(0)}
            </span>
          </div>
          <div className="text-caption text-status-ok font-mono mt-0.5">{roomStatusCounts.occupied} of {TOTAL_ROOMS} Rooms</div>
        </SmartLink>

        <SmartLink
          href="/app/reservations?filter=arrivals"
          data-kpi-card
          className="p-4 rounded-md bg-surface border border-border hover:border-muted-foreground/40 transition-all shadow-e0 group"
        >
          <div className="text-caption uppercase tracking-wider text-muted-foreground font-medium">
            Arrivals Today
          </div>
          <div className="font-mono text-display-md font-bold text-foreground mt-1 group-hover:text-accent transition-colors">
            <span ref={(el) => { kpiValueRefs.current[1] = el; }}>
              {prefersReducedMotion ? kpiTargets[1].format(kpiTargets[1].value) : kpiTargets[1].format(0)}
            </span>
          </div>
          <div className="text-caption text-muted-foreground font-mono mt-0.5">6 Checked In</div>
        </SmartLink>

        <SmartLink
          href="/app/reservations?filter=departures"
          data-kpi-card
          className="p-4 rounded-md bg-surface border border-border hover:border-muted-foreground/40 transition-all shadow-e0 group"
        >
          <div className="text-caption uppercase tracking-wider text-muted-foreground font-medium">
            Departures Today
          </div>
          <div className="font-mono text-display-md font-bold text-foreground mt-1 group-hover:text-accent transition-colors">
            <span ref={(el) => { kpiValueRefs.current[2] = el; }}>
              {prefersReducedMotion ? kpiTargets[2].format(kpiTargets[2].value) : kpiTargets[2].format(0)}
            </span>
          </div>
          <div className="text-caption text-muted-foreground font-mono mt-0.5">9 Completed</div>
        </SmartLink>

        <SmartLink
          href="/app/guests"
          data-kpi-card
          className="p-4 rounded-md bg-surface border border-border hover:border-muted-foreground/40 transition-all shadow-e0 group"
        >
          <div className="text-caption uppercase tracking-wider text-muted-foreground font-medium">
            In-House Guests
          </div>
          <div className="font-mono text-display-md font-bold text-foreground mt-1 group-hover:text-accent transition-colors">
            <span ref={(el) => { kpiValueRefs.current[3] = el; }}>
              {prefersReducedMotion ? kpiTargets[3].format(kpiTargets[3].value) : kpiTargets[3].format(0)}
            </span>
          </div>
          <div className="text-caption text-accent font-mono mt-0.5">4 VIP Guests</div>
        </SmartLink>

        <SmartLink
          href="/app/revenue"
          data-kpi-card
          className="p-4 rounded-md bg-surface border border-border hover:border-muted-foreground/40 transition-all shadow-e0 group col-span-2 sm:col-span-1"
        >
          <div className="text-caption uppercase tracking-wider text-muted-foreground font-medium">
            Revenue Today
          </div>
          <div className="font-mono text-display-md font-bold text-accent mt-1">
            <span ref={(el) => { kpiValueRefs.current[4] = el; }}>
              {prefersReducedMotion ? kpiTargets[4].format(kpiTargets[4].value) : kpiTargets[4].format(0)}
            </span>
          </div>
          <div className="text-caption text-status-ok font-mono mt-0.5 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +18% vs yesterday
          </div>
        </SmartLink>
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

          <div ref={attentionListRef} className="space-y-2">
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
                  data-flip-id={item.id}
                  className="p-3.5 rounded-md bg-surface border border-border flex items-center justify-between gap-3 hover:border-muted-foreground/40 transition-colors shadow-e0"
                >
                  <div className="flex items-center gap-3 truncate">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${urgencyDot}`} />
                    <span className="font-medium text-body-md text-foreground truncate">
                      {item.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <SmartLink
                      href={item.link}
                      className="text-body-sm font-medium text-accent hover:underline px-2 py-1"
                    >
                      {item.linkLabel}
                    </SmartLink>
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
              Today&apos;s Key Shifts &amp; Stays
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
                <span className="text-caption text-status-crit font-medium">Maintenance Delay</span>
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
                Room Status
              </span>
              <Link href="/app/rooms" className="text-caption text-accent hover:underline">
                Manage Rooms →
              </Link>
            </div>

            <div className="grid grid-cols-5 gap-2 text-center">
              <Link href="/app/rooms?status=available" className="p-2 bg-surface-2 rounded-sm hover:bg-border transition-colors">
                <div className="font-mono font-bold text-body-lg text-status-ok">{roomStatusCounts.available}</div>
                <div className="text-[10px] text-muted-foreground uppercase">Available</div>
              </Link>
              <Link href="/app/rooms?status=occupied" className="p-2 bg-surface-2 rounded-sm hover:bg-border transition-colors">
                <div className="font-mono font-bold text-body-lg text-foreground">{roomStatusCounts.occupied}</div>
                <div className="text-[10px] text-muted-foreground uppercase">Occupied</div>
              </Link>
              <Link href="/app/rooms?status=dirty" className="p-2 bg-surface-2 rounded-sm hover:bg-border transition-colors">
                <div className="font-mono font-bold text-body-lg text-status-warn">{roomStatusCounts.dirty}</div>
                <div className="text-[10px] text-muted-foreground uppercase">Dirty</div>
              </Link>
              <Link href="/app/rooms?status=cleaning" className="p-2 bg-surface-2 rounded-sm hover:bg-border transition-colors">
                <div className="font-mono font-bold text-body-lg text-status-info">{roomStatusCounts.cleaning}</div>
                <div className="text-[10px] text-muted-foreground uppercase">Cleaning</div>
              </Link>
              <Link href="/app/rooms?status=maintenance" className="p-2 bg-surface-2 rounded-sm hover:bg-border transition-colors">
                <div className="font-mono font-bold text-body-lg text-status-crit">{roomStatusCounts.blocked}</div>
                <div className="text-[10px] text-muted-foreground uppercase">Blocked</div>
              </Link>
            </div>
          </div>

          {/* Section 7: StayO AI Recommendations */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-accent">
              <Bot className="w-4 h-4" />
              <span className="font-semibold text-body-sm">StayO AI Recommendations</span>
            </div>

            <ApprovalFlow
              items={recommendations}
              onApprove={handleApproveRecommendation}
              onAdjust={handleAdjustRecommendation}
              onDismiss={handleDismissRecommendation}
            />
          </div>

          {/* Section 8: Live Activity Feed */}
          <div className="p-4 bg-surface border border-border rounded-md space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-body-sm font-semibold text-foreground">
                Recent Operations Feed
              </span>
              <span className="text-caption font-mono text-muted-foreground">Recent</span>
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