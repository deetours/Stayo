'use client';

import React, { useState } from 'react';
import { DataTable, Column, FilterChip } from '@/components/patterns/DataTable';
import { usePropertyData, MockChannel } from '@/lib/mock-data';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';

const STATUS_COLORS: Record<MockChannel['syncStatus'], string> = {
  synced: 'bg-status-ok/10 text-status-ok border-status-ok/30',
  syncing: 'bg-status-info/10 text-status-info border-status-info/30',
  error: 'bg-status-crit/10 text-status-crit border-status-crit/30',
};

const columns: Column<MockChannel>[] = [
  { key: 'name', header: 'OTA / Channel', sortable: true, render: (c) => <span className="font-medium text-foreground">{c.name}</span> },
  { key: 'lastSync', header: 'Last Sync', sortable: true, render: (c) => <span className="font-mono text-muted-foreground">{c.lastSync}</span> },
  {
    key: 'syncStatus',
    header: 'Status',
    sortable: true,
    render: (c) => (
      <span className={`flex items-center gap-1.5 w-fit px-2 py-0.5 rounded-full text-caption font-medium uppercase border ${STATUS_COLORS[c.syncStatus]}`}>
        {c.syncStatus === 'syncing' && <RefreshCw className="w-3 h-3 animate-spin" />}
        {c.syncStatus}
      </span>
    ),
  },
];

export default function ChannelsPage() {
  const { mockChannels, meta } = usePropertyData();
  const [filter, setFilter] = useState('all');

  const filterChips: FilterChip[] = [
    { id: 'all', label: 'All Channels', count: mockChannels.length },
    { id: 'error', label: 'Sync Errors', count: mockChannels.filter((c) => c.syncStatus === 'error').length },
  ];

  const filtered = mockChannels.filter((c) => {
    if (filter === 'all') return true;
    return c.syncStatus === filter;
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-heading-lg font-semibold tracking-tight text-foreground">Channels</h1>
        <p className="text-body-sm text-muted-foreground mt-1">
          OTA sync status and channel manager connections for {meta.name}.
        </p>
      </div>

      <DataTable<MockChannel>
        data={filtered}
        columns={columns}
        keyExtractor={(c) => c.id}
        filterChips={filterChips}
        activeFilter={filter}
        onFilterChange={setFilter}
        emptyTitle="No channels found"
        emptyDescription="No OTAs match this filter."
        actions={[
          { label: 'Force Sync', onClick: () => toast.success('Sync triggered') },
          { label: 'Configure', onClick: () => toast.success('Opening configuration') },
        ]}
      />
    </div>
  );
}
