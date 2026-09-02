'use client';

import React, { useState } from 'react';
import { DataTable, Column, FilterChip } from '@/components/patterns/DataTable';
import { DetailDrawer, TabItem } from '@/components/patterns/DetailDrawer';
import { Button } from '@/components/ui/button';
import { usePropertyData, MockGuest } from '@/lib/mock-data';

const columns: Column<MockGuest>[] = [
  {
    key: 'name',
    header: 'Guest',
    sortable: true,
    render: (g) => (
      <div className="flex items-center gap-2">
        <span className="font-medium text-foreground">{g.name}</span>
        {g.vip && <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-vip/20 text-vip font-bold">VIP</span>}
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
  const { mockGuests, mockReservations, meta } = usePropertyData();
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
          Every guest on file for {meta.name}.
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
        renderMobileCard={(g) => (
          <div className="space-y-2 mt-1">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-body-md text-foreground">{g.name}</span>
                  {g.vip && <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-vip/20 text-vip font-bold">VIP</span>}
                </div>
                <div className="font-mono text-[10px] text-muted-foreground mt-0.5">{g.email}</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-body-sm bg-surface-2 p-2 rounded-sm border border-border/50">
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Stays</span>
                <span className="font-mono text-foreground">{g.totalStays}</span>
              </div>
              <div className="flex flex-col text-center">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Last Stay</span>
                <span className="text-foreground">{g.lastStay}</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Spend</span>
                <span className="font-mono font-semibold text-foreground">{g.totalSpend}</span>
              </div>
            </div>
          </div>
        )}
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
          <span className="font-mono text-caption px-2 py-0.5 rounded-full bg-vip/15 text-vip border border-vip/30 uppercase">VIP</span>
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
