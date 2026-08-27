'use client';

import React, { useState } from 'react';
import { DataTable, Column, FilterChip } from '@/components/patterns/DataTable';
import { DetailDrawer, TabItem } from '@/components/patterns/DetailDrawer';
import { Button } from '@/components/ui/button';
import { usePropertyData, MockRate } from '@/lib/mock-data';
import { toast } from 'sonner';

const STATUS_COLORS: Record<MockRate['status'], string> = {
  standard: 'bg-surface-2 text-muted-foreground border-border',
  surge: 'bg-accent/10 text-accent border-accent/30',
  discount: 'bg-status-ok/10 text-status-ok border-status-ok/30',
};

const columns: Column<MockRate>[] = [
  { key: 'roomType', header: 'Room Type', sortable: true, render: (r) => <span className="font-medium text-foreground">{r.roomType}</span> },
  { key: 'baseRate', header: 'Base Rate', align: 'right', sortable: true, render: (r) => <span className="font-mono text-muted-foreground">₹{r.baseRate.toLocaleString('en-IN')}</span> },
  { 
    key: 'currentRate', 
    header: 'Active Rate', 
    align: 'right', 
    sortable: true, 
    render: (r) => (
      <span className={`font-mono font-semibold ${r.currentRate > r.baseRate ? 'text-accent' : r.currentRate < r.baseRate ? 'text-status-ok' : 'text-foreground'}`}>
        ₹{r.currentRate.toLocaleString('en-IN')}
      </span>
    )
  },
  { key: 'occupancy', header: 'Occupancy', align: 'center', sortable: true, render: (r) => <span className="font-mono">{r.occupancy}%</span> },
  {
    key: 'status',
    header: 'Modifier',
    sortable: true,
    render: (r) => (
      <span className={`px-2 py-0.5 rounded-full text-caption font-medium uppercase border ${STATUS_COLORS[r.status]}`}>
        {r.status}
      </span>
    ),
  },
];

const drawerTabs: TabItem[] = [
  { id: 'pricing', label: 'Pricing Rules' },
];

export default function RatesPage() {
  const { mockRates, meta } = usePropertyData();
  const [filter, setFilter] = useState('all');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<MockRate | null>(null);
  const [drawerTab, setDrawerTab] = useState('pricing');

  const filterChips: FilterChip[] = [
    { id: 'all', label: 'All Room Types', count: mockRates.length },
    { id: 'surge', label: 'Surge Pricing', count: mockRates.filter((r) => r.status === 'surge').length },
    { id: 'discount', label: 'Discounted', count: mockRates.filter((r) => r.status === 'discount').length },
  ];

  const filtered = mockRates.filter((r) => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  const openDrawer = (item: MockRate) => {
    setSelected(item);
    setDrawerTab('pricing');
    setDrawerOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-heading-lg font-semibold tracking-tight text-foreground">Rates</h1>
        <p className="text-body-sm text-muted-foreground mt-1">
          Dynamic pricing rules and active rates for {meta.name}.
        </p>
      </div>

      <DataTable<MockRate>
        data={filtered}
        columns={columns}
        keyExtractor={(r) => r.id}
        filterChips={filterChips}
        activeFilter={filter}
        onFilterChange={setFilter}
        onRowClick={openDrawer}
        emptyTitle="No rates found"
        emptyDescription="No room types match this filter."
        actions={[{ label: 'Edit Pricing', onClick: (item) => openDrawer(item) }]}
      />

      <DetailDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selected?.roomType ?? 'Rate'}
        tabs={drawerTabs}
        activeTab={drawerTab}
        onTabChange={setDrawerTab}
        badge={selected && (
          <span className={`font-mono text-caption px-2 py-0.5 rounded-full border uppercase ${STATUS_COLORS[selected.status]}`}>
            {selected.status}
          </span>
        )}
        footerActions={
          <>
            <Button variant="secondary" onClick={() => setDrawerOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              toast.success('Rate rules updated');
              setDrawerOpen(false);
            }}>
              Save Changes
            </Button>
          </>
        }
      >
        {drawerTab === 'pricing' && selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-md bg-surface-2 border border-border">
                <div className="text-caption text-muted-foreground">Base Rate</div>
                <div className="text-body-lg font-medium text-foreground mt-0.5 font-mono">₹{selected.baseRate.toLocaleString('en-IN')}</div>
              </div>
              <div className="p-3 rounded-md bg-surface-2 border border-border">
                <div className="text-caption text-muted-foreground">Active Override</div>
                <div className="text-body-lg font-medium text-foreground mt-0.5 font-mono">₹{selected.currentRate.toLocaleString('en-IN')}</div>
              </div>
            </div>
            
            <div className="p-4 rounded-md bg-surface-2 border border-border space-y-2">
               <div className="text-caption text-muted-foreground">Active Rules</div>
               {selected.status === 'surge' ? (
                 <p className="text-body-sm text-foreground">Weekend surge pricing active due to high occupancy ({selected.occupancy}%).</p>
               ) : selected.status === 'discount' ? (
                 <p className="text-body-sm text-foreground">Last-minute discount active to fill remaining inventory.</p>
               ) : (
                 <p className="text-body-sm text-foreground">No active overrides. Base rate is applied.</p>
               )}
            </div>
          </div>
        )}
      </DetailDrawer>
    </div>
  );
}
