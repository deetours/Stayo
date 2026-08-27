'use client';

import React, { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { DataTable, Column, FilterChip } from '@/components/patterns/DataTable';
import { DetailDrawer, TabItem } from '@/components/patterns/DetailDrawer';
import { usePropertyData, MockReservation } from '@/lib/mock-data';

const STATUS_COLORS: Record<MockReservation['status'], string> = {
  'checked-in': 'bg-status-ok/10 text-status-ok border-status-ok/30',
  confirmed: 'bg-status-info/10 text-status-info border-status-info/30',
  'checked-out': 'bg-surface-2 text-muted-foreground border-border',
  cancelled: 'bg-status-crit/10 text-status-crit border-status-crit/30',
};

const columns: Column<MockReservation>[] = [
  { key: 'id', header: 'ID', sortable: true, render: (r) => <span className="font-mono text-muted-foreground">{r.id}</span> },
  { key: 'guestName', header: 'Guest', sortable: true, render: (r) => <span className="font-medium text-foreground">{r.guestName}</span> },
  { key: 'roomNumber', header: 'Room', sortable: true, render: (r) => <span className="font-mono font-medium px-2 py-0.5 rounded-sm bg-surface-2 border border-border">{r.roomNumber}</span> },
  { key: 'dates', header: 'Stay Dates', render: (r) => <span className="text-muted-foreground">{r.checkIn} – {r.checkOut}</span> },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    render: (r) => (
      <span className={`px-2 py-0.5 rounded-full text-caption font-medium uppercase border ${STATUS_COLORS[r.status]}`}>
        {r.status}
      </span>
    ),
  },
  { key: 'channel', header: 'Channel', sortable: true, render: (r) => <span className="text-body-sm text-muted-foreground">{r.channel}</span> },
  { key: 'amount', header: 'Total', align: 'right', sortable: true, render: (r) => <span className="font-mono font-semibold text-foreground">{r.amount}</span> },
];

// Maps the ?filter= values the Dashboard's KPI cards link with onto this
// page's own filter chip ids — so those links actually filter instead of
// landing on the unfiltered "All Reservations" view.
const QUERY_FILTER_TO_CHIP: Record<string, string> = {
  arrivals: 'today',
  departures: 'departures',
};

const drawerTabs: TabItem[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'folio', label: 'Folio & Charges', count: 2 },
  { id: 'messages', label: 'Communication History', count: 4 },
  { id: 'activity', label: 'Activity Log' },
];

export default function ReservationsPage() {
  return (
    <Suspense fallback={null}>
      <ReservationsPageContent />
    </Suspense>
  );
}

function ReservationsPageContent() {
  const { mockReservations, meta } = usePropertyData();
  const searchParams = useSearchParams();
  // Lazy initializer so the incoming link's filter applies once, on arrival,
  // without a setState-in-effect render cascade — the chips themselves own
  // filter state from then on.
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

  const openDrawer = (item: MockReservation) => {
    setSelectedRecord(item);
    setDrawerTab('overview');
    setDrawerOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-heading-lg font-semibold tracking-tight text-foreground">Reservations</h1>
        <p className="text-body-sm text-muted-foreground mt-1">
          All bookings for {meta.name}, across every channel.
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
        actions={[{ label: 'View details', onClick: (item) => openDrawer(item) }]}
        bulkActions={[
          { label: 'Batch Check-In', onClick: (items) => toast.success(`Checking in ${items.length} guests`) },
          { label: 'Cancel Bookings', variant: 'destructive', onClick: (items) => toast.success(`Cancelling ${items.length} reservations`) },
        ]}
        emptyTitle="No reservations found"
        emptyDescription="There are currently no reservations booked for this filter."
        emptyActionLabel="Add Reservation"
        onEmptyAction={() => toast('New reservation flow coming soon')}
      />

      <DetailDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedRecord?.guestName ?? 'Details'}
        subtitle={selectedRecord ? `ID: ${selectedRecord.id}` : undefined}
        tabs={drawerTabs}
        activeTab={drawerTab}
        onTabChange={setDrawerTab}
        badge={
          selectedRecord && (
            <span className="font-mono text-caption px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30 uppercase">
              {selectedRecord.status}
            </span>
          )
        }
        footerActions={
          <>
            <button
              onClick={() => setDrawerOpen(false)}
              className="px-4 py-2 rounded-sm bg-surface-2 border border-border text-foreground hover:bg-border text-body-sm font-medium transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => {
                toast.success('Saved changes');
                setDrawerOpen(false);
              }}
              className="px-4 py-2 rounded-sm bg-accent text-accent-foreground text-body-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
            >
              Save Changes
            </button>
          </>
        }
      >
        <div className="space-y-6">
          {drawerTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-md bg-surface-2 border border-border">
                  <div className="text-caption text-muted-foreground">Room Assigned</div>
                  <div className="font-mono text-body-lg font-semibold text-foreground mt-0.5">
                    {selectedRecord?.roomNumber}
                  </div>
                </div>
                <div className="p-3 rounded-md bg-surface-2 border border-border">
                  <div className="text-caption text-muted-foreground">Channel</div>
                  <div className="text-body-lg font-medium text-foreground mt-0.5">
                    {selectedRecord?.channel}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-md bg-surface-2 border border-border space-y-3">
                <h5 className="text-body-md font-semibold text-foreground">Guest Preferences & AI Notes</h5>
                <p className="text-body-sm text-muted-foreground">
                  Prefers quiet room away from elevator. Requested extra towels via WhatsApp concierge.
                </p>
                <div className="inline-flex items-center gap-1.5 text-caption text-accent font-medium">
                  <span>✓ Verified by Concierge Agent</span>
                </div>
              </div>
            </div>
          )}

          {drawerTab === 'folio' && (
            <div className="p-4 rounded-md bg-surface-2 border border-border space-y-3">
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="text-body-sm text-muted-foreground">Room Charges</span>
                <span className="font-mono font-medium text-foreground">{selectedRecord?.amount}</span>
              </div>
              <div className="flex justify-between items-center pt-1 font-semibold">
                <span className="text-body-md text-foreground">Total Balance Due</span>
                <span className="font-mono text-heading-sm text-accent">{selectedRecord?.amount}</span>
              </div>
            </div>
          )}

          {drawerTab === 'messages' && (
            <div className="space-y-3">
              <div className="p-3 rounded-md bg-surface-2 border border-border text-body-sm space-y-1">
                <div className="flex justify-between text-caption text-muted-foreground">
                  <span>WhatsApp · Inbound</span>
                  <span className="font-mono">Yesterday, 4:12 PM</span>
                </div>
                <p className="text-foreground">&ldquo;Hi, can we request late checkout around 1:00 PM tomorrow?&rdquo;</p>
              </div>
              <div className="p-3 rounded-md bg-accent/10 border border-accent/20 text-body-sm space-y-1">
                <div className="flex justify-between text-caption text-accent">
                  <span>Concierge Agent · Auto-Replied</span>
                  <span className="font-mono">Yesterday, 4:13 PM</span>
                </div>
                <p className="text-foreground">&ldquo;Certainly! Your late checkout at 1:00 PM is approved.&rdquo;</p>
              </div>
            </div>
          )}

          {drawerTab === 'activity' && (
            <div className="text-body-sm text-muted-foreground italic">
              No recent modifications logged today.
            </div>
          )}
        </div>
      </DetailDrawer>
    </div>
  );
}
