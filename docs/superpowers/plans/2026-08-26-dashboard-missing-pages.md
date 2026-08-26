# Dashboard Missing Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the five `/app/*` pages that already have live UI pointing at them (Dashboard CTAs, sidebar items, ⌘K entries) but don't exist yet — Front Desk, Guests, Billing & Folios, Service Requests, and Maintenance — and flip each into `BUILT_ROUTES` so the existing "coming soon" gate lights it up automatically.

**Architecture:** This is not a bug fix. `src/lib/routes.ts` is an already-working feature-flag registry: any route not in `BUILT_ROUTES` renders as a disabled, `pointer-events-none` placeholder everywhere it's linked (`AppSidebar.tsx`, `SmartLink.tsx`, `CommandPalette.tsx`). Building a page and adding its route to the registry is the *entire* integration — no sidebar, dashboard, or command-palette code needs touching beyond that one line (plus two small `CommandPalette` additions noted below). Every new page is a `'use client'` default export under `src/app/app/<route>/page.tsx`, built from the same two list patterns the four existing pages already use: `DataTable` (Reservations, and here Guests/Billing) for sortable/filterable record lists, and `KanbanBoard` (Rooms, Housekeeping, and here Service Requests/Maintenance) for status-workflow boards. Both patterns already handle mobile (card view / horizontal scroll), loading, empty, and error states — no new pattern components are created.

**Tech Stack:** Next.js 16 (App Router), React 19, Zustand (`useUIStore`), the existing `useOptimisticAction` hook for instant-feedback state updates, `sonner` for toasts, Tailwind v4 CSS-token theme, `lucide-react`. No backend exists — all data lives in `src/lib/mock-data.ts`.

**Spec:** This plan implements the "What actually needs to be done" section of the dashboard functionality audit conducted in this conversation. Audit findings, reproduced as constraints below.

## Global Constraints

- **The routing/gating mechanism already works and is not to be redesigned.** `isRouteBuilt()` in `src/lib/routes.ts`, `SmartLink.tsx`, and the `isBuilt` branch in `AppSidebar.tsx` are correct as-is. Every task's only integration step is adding one path string to `BUILT_ROUTES`.
- **No new pattern/primitive components.** Every list view uses `DataTable` (`src/components/patterns/DataTable.tsx`), every board view uses `KanbanBoard` (`src/components/patterns/KanbanBoard.tsx`), every detail view uses `DetailDrawer` (`src/components/patterns/DetailDrawer.tsx`). These three are feature-complete for this plan's needs — read them, don't extend them.
- **All data is mock data extended in `src/lib/mock-data.ts`.** New entities (`MockGuest`, `MockFolio`, `MockServiceRequest`, `MockMaintenanceTicket`) must reuse the same 5 named guests/rooms already established there (Aarav Sharma/102, Elena Rostova/204, Vikram Mehta/301, Sarah Jenkins/105, Rohan Gupta/208) — no new invented guest names, so cross-page detail (e.g. clicking through from Guests to their stay) stays internally consistent.
- **Do not reconcile mock numbers against the Dashboard's hardcoded headline copy** (e.g. "42 in-house guests", "₹32,400 outstanding"). Those are independent placeholder strings on `dashboard/page.tsx`, already inconsistent with the 5-record mock arrays that back the built pages (14 "arrivals today" KPI vs. 2 actual `mockReservations` rows) — that mismatch predates this plan and touching `dashboard/page.tsx` is out of scope.
- **State mutations use `useOptimisticAction`, exactly as `rooms/page.tsx` and `housekeeping/page.tsx` already do** — optimistic update, fake `await new Promise(res => setTimeout(res, 300))`, no rollback path needed since there's no real backend to fail.
- **No test runner exists in this repo** (`package.json` scripts: `dev`, `build`, `start`, `lint` only). Every task's verification is: `npm run lint`, `npx tsc --noEmit`, and a manual check in the dev server (desktop width and mobile ≤480px, confirming `DataTable`'s card view / `KanbanBoard`'s horizontal scroll kick in).
- Reuse existing design tokens only (`bg-surface`, `text-foreground`, `text-status-ok/warn/crit/info`, `border-border`, etc.) — every snippet below already does this by copying the exact classes the four built pages use.
- **`AppSidebar.tsx`, `SmartLink.tsx`, and the four already-built pages (`dashboard`, `reservations`, `rooms`, `housekeeping`) are not modified by this plan.** The only existing file touched repeatedly is `src/lib/routes.ts` (one line per task) and, in three tasks, `src/components/shell/CommandPalette.tsx` (adding a nav entry / fixing one stale hardcoded flag) — both additive, never removing existing entries.

## Route inventory this plan changes

| Route | Task | Page pattern |
|---|---|---|
| `/app/front-desk` | 1 | DataTable |
| `/app/guests` | 2 | DataTable |
| `/app/billing` | 3 | DataTable |
| `/app/service-requests` | 4 | KanbanBoard |
| `/app/maintenance` | 5 | KanbanBoard |

Deferred (no task in this plan) — see "Not included" at the end: `/app/calendar`, `/app/communications`, `/app/restaurant`, `/app/experiences`, `/app/payments`, `/app/rates`, `/app/revenue`, `/app/reports`, `/app/ai`, `/app/automations`, `/app/staff`, `/app/channels`, `/app/settings`.

---

### Task 1: Front Desk

**Files:**
- Create: `src/app/app/front-desk/page.tsx`
- Modify (one line): `src/lib/routes.ts`

**Interfaces:**
- Consumes: `mockReservations`, `MockReservation`, `ReservationStatus` from `@/lib/mock-data` (existing, unchanged); `DataTable`, `Column`, `FilterChip` from `@/components/patterns/DataTable`; `DetailDrawer`, `TabItem` from `@/components/patterns/DetailDrawer`; `useOptimisticAction` from `@/hooks/useOptimisticAction`
- Produces: default-exported `FrontDeskPage`, consumed only by the Next.js router via the file path

- [ ] **Step 1: Create the page**

