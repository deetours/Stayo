'use client';

import React, { useState } from 'react';
import { KanbanBoard, KanbanColumn, KanbanItem } from '@/components/patterns/KanbanBoard';
import { DetailDrawer } from '@/components/patterns/DetailDrawer';
import { useOptimisticAction } from '@/hooks/useOptimisticAction';
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

  const handleItemMove = (itemId: string, targetStatus: string) => {
    performAction(
      (prev) => prev.map((it) => (it.id === itemId ? { ...it, status: targetStatus } : it)),
      async () => {
        await new Promise((res) => setTimeout(res, 300));
      }
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-heading-lg font-semibold tracking-tight text-foreground">Housekeeping</h1>
        <p className="text-body-sm text-muted-foreground mt-1">
          {items.length} active tasks. Drag a card to advance it through the workflow.
        </p>
      </div>

      <KanbanBoard
        columns={columns}
        items={items}
        onItemMove={handleItemMove}
        onItemClick={(item) => {
          setSelectedTask(item);
          setDrawerOpen(true);
        }}
      />

      <DetailDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedTask?.title ?? 'Task'}
        subtitle={selectedTask?.subtitle}
        badge={
          selectedTask && (
            <span className="font-mono text-caption px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30 uppercase">
              {selectedTask.status}
            </span>
          )
        }
        footerActions={
          <button
            onClick={() => setDrawerOpen(false)}
            className="px-4 py-2 rounded-sm bg-surface-2 border border-border text-foreground hover:bg-border text-body-sm font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        }
      >
        <p className="text-body-sm text-muted-foreground">
          Assigned to {selectedTask?.assignee?.name ?? 'nobody yet'}.
        </p>
      </DetailDrawer>
    </div>
  );
}
