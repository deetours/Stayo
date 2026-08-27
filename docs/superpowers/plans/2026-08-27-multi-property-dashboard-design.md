# Multi-Property Data Scoping + Dashboard Truth + Color Hierarchy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace StayO's hardcoded dashboard numbers and single-property mock data with a real `propertyDatasets` map (3 properties) read through one `usePropertyData()` hook, so every KPI, badge, and list on every page is derived from the same in-memory data and the property switcher in `AppTopBar` actually changes what every page shows.

**Architecture:** A Zustand `persist` store (`usePropertyStore`) holds the active property id in localStorage. `mock-data.ts` exposes `propertyDatasets: Record<PropertyId, PropertyDataset>` and a `usePropertyData()` hook that reads the active id and returns that property's bundle. Twelve consuming files swap their module-level `mock-data` imports for the hook; pages that seed local optimistic state from that data additionally remount on property change so they never show stale data from the previously active property.

**Tech Stack:** Next.js 16 (App Router, client components), React 19, Zustand 5 (`persist` middleware), Tailwind v4 `@theme` tokens, GSAP (`useGSAP`) for the dashboard's existing count-up/FLIP animations. No test framework exists in this repo — verification is `npm run build` (which type-checks) plus manual browser checks, matching the spec's own Testing section.

**Spec:** `docs/superpowers/specs/2026-08-27-multi-property-dashboard-design.md`

## Global Constraints