```tsx
// src/app/app/front-desk/page.tsx
'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { DataTable, Column, FilterChip } from '@/components/patterns/DataTable';
import { DetailDrawer, TabItem } from '@/components/patterns/DetailDrawer';
import { useOptimisticAction } from '@/hooks/useOptimisticAction';
import { mockReservations, mockRooms, MockReservation, ReservationStatus } from '@/lib/mock-data';

const STATUS_COLORS: Record<ReservationStatus, string> = {
  'checked-in': 'bg-status-ok/10 text-status-ok border-status-ok/30',
  confirmed: 'bg-status-info/10 text-status-info border-status-info/30',
  'checked-out': 'bg-surface-2 text-muted-foreground border-border',
  cancelled: 'bg-status-crit/10 text-status-crit border-status-crit/30',
};

function roomReadiness(roomNumber: string): { label: string; className: string } {
  const room = mockRooms.find((r) => r.number === roomNumber);
  if (!room || room.status === 'available') {
    return { label: 'Room ready', className: 'text-status-ok border-status-ok/30 bg-status-ok/5' };
  }
  if (room.status === 'blocked') {
    return { label: 'Room blocked', className: 'text-status-crit border-status-crit/30 bg-status-crit/5' };
  }
  return { label: `Room ${room.status}`, className: 'text-status-warn border-status-warn/30 bg-status-warn/5' };
}

const drawerTabs: TabItem[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'folio', label: 'Folio & Charges' },
];

export default function FrontDeskPage() {
  const { state: reservations, performAction } = useOptimisticAction<MockReservation[]>(mockReservations);
  const [filter, setFilter] = useState('arrivals');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<MockReservation | null>(null);
  const [drawerTab, setDrawerTab] = useState('overview');

  const filterChips: FilterChip[] = [
    { id: 'arrivals', label: 'Arrivals Today', count: reservations.filter((r) => r.checkIn === 'Today' && r.status !== 'cancelled').length },
    { id: 'departures', label: 'Departures Today', count: reservations.filter((r) => r.checkOut === 'Today' && r.status === 'checked-in').length },
    { id: 'in-house', label: 'In-House', count: reservations.filter((r) => r.status === 'checked-in').length },
    { id: 'all', label: 'All Today', count: reservations.filter((r) => r.checkIn === 'Today' || r.checkOut === 'Today' || r.status === 'checked-in').length },
  ];

  const filtered = reservations.filter((r) => {
    if (filter === 'arrivals') return r.checkIn === 'Today' && r.status !== 'cancelled';
    if (filter === 'departures') return r.checkOut === 'Today' && r.status === 'checked-in';
    if (filter === 'in-house') return r.status === 'checked-in';
    return r.checkIn === 'Today' || r.checkOut === 'Today' || r.status === 'checked-in';
  });

  const openDrawer = (item: MockReservation) => {
    setSelected(item);
    setDrawerTab('overview');
    setDrawerOpen(true);
  };

  const handleCheckIn = (item: MockReservation, e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.status === 'checked-in') {
      toast.error(`${item.guestName} is already checked in`);
      return;
    }
    performAction(
      (prev) => prev.map((r) => (r.id === item.id ? { ...r, status: 'checked-in' as const } : r)),
      async () => { await new Promise((res) => setTimeout(res, 300)); }
    );
    toast.success(`${item.guestName} checked in — Room ${item.roomNumber}`);
  };

  const handleCheckOut = (item: MockReservation, e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.status !== 'checked-in') {
      toast.error(`${item.guestName} hasn't checked in yet`);
      return;
    }
    performAction(
      (prev) => prev.map((r) => (r.id === item.id ? { ...r, status: 'checked-out' as const } : r)),
      async () => { await new Promise((res) => setTimeout(res, 300)); }
    );
    toast.success(`${item.guestName} checked out — Room ${item.roomNumber}`);
  };

  const columns: Column<MockReservation>[] = [
    { key: 'guestName', header: 'Guest', sortable: true, render: (r) => <span className="font-medium text-foreground">{r.guestName}</span> },
    { key: 'roomNumber', header: 'Room', sortable: true, render: (r) => <span className="font-mono font-medium px-2 py-0.5 rounded-sm bg-surface-2 border border-border">{r.roomNumber}</span> },
    { key: 'dates', header: 'Stay Dates', render: (r) => <span className="text-muted-foreground">{r.checkIn} – {r.checkOut}</span> },
    {
      key: 'readiness',
      header: 'Room Status',
      render: (r) => (
        <span className={`text-body-sm font-medium ${roomReadiness(r.roomNumber).className.split(' ')[0]}`}>
          {roomReadiness(r.roomNumber).label}
        </span>
      ),
    },
    { key: 'status', header: 'Status', sortable: true, render: (r) => <span className={`px-2 py-0.5 rounded-full text-caption font-medium uppercase border ${STATUS_COLORS[r.status]}`}>{r.status}</span> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-heading-lg font-semibold tracking-tight text-foreground">Front Desk</h1>
        <p className="text-body-sm text-muted-foreground mt-1">
          Today&apos;s arrivals, departures, and in-house guests for Off The Trail — Dalhousie.
        </p>
      </div>

      <DataTable<MockReservation>
        data={filtered}
        columns={columns}
        keyExtractor={(r) => r.id}
        filterChips={filterChips}
        activeFilter={filter}
        onFilterChange={setFilter}
        onRowClick={openDrawer}
        actions={[
          { label: 'Check In', onClick: handleCheckIn },
          { label: 'Check Out', onClick: handleCheckOut },
        ]}
        emptyTitle="Nothing due right now"
        emptyDescription="No arrivals, departures, or in-house guests match this filter."
      />

      <DetailDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selected?.guestName ?? 'Guest'}
        subtitle={selected ? `Room ${selected.roomNumber} · ${selected.id}` : undefined}
        tabs={drawerTabs}
        activeTab={drawerTab}
        onTabChange={setDrawerTab}
        badge={selected && (
          <span className={`font-mono text-caption px-2 py-0.5 rounded-full border uppercase ${STATUS_COLORS[selected.status]}`}>
            {selected.status}
          </span>
        )}
        footerActions={
          <button
            onClick={() => setDrawerOpen(false)}
            className="px-4 py-2 rounded-sm bg-surface-2 border border-border text-foreground hover:bg-border text-body-sm font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        }
      >
        {drawerTab === 'overview' && selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-md bg-surface-2 border border-border">
                <div className="text-caption text-muted-foreground">Room</div>
                <div className="font-mono text-body-lg font-semibold text-foreground mt-0.5">{selected.roomNumber}</div>
              </div>
              <div className="p-3 rounded-md bg-surface-2 border border-border">
                <div className="text-caption text-muted-foreground">Channel</div>
                <div className="text-body-lg font-medium text-foreground mt-0.5">{selected.channel}</div>
              </div>
            </div>
            <div className={`p-3 rounded-md border text-body-sm font-medium ${roomReadiness(selected.roomNumber).className}`}>
              {roomReadiness(selected.roomNumber).label}
            </div>
          </div>
        )}

        {drawerTab === 'folio' && selected && (
          <div className="p-4 rounded-md bg-surface-2 border border-border space-y-3">
            <div className="flex justify-between items-center pt-1 font-semibold">
              <span className="text-body-md text-foreground">Total Balance Due</span>
              <span className="font-mono text-heading-sm text-accent">{selected.amount}</span>
            </div>
          </div>
        )}
      </DetailDrawer>
    </div>
  );
}
```

- [ ] **Step 2: Register the route**

In `src/lib/routes.ts`, add `/app/front-desk` to the set:

```ts
const BUILT_ROUTES = new Set([
  '/app/dashboard',
  '/app/reservations',
  '/app/rooms',
  '/app/housekeeping',
  '/app/front-desk',
]);
```

- [ ] **Step 3: Verify**

Run: `npm run lint` — expect no new errors.
Run: `npx tsc --noEmit` — expect no new errors.
Run: `npm run dev`. Confirm: the sidebar's "Front Desk" item is now a real link (no more `opacity-40`/"Coming Soon" tooltip), the Dashboard's "Open Front Desk Shift" button navigates here, and ⌘K's "Go to Front Desk" is selectable (it was already unconditionally listed, just previously disabled). On the page itself: the "Arrivals Today" chip is selected by default, clicking "Check In" on a confirmed arrival moves it into the "In-House" count immediately (optimistic), clicking "Check Out" on a row that isn't checked in shows an error toast instead of acting, and the table collapses to the card layout at ≤480px width.

- [ ] **Step 4: Commit**

```bash
git add src/app/app/front-desk/page.tsx src/lib/routes.ts
git commit -m "feat(dashboard): build Front Desk page and unlock its route"
```

---

### Task 2: Guests

**Files:**
- Create: `src/app/app/guests/page.tsx`
- Modify: `src/lib/mock-data.ts` — add `MockGuest` type and `mockGuests` array
- Modify: `src/components/shell/CommandPalette.tsx` — add one ⌘K nav entry
- Modify (one line): `src/lib/routes.ts`

**Interfaces:**
- Consumes: `mockReservations` from `@/lib/mock-data` (existing); `DataTable`, `Column`, `FilterChip`; `DetailDrawer`, `TabItem`
- Produces: `MockGuest` interface and `mockGuests: MockGuest[]` in `mock-data.ts`, consumed only by this page (Task 5's Maintenance drawer does not need it)

- [ ] **Step 1: Add the guest entity to mock data**

Append to `src/lib/mock-data.ts`, after the `room204Alert` export at the end of the file:

```ts
export interface MockGuest {
  id: string;
  name: string;
  email: string;
  phone: string;
  vip: boolean;
  totalStays: number;
  lastStay: string;
  totalSpend: string;
  notes?: string;
}

