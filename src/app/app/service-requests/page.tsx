'use client';

import React, { useState } from 'react';
import { KanbanBoard, KanbanColumn, KanbanItem } from '@/components/patterns/KanbanBoard';
import { DetailDrawer } from '@/components/patterns/DetailDrawer';
import { Button } from '@/components/ui/button';
import { useOptimisticAction } from '@/hooks/useOptimisticAction';
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
          <Button variant="secondary" onClick={() => setDrawerOpen(false)}>
            Close
          </Button>
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
