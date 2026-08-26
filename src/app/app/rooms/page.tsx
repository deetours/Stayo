'use client';

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X } from 'lucide-react';
import { KanbanBoard, KanbanColumn, KanbanItem } from '@/components/patterns/KanbanBoard';
import { DetailDrawer } from '@/components/patterns/DetailDrawer';
import { useOptimisticAction } from '@/hooks/useOptimisticAction';
import { mockRooms, MockRoom } from '@/lib/mock-data';

const columns: KanbanColumn[] = [
  { id: 'available', title: 'Available' },
  { id: 'occupied', title: 'Occupied' },
  { id: 'dirty', title: 'Dirty' },
  { id: 'cleaning', title: 'Cleaning' },
  { id: 'blocked', title: 'Blocked' },
];

// The Dashboard's Room Status strip links here with ?status=<value> — its
// "maintenance" tile actually reflects the "blocked" column, so that one
// needs a rename rather than a 1:1 match against column ids.
const QUERY_STATUS_TO_COLUMN: Record<string, string> = {
  available: 'available',
  occupied: 'occupied',
  dirty: 'dirty',
  cleaning: 'cleaning',
  maintenance: 'blocked',
};

function toKanbanItem(room: MockRoom): KanbanItem {
  return {
    id: room.number,
    title: `Room ${room.number} · ${room.type}`,
    subtitle: `₹${room.rate.toLocaleString('en-IN')} / night`,
    status: room.status,
    priority: room.status === 'blocked' ? 'urgent' : undefined,
  };
}

export default function RoomsPage() {
  return (
    <Suspense fallback={null}>
      <RoomsPageContent />
    </Suspense>
  );
}

function RoomsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusParam = searchParams.get('status');
  const highlightColumnId = statusParam ? QUERY_STATUS_TO_COLUMN[statusParam] ?? null : null;
  const highlightColumn = columns.find((c) => c.id === highlightColumnId);

  const { state: items, performAction } = useOptimisticAction<KanbanItem[]>(mockRooms.map(toKanbanItem));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<KanbanItem | null>(null);

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
        <h1 className="text-heading-lg font-semibold tracking-tight text-foreground">Rooms</h1>
        <p className="text-body-sm text-muted-foreground mt-1">
          {mockRooms.length} rooms across Off The Trail — Dalhousie. Drag a card to change its status.
        </p>
      </div>

      {highlightColumn && (
        <div className="flex items-center justify-between gap-3 px-3.5 py-2 rounded-md bg-accent/10 border border-accent/30 text-body-sm text-accent">
          <span>Showing rooms flagged from the Dashboard as &ldquo;{highlightColumn.title}&rdquo;.</span>
          <button
            onClick={() => router.replace('/app/rooms')}
            className="inline-flex items-center gap-1 text-caption font-medium hover:underline cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      )}

      <KanbanBoard
        columns={columns}
        items={items}
        onItemMove={handleItemMove}
        highlightColumnId={highlightColumnId}
        onItemClick={(item) => {
          setSelectedRoom(item);
          setDrawerOpen(true);
        }}
      />

      <DetailDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedRoom?.title ?? 'Room'}
        badge={
          selectedRoom && (
            <span className="font-mono text-caption px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30 uppercase">
              {selectedRoom.status}
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
          {selectedRoom?.subtitle}
        </p>
      </DetailDrawer>
    </div>
  );
}