// One row per named guest already used across mockReservations, the
// dashboard, and CommandPalette — kept 1:1 so drilling from a guest into
// their stay history never hits an unknown name.
export const mockGuests: MockGuest[] = [
  { id: 'GST-001', name: 'Aarav Sharma', email: 'aarav.sharma@example.com', phone: '+91 98765 43210', vip: true, totalStays: 4, lastStay: 'Today', totalSpend: '₹58,200', notes: 'Prefers quiet room away from elevator. Requested extra towels via WhatsApp concierge.' },
  { id: 'GST-002', name: 'Elena Rostova', email: 'elena.rostova@example.com', phone: '+91 90000 11223', vip: false, totalStays: 1, lastStay: 'Today', totalSpend: '₹22,500' },
  { id: 'GST-003', name: 'Vikram Mehta', email: 'vikram.mehta@example.com', phone: '+91 98111 22334', vip: false, totalStays: 2, lastStay: 'Tomorrow', totalSpend: '₹32,000' },
  { id: 'GST-004', name: 'Sarah Jenkins', email: 'sarah.jenkins@example.com', phone: '+1 415 555 0132', vip: false, totalStays: 1, lastStay: '25 Aug', totalSpend: '₹12,400' },
  { id: 'GST-005', name: 'Rohan Gupta', email: 'rohan.gupta@example.com', phone: '+91 99887 66554', vip: false, totalStays: 3, lastStay: '27 Aug', totalSpend: '₹31,000' },
];
```

- [ ] **Step 2: Create the page**

```tsx
// src/app/app/guests/page.tsx
'use client';

import React, { useState } from 'react';
import { DataTable, Column, FilterChip } from '@/components/patterns/DataTable';
import { DetailDrawer, TabItem } from '@/components/patterns/DetailDrawer';
import { mockGuests, mockReservations, MockGuest } from '@/lib/mock-data';

const columns: Column<MockGuest>[] = [
  {
    key: 'name',
    header: 'Guest',
    sortable: true,
    render: (g) => (
      <div className="flex items-center gap-2">
        <span className="font-medium text-foreground">{g.name}</span>
        {g.vip && <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-accent/20 text-accent font-bold">VIP</span>}
      </div>
    ),
  },
  { key: 'email', header: 'Contact', render: (g) => <span className="text-muted-foreground">{g.email}</span> },
  { key: 'totalStays', header: 'Stays', align: 'center', sortable: true, render: (g) => <span className="font-mono">{g.totalStays}</span> },
  { key: 'lastStay', header: 'Last Stay', sortable: true, render: (g) => <span className="text-muted-foreground">{g.lastStay}</span> },
  { key: 'totalSpend', header: 'Total Spend', align: 'right', sortable: true, render: (g) => <span className="font-mono font-semibold text-foreground">{g.totalSpend}</span> },
];

const drawerTabs: TabItem[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'stays', label: 'Stay History' },
];

