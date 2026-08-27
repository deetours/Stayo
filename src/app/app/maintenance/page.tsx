'use client';

import React, { useState } from 'react';
import { KanbanBoard, KanbanColumn, KanbanItem } from '@/components/patterns/KanbanBoard';
import { DetailDrawer } from '@/components/patterns/DetailDrawer';
import { Button } from '@/components/ui/button';
import { useOptimisticAction } from '@/hooks/useOptimisticAction';
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
          <Button variant="secondary" onClick={() => setDrawerOpen(false)}>
            Close
          </Button>
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
