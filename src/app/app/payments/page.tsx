'use client';

import React, { useState } from 'react';
import { DataTable, Column, FilterChip } from '@/components/patterns/DataTable';
import { DetailDrawer, TabItem } from '@/components/patterns/DetailDrawer';
import { Button } from '@/components/ui/button';
import { usePropertyData, MockPayment } from '@/lib/mock-data';
import { toast } from 'sonner';

const STATUS_COLORS: Record<MockPayment['status'], string> = {
  success: 'bg-status-ok/10 text-status-ok border-status-ok/30',
  pending: 'bg-status-warn/10 text-status-warn border-status-warn/30',
  failed: 'bg-status-crit/10 text-status-crit border-status-crit/30',
  refunded: 'bg-surface-2 text-muted-foreground border-border',
};

const columns: Column<MockPayment>[] = [
  { key: 'id', header: 'Txn ID', sortable: true, render: (p) => <span className="font-mono text-muted-foreground">{p.id}</span> },
  { key: 'date', header: 'Date', sortable: true, render: (p) => <span className="text-muted-foreground">{p.date}</span> },
  { key: 'guestName', header: 'Guest', sortable: true, render: (p) => <span className="font-medium text-foreground">{p.guestName}</span> },
  { key: 'method', header: 'Method', sortable: true, render: (p) => <span className="text-muted-foreground">{p.method}</span> },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    render: (p) => (
      <span className={`px-2 py-0.5 rounded-full text-caption font-medium uppercase border ${STATUS_COLORS[p.status]}`}>
        {p.status}
      </span>
    ),
  },
  { key: 'amount', header: 'Amount', align: 'right', sortable: true, render: (p) => <span className="font-mono font-semibold text-foreground">₹{p.amount.toLocaleString('en-IN')}</span> },
];

const drawerTabs: TabItem[] = [
  { id: 'details', label: 'Transaction Details' },
];

export default function PaymentsPage() {
  const { mockPayments, meta } = usePropertyData();
  const [filter, setFilter] = useState('all');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<MockPayment | null>(null);
  const [drawerTab, setDrawerTab] = useState('details');

  const filterChips: FilterChip[] = [
    { id: 'all', label: 'All Payments', count: mockPayments.length },
    { id: 'success', label: 'Successful', count: mockPayments.filter((p) => p.status === 'success').length },
    { id: 'pending', label: 'Pending', count: mockPayments.filter((p) => p.status === 'pending').length },
    { id: 'failed', label: 'Failed', count: mockPayments.filter((p) => p.status === 'failed').length },
  ];

  const filtered = mockPayments.filter((p) => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  const openDrawer = (item: MockPayment) => {
    setSelected(item);
    setDrawerTab('details');
    setDrawerOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-heading-lg font-semibold tracking-tight text-foreground">Payments</h1>
        <p className="text-body-sm text-muted-foreground mt-1">
          Recent transactions and payment gateway activity for {meta.name}.
        </p>
      </div>

      <DataTable<MockPayment>
        data={filtered}
        columns={columns}
        keyExtractor={(p) => p.id}
        filterChips={filterChips}
        activeFilter={filter}
        onFilterChange={setFilter}
        onRowClick={openDrawer}
        emptyTitle="No payments found"
        emptyDescription="No transactions match this filter."
        actions={[{ label: 'View Details', onClick: (item) => openDrawer(item) }]}
        bulkActions={[
          { label: 'Issue Refund', variant: 'destructive', onClick: (items) => toast.success(`Refunding ${items.length} payments`) }
        ]}
      />

      <DetailDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selected ? `Payment ${selected.id}` : 'Payment'}
        subtitle={selected?.guestName}
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
            {selected?.status === 'success' && (
              <Button variant="destructive" onClick={() => {
                toast.success('Refund initiated');
                setDrawerOpen(false);
              }}>
                Refund
              </Button>
            )}
          </>
        }
      >
        {drawerTab === 'details' && selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-md bg-surface-2 border border-border">
                <div className="text-caption text-muted-foreground">Amount</div>
                <div className="text-body-lg font-medium text-foreground mt-0.5 font-mono">₹{selected.amount.toLocaleString('en-IN')}</div>
              </div>
              <div className="p-3 rounded-md bg-surface-2 border border-border">
                <div className="text-caption text-muted-foreground">Method</div>
                <div className="text-body-lg font-medium text-foreground mt-0.5">{selected.method}</div>
              </div>
            </div>
            
            <div className="p-4 rounded-md bg-surface-2 border border-border space-y-2">
               <div className="text-caption text-muted-foreground">Linked Folio</div>
               <div className="font-mono text-body-md text-accent">{selected.folioId}</div>
            </div>
          </div>
        )}
      </DetailDrawer>
    </div>
  );
}