export default function GuestsPage() {
  const [filter, setFilter] = useState('all');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<MockGuest | null>(null);
  const [drawerTab, setDrawerTab] = useState('overview');

  const inHouseNames = new Set(mockReservations.filter((r) => r.status === 'checked-in').map((r) => r.guestName));

  const filterChips: FilterChip[] = [
    { id: 'all', label: 'All Guests', count: mockGuests.length },
    { id: 'vip', label: 'VIP', count: mockGuests.filter((g) => g.vip).length },
    { id: 'in-house', label: 'In-House', count: mockGuests.filter((g) => inHouseNames.has(g.name)).length },
  ];

  const filtered = mockGuests.filter((g) => {
    if (filter === 'vip') return g.vip;
    if (filter === 'in-house') return inHouseNames.has(g.name);
    return true;
  });

  const openDrawer = (item: MockGuest) => {
    setSelected(item);
    setDrawerTab('overview');
    setDrawerOpen(true);
  };

  const guestReservations = selected ? mockReservations.filter((r) => r.guestName === selected.name) : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-heading-lg font-semibold tracking-tight text-foreground">Guests</h1>
        <p className="text-body-sm text-muted-foreground mt-1">
          Every guest on file for Off The Trail — Dalhousie.
        </p>
      </div>

      <DataTable<MockGuest>
        data={filtered}
        columns={columns}
        keyExtractor={(g) => g.id}
        filterChips={filterChips}
        activeFilter={filter}
        onFilterChange={setFilter}
        onRowClick={openDrawer}
        emptyTitle="No guests found"
        emptyDescription="No guests match this filter yet."
      />

      <DetailDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selected?.name ?? 'Guest'}
        subtitle={selected?.email}
        tabs={drawerTabs}
        activeTab={drawerTab}
        onTabChange={setDrawerTab}
        badge={selected?.vip && (
          <span className="font-mono text-caption px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30 uppercase">VIP</span>
        )}
        footerActions={
          <button
            onClick={() => setDrawerOpen(false)}
            className="px-4 py-2 rounded-sm bg-surface-2 border border-border text-foreground hover:bg-border text-body-sm font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        }
      >
        {drawerTab === 'overview' && selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-md bg-surface-2 border border-border">
                <div className="text-caption text-muted-foreground">Phone</div>
                <div className="text-body-lg font-medium text-foreground mt-0.5">{selected.phone}</div>
              </div>
              <div className="p-3 rounded-md bg-surface-2 border border-border">
                <div className="text-caption text-muted-foreground">Total Spend</div>
                <div className="font-mono text-body-lg font-semibold text-foreground mt-0.5">{selected.totalSpend}</div>
              </div>
            </div>
            {selected.notes && (
              <div className="p-4 rounded-md bg-surface-2 border border-border space-y-2">
                <h5 className="text-body-md font-semibold text-foreground">Notes</h5>
                <p className="text-body-sm text-muted-foreground">{selected.notes}</p>
              </div>
            )}
          </div>
        )}

        {drawerTab === 'stays' && (
          <div className="space-y-2.5">
            {guestReservations.length === 0 && (
              <p className="text-body-sm text-muted-foreground italic">No reservations on file.</p>
            )}
            {guestReservations.map((r) => (
              <div key={r.id} className="p-3 rounded-md bg-surface-2 border border-border flex items-center justify-between text-body-sm">
                <div>
                  <div className="font-medium text-foreground">Room {r.roomNumber} · {r.channel}</div>
                  <div className="text-caption text-muted-foreground font-mono">{r.checkIn} – {r.checkOut}</div>
                </div>
                <span className="font-mono font-semibold text-foreground">{r.amount}</span>
              </div>
            ))}
          </div>
        )}
      </DetailDrawer>
    </div>
  );
}
```

- [ ] **Step 3: Add a ⌘K entry**

In `src/components/shell/CommandPalette.tsx`, `User` is already imported from `lucide-react` (used by `quickEntities`). Add one line to `navigationItems`:

```ts
  const navigationItems = [
    { label: 'Go to Dashboard', href: '/app/dashboard', icon: Sparkles },
    { label: 'Go to Reservations', href: '/app/reservations', icon: BookOpen },
    { label: 'Go to Rooms', href: '/app/rooms', icon: Bed },
    { label: 'Go to Housekeeping Board', href: '/app/housekeeping', icon: Sparkles },
    { label: 'Go to Front Desk', href: '/app/front-desk', icon: BookOpen },
    { label: 'Go to Guests', href: '/app/guests', icon: User },
    { label: 'Go to Calendar', href: '/app/calendar', icon: Bed },
    { label: 'Go to AI Command Centre', href: '/app/ai', icon: Sparkles },
    { label: 'Go to Billing & Folios', href: '/app/billing', icon: BookOpen },
  ];
```

- [ ] **Step 4: Register the route**

In `src/lib/routes.ts`:

```ts
const BUILT_ROUTES = new Set([
  '/app/dashboard',
  '/app/reservations',
  '/app/rooms',
  '/app/housekeeping',
  '/app/front-desk',
  '/app/guests',
]);
```

- [ ] **Step 5: Verify**

Run: `npm run lint`, `npx tsc --noEmit`. In the dev server, confirm the sidebar "Guests" item and the Dashboard's "In-House Guests" KPI card both navigate here now. Confirm the "VIP" chip shows exactly Aarav Sharma, clicking a row opens the drawer, and the "Stay History" tab lists that guest's `mockReservations` rows (Aarav → 1 row, RES-8921). Confirm ⌘K's new "Go to Guests" entry navigates and closes the palette. Confirm the card layout at ≤480px.

- [ ] **Step 6: Commit**

```bash
git add src/app/app/guests/page.tsx src/lib/mock-data.ts src/components/shell/CommandPalette.tsx src/lib/routes.ts
git commit -m "feat(dashboard): build Guests page and unlock its route"
```

---

### Task 3: Billing & Folios

**Files:**
- Create: `src/app/app/billing/page.tsx`
- Modify: `src/lib/mock-data.ts` — add `MockFolio` type and `mockFolios` array
- Modify (one line): `src/lib/routes.ts`

**Interfaces:**
- Consumes: `DataTable`, `Column`, `FilterChip`; `DetailDrawer`; `useOptimisticAction`
- Produces: `MockFolio`, `FolioStatus`, `mockFolios` in `mock-data.ts`

- [ ] **Step 1: Add the folio entity to mock data**

Append to `src/lib/mock-data.ts`, after `mockGuests` (Task 2):

```ts
export type FolioStatus = 'outstanding' | 'partial' | 'paid';

export interface MockFolio {
  id: string;
  guestName: string;
  roomNumber: string;
  reservationId: string;
  charges: { label: string; amount: number }[];
  totalPaid: number;
  status: FolioStatus;
}

export const mockFolios: MockFolio[] = [
  { id: 'FOL-442', guestName: 'Aarav Sharma', roomNumber: '102', reservationId: 'RES-8921', charges: [{ label: 'Room Charges', amount: 14200 }, { label: 'Restaurant', amount: 2200 }], totalPaid: 14200, status: 'partial' },
  { id: 'FOL-443', guestName: 'Elena Rostova', roomNumber: '204', reservationId: 'RES-8922', charges: [{ label: 'Room Charges', amount: 22500 }], totalPaid: 0, status: 'outstanding' },
  { id: 'FOL-444', guestName: 'Vikram Mehta', roomNumber: '301', reservationId: 'RES-8923', charges: [{ label: 'Room Charges', amount: 18000 }], totalPaid: 18000, status: 'paid' },
  { id: 'FOL-445', guestName: 'Sarah Jenkins', roomNumber: '105', reservationId: 'RES-8924', charges: [{ label: 'Room Charges', amount: 12400 }], totalPaid: 12400, status: 'paid' },
  { id: 'FOL-446', guestName: 'Rohan Gupta', roomNumber: '208', reservationId: 'RES-8925', charges: [{ label: 'Room Charges', amount: 31000 }], totalPaid: 0, status: 'outstanding' },
];
```

- [ ] **Step 2: Create the page**

```tsx
// src/app/app/billing/page.tsx
'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { DataTable, Column, FilterChip } from '@/components/patterns/DataTable';
import { DetailDrawer } from '@/components/patterns/DetailDrawer';
import { useOptimisticAction } from '@/hooks/useOptimisticAction';
import { mockFolios, MockFolio, FolioStatus } from '@/lib/mock-data';

