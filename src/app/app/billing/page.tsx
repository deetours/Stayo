'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { DataTable, Column, FilterChip } from '@/components/patterns/DataTable';
import { DetailDrawer } from '@/components/patterns/DetailDrawer';
import { Button } from '@/components/ui/button';
import { useOptimisticAction } from '@/hooks/useOptimisticAction';
import { usePropertyData, MockFolio, FolioStatus } from '@/lib/mock-data';
import { usePropertyStore } from '@/lib/property-store';
import { useRowFlash } from '@/hooks/use-row-flash';

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
  const activePropertyId = usePropertyStore((s) => s.activePropertyId);
  return <BillingPageContent key={activePropertyId} />;
}

function BillingPageContent() {
  const { mockFolios, meta } = usePropertyData();
  const { state: folios, performAction } = useOptimisticAction<MockFolio[]>(mockFolios);
  const [filter, setFilter] = useState('outstanding');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<MockFolio | null>(null);
  const { containerRef, flashRow } = useRowFlash();

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
    flashRow(folio.id);
    toast.success(`Recorded ${formatINR(balance)} payment for ${folio.guestName}`);
    setDrawerOpen(false);
  };

  const columns: Column<MockFolio>[] = [
    { key: 'id', header: 'Folio', sortable: true, render: (f) => <span className="font-mono text-muted-foreground">{f.id}</span> },
    { key: 'guestName', header: 'Guest', sortable: true, render: (f) => <span className="font-medium text-foreground">{f.guestName}</span> },
    { key: 'roomNumber', header: 'Room', sortable: true, render: (f) => <span className="font-mono font-medium px-2 py-0.5 rounded-sm bg-surface-2 border border-border">{f.roomNumber}</span> },
    { key: 'total', header: 'Total', align: 'right', render: (f) => <span className="font-mono text-foreground">{formatINR(folioTotal(f))}</span> },
    { key: 'balance', header: 'Balance Due', align: 'right', render: (f) => <span className="font-mono font-semibold text-foreground">{formatINR(folioBalance(f))}</span> },
    { key: 'status', header: 'Status', sortable: true, render: (f) => <span className={`px-2 py-0.5 rounded-full text-caption font-medium uppercase border ${STATUS_COLORS[f.status]}`}>{f.status}</span> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-heading-lg font-semibold tracking-tight text-foreground">Billing &amp; Folios</h1>
        <p className="text-body-sm text-muted-foreground mt-1">
          Guest folios and outstanding balances for {meta.name}.
        </p>
      </div>

      <div ref={containerRef}>
        <DataTable<MockFolio>
          data={filtered}
          columns={columns}
          keyExtractor={(f) => f.id}
          filterChips={filterChips}
          activeFilter={filter}
          onFilterChange={setFilter}
          onRowClick={openDrawer}
          actions={[{ label: 'Record Payment', onClick: (f, e) => { e.stopPropagation(); handleRecordPayment(f); }, variant: 'primary' }]}
          bulkActions={[
            { label: 'Send Payment Reminder', onClick: (items) => toast.success(`Reminder sent for ${items.length} folios`) },
          ]}
          emptyTitle="No folios found"
          emptyDescription="No folios match this filter."
        />
      </div>

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
            <Button variant="secondary" onClick={() => setDrawerOpen(false)}>
              Close
            </Button>
            {selected && folioBalance(selected) > 0 && (
              <Button onClick={() => handleRecordPayment(selected)}>
                Record Payment
              </Button>
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
