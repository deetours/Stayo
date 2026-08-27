'use client';

import React, { useState } from 'react';
import { KanbanBoard, KanbanColumn, KanbanItem } from '@/components/patterns/KanbanBoard';
import { usePropertyData } from '@/lib/mock-data';
import { useOptimisticAction } from '@/hooks/useOptimisticAction';

const columns: KanbanColumn[] = [
  { id: 'pending', title: 'New Orders' },
  { id: 'preparing', title: 'Preparing' },
  { id: 'delivered', title: 'Delivered' },
];

export default function RestaurantPage() {
  const { mockOrders, meta } = usePropertyData();

  const initialItems: KanbanItem[] = mockOrders.map((o) => ({
    id: o.id,
    title: o.items,
    subtitle: `${o.tableOrRoom} - ${o.guestName}`,
    status: o.status,
    priority: 'normal',
    meta: <span className="font-mono text-accent">₹{o.total}</span>
  }));

  const { state: items, performAction } = useOptimisticAction<KanbanItem[]>(initialItems);

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
        <h1 className="text-heading-lg font-semibold tracking-tight text-foreground">Restaurant POS</h1>
        <p className="text-body-sm text-muted-foreground mt-1">
          Active orders and room service requests for {meta.name}.
        </p>
      </div>

      <KanbanBoard
        columns={columns}
        items={items}
        onItemMove={handleItemMove}
      />
    </div>
  );
}