const STATUS_COLORS: Record<FolioStatus, string> = {
  outstanding: 'bg-status-crit/10 text-status-crit border-status-crit/30',
  partial: 'bg-status-warn/10 text-status-warn border-status-warn/30',
  paid: 'bg-status-ok/10 text-status-ok border-status-ok/30',
};

function folioTotal(folio: MockFolio): number {
  return folio.charges.reduce((sum, c) => sum + c.amount, 0);
}
function folioBalance(folio: MockFolio): number {
  return folioTotal(folio) - folio.totalPaid;
}
function formatINR(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export default function BillingPage() {
  const { state: folios, performAction } = useOptimisticAction<MockFolio[]>(mockFolios);
  const [filter, setFilter] = useState('outstanding');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<MockFolio | null>(null);

  const filterChips: FilterChip[] = [
    { id: 'all', label: 'All Folios', count: folios.length },
    { id: 'outstanding', label: 'Outstanding', count: folios.filter((f) => f.status !== 'paid').length },
    { id: 'paid', label: 'Paid', count: folios.filter((f) => f.status === 'paid').length },
  ];

  const filtered = folios.filter((f) => {
    if (filter === 'outstanding') return f.status !== 'paid';
    if (filter === 'paid') return f.status === 'paid';
    return true;
  });

  const openDrawer = (item: MockFolio) => {
    setSelected(item);
    setDrawerOpen(true);
  };

  const handleRecordPayment = (folio: MockFolio) => {
    const balance = folioBalance(folio);
    if (balance <= 0) {
      toast.error(`${folio.guestName}'s folio is already settled`);
      return;
    }
    performAction(
      (prev) => prev.map((f) => (f.id === folio.id ? { ...f, totalPaid: folioTotal(f), status: 'paid' as const } : f)),
      async () => { await new Promise((res) => setTimeout(res, 300)); }
    );
    toast.success(`Recorded ${formatINR(balance)} payment for ${folio.guestName}`);
    setDrawerOpen(false);
  };

  const columns: Column<MockFolio>[] = [
    { key: 'id', header: 'Folio', sortable: true, render: (f) => <span className="font-mono text-muted-foreground">{f.id}</span> },
    { key: 'guestName', header: 'Guest', sortable: true, render: (f) => <span className="font-medium text-foreground">{f.guestName}</span> },
    { key: 'roomNumber', header: 'Room', sortable: true, render: (f) => <span className="font-mono font-medium px-2 py-0.5 rounded-sm bg-surface-2 border border-border">{f.roomNumber}</span> },
    { key: 'total', header: 'Total', align: 'right', sortable: true, render: (f) => <span className="font-mono text-foreground">{formatINR(folioTotal(f))}</span> },
    { key: 'balance', header: 'Balance Due', align: 'right', sortable: true, render: (f) => <span className="font-mono font-semibold text-foreground">{formatINR(folioBalance(f))}</span> },
    { key: 'status', header: 'Status', sortable: true, render: (f) => <span className={`px-2 py-0.5 rounded-full text-caption font-medium uppercase border ${STATUS_COLORS[f.status]}`}>{f.status}</span> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-heading-lg font-semibold tracking-tight text-foreground">Billing &amp; Folios</h1>
        <p className="text-body-sm text-muted-foreground mt-1">
          Guest folios and outstanding balances for Off The Trail — Dalhousie.
        </p>
      </div>

      <DataTable<MockFolio>
        data={filtered}
        columns={columns}
        keyExtractor={(f) => f.id}
        filterChips={filterChips}
        activeFilter={filter}
        onFilterChange={setFilter}
        onRowClick={openDrawer}
        actions={[{ label: 'Record Payment', onClick: (f, e) => { e.stopPropagation(); handleRecordPayment(f); } }]}
        bulkActions={[
          { label: 'Send Payment Reminder', onClick: (items) => toast.success(`Reminder sent for ${items.length} folios`) },
        ]}
        emptyTitle="No folios found"
        emptyDescription="No folios match this filter."
      />

      <DetailDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selected?.guestName ?? 'Folio'}
        subtitle={selected ? `${selected.id} · Room ${selected.roomNumber}` : undefined}
        badge={selected && (
          <span className={`font-mono text-caption px-2 py-0.5 rounded-full border uppercase ${STATUS_COLORS[selected.status]}`}>
            {selected.status}
          </span>
        )}
        footerActions={
          <>
            <button
              onClick={() => setDrawerOpen(false)}
              className="px-4 py-2 rounded-sm bg-surface-2 border border-border text-foreground hover:bg-border text-body-sm font-medium transition-colors cursor-pointer"
            >
              Close
            </button>
            {selected && folioBalance(selected) > 0 && (
              <button
                onClick={() => handleRecordPayment(selected)}
                className="px-4 py-2 rounded-sm bg-accent text-accent-foreground text-body-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
              >
                Record Payment
              </button>
            )}
          </>
        }
      >
        {selected && (
          <div className="p-4 rounded-md bg-surface-2 border border-border space-y-3">
            {selected.charges.map((c, i) => (
              <div key={i} className="flex justify-between items-center border-b border-border pb-2 last:border-0 last:pb-0">
                <span className="text-body-sm text-muted-foreground">{c.label}</span>
                <span className="font-mono font-medium text-foreground">{formatINR(c.amount)}</span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-2 font-semibold">
              <span className="text-body-md text-foreground">Balance Due</span>
              <span className="font-mono text-heading-sm text-accent">{formatINR(folioBalance(selected))}</span>
            </div>
          </div>
        )}
      </DetailDrawer>
    </div>
  );
}
```

- [ ] **Step 3: Register the route**

In `src/lib/routes.ts`:

```ts
const BUILT_ROUTES = new Set([
  '/app/dashboard',
  '/app/reservations',
  '/app/rooms',
  '/app/housekeeping',
  '/app/front-desk',
  '/app/guests',
  '/app/billing',
]);
```

- [ ] **Step 4: Verify**

Run: `npm run lint`, `npx tsc --noEmit`. Confirm: the sidebar "Billing" item and the Dashboard's "₹32,400 outstanding..." Needs Attention link both navigate here now (⌘K's "Go to Billing & Folios" was already listed, just previously disabled — no CommandPalette edit needed for this task). Confirm "Record Payment" on an outstanding folio flips its status to `paid` and its balance to ₹0 immediately, and clicking it again shows the "already settled" error toast. Confirm the "Outstanding" chip is selected by default and its count drops by one after a payment is recorded.

- [ ] **Step 5: Commit**

```bash
git add src/app/app/billing/page.tsx src/lib/mock-data.ts src/lib/routes.ts
git commit -m "feat(dashboard): build Billing & Folios page and unlock its route"
```

---

### Task 4: Service Requests

**Files:**
- Create: `src/app/app/service-requests/page.tsx`
- Modify: `src/lib/mock-data.ts` — add `MockServiceRequest` type and `mockServiceRequests` array
- Modify: `src/components/shell/CommandPalette.tsx` — add one ⌘K nav entry + one icon import
- Modify (one line): `src/lib/routes.ts`

**Interfaces:**
- Consumes: `KanbanBoard`, `KanbanColumn`, `KanbanItem` from `@/components/patterns/KanbanBoard`; `DetailDrawer`; `useOptimisticAction`; `TaskPriority` (existing type from `mock-data.ts`)
- Produces: `MockServiceRequest`, `mockServiceRequests` in `mock-data.ts`

- [ ] **Step 1: Add the service-request entity to mock data**

Append to `src/lib/mock-data.ts`, after `mockFolios` (Task 3). This reuses the existing `TaskPriority` type from the Housekeeping section above it — do not redefine it:

```ts
export type ServiceRequestStatus = 'open' | 'in-progress' | 'resolved';
export type ServiceRequestCategory = 'Housekeeping' | 'Maintenance' | 'F&B' | 'Concierge';

export interface MockServiceRequest {
  id: string;
  roomNumber: string;
  guestName: string;
  title: string;
  category: ServiceRequestCategory;
  status: ServiceRequestStatus;
  priority: TaskPriority;
  waitingSince: string;
  assignee?: { name: string; initials: string };
}

// SR-501 and SR-502 are the "2 guest requests waiting > 20 min" the
// Dashboard's Needs Attention feed already references.
export const mockServiceRequests: MockServiceRequest[] = [
  { id: 'SR-501', roomNumber: '204', guestName: 'Elena Rostova', title: 'Extra towels requested', category: 'Housekeeping', status: 'open', priority: 'urgent', waitingSince: '22 min ago' },
  { id: 'SR-502', roomNumber: '102', guestName: 'Aarav Sharma', title: 'Late checkout to 1:00 PM', category: 'Concierge', status: 'open', priority: 'high', waitingSince: '21 min ago' },
  { id: 'SR-503', roomNumber: '301', guestName: 'Vikram Mehta', title: 'Room service — breakfast for 2', category: 'F&B', status: 'in-progress', priority: 'normal', waitingSince: '8 min ago', assignee: { name: 'Rahul V.', initials: 'RV' } },
  { id: 'SR-504', roomNumber: '105', guestName: 'Sarah Jenkins', title: 'AC not cooling', category: 'Maintenance', status: 'resolved', priority: 'normal', waitingSince: '1 hr ago', assignee: { name: 'Manoj K.', initials: 'MK' } },
];
```

- [ ] **Step 2: Create the page**

```tsx
// src/app/app/service-requests/page.tsx
'use client';

import React, { useState } from 'react';
import { KanbanBoard, KanbanColumn, KanbanItem } from '@/components/patterns/KanbanBoard';
import { DetailDrawer } from '@/components/patterns/DetailDrawer';
import { useOptimisticAction } from '@/hooks/useOptimisticAction';
import { mockServiceRequests } from '@/lib/mock-data';

const columns: KanbanColumn[] = [
  { id: 'open', title: 'Open' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'resolved', title: 'Resolved' },
];

const initialItems: KanbanItem[] = mockServiceRequests.map((r) => ({
  id: r.id,
  title: r.title,
  subtitle: `Room ${r.roomNumber} · ${r.guestName}`,
  status: r.status,
  priority: r.priority,
  assignee: r.assignee,
  meta: r.waitingSince,
}));

export default function ServiceRequestsPage() {
  const { state: items, performAction } = useOptimisticAction<KanbanItem[]>(initialItems);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<KanbanItem | null>(null);

  const handleItemMove = (itemId: string, targetStatus: string) => {
    performAction(
      (prev) => prev.map((it) => (it.id === itemId ? { ...it, status: targetStatus } : it)),
      async () => { await new Promise((res) => setTimeout(res, 300)); }
    );
  };

  const requestMeta = selected ? mockServiceRequests.find((r) => r.id === selected.id) : undefined;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-heading-lg font-semibold tracking-tight text-foreground">Service Requests</h1>
        <p className="text-body-sm text-muted-foreground mt-1">
          {items.filter((i) => i.status !== 'resolved').length} open guest requests. Drag a card to advance it.
        </p>
      </div>

      <KanbanBoard
        columns={columns}
        items={items}
        onItemMove={handleItemMove}
        onItemClick={(item) => { setSelected(item); setDrawerOpen(true); }}
      />

      <DetailDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selected?.title ?? 'Request'}
        subtitle={selected?.subtitle}
        badge={selected && (
          <span className="font-mono text-caption px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30 uppercase">
            {selected.status}
          </span>
        )}
        footerActions={
          <button
            onClick={() => setDrawerOpen(false)}
            className="px-4 py-2 rounded-sm bg-surface-2 border border-border text-foreground hover:bg-border text-body-sm font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        }
      >
        <div className="space-y-3 text-body-sm">
          <div className="flex justify-between p-3 rounded-md bg-surface-2 border border-border">
            <span className="text-muted-foreground">Category</span>
            <span className="font-medium text-foreground">{requestMeta?.category}</span>
          </div>
          <div className="flex justify-between p-3 rounded-md bg-surface-2 border border-border">
            <span className="text-muted-foreground">Waiting since</span>
            <span className="font-medium text-foreground">{requestMeta?.waitingSince}</span>
          </div>
          <p className="text-muted-foreground">
            Assigned to {selected?.assignee?.name ?? 'nobody yet'}.
          </p>
        </div>
      </DetailDrawer>
    </div>
  );
}
```

- [ ] **Step 3: Add a ⌘K entry**

In `src/components/shell/CommandPalette.tsx`, add `ClipboardList` to the `lucide-react` import:

```ts
import { Bed, BookOpen, User, Sparkles, ClipboardList } from 'lucide-react';
```

Add one line to `navigationItems` (after the Guests entry added in Task 2):

```ts
    { label: 'Go to Service Requests', href: '/app/service-requests', icon: ClipboardList },
```

- [ ] **Step 4: Register the route**

In `src/lib/routes.ts`:

```ts
const BUILT_ROUTES = new Set([
  '/app/dashboard',
  '/app/reservations',
  '/app/rooms',
  '/app/housekeeping',
  '/app/front-desk',
  '/app/guests',
  '/app/billing',
  '/app/service-requests',
]);
```

- [ ] **Step 5: Verify**

Run: `npm run lint`, `npx tsc --noEmit`. Confirm the sidebar "Service Requests" item and the Dashboard's "2 guest requests waiting > 20 min" link both navigate here. Confirm dragging SR-501 from "Open" to "In Progress" animates via the existing Flip transition (same as Housekeeping) and updates the open-count in the page subtitle. Confirm ⌘K's new "Go to Service Requests" entry works.

- [ ] **Step 6: Commit**

```bash
git add src/app/app/service-requests/page.tsx src/lib/mock-data.ts src/components/shell/CommandPalette.tsx src/lib/routes.ts
git commit -m "feat(dashboard): build Service Requests page and unlock its route"
```

---

### Task 5: Maintenance

**Files:**
- Create: `src/app/app/maintenance/page.tsx`
- Modify: `src/lib/mock-data.ts` — add `MockMaintenanceTicket` type and `mockMaintenanceTickets` array
- Modify: `src/components/shell/CommandPalette.tsx` — add one ⌘K nav entry, one icon import, and fix one stale hardcoded flag (see Step 4)
- Modify (one line): `src/lib/routes.ts`

**Interfaces:**
- Consumes: `KanbanBoard`, `KanbanColumn`, `KanbanItem`; `DetailDrawer`; `useOptimisticAction`; `room204Alert`, `TaskPriority` (existing, from `mock-data.ts`)
- Produces: `MockMaintenanceTicket`, `mockMaintenanceTickets` in `mock-data.ts`

- [ ] **Step 1: Add the maintenance entity to mock data**

Append to `src/lib/mock-data.ts`, after `mockServiceRequests` (Task 4). The first ticket reuses `room204Alert` — the same emergency the Dashboard's "1 Maintenance emergency — Room 204" line and CommandPalette's Room 204 quick-entity already point at:

```ts
export type MaintenanceStatus = 'reported' | 'in-progress' | 'resolved';

export interface MockMaintenanceTicket {
  id: string;
  roomNumber: string;
  title: string;
  detail: string;
  status: MaintenanceStatus;
  priority: TaskPriority;
  reportedAt: string;
  assignee?: { name: string; initials: string };
}

export const mockMaintenanceTickets: MockMaintenanceTicket[] = [
  { id: 'MT-901', roomNumber: room204Alert.roomNumber, title: 'Bathroom leak', detail: room204Alert.detail, status: 'reported', priority: 'urgent', reportedAt: '12 min ago' },
  { id: 'MT-902', roomNumber: '105', title: 'AC not cooling', detail: 'Guest reports the AC unit is running but not cooling the room.', status: 'in-progress', priority: 'high', reportedAt: '1 hr ago', assignee: { name: 'Manoj K.', initials: 'MK' } },
  { id: 'MT-903', roomNumber: '303', title: 'Bathroom tap dripping', detail: 'Slow drip reported by housekeeping during turnover.', status: 'resolved', priority: 'low', reportedAt: 'Yesterday', assignee: { name: 'Rahul V.', initials: 'RV' } },
];
```

- [ ] **Step 2: Create the page**

```tsx
// src/app/app/maintenance/page.tsx
'use client';

import React, { useState } from 'react';
import { KanbanBoard, KanbanColumn, KanbanItem } from '@/components/patterns/KanbanBoard';
import { DetailDrawer } from '@/components/patterns/DetailDrawer';
import { useOptimisticAction } from '@/hooks/useOptimisticAction';
import { mockMaintenanceTickets } from '@/lib/mock-data';

const columns: KanbanColumn[] = [
  { id: 'reported', title: 'Reported' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'resolved', title: 'Resolved' },
];

const initialItems: KanbanItem[] = mockMaintenanceTickets.map((t) => ({
  id: t.id,
  title: `${t.title} — Room ${t.roomNumber}`,
  subtitle: t.detail,
  status: t.status,
  priority: t.priority,
  assignee: t.assignee,
  meta: t.reportedAt,
}));

export default function MaintenancePage() {
  const { state: items, performAction } = useOptimisticAction<KanbanItem[]>(initialItems);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<KanbanItem | null>(null);

  const handleItemMove = (itemId: string, targetStatus: string) => {
    performAction(
      (prev) => prev.map((it) => (it.id === itemId ? { ...it, status: targetStatus } : it)),
      async () => { await new Promise((res) => setTimeout(res, 300)); }
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-heading-lg font-semibold tracking-tight text-foreground">Maintenance</h1>
        <p className="text-body-sm text-muted-foreground mt-1">
          {items.filter((i) => i.status !== 'resolved').length} open tickets. Drag a card to advance it.
        </p>
      </div>

      <KanbanBoard
        columns={columns}
        items={items}
        onItemMove={handleItemMove}
        onItemClick={(item) => { setSelected(item); setDrawerOpen(true); }}
      />

      <DetailDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selected?.title ?? 'Ticket'}
        badge={selected && (
          <span className="font-mono text-caption px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30 uppercase">
            {selected.status}
          </span>
        )}
        footerActions={
          <button
            onClick={() => setDrawerOpen(false)}
            className="px-4 py-2 rounded-sm bg-surface-2 border border-border text-foreground hover:bg-border text-body-sm font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        }
      >
        <p className="text-body-sm text-muted-foreground">{selected?.subtitle}</p>
        <p className="text-body-sm text-muted-foreground">
          Assigned to {selected?.assignee?.name ?? 'nobody yet'}.
        </p>
      </DetailDrawer>
    </div>
  );
}
```

- [ ] **Step 3: Add a ⌘K entry**

In `src/components/shell/CommandPalette.tsx`, add `Wrench` to the `lucide-react` import (alongside `ClipboardList` added in Task 4):

```ts
import { Bed, BookOpen, User, Sparkles, ClipboardList, Wrench } from 'lucide-react';
```

Add one line to `navigationItems` (after the Service Requests entry added in Task 4):

```ts
    { label: 'Go to Maintenance', href: '/app/maintenance', icon: Wrench },
```

- [ ] **Step 4: Fix the stale hardcoded `built: false` on the Room 204 quick-entity**

`quickEntities`' comment currently says all three entries are "always dynamic detail routes StayO hasn't built yet" — that was true when it was written, but the Room 204 entry points at `/app/maintenance`, the static list page this task just built, not a dynamic detail route. Left as `built: false`, this one link would stay permanently disabled even after the page ships — the exact bug this whole plan is about, reintroduced by omission. Update the comment and that one entry to read off the shared registry, same as `navigationItems` does. The other two entries (Aarav's and Elena's dynamic detail links) are genuinely unbuilt and stay hardcoded `false`:

```ts
  // Aarav's and Elena's links below are dynamic detail routes StayO hasn't
  // built yet — isRouteBuilt only knows static paths, so those two stay
  // hardcoded unbuilt. Room 204's link points at the (now-built) static
  // Maintenance list page, so it reads off the shared registry instead.
  const quickEntities = [
    { label: `${aarav.guestName} (Room ${aarav.roomNumber} – In-House)`, href: `/app/guests/${aarav.roomNumber}`, icon: User, type: 'Guest', built: false },
    { label: `${elena.guestName} (Room ${elena.roomNumber} – Arrival Today)`, href: '/app/reservations/8922', icon: BookOpen, type: 'Reservation', built: false },
    { label: `Room ${room204Alert.roomNumber} (Maintenance Emergency)`, href: '/app/maintenance', icon: Bed, type: 'Room', built: isRouteBuilt('/app/maintenance') },
  ];
```

- [ ] **Step 5: Register the route**

In `src/lib/routes.ts`:

```ts
const BUILT_ROUTES = new Set([
  '/app/dashboard',
  '/app/reservations',
  '/app/rooms',
  '/app/housekeeping',
  '/app/front-desk',
  '/app/guests',
  '/app/billing',
  '/app/service-requests',
  '/app/maintenance',
]);
```

- [ ] **Step 6: Verify**

Run: `npm run lint`, `npx tsc --noEmit`. Confirm the sidebar "Maintenance" item and the Dashboard's "1 Maintenance emergency — Room 204" link both navigate here, landing on a board whose "Reported" column contains the Room 204 bathroom-leak ticket. Confirm ⌘K: the new "Go to Maintenance" nav entry works, **and** the "Room 204 (Maintenance Emergency)" quick-entity under "Guests & Reservations" is now selectable (previously showed a permanent "Coming soon" badge) and navigates to `/app/maintenance`.

- [ ] **Step 7: Commit**

```bash
git add src/app/app/maintenance/page.tsx src/lib/mock-data.ts src/components/shell/CommandPalette.tsx src/lib/routes.ts
git commit -m "feat(dashboard): build Maintenance page, unlock its route, and fix its stale Command Palette entry"
```

---

### Task 6: Full verification pass

**Files:** none (verification only)

**Interfaces:** none

- [ ] **Step 1: Confirm the route registry**

Read `src/lib/routes.ts` and confirm `BUILT_ROUTES` now contains exactly 9 entries: the original 4 (`dashboard`, `reservations`, `rooms`, `housekeeping`) plus the 5 built in this plan (`front-desk`, `guests`, `billing`, `service-requests`, `maintenance`).

- [ ] **Step 2: Full lint + typecheck**

Run: `npm run lint` — expect zero errors across the whole repo, not just the touched files.
Run: `npx tsc --noEmit` — expect zero errors across the whole repo.

- [ ] **Step 3: Click-through every sidebar item**

Run: `npm run dev`. In the browser, click every item in every sidebar group top to bottom:
- **Overview:** Dashboard (works), Calendar (still "Coming Soon" — expected, deferred)
- **Operations:** Front Desk (works), Reservations (works), Guests (works)
- **Property:** Rooms (works), Housekeeping (works), Maintenance (works)
- **Guest Experience:** Communications, Service Requests (works), Restaurant, Experiences (all still "Coming Soon" except Service Requests — expected)
- **Revenue:** Billing (works), Payments, Rates, Revenue, Reports (all still "Coming Soon" except Billing — expected)
- **AI & Automation, Admin:** all still "Coming Soon" — expected, deferred

Confirm none of the 9 now-built items show the disabled/opacity-40 state, and none of the remaining 13 accidentally became clickable.

- [ ] **Step 4: Click-through every Dashboard link**

On `/app/dashboard`, click: "Open Front Desk Shift", all 5 KPI cards (Occupancy → Calendar, still disabled — expected; Arrivals/Departures → Reservations; In-House Guests → Guests; Revenue → Revenue, still disabled — expected), all 5 "Needs Attention" row links (Housekeeping, Billing, Service Requests, Maintenance, Reservations), and "Manage Rooms →". Confirm each built target navigates and each still-deferred target (Calendar, Revenue) shows its disabled state without erroring.

- [ ] **Step 5: Mobile pass**

At ≤480px width (DevTools device toolbar), confirm the mobile sidebar Sheet drawer lists the same 9 working / 13 disabled items correctly, and that Front Desk, Guests, and Billing render as stacked cards (not a horizontally-scrolled table) while Service Requests and Maintenance keep the Kanban board's horizontal column scroll.

- [ ] **Step 6: Commit**

Only if Step 1–5 required any fixes (this task is verification-only; if everything passes, there's nothing to commit):

```bash
git add -A
git commit -m "fix(dashboard): address issues found in full verification pass"
```

---

## Self-review

**Spec coverage** — all 5 routes named in the audit's "highest-value next builds" list (Front Desk, Guests, Billing/Payments, Service Requests, Maintenance) map to a task. "Payments" from the audit is folded into Task 3 (Billing & Folios) rather than a separate page — the Dashboard only links `/app/billing`, not `/app/payments`, and a folio *is* where payments get recorded in this data model, so a separate Payments page would have no existing surface pointing at it and no distinct data to show.

**Placeholder scan** — every step contains complete, copy-pasteable code. The only deferred content is the 13 lower-priority routes, explicitly listed in "Not included" below rather than stubbed.

**Type consistency** — `MockReservation`/`ReservationStatus` (Task 1), `MockGuest` (Task 2), `MockFolio`/`FolioStatus` (Task 3), `MockServiceRequest`/`ServiceRequestStatus`/`ServiceRequestCategory` (Task 4), and `MockMaintenanceTicket`/`MaintenanceStatus` (Task 5) are each defined once, in `mock-data.ts`, and imported by name everywhere they're used — no task redefines another task's type. All five new pages reuse the same `TabItem`/`Column`/`FilterChip`/`KanbanColumn`/`KanbanItem` interfaces already exported by the three pattern components, unchanged. `isRouteBuilt` (Task 5, Step 4) is imported from `@/lib/routes` in `CommandPalette.tsx` — already imported there today (see the file's existing `import { isRouteBuilt } from '@/lib/routes';`), so no new import is needed for that specific call.

## Not included in this plan

The remaining 13 sidebar items stay gated behind "Coming Soon" after this plan ships, deliberately:

| Route | Why deferred |
|---|---|
| `/app/calendar` | No page-specific spec yet — needs a decision on whether it's a new calendar view or a redirect to Reservations' date-filtered view |
| `/app/communications`, `/app/restaurant`, `/app/experiences` | No existing UI links to these (unlike the 5 built here, nothing on the Dashboard or elsewhere currently points at them) |
| `/app/payments`, `/app/rates`, `/app/revenue`, `/app/reports` | Overlap with Billing (Task 3) and the Dashboard's Revenue KPI; each needs its own scope decision before a page is designed, not just built |
| `/app/ai`, `/app/automations` | Product-level scope undefined — "StayO AI Recommendations" already lives inline on the Dashboard; a standalone AI Command page needs a decision on what it adds beyond that |
| `/app/staff`, `/app/channels`, `/app/settings` | Admin-tier pages with no mock data model yet and no urgency signal (nothing currently links to them except the sidebar) |

Each is a reasonable candidate for a follow-up plan once there's a concrete spec for what it shows — building UI ahead of that would mean guessing at product decisions this plan has no basis for.
