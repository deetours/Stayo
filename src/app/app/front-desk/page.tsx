'use client';

import React, { useState } from 'react';
import { LogIn, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { DataTable, Column, FilterChip } from '@/components/patterns/DataTable';
import { DetailDrawer, TabItem } from '@/components/patterns/DetailDrawer';
import { Button } from '@/components/ui/button';
import { useOptimisticAction } from '@/hooks/useOptimisticAction';
import { usePropertyData, MockReservation, MockRoom, ReservationStatus } from '@/lib/mock-data';
import { usePropertyStore } from '@/lib/property-store';
import { useRowFlash } from '@/hooks/use-row-flash';

const STATUS_COLORS: Record<ReservationStatus, string> = {
  'checked-in': 'bg-status-ok/10 text-status-ok border-status-ok/30',
  confirmed: 'bg-status-info/10 text-status-info border-status-info/30',
  'checked-out': 'bg-surface-2 text-muted-foreground border-border',
  cancelled: 'bg-status-crit/10 text-status-crit border-status-crit/30',
};

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

const drawerTabs: TabItem[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'folio', label: 'Folio & Charges' },
];

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
  const { containerRef, flashRow } = useRowFlash();

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
    flashRow(item.id);
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
    flashRow(item.id);
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
        <span className={`text-body-sm font-medium ${roomReadiness(r.roomNumber, mockRooms).className.split(' ')[0]}`}>
          {roomReadiness(r.roomNumber, mockRooms).label}
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
          Today&apos;s arrivals, departures, and in-house guests for {meta.name}.
        </p>
      </div>

      <div ref={containerRef}>
        <DataTable<MockReservation>
          data={filtered}
          columns={columns}
          keyExtractor={(r) => r.id}
          filterChips={filterChips}
          activeFilter={filter}
          onFilterChange={setFilter}
          onRowClick={openDrawer}
          actions={[
            { label: 'Check In', icon: <LogIn className="w-4 h-4" />, onClick: handleCheckIn, variant: 'primary' },
            { label: 'Check Out', icon: <LogOut className="w-4 h-4" />, onClick: handleCheckOut, variant: 'primary' },
          ]}
          emptyTitle="Nothing due right now"
          emptyDescription="No arrivals, departures, or in-house guests match this filter."
        />
      </div>

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
          <Button variant="secondary" onClick={() => setDrawerOpen(false)}>
            Close
          </Button>
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
            <div className={`p-3 rounded-md border text-body-sm font-medium ${roomReadiness(selected.roomNumber, mockRooms).className}`}>
              {roomReadiness(selected.roomNumber, mockRooms).label}
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
