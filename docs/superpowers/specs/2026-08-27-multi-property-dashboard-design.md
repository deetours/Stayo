# Multi-property data scoping + dashboard truth + color hierarchy

Status: approved by user, ready for implementation planning.

## Why

Phase-0 investigation of the dashboard found three trust problems:

1. **P0 — Dashboard truth.** The KPI strip (Arrivals, Departures, In-House
   Guests, Revenue) and the "Needs Attention" counts are hardcoded numbers
   that don't match `mock-data.ts`. A GSAP count-up animation makes these
   fake numbers look live, which makes them actively misleading.
2. **P1 — Color hierarchy.** `--color-accent` (#d97706) is reused for the
   brand mark, primary CTAs, active nav state, VIP badges, AI/automation
   badges, and the Revenue KPI — six unrelated meanings sharing one color,
   which flattens visual hierarchy.
3. **P2 — Property switcher.** `AppTopBar` offers 3 properties in a
   dropdown, but only "Off The Trail — Dalhousie" has any data behind it.
   Selecting either other property changes the header label and nothing
   else — the switcher promises multi-property and delivers single-property.

The user's explicit direction on P2: **build real multi-property data
scoping**, not a "coming soon" lock. That decision upgrades this from a
same-file bug fix into a data-layer restructure touching every page that
reads `mock-data.ts` (12 files), so this went through the architectural
design path instead of a bounded one.

## Non-goals

- No backend/API/database — this stays a static, in-memory demo.
- No URL-based property routing (`/app/[propertyId]/...`). Routes stay
  flat; the active property is client state.
- No per-property theming, branding, or visual differentiation beyond
  the data itself.
- No auth/permissions scoping per property.
- No changes to the 13 gated ("Coming Soon") sidebar routes — out of
  scope, already covered by the existing `isRouteBuilt()` gate.

## Architecture

**Approach:** a Zustand-backed active-property id (persisted to
localStorage) plus a `propertyDatasets` map in `mock-data.ts`, read
through one `usePropertyData()` hook. Routing is untouched — every
`SmartLink`, `CommandPalette` result, and `isRouteBuilt()` check keeps
working exactly as it does today; only *which data* renders under those
routes changes.

Rejected: URL-scoped properties (`/app/[propertyId]/dashboard`) — would
require every link, the Command Palette, and the route-gating logic to
become property-aware, a much larger and riskier routing change, and
exactly the kind of routing surgery AGENTS.md warns is easy to get wrong
in this Next.js version. Not worth it for a client-only demo dataset.

### Data layer (`src/lib/mock-data.ts`)

Existing flat exports (`mockRooms`, `mockReservations`, `mockGuests`,
`mockFolios`, `mockHousekeepingTasks`, `mockServiceRequests`,
`mockMaintenanceTickets`, `room204Alert`, `roomStatusCounts`,
`TOTAL_ROOMS`) move inside a per-property bundle:

```ts
export type PropertyId = 'off-the-trail' | 'pine-peaks' | 'wildflower-valley';

export interface PropertyMeta {
  id: PropertyId;
  name: string;
  type: string; // 'Boutique Resort' | 'Homestay' | 'Cabin Villa'
}

export interface ActivityLogEntry {
  id: string;
  message: string;   // "Reservation #8923 created by Concierge Agent via WhatsApp"
  tone: 'ok' | 'info' | 'warn';
  timestamp: string;  // relative time string, matches existing convention
}

export interface PropertyDataset {
  meta: PropertyMeta;
  rooms: MockRoom[];
  totalRooms: number;
  roomStatusCounts: Record<RoomStatus, number>;
  reservations: MockReservation[];
  guests: MockGuest[];
  folios: MockFolio[];
  housekeepingTasks: MockHousekeepingTask[];
  serviceRequests: MockServiceRequest[];
  maintenanceTickets: MockMaintenanceTicket[];
  signatureIncident: RoomAlert;   // this property's one flagged incident
  activityLog: ActivityLogEntry[];
}

export const propertyDatasets: Record<PropertyId, PropertyDataset> = { /* ... */ };
```

`roomStatusCounts` and `totalRooms` are still *computed* from `rooms`
(as today), just once per property at module load, not hand-maintained.

Two additive, non-breaking field additions to existing interfaces:

- `MockReservation` gains `guestCount?: number` (default 1 when absent)
  and `amountValue: number` (numeric twin of the existing display string
  `amount`, used only for KPI aggregation — `amount` itself is untouched,
  so the 5 files that already render `.amount` as text need no changes).
  Reservations relevant to "today" also get optional `arrivalTime?` /
  `departureTime?: string` (e.g. `'14:00'`) to drive the dashboard's
  "Today's Key Shifts & Stays" list.
- No changes to `MockFolio`, `MockGuest`, `MockHousekeepingTask`,
  `MockServiceRequest`, or `MockMaintenanceTicket` shapes — only their
  values become per-property.

**Invariant:** every `activityLog` entry, `signatureIncident`, and
"Today's Key Shifts" row must reference only room numbers / guest names /
IDs that exist elsewhere in that same property's dataset. This is the
exact bug being fixed (dashboard numbers disagreeing with the pages they
link to) — the new structure must not reintroduce it under a different
property.

### State & persistence (`src/lib/property-store.ts`, new file)

```ts
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

Kept separate from `useUIStore` — this is data-scoping state, not shell
UI state, and `persist` only needs to wrap the one slice that goes to
localStorage. `hasHydrated` exists so consuming pages can render the
`off-the-trail` default on first server/client paint and swap in the
persisted value post-hydration without a flash — standard Zustand+Next.js
pattern, low risk since every consuming page here is already `'use
client'`.

### The `usePropertyData()` hook (`src/lib/mock-data.ts` or co-located)

```ts
export function usePropertyData(): PropertyDataset {
  const activePropertyId = usePropertyStore((s) => s.activePropertyId);
  return propertyDatasets[activePropertyId];
}
```

### Component migration

12 files currently do
`import { mockRooms, ... } from '@/lib/mock-data'` at module scope:

`front-desk/page.tsx`, `billing/page.tsx`, `maintenance/page.tsx`,
`service-requests/page.tsx`, `guests/page.tsx`, `reservations/page.tsx`,
`dashboard/page.tsx`, `rooms/page.tsx`, `housekeeping/page.tsx`,
`dev/patterns/page.tsx`, `components/shell/CommandPalette.tsx`,
`components/shell/AppSidebar.tsx`.

Each switches the import to `usePropertyData` and destructures inside
the component body: `const { mockRooms, ... } = usePropertyData();`.
Mechanical — no logic in these files changes beyond the data source.
(`dev/patterns/page.tsx` is a dev-only showcase; include it for
consistency but it's not user-facing.)

`AppTopBar.tsx`: drop the local `mockProperties` array and
`activeProperty` `useState`. Property list for the dropdown comes from
`Object.values(propertyDatasets).map(d => d.meta)`; the checkmark compares
against `usePropertyStore(s => s.activePropertyId)`; `handleSelectProperty`
calls `setActiveProperty(id)` instead of local `setState`. The transient
"You are now viewing X" banner behavior is unchanged.

`CommandPalette.tsx`: its searchable entities come from the active
property's `usePropertyData()` instead of any hardcoded list — this also
resolves the earlier-noted "curated ~3 hardcoded quick entities" gap for
whichever property is active.

## P0 — Dashboard truth

`dashboard/page.tsx` KPI strip and Needs Attention no longer carry
hardcoded values. Derived from the active `PropertyDataset`:

- **Occupancy** — unchanged (`occupied / totalRooms`, already real).
- **Arrivals Today** — `reservations.filter(r => r.checkIn === 'Today' && r.status !== 'cancelled').length`.
- **Departures Today** — `reservations.filter(r => r.checkOut === 'Today').length`.
- **In-House Guests** — sum of `guestCount ?? 1` over reservations with
  `status === 'checked-in'`. VIP sub-count = same set filtered by
  `guests.find(g => g.name === r.guestName)?.vip`.
- **Revenue Today** — sum of `amountValue` over reservations with
  `checkIn === 'Today'`.
- **Needs Attention** — each item's count is a live `.length`/`.filter()`
  over the corresponding array (`housekeepingTasks` awaiting inspection,
  `folios` with `status !== 'paid'`, `serviceRequests` with
  `status === 'open'`, `maintenanceTickets` with `status !== 'resolved'`),
  so it can't desync from the page it links to again.
- **Today's Key Shifts & Stays** — replaces the 3 hand-written JSX rows
  with a `.map()` over reservations that have `arrivalTime`/`departureTime`
  set for today, badge state (maintenance delay / VIP / room ready /
  checked out) derived from `signatureIncident`, `guest.vip`, and
  `reservation.status`.
- **Recent Operations Feed** — replaces the 3 hand-written JSX rows with
  a `.map()` over `activityLog`.

The old hardcoded target numbers (14/11/42/₹1.84L) are dropped, not
preserved as a floor — the dataset is sized so real derived numbers read
as a believable, moderately busy property (not empty, not implausibly
overbooked for 25 rooms), per the user's direction that "world class"
means every number is real and internally consistent, not inflated.

## P1 — Color hierarchy

Two token/usage changes in `globals.css` and consuming components:

- New `--color-vip` (gold/champagne, distinct from `--color-accent`) for
  VIP badges (currently `bg-accent/20 text-accent`).
- AI/automation surfaces — the "AI Agents Active" top-bar badge and the
  "StayO AI Recommendations" label/icon on the dashboard — reroute from
  `text-accent`/`bg-accent/*` to the existing `--color-status-info` blue.
- Everything else currently on accent (brand mark, primary CTAs, active
  nav state and its icon/border, Revenue KPI, "Ask StayO" button) stays
  accent — those are legitimately the same category (brand / primary
  action / money), and are exactly where accent should draw the eye.

## Data sizing for the two new properties

- **Pine & Peaks Homestay** (6 rooms) and **Wildflower Valley Cabin**
  (4 rooms) each get a full `PropertyDataset` — every array populated,
  proportionally sized to room count (e.g. 2-4 reservations, not 15;
  1-2 open service requests, not 5).
- Each gets its own `signatureIncident` (not a copy of Room 204's leak)
  so the three properties don't feel like reskins of one dataset.
- Guest names, folio amounts, and activity-log entries are property-
  specific — no shared identities across properties.

## Testing / verification

- `npm run build` (or the project's existing type-check command) must
  pass — the additive field changes and the 12-file import swap are
  exactly the kind of thing TypeScript will catch if a file is missed.
- Manual pass in-browser: switch properties via `AppTopBar`, confirm
  every one of the 9 built pages (Dashboard, Front Desk, Reservations,
  Guests, Rooms, Housekeeping, Maintenance, Service Requests, Billing)
  re-renders with that property's data, Needs Attention counts match
  the pages they link to, and Command Palette search only surfaces the
  active property's entities.
- Reload the page mid-session and confirm the selected property persists
  (localStorage), with no hydration-mismatch flash.
