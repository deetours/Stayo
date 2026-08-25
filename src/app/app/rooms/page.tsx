'use client';

import React, { useState } from 'react';
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

      <KanbanBoard
        columns={columns}
        items={items}
        onItemMove={handleItemMove}
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