- No backend/API/database — stays a static, in-memory demo (spec non-goal).
- No URL-based property routing — routes stay flat; active property is client state only (spec non-goal).
- No per-property theming/branding beyond the data itself (spec non-goal).
- No auth/permissions scoping per property (spec non-goal).
- No changes to the 13 gated "Coming Soon" sidebar routes (spec non-goal).
- **Deviation from the spec's illustrative code — field naming.** The spec's `PropertyDataset` code block uses short field names (`rooms`, `reservations`, `guests`, ...), but its own "Component migration" section shows pages destructuring `const { mockRooms, ... } = usePropertyData();` — i.e. the *old* flat export names. Every one of the 12 files already uses `mockRooms.find(...)`, `mockReservations.filter(...)`, etc. throughout its body, not just at the import line. To make the migration genuinely mechanical (per the spec's own stated intent), `PropertyDataset` in this plan uses the OLD flat names (`mockRooms`, `mockReservations`, `mockGuests`, `mockFolios`, `mockHousekeepingTasks`, `mockServiceRequests`, `mockMaintenanceTickets`) as its field names, plus `meta`, `totalRooms`, `roomStatusCounts`, `signatureIncident`, `activityLog`. This is the resolution used everywhere below — do not "fix" it back to the spec's shorthand names.
- **Deviation — `PropertyId` location.** The spec's code block defines `PropertyId` in `mock-data.ts` and has `property-store.ts` import it. That creates a circular import (`mock-data.ts` → `property-store.ts` → `mock-data.ts`). This plan defines `PropertyId` in `property-store.ts` instead, and `mock-data.ts` imports it from there. No behavior change, just avoids the cycle.
- **Staleness rule.** Any page that seeds `useState`/`useOptimisticAction` from property data (front-desk, billing, rooms, housekeeping, maintenance, service-requests, dashboard) only reads that seed once, on mount — switching the active property while sitting on one of these pages would otherwise silently keep showing the *previous* property's data. Each of these pages is split into a thin default-exported wrapper that reads `activePropertyId` and renders a `*Content` component keyed by it (`<XPageContent key={activePropertyId} />`), forcing a full remount (and thus a fresh seed) on every property switch. Pages with no local copy of property data (guests, reservations, dev/patterns, AppSidebar, AppTopBar, CommandPalette) don't need this and aren't given it — added only where staleness would actually occur.
- `npm run build` (runs `next build`, which type-checks) must pass after every task that touches a `.ts`/`.tsx` file.

---

## Task 1: Property store + hydration gate

**Files:**
- Create: `src/lib/property-store.ts`
- Modify: `src/app/app/layout.tsx`

**Interfaces:**
- Produces: `PropertyId` (`'off-the-trail' | 'pine-peaks' | 'wildflower-valley'`), `usePropertyStore` (Zustand hook with `activePropertyId: PropertyId`, `setActiveProperty(id: PropertyId): void`, `hasHydrated: boolean`, `setHasHydrated(v: boolean): void`) — consumed by every task from here on.

- [ ] **Step 1: Create the property store**

```ts
// src/lib/property-store.ts
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PropertyId = 'off-the-trail' | 'pine-peaks' | 'wildflower-valley';

interface PropertyState {
  activePropertyId: PropertyId;
  setActiveProperty: (id: PropertyId) => void;
  hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
}

export const usePropertyStore = create<PropertyState>()(
  persist(
    (set) => ({
      activePropertyId: 'off-the-trail',
      setActiveProperty: (id) => set({ activePropertyId: id }),
      hasHydrated: false,
      setHasHydrated: (v) => set({ hasHydrated: v }),
    }),
    {
      name: 'stayo-active-property',
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    }
  )
);
```

- [ ] **Step 2: Gate the app shell on hydration so a returning visitor never flashes the default property**

`src/app/app/layout.tsx` renders `AppSidebar`/`AppTopBar`/every page once per session — it's the single cheapest place to avoid the flash the spec calls out, instead of gating all 12 consuming files individually. Add the import and an early return:

```tsx
// src/app/app/layout.tsx
'use client';

import React, { useState } from 'react';
import { Toaster } from 'sonner';
import { AppSidebar } from '@/components/shell/AppSidebar';
import { AppTopBar } from '@/components/shell/AppTopBar';
import { CommandPalette } from '@/components/shell/CommandPalette';
import { AskStayOPanel } from '@/components/shell/AskStayOPanel';
import { useUIStore } from '@/lib/store';
import { usePropertyStore } from '@/lib/property-store';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [cmdKOpen, setCmdKOpen] = useState(false);
  const askStayOOpen = useUIStore((s) => s.askStayOOpen);
  const setAskStayOOpen = useUIStore((s) => s.setAskStayOOpen);
  const hasHydrated = usePropertyStore((s) => s.hasHydrated);

  if (!hasHydrated) {
    return <div className="flex h-screen w-screen bg-background" />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground font-sans">
      {/* Collapsible Left Sidebar */}
      <AppSidebar />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Global Top Bar */}
        <AppTopBar
          onOpenCmdK={() => setCmdKOpen(true)}
          onOpenAskStayO={() => setAskStayOOpen(true)}
        />

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-background">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Global Modals & Panels */}
      <CommandPalette open={cmdKOpen} onOpenChange={setCmdKOpen} />
      <AskStayOPanel open={askStayOOpen} onOpenChange={setAskStayOOpen} />
      <Toaster theme="dark" richColors position="bottom-right" />
    </div>
  );
}
```

- [ ] **Step 3: Verify**

Run: `npm run build`
Expected: succeeds (this file isn't consumed by anything yet, so it's dead code but must type-check clean).

- [ ] **Step 4: Commit**

```bash
git add src/lib/property-store.ts src/app/app/layout.tsx
git commit -m "feat: add property store with persisted active property + hydration gate"
```

---

## Task 2: `--color-vip` token

**Files:**
- Modify: `src/app/globals.css:15-16`

**Interfaces:**
- Produces: `bg-vip`, `text-vip`, `border-vip` Tailwind utilities — consumed by Task 7 (Guests page) and Task 12 (Dashboard).

- [ ] **Step 1: Add the token**

In the `@theme` block, right after the accent tokens:

```css
  --color-accent: #d97706;
  --color-accent-foreground: #fffbeb;

  --color-vip: #d4af37;

  --color-status-ok: #10b981;
```

- [ ] **Step 2: Verify**

Run: `npm run build`
Expected: succeeds (CSS-only change, nothing references `vip` yet).

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add --color-vip token, distinct from --color-accent"
```

---

## Task 3: Restructure `mock-data.ts` into `propertyDatasets` + `usePropertyData()`

This is the large, mostly-mechanical data task. Off The Trail's `mockRooms`, `mockGuests`, `mockFolios`, `mockHousekeepingTasks`, `mockServiceRequests`, `mockMaintenanceTickets` keep their exact existing values (just become property-private consts instead of top-level exports). Its `mockReservations` grows from 5 to 13 records (adds `amountValue` to all, `guestCount` where >1, and `arrivalTime`/`departureTime` on the 3 that feed "Today's Key Shifts"), and its 8 newly-checked-in guests get matching `mockGuests` rows so the Guests page's "In-House" count can never disagree with the Dashboard's In-House KPI. Pine & Peaks Homestay (6 rooms) and Wildflower Valley Cabin (4 rooms) are built from scratch, proportionally sized per the spec.

**Files:**
- Modify: `src/lib/mock-data.ts` (full rewrite)

**Interfaces:**
- Consumes: `PropertyId` from `./property-store` (Task 1).
- Produces: `PropertyDataset` interface, `propertyDatasets: Record<PropertyId, PropertyDataset>`, `usePropertyData(): PropertyDataset` — consumed by every remaining task. Also re-exports the unchanged type interfaces (`MockRoom`, `RoomStatus`, `MockReservation`, `ReservationStatus`, `BookingChannel`, `MockHousekeepingTask`, `HousekeepingStatus`, `TaskPriority`, `RoomAlert`, `MockGuest`, `MockFolio`, `FolioStatus`, `MockServiceRequest`, `ServiceRequestStatus`, `ServiceRequestCategory`, `MockMaintenanceTicket`, `MaintenanceStatus`) plus new `PropertyMeta` and `ActivityLogEntry`.

- [ ] **Step 1: Replace the entire file**

```ts
// src/lib/mock-data.ts
// Per-property mock datasets for StayO's demo app. Everything a page needs
// for the *active* property comes through usePropertyData() — nothing here
// is imported directly by page/component code anymore.

import { usePropertyStore, type PropertyId } from './property-store';

export type RoomStatus = 'available' | 'occupied' | 'dirty' | 'cleaning' | 'blocked';

export interface MockRoom {
  number: string;
  type: string;
  status: RoomStatus;
  rate: number;
}

export const ROOM_TYPE_RATES: Record<string, number> = {
  'Deluxe Pine Suite': 8500,
  'Forest Suite': 9500,
  'Valley View Villa': 14000,
  'Attic Loft': 11000,
};

export interface PropertyMeta {
  id: PropertyId;
  name: string;
  type: string;
}

export interface ActivityLogEntry {
  id: string;
  message: string;
  tone: 'ok' | 'info' | 'warn';
  timestamp: string;
}

export type ReservationStatus = 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';
export type BookingChannel = 'Direct' | 'Booking.com' | 'WhatsApp' | 'Airbnb';

export interface MockReservation {
  id: string;
  guestName: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  status: ReservationStatus;
  channel: BookingChannel;
  amount: string;
  amountValue: number;
  guestCount?: number;
  arrivalTime?: string;
  departureTime?: string;
}

export type HousekeepingStatus = 'dirty' | 'cleaning' | 'inspected' | 'ready';
export type TaskPriority = 'urgent' | 'high' | 'normal' | 'low';

export interface MockHousekeepingTask {
  id: string;
  roomNumber: string;
  roomLabel: string;
  subtitle: string;
  status: HousekeepingStatus;
  priority: TaskPriority;
  assignee: { name: string; initials: string };
  meta?: string;
}

export interface RoomAlert {
  roomNumber: string;
  guestName: string;
  title: string;
  detail: string;
}

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

export interface PropertyDataset {
  meta: PropertyMeta;
  mockRooms: MockRoom[];
  totalRooms: number;
  roomStatusCounts: Record<RoomStatus, number>;
  mockReservations: MockReservation[];
  mockGuests: MockGuest[];
  mockFolios: MockFolio[];
  mockHousekeepingTasks: MockHousekeepingTask[];
  mockServiceRequests: MockServiceRequest[];
  mockMaintenanceTickets: MockMaintenanceTicket[];
  signatureIncident: RoomAlert;
  activityLog: ActivityLogEntry[];
}

function computeRoomStatusCounts(rooms: MockRoom[]): Record<RoomStatus, number> {
  const counts: Record<RoomStatus, number> = { available: 0, occupied: 0, dirty: 0, cleaning: 0, blocked: 0 };
  for (const room of rooms) counts[room.status]++;
  return counts;
}

// ---------------------------------------------------------------------------
// Off The Trail — Dalhousie (Boutique Resort, 25 rooms)
// ---------------------------------------------------------------------------

const offTheTrailRooms: MockRoom[] = ([
  { number: '101', type: 'Deluxe Pine Suite', status: 'dirty' },
  { number: '102', type: 'Forest Suite', status: 'occupied' },
  { number: '103', type: 'Valley View Villa', status: 'cleaning' },
  { number: '104', type: 'Attic Loft', status: 'occupied' },
  { number: '105', type: 'Deluxe Pine Suite', status: 'dirty' },
  { number: '106', type: 'Forest Suite', status: 'available' },
  { number: '107', type: 'Valley View Villa', status: 'occupied' },
  { number: '108', type: 'Attic Loft', status: 'occupied' },
  { number: '201', type: 'Deluxe Pine Suite', status: 'occupied' },
  { number: '202', type: 'Forest Suite', status: 'occupied' },
  { number: '203', type: 'Valley View Villa', status: 'occupied' },
  { number: '204', type: 'Valley View Villa', status: 'blocked' },
  { number: '205', type: 'Attic Loft', status: 'occupied' },
  { number: '206', type: 'Deluxe Pine Suite', status: 'occupied' },
  { number: '207', type: 'Forest Suite', status: 'occupied' },
  { number: '208', type: 'Deluxe Pine Suite', status: 'available' },
  { number: '301', type: 'Attic Loft', status: 'available' },
  { number: '302', type: 'Deluxe Pine Suite', status: 'occupied' },
  { number: '303', type: 'Forest Suite', status: 'occupied' },
  { number: '304', type: 'Valley View Villa', status: 'occupied' },
  { number: '305', type: 'Attic Loft', status: 'occupied' },
  { number: '401', type: 'Deluxe Pine Suite', status: 'occupied' },
  { number: '402', type: 'Forest Suite', status: 'occupied' },
  { number: '403', type: 'Valley View Villa', status: 'occupied' },
  { number: '404', type: 'Attic Loft', status: 'occupied' },
] as { number: string; type: string; status: RoomStatus }[]).map((r) => ({ ...r, rate: ROOM_TYPE_RATES[r.type] }));

const offTheTrailReservations: MockReservation[] = [
  { id: 'RES-8921', guestName: 'Aarav Sharma', roomNumber: '102', checkIn: 'Today', checkOut: '24 Aug', status: 'checked-in', channel: 'Direct', amount: '₹14,200', amountValue: 14200, guestCount: 1, arrivalTime: '15:30' },
  { id: 'RES-8922', guestName: 'Elena Rostova', roomNumber: '204', checkIn: 'Today', checkOut: '23 Aug', status: 'confirmed', channel: 'Booking.com', amount: '₹22,500', amountValue: 22500, guestCount: 1, arrivalTime: '14:00' },
  { id: 'RES-8923', guestName: 'Vikram Mehta', roomNumber: '301', checkIn: 'Tomorrow', checkOut: '26 Aug', status: 'confirmed', channel: 'WhatsApp', amount: '₹18,000', amountValue: 18000, guestCount: 2 },
  { id: 'RES-8924', guestName: 'Sarah Jenkins', roomNumber: '105', checkIn: '18 Aug', checkOut: 'Today', status: 'checked-out', channel: 'Airbnb', amount: '₹12,400', amountValue: 12400, guestCount: 1, departureTime: '11:00' },
  { id: 'RES-8925', guestName: 'Rohan Gupta', roomNumber: '208', checkIn: '23 Aug', checkOut: '27 Aug', status: 'cancelled', channel: 'Direct', amount: '₹31,000', amountValue: 31000, guestCount: 1 },
  { id: 'RES-8926', guestName: 'Priya Nair', roomNumber: '107', checkIn: '19 Aug', checkOut: '24 Aug', status: 'checked-in', channel: 'Direct', amount: '₹19,000', amountValue: 19000, guestCount: 2 },
  { id: 'RES-8927', guestName: 'Marcus Webb', roomNumber: '108', checkIn: '20 Aug', checkOut: '26 Aug', status: 'checked-in', channel: 'Booking.com', amount: '₹27,500', amountValue: 27500, guestCount: 2 },
  { id: 'RES-8928', guestName: 'Ananya Iyer', roomNumber: '201', checkIn: '18 Aug', checkOut: 'Today', status: 'checked-in', channel: 'Direct', amount: '₹21,000', amountValue: 21000, guestCount: 1 },
  { id: 'RES-8929', guestName: 'Devika Menon', roomNumber: '202', checkIn: '17 Aug', checkOut: '25 Aug', status: 'checked-in', channel: 'Airbnb', amount: '₹33,000', amountValue: 33000, guestCount: 2 },
  { id: 'RES-8930', guestName: 'Karan Bedi', roomNumber: '203', checkIn: 'Today', checkOut: '24 Aug', status: 'checked-in', channel: 'Direct', amount: '₹16,500', amountValue: 16500, guestCount: 1 },
  { id: 'RES-8931', guestName: 'Fatima Sheikh', roomNumber: '205', checkIn: '19 Aug', checkOut: 'Today', status: 'checked-in', channel: 'WhatsApp', amount: '₹21,500', amountValue: 21500, guestCount: 2 },
  { id: 'RES-8932', guestName: 'Oliver Grant', roomNumber: '206', checkIn: '20 Aug', checkOut: '25 Aug', status: 'checked-in', channel: 'Booking.com', amount: '₹20,500', amountValue: 20500, guestCount: 1 },
  { id: 'RES-8933', guestName: 'Meera Kulkarni', roomNumber: '207', checkIn: 'Today', checkOut: '25 Aug', status: 'confirmed', channel: 'Direct', amount: '₹15,200', amountValue: 15200, guestCount: 1 },
];

// Room 204 is excluded here on purpose — its maintenance emergency (see
// offTheTrailSignatureIncident below) blocks it from the housekeeping
// workflow entirely.
const offTheTrailHousekeepingTasks: MockHousekeepingTask[] = [
  { id: 'hk-101', roomNumber: '101', roomLabel: 'Room 101 · Deluxe Pine', subtitle: 'Departure at 11:00 AM', status: 'dirty', priority: 'urgent', assignee: { name: 'Sunita D.', initials: 'SD' }, meta: 'Next: 2:00 PM' },
  { id: 'hk-102', roomNumber: '102', roomLabel: 'Room 102 · Forest Suite', subtitle: 'Stayover refresh', status: 'cleaning', priority: 'normal', assignee: { name: 'Manoj K.', initials: 'MK' } },
  { id: 'hk-103', roomNumber: '103', roomLabel: 'Room 103 · Valley View Villa', subtitle: 'Post-checkout deep clean', status: 'cleaning', priority: 'normal', assignee: { name: 'Manoj K.', initials: 'MK' } },
  { id: 'hk-105', roomNumber: '105', roomLabel: 'Room 105 · Deluxe Pine', subtitle: 'Departure clean, VIP arriving next door at 15:30', status: 'dirty', priority: 'high', assignee: { name: 'Sunita D.', initials: 'SD' } },
  { id: 'hk-106', roomNumber: '106', roomLabel: 'Room 106 · Forest Suite', subtitle: 'Final inspection before release', status: 'inspected', priority: 'normal', assignee: { name: 'Rahul V.', initials: 'RV' } },
  { id: 'hk-301', roomNumber: '301', roomLabel: 'Room 301 · Attic Loft', subtitle: 'Ready for check-in', status: 'ready', priority: 'normal', assignee: { name: 'Rahul V.', initials: 'RV' } },
];

const offTheTrailSignatureIncident: RoomAlert = {
  roomNumber: '204',
  guestName: 'Elena Rostova',
  title: 'Maintenance emergency — Room 204 (Bathroom leak)',
  detail: 'Bathroom leak reported ahead of a 14:00 VIP arrival. Room is blocked pending repair.',
};

// One row per named guest already used across offTheTrailReservations —
// kept 1:1 so the Guests page's "In-House" count never disagrees with the
// Dashboard's In-House Guests KPI.
const offTheTrailGuests: MockGuest[] = [
  { id: 'GST-001', name: 'Aarav Sharma', email: 'aarav.sharma@example.com', phone: '+91 98765 43210', vip: true, totalStays: 4, lastStay: 'Today', totalSpend: '₹58,200', notes: 'Prefers quiet room away from elevator. Requested extra towels via WhatsApp concierge.' },
  { id: 'GST-002', name: 'Elena Rostova', email: 'elena.rostova@example.com', phone: '+91 90000 11223', vip: false, totalStays: 1, lastStay: 'Today', totalSpend: '₹22,500' },
  { id: 'GST-003', name: 'Vikram Mehta', email: 'vikram.mehta@example.com', phone: '+91 98111 22334', vip: false, totalStays: 2, lastStay: 'Tomorrow', totalSpend: '₹32,000' },
  { id: 'GST-004', name: 'Sarah Jenkins', email: 'sarah.jenkins@example.com', phone: '+1 415 555 0132', vip: false, totalStays: 1, lastStay: 'Today', totalSpend: '₹12,400' },
  { id: 'GST-005', name: 'Rohan Gupta', email: 'rohan.gupta@example.com', phone: '+91 99887 66554', vip: false, totalStays: 3, lastStay: '27 Aug', totalSpend: '₹31,000' },
  { id: 'GST-006', name: 'Priya Nair', email: 'priya.nair@example.com', phone: '+91 98450 11223', vip: false, totalStays: 2, lastStay: '19 Aug', totalSpend: '₹34,000' },
  { id: 'GST-007', name: 'Marcus Webb', email: 'marcus.webb@example.com', phone: '+44 7700 900123', vip: false, totalStays: 1, lastStay: '20 Aug', totalSpend: '₹27,500' },
  { id: 'GST-008', name: 'Ananya Iyer', email: 'ananya.iyer@example.com', phone: '+91 99001 22334', vip: false, totalStays: 3, lastStay: '18 Aug', totalSpend: '₹58,000' },
  { id: 'GST-009', name: 'Devika Menon', email: 'devika.menon@example.com', phone: '+91 98220 33445', vip: false, totalStays: 2, lastStay: '17 Aug', totalSpend: '₹61,000' },
  { id: 'GST-010', name: 'Karan Bedi', email: 'karan.bedi@example.com', phone: '+91 98111 55667', vip: false, totalStays: 1, lastStay: 'Today', totalSpend: '₹16,500' },
  { id: 'GST-011', name: 'Fatima Sheikh', email: 'fatima.sheikh@example.com', phone: '+91 97400 88990', vip: false, totalStays: 2, lastStay: '19 Aug', totalSpend: '₹40,500' },
  { id: 'GST-012', name: 'Oliver Grant', email: 'oliver.grant@example.com', phone: '+44 7911 123456', vip: false, totalStays: 1, lastStay: '20 Aug', totalSpend: '₹20,500' },
  { id: 'GST-013', name: 'Meera Kulkarni', email: 'meera.kulkarni@example.com', phone: '+91 98765 22110', vip: false, totalStays: 1, lastStay: 'Today', totalSpend: '₹15,200' },
];

const offTheTrailFolios: MockFolio[] = [
  { id: 'FOL-442', guestName: 'Aarav Sharma', roomNumber: '102', reservationId: 'RES-8921', charges: [{ label: 'Room Charges', amount: 14200 }, { label: 'Restaurant', amount: 2200 }], totalPaid: 14200, status: 'partial' },
  { id: 'FOL-443', guestName: 'Elena Rostova', roomNumber: '204', reservationId: 'RES-8922', charges: [{ label: 'Room Charges', amount: 22500 }], totalPaid: 0, status: 'outstanding' },
  { id: 'FOL-444', guestName: 'Vikram Mehta', roomNumber: '301', reservationId: 'RES-8923', charges: [{ label: 'Room Charges', amount: 18000 }], totalPaid: 18000, status: 'paid' },
  { id: 'FOL-445', guestName: 'Sarah Jenkins', roomNumber: '105', reservationId: 'RES-8924', charges: [{ label: 'Room Charges', amount: 12400 }], totalPaid: 12400, status: 'paid' },
  { id: 'FOL-446', guestName: 'Rohan Gupta', roomNumber: '208', reservationId: 'RES-8925', charges: [{ label: 'Room Charges', amount: 31000 }], totalPaid: 0, status: 'outstanding' },
];

// SR-501 and SR-502 are the "2 guest requests waiting" the Dashboard's
// Needs Attention feed derives its count from.
const offTheTrailServiceRequests: MockServiceRequest[] = [
  { id: 'SR-501', roomNumber: '204', guestName: 'Elena Rostova', title: 'Extra towels requested', category: 'Housekeeping', status: 'open', priority: 'urgent', waitingSince: '22 min ago' },
  { id: 'SR-502', roomNumber: '102', guestName: 'Aarav Sharma', title: 'Late checkout to 1:00 PM', category: 'Concierge', status: 'open', priority: 'high', waitingSince: '21 min ago' },
  { id: 'SR-503', roomNumber: '301', guestName: 'Vikram Mehta', title: 'Room service — breakfast for 2', category: 'F&B', status: 'in-progress', priority: 'normal', waitingSince: '8 min ago', assignee: { name: 'Rahul V.', initials: 'RV' } },
  { id: 'SR-504', roomNumber: '105', guestName: 'Sarah Jenkins', title: 'AC not cooling', category: 'Maintenance', status: 'resolved', priority: 'normal', waitingSince: '1 hr ago', assignee: { name: 'Manoj K.', initials: 'MK' } },
];

const offTheTrailMaintenanceTickets: MockMaintenanceTicket[] = [
  { id: 'MT-901', roomNumber: offTheTrailSignatureIncident.roomNumber, title: 'Bathroom leak', detail: offTheTrailSignatureIncident.detail, status: 'reported', priority: 'urgent', reportedAt: '12 min ago' },
  { id: 'MT-902', roomNumber: '105', title: 'AC not cooling', detail: 'Guest reports the AC unit is running but not cooling the room.', status: 'resolved', priority: 'high', reportedAt: '1 hr ago', assignee: { name: 'Manoj K.', initials: 'MK' } },
  { id: 'MT-903', roomNumber: '303', title: 'Bathroom tap dripping', detail: 'Slow drip reported by housekeeping during turnover.', status: 'resolved', priority: 'low', reportedAt: 'Yesterday', assignee: { name: 'Rahul V.', initials: 'RV' } },
];

const offTheTrailActivityLog: ActivityLogEntry[] = [
  { id: 'ott-act-1', message: 'Reservation #8923 created by Concierge Agent via WhatsApp', tone: 'ok', timestamp: '4 min ago' },
  { id: 'ott-act-2', message: 'Room 101 cleaning completed by Sunita D.', tone: 'info', timestamp: '18 min ago' },
  { id: 'ott-act-3', message: 'Folio #442 updated with ₹2,200 Restaurant charge', tone: 'warn', timestamp: '32 min ago' },
  { id: 'ott-act-4', message: 'Bathroom leak reported for Room 204 by front desk', tone: 'warn', timestamp: '12 min ago' },
];

// ---------------------------------------------------------------------------
// Pine & Peaks Homestay (Homestay, 6 rooms)
// ---------------------------------------------------------------------------

const pinePeaksRooms: MockRoom[] = [
  { number: '1', type: 'Garden Room', status: 'occupied', rate: 4500 },
  { number: '2', type: 'Garden Room', status: 'available', rate: 4500 },
  { number: '3', type: 'Mountain View Room', status: 'occupied', rate: 5500 },
  { number: '4', type: 'Mountain View Room', status: 'dirty', rate: 5500 },
  { number: '5', type: 'Family Suite', status: 'occupied', rate: 7500 },
  { number: '6', type: 'Family Suite', status: 'blocked', rate: 7500 },
];

const pinePeaksReservations: MockReservation[] = [
  { id: 'RES-PP01', guestName: 'Neha Kapoor', roomNumber: '1', checkIn: 'Today', checkOut: '24 Aug', status: 'checked-in', channel: 'Direct', amount: '₹4,500', amountValue: 4500, guestCount: 1, arrivalTime: '13:00' },
  { id: 'RES-PP02', guestName: 'Thomas Reid', roomNumber: '6', checkIn: 'Today', checkOut: '25 Aug', status: 'confirmed', channel: 'Booking.com', amount: '₹7,500', amountValue: 7500, guestCount: 2, arrivalTime: '16:00' },
  { id: 'RES-PP03', guestName: 'Ritu Joshi', roomNumber: '3', checkIn: '20 Aug', checkOut: '24 Aug', status: 'checked-in', channel: 'Airbnb', amount: '₹5,500', amountValue: 5500, guestCount: 2 },
  { id: 'RES-PP04', guestName: 'George Abraham', roomNumber: '5', checkIn: '19 Aug', checkOut: 'Today', status: 'checked-in', channel: 'Direct', amount: '₹7,500', amountValue: 7500, guestCount: 1, departureTime: '10:30' },
];

const pinePeaksSignatureIncident: RoomAlert = {
  roomNumber: '6',
  guestName: 'Thomas Reid',
  title: 'Maintenance emergency — Room 6 (Water heater failure)',
  detail: 'Water heater failure discovered ahead of a 16:00 arrival. Room is blocked pending repair.',
};

const pinePeaksGuests: MockGuest[] = [
  { id: 'PPG-001', name: 'Neha Kapoor', email: 'neha.kapoor@example.com', phone: '+91 98230 11445', vip: true, totalStays: 3, lastStay: 'Today', totalSpend: '₹13,500', notes: 'Requests extra pillows and a quiet garden-facing room.' },
  { id: 'PPG-002', name: 'Thomas Reid', email: 'thomas.reid@example.com', phone: '+44 7700 900456', vip: false, totalStays: 1, lastStay: 'Today', totalSpend: '₹7,500' },
  { id: 'PPG-003', name: 'Ritu Joshi', email: 'ritu.joshi@example.com', phone: '+91 98111 66778', vip: false, totalStays: 2, lastStay: '20 Aug', totalSpend: '₹11,000' },
  { id: 'PPG-004', name: 'George Abraham', email: 'george.abraham@example.com', phone: '+91 94470 22110', vip: false, totalStays: 4, lastStay: 'Today', totalSpend: '₹28,000' },
];

const pinePeaksFolios: MockFolio[] = [
  { id: 'FOL-PP01', guestName: 'Neha Kapoor', roomNumber: '1', reservationId: 'RES-PP01', charges: [{ label: 'Room Charges', amount: 4500 }], totalPaid: 4500, status: 'paid' },
  { id: 'FOL-PP02', guestName: 'Thomas Reid', roomNumber: '6', reservationId: 'RES-PP02', charges: [{ label: 'Room Charges', amount: 7500 }], totalPaid: 0, status: 'outstanding' },
  { id: 'FOL-PP03', guestName: 'George Abraham', roomNumber: '5', reservationId: 'RES-PP04', charges: [{ label: 'Room Charges', amount: 7500 }, { label: 'Breakfast', amount: 600 }], totalPaid: 7500, status: 'partial' },
];

const pinePeaksHousekeepingTasks: MockHousekeepingTask[] = [
  { id: 'pp-hk-2', roomNumber: '2', roomLabel: 'Room 2 · Garden Room', subtitle: 'Turnover clean before next arrival', status: 'cleaning', priority: 'normal', assignee: { name: 'Divya S.', initials: 'DS' } },
  { id: 'pp-hk-4', roomNumber: '4', roomLabel: 'Room 4 · Mountain View Room', subtitle: 'Departure clean, next guest at 16:00', status: 'dirty', priority: 'high', assignee: { name: 'Divya S.', initials: 'DS' } },
];

const pinePeaksServiceRequests: MockServiceRequest[] = [
  { id: 'SR-PP01', roomNumber: '3', guestName: 'Ritu Joshi', title: 'Extra blankets requested', category: 'Housekeeping', status: 'open', priority: 'normal', waitingSince: '15 min ago' },
];

const pinePeaksMaintenanceTickets: MockMaintenanceTicket[] = [
  { id: 'MT-PP01', roomNumber: pinePeaksSignatureIncident.roomNumber, title: 'Water heater failure', detail: pinePeaksSignatureIncident.detail, status: 'reported', priority: 'urgent', reportedAt: '20 min ago' },
  { id: 'MT-PP02', roomNumber: '4', title: 'Loose door handle', detail: 'Guest reported the door handle is loose and sticks when locking.', status: 'resolved', priority: 'low', reportedAt: 'Yesterday', assignee: { name: 'Divya S.', initials: 'DS' } },
];

const pinePeaksActivityLog: ActivityLogEntry[] = [
  { id: 'pp-act-1', message: 'Reservation RES-PP02 created by Concierge Agent via Booking.com', tone: 'ok', timestamp: '6 min ago' },
  { id: 'pp-act-2', message: 'Room 2 cleaning started by Divya S.', tone: 'info', timestamp: '22 min ago' },
  { id: 'pp-act-3', message: 'Folio FOL-PP03 updated with ₹600 Breakfast charge', tone: 'warn', timestamp: '40 min ago' },
  { id: 'pp-act-4', message: 'Water heater failure reported for Room 6', tone: 'warn', timestamp: '20 min ago' },
];

// ---------------------------------------------------------------------------
// Wildflower Valley Cabin (Cabin Villa, 4 rooms)
// ---------------------------------------------------------------------------

const wildflowerRooms: MockRoom[] = [
  { number: '1', type: 'Standard Cabin', status: 'occupied', rate: 6000 },
  { number: '2', type: 'Standard Cabin', status: 'blocked', rate: 6000 },
  { number: '3', type: 'Deluxe Cabin', status: 'occupied', rate: 9000 },
  { number: '4', type: 'Deluxe Cabin', status: 'available', rate: 9000 },
];

const wildflowerReservations: MockReservation[] = [
  { id: 'RES-WV01', guestName: 'Karthik Iyer', roomNumber: '4', checkIn: 'Today', checkOut: '23 Aug', status: 'checked-in', channel: 'Direct', amount: '₹9,500', amountValue: 9500, guestCount: 1, arrivalTime: '13:30' },
  { id: 'RES-WV02', guestName: 'Daniel Cho', roomNumber: '2', checkIn: 'Today', checkOut: '24 Aug', status: 'confirmed', channel: 'WhatsApp', amount: '₹18,000', amountValue: 18000, guestCount: 2, arrivalTime: '15:00' },
  { id: 'RES-WV03', guestName: 'Ayesha Khan', roomNumber: '1', checkIn: '19 Aug', checkOut: 'Today', status: 'checked-in', channel: 'Direct', amount: '₹12,000', amountValue: 12000, guestCount: 2, departureTime: '10:00' },
  { id: 'RES-WV04', guestName: 'Meera Pillai', roomNumber: '3', checkIn: '21 Aug', checkOut: '26 Aug', status: 'checked-in', channel: 'Airbnb', amount: '₹27,000', amountValue: 27000, guestCount: 1 },
];

const wildflowerSignatureIncident: RoomAlert = {
  roomNumber: '2',
  guestName: 'Daniel Cho',
  title: 'Maintenance emergency — Cabin 2 (Propane heater malfunction)',
  detail: 'Propane heater malfunction discovered ahead of a 15:00 arrival. Cabin is blocked pending repair.',
};

const wildflowerGuests: MockGuest[] = [
  { id: 'WVG-001', name: 'Karthik Iyer', email: 'karthik.iyer@example.com', phone: '+91 98450 77889', vip: true, totalStays: 2, lastStay: 'Today', totalSpend: '₹19,000', notes: 'Requested a cabin close to the river trailhead.' },
  { id: 'WVG-002', name: 'Daniel Cho', email: 'daniel.cho@example.com', phone: '+1 415 555 0188', vip: false, totalStays: 1, lastStay: 'Today', totalSpend: '₹18,000' },
  { id: 'WVG-003', name: 'Ayesha Khan', email: 'ayesha.khan@example.com', phone: '+91 99000 44556', vip: false, totalStays: 1, lastStay: 'Today', totalSpend: '₹12,000' },
  { id: 'WVG-004', name: 'Meera Pillai', email: 'meera.pillai@example.com', phone: '+91 98220 99887', vip: false, totalStays: 3, lastStay: '21 Aug', totalSpend: '₹52,000' },
];

const wildflowerFolios: MockFolio[] = [
  { id: 'FOL-WV01', guestName: 'Karthik Iyer', roomNumber: '4', reservationId: 'RES-WV01', charges: [{ label: 'Room Charges', amount: 9500 }], totalPaid: 9500, status: 'paid' },
  { id: 'FOL-WV02', guestName: 'Daniel Cho', roomNumber: '2', reservationId: 'RES-WV02', charges: [{ label: 'Room Charges', amount: 18000 }], totalPaid: 0, status: 'outstanding' },
  { id: 'FOL-WV03', guestName: 'Ayesha Khan', roomNumber: '1', reservationId: 'RES-WV03', charges: [{ label: 'Room Charges', amount: 12000 }, { label: 'Spa Treatment', amount: 1500 }], totalPaid: 12000, status: 'partial' },
];

const wildflowerHousekeepingTasks: MockHousekeepingTask[] = [
  { id: 'wv-hk-1', roomNumber: '1', roomLabel: 'Cabin 1 · Standard Cabin', subtitle: 'Pre-departure tidy ahead of 10:00 checkout', status: 'cleaning', priority: 'normal', assignee: { name: 'Tenzin L.', initials: 'TL' } },
];

const wildflowerServiceRequests: MockServiceRequest[] = [
  { id: 'SR-WV01', roomNumber: '3', guestName: 'Meera Pillai', title: 'Extra firewood for cabin stove', category: 'Concierge', status: 'open', priority: 'normal', waitingSince: '10 min ago' },
];

const wildflowerMaintenanceTickets: MockMaintenanceTicket[] = [
  { id: 'MT-WV01', roomNumber: wildflowerSignatureIncident.roomNumber, title: 'Propane heater malfunction', detail: wildflowerSignatureIncident.detail, status: 'reported', priority: 'urgent', reportedAt: '25 min ago' },
  { id: 'MT-WV02', roomNumber: '3', title: 'Squeaky door hinge', detail: 'Cabin door hinge squeaks loudly when opened.', status: 'resolved', priority: 'low', reportedAt: 'Yesterday', assignee: { name: 'Tenzin L.', initials: 'TL' } },
];

const wildflowerActivityLog: ActivityLogEntry[] = [
  { id: 'wv-act-1', message: 'Reservation RES-WV02 created by Concierge Agent via WhatsApp', tone: 'ok', timestamp: '8 min ago' },
  { id: 'wv-act-2', message: 'Cabin 4 marked available after inspection', tone: 'ok', timestamp: '35 min ago' },
  { id: 'wv-act-3', message: 'Propane heater malfunction reported for Cabin 2', tone: 'warn', timestamp: '25 min ago' },
  { id: 'wv-act-4', message: 'Folio FOL-WV02 opened for Daniel Cho', tone: 'info', timestamp: '5 min ago' },
];

// ---------------------------------------------------------------------------
// Assembled datasets
// ---------------------------------------------------------------------------

export const propertyDatasets: Record<PropertyId, PropertyDataset> = {
  'off-the-trail': {
    meta: { id: 'off-the-trail', name: 'Off The Trail — Dalhousie', type: 'Boutique Resort' },
    mockRooms: offTheTrailRooms,
    totalRooms: offTheTrailRooms.length,
    roomStatusCounts: computeRoomStatusCounts(offTheTrailRooms),
    mockReservations: offTheTrailReservations,
    mockGuests: offTheTrailGuests,
    mockFolios: offTheTrailFolios,
    mockHousekeepingTasks: offTheTrailHousekeepingTasks,
    mockServiceRequests: offTheTrailServiceRequests,
    mockMaintenanceTickets: offTheTrailMaintenanceTickets,
    signatureIncident: offTheTrailSignatureIncident,
    activityLog: offTheTrailActivityLog,
  },
  'pine-peaks': {
    meta: { id: 'pine-peaks', name: 'Pine & Peaks Homestay', type: 'Homestay' },
    mockRooms: pinePeaksRooms,
    totalRooms: pinePeaksRooms.length,
    roomStatusCounts: computeRoomStatusCounts(pinePeaksRooms),
    mockReservations: pinePeaksReservations,
    mockGuests: pinePeaksGuests,
    mockFolios: pinePeaksFolios,
    mockHousekeepingTasks: pinePeaksHousekeepingTasks,
    mockServiceRequests: pinePeaksServiceRequests,
    mockMaintenanceTickets: pinePeaksMaintenanceTickets,
    signatureIncident: pinePeaksSignatureIncident,
    activityLog: pinePeaksActivityLog,
  },
  'wildflower-valley': {
    meta: { id: 'wildflower-valley', name: 'Wildflower Valley Cabin', type: 'Cabin Villa' },
    mockRooms: wildflowerRooms,
    totalRooms: wildflowerRooms.length,
    roomStatusCounts: computeRoomStatusCounts(wildflowerRooms),
    mockReservations: wildflowerReservations,
    mockGuests: wildflowerGuests,
    mockFolios: wildflowerFolios,
    mockHousekeepingTasks: wildflowerHousekeepingTasks,
    mockServiceRequests: wildflowerServiceRequests,
    mockMaintenanceTickets: wildflowerMaintenanceTickets,
    signatureIncident: wildflowerSignatureIncident,
    activityLog: wildflowerActivityLog,
  },
};

export function usePropertyData(): PropertyDataset {
  const activePropertyId = usePropertyStore((s) => s.activePropertyId);
  return propertyDatasets[activePropertyId];
}
```

- [ ] **Step 2: Verify the file type-checks in isolation**

Run: `npm run build`
Expected: fails at this point — every consuming file still imports the now-removed flat exports (`mockRooms`, `room204Alert`, etc.). That's expected; confirm the *errors* are all "has no exported member" in the 12 consuming files, not syntax errors inside `mock-data.ts` itself. If `mock-data.ts` itself reports an error, fix it before continuing.

- [ ] **Step 3: Commit**

```bash
git add src/lib/mock-data.ts
git commit -m "feat: restructure mock-data into per-property datasets + usePropertyData hook"
```

---

## Task 4: Migrate `AppTopBar.tsx`

**Files:**
- Modify: `src/components/shell/AppTopBar.tsx`

**Interfaces:**
- Consumes: `usePropertyStore` (Task 1), `propertyDatasets`, `PropertyMeta` (Task 3).

- [ ] **Step 1: Replace the hardcoded property list and local state**

Remove the `mockProperties` array (current lines 36-40) and update imports/state:

```tsx
import { usePropertyStore } from '@/lib/property-store';
import { propertyDatasets, type PropertyMeta } from '@/lib/mock-data';
```

Inside the component, replace:

```tsx
const [activeProperty, setActiveProperty] = useState(mockProperties[0]);
```

with:

```tsx
const activePropertyId = usePropertyStore((s) => s.activePropertyId);
const setActiveProperty = usePropertyStore((s) => s.setActiveProperty);
const properties = Object.values(propertyDatasets).map((d) => d.meta);
const activeProperty = propertyDatasets[activePropertyId].meta;
```

- [ ] **Step 2: Update the select handler and dropdown**

```tsx
const handleSelectProperty = (prop: PropertyMeta) => {
  setActiveProperty(prop.id);
  setPropertyOpen(false);
  setBannerMessage(`You are now viewing ${prop.name}`);
};
```

In the dropdown, swap `mockProperties.map(...)` for `properties.map(...)`, and since `PropertyMeta` has no `rooms` count, read it from the dataset:

```tsx
{properties.map((prop) => (
  <button
    key={prop.id}
    onClick={() => handleSelectProperty(prop)}
    className="w-full flex items-center justify-between p-2 rounded-sm text-left hover:bg-surface-2 transition-colors cursor-pointer"
  >
    <div>
      <div className="font-medium text-body-sm text-foreground">{prop.name}</div>
      <div className="text-caption text-muted-foreground font-mono">
        {prop.type} • {propertyDatasets[prop.id].totalRooms} Rooms
      </div>
    </div>
    {prop.id === activePropertyId && (
      <Check className="w-4 h-4 text-accent" />
    )}
  </button>
))}
```

- [ ] **Step 3: Reroute the "AI Agents Active" badge to `status-info` (P1)**

```tsx
<div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-status-info/10 border border-status-info/20 text-caption font-mono text-status-info">
  <span className="w-2 h-2 rounded-full bg-status-info animate-pulse" />
  <span>AI Agents Active</span>
</div>
```

- [ ] **Step 4: Verify**

Run: `npm run build`
Expected: `AppTopBar.tsx` no longer appears in the error list (other files still will).

- [ ] **Step 5: Commit**

```bash
git add src/components/shell/AppTopBar.tsx
git commit -m "feat: wire AppTopBar property switcher to the property store"
```

---

## Task 5: Migrate `AppSidebar.tsx`

**Files:**
- Modify: `src/components/shell/AppSidebar.tsx`

**Interfaces:**
- Consumes: `usePropertyData` (Task 3).

- [ ] **Step 1: Move `navGroups` inside `SidebarBody` and swap the import**

Replace the import:

```tsx
import { usePropertyData } from '@/lib/mock-data';
```

Delete the module-scope `const navGroups: NavGroup[] = [...]` (it references `mockHousekeepingTasks.length` at module scope, which no longer exists as an import) and rebuild it inside `SidebarBody`, right after `const pathname = usePathname();`:

```tsx
function SidebarBody({ collapsed, onToggleCollapse, onNavigate }: SidebarBodyProps) {
  const pathname = usePathname();
  const { mockHousekeepingTasks, meta } = usePropertyData();

  const navGroups: NavGroup[] = [
    {
      groupName: 'Overview',
      items: [
        { label: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard },
        { label: 'Calendar', href: '/app/calendar', icon: Calendar },
      ],
    },
    {
      groupName: 'Operations',
      items: [
        { label: 'Front Desk', href: '/app/front-desk', icon: ConciergeBell },
        { label: 'Reservations', href: '/app/reservations', icon: BookOpen },
        { label: 'Guests', href: '/app/guests', icon: Users },
      ],
    },
    {
      groupName: 'Property',
      items: [
        { label: 'Rooms', href: '/app/rooms', icon: BedDouble },
        { label: 'Housekeeping', href: '/app/housekeeping', icon: Sparkles, badge: String(mockHousekeepingTasks.length) },
        { label: 'Maintenance', href: '/app/maintenance', icon: Wrench },
      ],
    },
    {
      groupName: 'Guest Experience',
      items: [
        { label: 'Communications', href: '/app/communications', icon: MessageSquare },
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

  // ...rest of the function (the JSX return) stays exactly as it is,
  // it already reads `navGroups` and now closes over the fresh, per-render value.
```

- [ ] **Step 2: Fix the hardcoded "Off The Trail" / "OT" footer**

Add a small helper above `SidebarBody` (module scope, pure function, no data dependency):

```tsx
function propertyInitials(name: string): string {
  const words = name.split(/\s+/).filter((w) => /^[A-Za-z]/.test(w));
  return words.slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}
```

Replace the footer block:

```tsx
{/* User Profile Footer */}
<div className="p-3 border-t border-border bg-surface-2/40 flex items-center gap-3">
  <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/40 text-accent font-bold font-mono flex items-center justify-center text-body-sm shrink-0">
    {propertyInitials(meta.name)}
  </div>
  {!collapsed && (
    <div className="overflow-hidden flex-1 leading-tight">
      <div className="font-semibold text-body-sm text-foreground truncate">
        {meta.name.split('—')[0].trim()}
      </div>
      <div className="text-caption text-muted-foreground font-mono truncate">
        General Manager
      </div>
    </div>
  )}
</div>
```

- [ ] **Step 3: Verify**

Run: `npm run build`
Expected: `AppSidebar.tsx` no longer appears in the error list.

- [ ] **Step 4: Commit**

```bash
git add src/components/shell/AppSidebar.tsx
git commit -m "feat: make AppSidebar housekeeping badge and footer property-aware"
```

---

## Task 6: Migrate `CommandPalette.tsx`

**Files:**
- Modify: `src/components/shell/CommandPalette.tsx`

**Interfaces:**
- Consumes: `usePropertyData` (Task 3).

- [ ] **Step 1: Swap the import and derive quick entities generically**

```tsx
import { usePropertyData } from '@/lib/mock-data';
```

Replace the hardcoded `mockReservations.find((r) => r.id === 'RES-8921')!` / `'RES-8922'` lookups with a generic "featured reservations" derivation that works for any property (each property's dataset guarantees at least 2 reservations with `arrivalTime`/`departureTime` set, ordered so the first two are an in-house/VIP guest and a delayed arrival — see Task 3's data):

```tsx
export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const { mockReservations, signatureIncident } = usePropertyData();

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

  // ...rest of the component (handleSelect + JSX return) is unchanged.
```

- [ ] **Step 2: Verify**

Run: `npm run build`
Expected: `CommandPalette.tsx` no longer appears in the error list.

- [ ] **Step 3: Commit**

```bash
git add src/components/shell/CommandPalette.tsx
git commit -m "feat: make CommandPalette quick entities property-aware"
```

---

## Task 7: Migrate Guests + Reservations pages

Neither page keeps a local optimistic copy of property data (both read the imported arrays fresh on every render), so this is a pure mechanical swap — no remount-key needed.

**Files:**
- Modify: `src/app/app/guests/page.tsx`
- Modify: `src/app/app/reservations/page.tsx`

**Interfaces:**
- Consumes: `usePropertyData` (Task 3).

- [ ] **Step 1: Guests page — swap import and add the hook call**

Replace line 6:

```tsx
import { usePropertyData, MockGuest } from '@/lib/mock-data';
```

Add as the first line inside `GuestsPage()`, before `const [filter, setFilter] = useState('all');`:

```tsx
const { mockGuests, mockReservations, meta } = usePropertyData();
```

Update the hardcoded subtitle:

```tsx
<p className="text-body-sm text-muted-foreground mt-1">
  Every guest on file for {meta.name}.
</p>
```

Reroute the two VIP badges to the `vip` token (P1):

```tsx
{g.vip && <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-vip/20 text-vip font-bold">VIP</span>}
```

```tsx
badge={selected?.vip && (
  <span className="font-mono text-caption px-2 py-0.5 rounded-full bg-vip/15 text-vip border border-vip/30 uppercase">VIP</span>
)}
```

- [ ] **Step 2: Reservations page — swap import, move `filterChips` inside the component**

Replace line 8:

```tsx
import { usePropertyData, MockReservation } from '@/lib/mock-data';
```

`filterChips` is currently a module-scope `const` that reads `mockReservations` at module load — that array no longer exists at module scope, so move the whole `const filterChips: FilterChip[] = [...]` block (lines 36-42) inside `ReservationsPageContent()`, computed right after obtaining the data:

```tsx
function ReservationsPageContent() {
  const { mockReservations, meta } = usePropertyData();
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState(() => {
    const queryFilter = searchParams.get('filter');
    const chipId = queryFilter ? QUERY_FILTER_TO_CHIP[queryFilter] : undefined;
    return chipId ?? 'all';
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MockReservation | null>(null);
  const [drawerTab, setDrawerTab] = useState('overview');

  const filterChips: FilterChip[] = [
    { id: 'all', label: 'All Reservations', count: mockReservations.length },
    { id: 'today', label: 'Arriving Today', count: mockReservations.filter((r) => r.checkIn === 'Today').length },
    { id: 'departures', label: 'Departing Today', count: mockReservations.filter((r) => r.checkOut === 'Today').length },
    { id: 'in-house', label: 'In-House', count: mockReservations.filter((r) => r.status === 'checked-in').length },
    { id: 'cancelled', label: 'Cancelled', count: mockReservations.filter((r) => r.status === 'cancelled').length },
  ];

  const filtered = mockReservations.filter((r) => {
    if (filter === 'today') return r.checkIn === 'Today';
    if (filter === 'departures') return r.checkOut === 'Today';
    if (filter === 'in-house') return r.status === 'checked-in';
    if (filter === 'cancelled') return r.status === 'cancelled';
    return true;
  });
  // ...rest unchanged...
```

`columns`, `QUERY_FILTER_TO_CHIP`, and `drawerTabs` stay at module scope — none of them reference mock data. Update the hardcoded subtitle:

```tsx
<p className="text-body-sm text-muted-foreground mt-1">
  All bookings for {meta.name}, across every channel.
</p>
```

- [ ] **Step 3: Verify**

Run: `npm run build`
Expected: neither file appears in the error list.

- [ ] **Step 4: Commit**

```bash
git add src/app/app/guests/page.tsx src/app/app/reservations/page.tsx
git commit -m "feat: make Guests and Reservations pages property-aware"
```

---

## Task 8: Migrate Front Desk + Billing pages

Both seed `useOptimisticAction` from property data at the top of the component — apply the remount-key pattern from Global Constraints.

**Files:**
- Modify: `src/app/app/front-desk/page.tsx`
- Modify: `src/app/app/billing/page.tsx`

**Interfaces:**
- Consumes: `usePropertyData`, `usePropertyStore` (Tasks 1, 3).

- [ ] **Step 1: Front Desk page — swap imports, split into wrapper + keyed content**

```tsx
import { usePropertyData, MockReservation, MockRoom, ReservationStatus } from '@/lib/mock-data';
import { usePropertyStore } from '@/lib/property-store';
```

`roomReadiness` is a module-scope function that reads `mockRooms` — since `mockRooms` is no longer a module import, give it a `rooms` parameter instead:

```tsx
function roomReadiness(roomNumber: string, rooms: MockRoom[]): { label: string; className: string } {
  const room = rooms.find((r) => r.number === roomNumber);
  if (!room || room.status === 'available') {
    return { label: 'Room ready', className: 'text-status-ok border-status-ok/30 bg-status-ok/5' };
  }
  if (room.status === 'blocked') {
    return { label: 'Room blocked', className: 'text-status-crit border-status-crit/30 bg-status-crit/5' };
  }
  return { label: `Room ${room.status}`, className: 'text-status-warn border-status-warn/30 bg-status-warn/5' };
}
```

Split the export:

```tsx
export default function FrontDeskPage() {
  const activePropertyId = usePropertyStore((s) => s.activePropertyId);
  return <FrontDeskPageContent key={activePropertyId} />;
}

function FrontDeskPageContent() {
  const { mockReservations, mockRooms, meta } = usePropertyData();
  const { state: reservations, performAction } = useOptimisticAction<MockReservation[]>(mockReservations);
  const [filter, setFilter] = useState('arrivals');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<MockReservation | null>(null);
  const [drawerTab, setDrawerTab] = useState('overview');
  // ...rest of the body is unchanged, except every `roomReadiness(x)` call
  // becomes `roomReadiness(x, mockRooms)` (there are 3 call sites: the
  // table column render, and twice in the drawer's overview tab).
```

Update the hardcoded subtitle:

```tsx
<p className="text-body-sm text-muted-foreground mt-1">
  Today&apos;s arrivals, departures, and in-house guests for {meta.name}.
</p>
```

- [ ] **Step 2: Billing page — swap imports, split into wrapper + keyed content**

```tsx
import { usePropertyData, MockFolio, FolioStatus } from '@/lib/mock-data';
import { usePropertyStore } from '@/lib/property-store';
```

```tsx
export default function BillingPage() {
  const activePropertyId = usePropertyStore((s) => s.activePropertyId);
  return <BillingPageContent key={activePropertyId} />;
}

function BillingPageContent() {
  const { mockFolios, meta } = usePropertyData();
  const { state: folios, performAction } = useOptimisticAction<MockFolio[]>(mockFolios);
  const [filter, setFilter] = useState('outstanding');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<MockFolio | null>(null);
  // ...rest of the body is unchanged.
```

Update the hardcoded subtitle:

```tsx
<p className="text-body-sm text-muted-foreground mt-1">
  Guest folios and outstanding balances for {meta.name}.
</p>
```

- [ ] **Step 3: Verify**

Run: `npm run build`
Expected: neither file appears in the error list.

- [ ] **Step 4: Commit**

```bash
git add src/app/app/front-desk/page.tsx src/app/app/billing/page.tsx
git commit -m "feat: make Front Desk and Billing pages property-aware, remount on property switch"
```

---

## Task 9: Migrate Rooms page

**Files:**
- Modify: `src/app/app/rooms/page.tsx`

**Interfaces:**
- Consumes: `usePropertyData`, `usePropertyStore` (Tasks 1, 3).

- [ ] **Step 1: Swap the import, key the Suspense child**

```tsx
import { usePropertyData, MockRoom } from '@/lib/mock-data';
import { usePropertyStore } from '@/lib/property-store';
```

`toKanbanItem` already takes a `room: MockRoom` parameter — no change needed there. Update the two exports:

```tsx
export default function RoomsPage() {
  const activePropertyId = usePropertyStore((s) => s.activePropertyId);
  return (
    <Suspense fallback={null}>
      <RoomsPageContent key={activePropertyId} />
    </Suspense>
  );
}

function RoomsPageContent() {
  const { mockRooms, meta } = usePropertyData();
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusParam = searchParams.get('status');
  const highlightColumnId = statusParam ? QUERY_STATUS_TO_COLUMN[statusParam] ?? null : null;
  const highlightColumn = columns.find((c) => c.id === highlightColumnId);

  const { state: items, performAction } = useOptimisticAction<KanbanItem[]>(mockRooms.map(toKanbanItem));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<KanbanItem | null>(null);
  // ...handleItemMove unchanged...
```

Update the hardcoded subtitle:

```tsx
<p className="text-body-sm text-muted-foreground mt-1">
  {mockRooms.length} rooms across {meta.name}. Drag a card to change its status.
</p>
```

- [ ] **Step 2: Verify**

Run: `npm run build`
Expected: `rooms/page.tsx` no longer appears in the error list.

- [ ] **Step 3: Commit**

```bash
git add src/app/app/rooms/page.tsx
git commit -m "feat: make Rooms page property-aware, remount on property switch"
```

---

## Task 10: Migrate Housekeeping, Maintenance, Service Requests pages

All three have the identical shape: a module-scope `initialItems` derived from a mock array, fed into `useOptimisticAction`. Move the derivation inside the component and apply the remount-key pattern.

**Files:**
- Modify: `src/app/app/housekeeping/page.tsx`
- Modify: `src/app/app/maintenance/page.tsx`
- Modify: `src/app/app/service-requests/page.tsx`

**Interfaces:**
- Consumes: `usePropertyData`, `usePropertyStore` (Tasks 1, 3).

- [ ] **Step 1: Housekeeping page**

```tsx
import { usePropertyData } from '@/lib/mock-data';
import { usePropertyStore } from '@/lib/property-store';

const columns: KanbanColumn[] = [
  { id: 'dirty', title: 'Dirty' },
  { id: 'cleaning', title: 'Cleaning' },
  { id: 'inspected', title: 'Inspected' },
  { id: 'ready', title: 'Ready' },
];

export default function HousekeepingPage() {
  const activePropertyId = usePropertyStore((s) => s.activePropertyId);
  return <HousekeepingPageContent key={activePropertyId} />;
}

function HousekeepingPageContent() {
  const { mockHousekeepingTasks } = usePropertyData();
  const initialItems: KanbanItem[] = mockHousekeepingTasks.map((t) => ({
    id: t.id,
    title: t.roomLabel,
    subtitle: t.subtitle,
    status: t.status,
    priority: t.priority,
    assignee: t.assignee,
    meta: t.meta,
  }));
  const { state: items, performAction } = useOptimisticAction<KanbanItem[]>(initialItems);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<KanbanItem | null>(null);
  // ...rest of the body (handleItemMove + JSX return) is unchanged.
```

- [ ] **Step 2: Maintenance page**

```tsx
import { usePropertyData } from '@/lib/mock-data';
import { usePropertyStore } from '@/lib/property-store';

const columns: KanbanColumn[] = [
  { id: 'reported', title: 'Reported' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'resolved', title: 'Resolved' },
];

export default function MaintenancePage() {
  const activePropertyId = usePropertyStore((s) => s.activePropertyId);
  return <MaintenancePageContent key={activePropertyId} />;
}

function MaintenancePageContent() {
  const { mockMaintenanceTickets } = usePropertyData();
  const initialItems: KanbanItem[] = mockMaintenanceTickets.map((t) => ({
    id: t.id,
    title: `${t.title} — Room ${t.roomNumber}`,
    subtitle: t.detail,
    status: t.status,
    priority: t.priority,
    assignee: t.assignee,
    meta: t.reportedAt,
  }));
  const { state: items, performAction } = useOptimisticAction<KanbanItem[]>(initialItems);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<KanbanItem | null>(null);
  // ...rest unchanged...
```

- [ ] **Step 3: Service Requests page**

```tsx
import { usePropertyData } from '@/lib/mock-data';
import { usePropertyStore } from '@/lib/property-store';

const columns: KanbanColumn[] = [
  { id: 'open', title: 'Open' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'resolved', title: 'Resolved' },
];

export default function ServiceRequestsPage() {
  const activePropertyId = usePropertyStore((s) => s.activePropertyId);
  return <ServiceRequestsPageContent key={activePropertyId} />;
}

function ServiceRequestsPageContent() {
  const { mockServiceRequests } = usePropertyData();
  const initialItems: KanbanItem[] = mockServiceRequests.map((r) => ({
    id: r.id,
    title: r.title,
    subtitle: `Room ${r.roomNumber} · ${r.guestName}`,
    status: r.status,
    priority: r.priority,
    assignee: r.assignee,
    meta: r.waitingSince,
  }));
  const { state: items, performAction } = useOptimisticAction<KanbanItem[]>(initialItems);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<KanbanItem | null>(null);
  // ...handleItemMove unchanged...
  const requestMeta = selected ? mockServiceRequests.find((r) => r.id === selected.id) : undefined;
  // ...rest unchanged...
```

- [ ] **Step 4: Verify**

Run: `npm run build`
Expected: none of the three files appears in the error list.

- [ ] **Step 5: Commit**

```bash
git add src/app/app/housekeeping/page.tsx src/app/app/maintenance/page.tsx src/app/app/service-requests/page.tsx
git commit -m "feat: make Housekeeping, Maintenance, Service Requests pages property-aware"
```

---

## Task 11: Migrate `dev/patterns/page.tsx`

Dev-only showcase — included for import consistency per the spec, but not user-facing and not part of the "dashboard truth" invariant, so no remount-key.

**Files:**
- Modify: `src/app/dev/patterns/page.tsx`

**Interfaces:**
- Consumes: `usePropertyData` (Task 3).

- [ ] **Step 1: Swap the import and add the hook call**

Replace line 11:

```tsx
import { usePropertyData, MockReservation } from '@/lib/mock-data';
```

Add as the first line inside `PatternsDevPage()`:

```tsx
const { mockReservations, mockHousekeepingTasks } = usePropertyData();
```

Everything below (`rawReservations`, the `kanbanItems` `useState` seed, `columns`, etc.) already references these two names and needs no further change.

- [ ] **Step 2: Verify**

Run: `npm run build`
Expected: `dev/patterns/page.tsx` no longer appears in the error list.

- [ ] **Step 3: Commit**

```bash
git add src/app/dev/patterns/page.tsx
git commit -m "feat: make dev pattern showcase property-aware"
```

---

## Task 12: Dashboard P0 — real KPIs, Needs Attention, Today's Key Shifts, Recent Ops Feed

The big one. Replaces every hardcoded number and the 3 hand-written JSX rows with derivations off the active `PropertyDataset`, and folds in P1's two dashboard-specific color reroutes.

**Files:**
- Modify: `src/app/app/dashboard/page.tsx` (full rewrite)

**Interfaces:**
- Consumes: `usePropertyData`, `usePropertyStore`, `PropertyDataset` (Tasks 1, 3), `--color-vip` (Task 2).

- [ ] **Step 1: Replace the entire file**

```tsx
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
```

Note: `Clock`, `Sparkles`, `ArrowRight`, `CheckCircle2`, `Users`, `Bed`, `ChevronRight`, `ShieldAlert`, `DollarSign` are imported but unused by this JSX — this matches the original file, which already shipped with this same set unused (`AlertCircle` and `TrendingUp` are the only two icons this rewrite actually drops, since the revenue card's trend line — the one thing that used them — is gone). If `npm run build` fails on unused-import errors, drop the ones this file doesn't reference; if it doesn't (most likely, since the original file already built fine with unused imports), leave them as-is rather than doing an unrelated cleanup pass.

- [ ] **Step 2: Verify**

Run: `npm run build`
Expected: succeeds. This should be the last file in the original error list — a clean build here means all 12 files plus the dashboard are fully migrated.

- [ ] **Step 3: Commit**

```bash
git add src/app/app/dashboard/page.tsx
git commit -m "feat: derive dashboard KPIs, Needs Attention, Key Shifts, and activity feed from real property data"
```

---

## Task 13: Final verification pass

**Files:** none (verification only)

- [ ] **Step 1: Full build**

Run: `npm run build`
Expected: succeeds with zero TypeScript errors.

- [ ] **Step 2: Start the dev server and manually verify in-browser**

Run: `npm run dev`, open the app, and for **each of the 3 properties** (switch via `AppTopBar`'s dropdown):

- Dashboard: Occupancy, Arrivals Today, Departures Today, In-House Guests, Revenue Today all show real numbers (not the old 14/11/42/₹1.84L); Needs Attention item counts match the counts shown on Housekeeping/Billing/Service Requests/Maintenance pages; Today's Key Shifts rows reference guests/rooms that exist on the Guests/Rooms pages; Recent Operations Feed shows that property's activity log.
- Front Desk, Reservations, Guests, Rooms, Housekeeping, Maintenance, Service Requests, Billing: each re-renders with that property's data (room/guest/reservation counts change when switching).
- Command Palette (`⌘K`): the two featured "Guests & Reservations" quick entities and the maintenance-room entity change per property.
- AppSidebar: the Housekeeping badge count and the footer name/initials change per property.
- Property dropdown: room counts shown next to each property name are correct (25 / 6 / 4).
- No console errors, no React hydration-mismatch warnings.

- [ ] **Step 3: Persistence check**

Switch to a non-default property (Pine & Peaks or Wildflower Valley), reload the page. Expected: the same property is still active (localStorage key `stayo-active-property`), with no visible flash of Off The Trail's data before it settles.

- [ ] **Step 4: Color hierarchy check**

Confirm: VIP badges (Guests page, Dashboard Key Shifts, Dashboard In-House subtext) render in the new gold/champagne `--color-vip`, distinct from the orange `--color-accent`. "AI Agents Active" (top bar) and "StayO AI Recommendations" (dashboard) render in blue `--color-status-info`. Brand mark, primary CTAs, active nav state, and Revenue KPI are still accent-colored (unchanged).

- [ ] **Step 5: No commit** (verification only — if any check fails, fix the underlying task and re-commit there, don't accumulate fixes here).
