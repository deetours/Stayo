'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
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
import { usePropertyData, PropertyDataset } from '@/lib/mock-data';
import { usePropertyStore } from '@/lib/property-store';
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

function buildNeedsAttention(data: PropertyDataset): NeedsAttentionItem[] {
  const items: NeedsAttentionItem[] = [];

  const activeHousekeeping = data.mockHousekeepingTasks.filter((t) => t.status !== 'ready');
  if (activeHousekeeping.length > 0) {
    items.push({
      id: 'na-housekeeping',
      title: `${activeHousekeeping.length} housekeeping task${activeHousekeeping.length === 1 ? '' : 's'} in progress`,
      count: activeHousekeeping.length,
      category: 'Housekeeping',
      urgency: 'warn',
      link: '/app/housekeeping',
      linkLabel: 'Housekeeping →',
    });
  }

  const unpaidFolios = data.mockFolios.filter((f) => f.status !== 'paid');
  if (unpaidFolios.length > 0) {
    const outstanding = unpaidFolios.reduce(
      (sum, f) => sum + (f.charges.reduce((s, c) => s + c.amount, 0) - f.totalPaid),
      0
    );
    items.push({
      id: 'na-billing',
      title: `₹${outstanding.toLocaleString('en-IN')} outstanding across ${unpaidFolios.length} folio${unpaidFolios.length === 1 ? '' : 's'}`,
      count: unpaidFolios.length,
      category: 'Billing',
      urgency: 'warn',
      link: '/app/billing',
      linkLabel: 'Billing →',
    });
  }

  const openRequests = data.mockServiceRequests.filter((r) => r.status === 'open');
  if (openRequests.length > 0) {
    items.push({
      id: 'na-service',
      title: `${openRequests.length} guest request${openRequests.length === 1 ? '' : 's'} open`,
      count: openRequests.length,
      category: 'Service requests',
      urgency: 'crit',
      link: '/app/service-requests',
      linkLabel: 'Service requests →',
    });
  }

  const openTickets = data.mockMaintenanceTickets.filter((t) => t.status !== 'resolved');
  if (openTickets.length > 0) {
    const title =
      openTickets.length === 1
        ? `1 ${openTickets[0].title} — Room ${openTickets[0].roomNumber}`
        : `${openTickets.length} maintenance tickets open`;
    items.push({
      id: 'na-maintenance',
      title,
      count: openTickets.length,
      category: 'Maintenance',
      urgency: 'crit',
      link: '/app/maintenance',
      linkLabel: 'Maintenance →',
    });
  }

  return items;
}

interface KeyShiftRow {
  id: string;
  time: string;
  kind: 'ARRIVAL' | 'DEPARTURE';
  guestName: string;
  roomNumber: string;
  vip: boolean;
  statusLabel: string;
  statusTone: 'crit' | 'ok' | 'muted';
}

function buildKeyShifts(data: PropertyDataset): KeyShiftRow[] {
  const rows: KeyShiftRow[] = [];
  for (const r of data.mockReservations) {
    const guest = data.mockGuests.find((g) => g.name === r.guestName);
    const vip = guest?.vip ?? false;
    const isSignatureRoom = r.roomNumber === data.signatureIncident.roomNumber;

    if (r.arrivalTime) {
      rows.push({
        id: `${r.id}-arrival`,
        time: r.arrivalTime,
        kind: 'ARRIVAL',
        guestName: r.guestName,
        roomNumber: r.roomNumber,
        vip,
        statusLabel: isSignatureRoom ? 'Maintenance Delay' : r.status === 'checked-in' ? 'Room Ready ✓' : 'Awaiting Arrival',
        statusTone: isSignatureRoom ? 'crit' : r.status === 'checked-in' ? 'ok' : 'muted',
      });
    }
    if (r.departureTime) {
      rows.push({
        id: `${r.id}-departure`,
        time: r.departureTime,
        kind: 'DEPARTURE',
        guestName: r.guestName,
        roomNumber: r.roomNumber,
        vip,
        statusLabel: r.status === 'checked-out' ? 'Checked Out' : 'Pending Checkout',
        statusTone: 'muted',
      });
    }
  }
  return rows.sort((a, b) => a.time.localeCompare(b.time));
}

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
  const activePropertyId = usePropertyStore((s) => s.activePropertyId);
  return <DashboardPageContent key={activePropertyId} />;
}

function DashboardPageContent() {
  const data = usePropertyData();
  const {
    meta,
    totalRooms,
    roomStatusCounts,
    mockReservations,
    mockGuests,
    activityLog,
  } = data;

  const [dateStr, setDateStr] = useState('Today, 21 Aug 2026');
  const setAskStayOOpen = useUIStore((s) => s.setAskStayOOpen);

  const { state: needsAttention, performAction } = useOptimisticAction(buildNeedsAttention(data));

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

  const occupancyPct = Math.round((roomStatusCounts.occupied / totalRooms) * 100);
  const arrivalsToday = mockReservations.filter((r) => r.checkIn === 'Today' && r.status !== 'cancelled').length;
  const arrivalsCheckedIn = mockReservations.filter((r) => r.checkIn === 'Today' && r.status === 'checked-in').length;
  const departuresToday = mockReservations.filter((r) => r.checkOut === 'Today').length;
  const departuresCompleted = mockReservations.filter((r) => r.checkOut === 'Today' && r.status === 'checked-out').length;
  const inHouseReservations = mockReservations.filter((r) => r.status === 'checked-in');
  const inHouseGuests = inHouseReservations.reduce((sum, r) => sum + (r.guestCount ?? 1), 0);
  const inHouseVips = inHouseReservations.filter((r) => mockGuests.find((g) => g.name === r.guestName)?.vip).length;
  const revenueToday = mockReservations
    .filter((r) => r.checkIn === 'Today')
    .reduce((sum, r) => sum + r.amountValue, 0);

  const keyShifts = buildKeyShifts(data);

  const kpiTargets = [
    { value: occupancyPct, decimals: 0, format: (v: number) => `${Math.round(v)}%` },
    { value: arrivalsToday, decimals: 0, format: (v: number) => `${Math.round(v)}` },
    { value: departuresToday, decimals: 0, format: (v: number) => `${Math.round(v)}` },
    { value: inHouseGuests, decimals: 0, format: (v: number) => `${Math.round(v)}` },
    { value: revenueToday, decimals: 0, format: (v: number) => `₹${Math.round(v).toLocaleString('en-IN')}` },
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
        await new Promise((res) => setTimeout(res, 400));
      }
    );
  };

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
            {meta.name}
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
          <div className="text-caption text-status-ok font-mono mt-0.5">{roomStatusCounts.occupied} of {totalRooms} Rooms</div>
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
          <div className="text-caption text-muted-foreground font-mono mt-0.5">{arrivalsCheckedIn} Checked In</div>
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
          <div className="text-caption text-muted-foreground font-mono mt-0.5">{departuresCompleted} Completed</div>
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
          <div className="text-caption text-vip font-mono mt-0.5">{inHouseVips} VIP Guest{inHouseVips === 1 ? '' : 's'}</div>
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
          <div className="text-caption text-status-ok font-mono mt-0.5">
            {arrivalsToday} arrival{arrivalsToday === 1 ? '' : 's'} billed today
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
              {keyShifts.map((row) => (
                <div key={row.id} className="p-3 flex items-center justify-between text-body-sm">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`font-mono text-caption px-2 py-0.5 rounded-sm font-semibold ${
                        row.kind === 'ARRIVAL' ? 'bg-accent/15 text-accent' : 'bg-surface-2 text-muted-foreground'
                      }`}
                    >
                      {row.time} {row.kind}
                    </span>
                    <span className="font-medium text-foreground">{row.guestName}</span>
                    {row.vip && (
                      <span className="text-caption px-1.5 py-0.2 rounded-full bg-vip/20 text-vip font-bold">
                        VIP
                      </span>
                    )}
                    <span className="font-mono text-muted-foreground text-caption">Room {row.roomNumber}</span>
                  </div>
                  <span
                    className={`text-caption font-medium ${
                      row.statusTone === 'crit'
                        ? 'text-status-crit'
                        : row.statusTone === 'ok'
                        ? 'text-status-ok'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {row.statusLabel}
                  </span>
                </div>
              ))}
              {keyShifts.length === 0 && (
                <div className="p-4 text-center text-muted-foreground text-body-sm">
                  No arrivals or departures scheduled right now.
                </div>
              )}
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
            <div className="flex items-center gap-2 text-status-info">
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
              {activityLog.map((entry) => (
                <div key={entry.id} className="flex items-start gap-2.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${
                      entry.tone === 'ok' ? 'bg-status-ok' : entry.tone === 'warn' ? 'bg-status-warn' : 'bg-status-info'
                    }`}
                  />
                  <div>
                    <span className="font-medium text-foreground">{entry.message}</span>
                    <div className="text-[11px] font-mono text-muted-foreground/60">{entry.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
