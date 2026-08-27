'use client';

import React, { useState } from 'react';
import { DataTable, Column, FilterChip } from '@/components/patterns/DataTable';
import { usePropertyData, MockExperienceBooking } from '@/lib/mock-data';
import { toast } from 'sonner';

const STATUS_COLORS: Record<MockExperienceBooking['status'], string> = {
  confirmed: 'bg-status-info/10 text-status-info border-status-info/30',
  completed: 'bg-surface-2 text-muted-foreground border-border',
  cancelled: 'bg-status-crit/10 text-status-crit border-status-crit/30',
};

const columns: Column<MockExperienceBooking>[] = [
  { key: 'experienceName', header: 'Experience', sortable: true, render: (e) => <span className="font-medium text-foreground">{e.experienceName}</span> },
  { key: 'guestName', header: 'Guest', sortable: true, render: (e) => <span className="text-muted-foreground">{e.guestName}</span> },
  { key: 'date', header: 'Date', sortable: true, render: (e) => <span className="text-muted-foreground">{e.date}</span> },
  { key: 'pax', header: 'Pax', align: 'center', sortable: true, render: (e) => <span className="font-mono">{e.pax}</span> },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    render: (e) => (
      <span className={`px-2 py-0.5 rounded-full text-caption font-medium uppercase border ${STATUS_COLORS[e.status]}`}>
        {e.status}
      </span>
    ),
  },
];

export default function ExperiencesPage() {
  const { mockExperiences, meta } = usePropertyData();
  const [filter, setFilter] = useState('all');

  const filterChips: FilterChip[] = [
    { id: 'all', label: 'All Bookings', count: mockExperiences.length },
    { id: 'confirmed', label: 'Confirmed', count: mockExperiences.filter((e) => e.status === 'confirmed').length },
    { id: 'completed', label: 'Completed', count: mockExperiences.filter((e) => e.status === 'completed').length },
  ];

  const filtered = mockExperiences.filter((e) => {
    if (filter === 'all') return true;
    return e.status === filter;
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-heading-lg font-semibold tracking-tight text-foreground">Experiences</h1>
        <p className="text-body-sm text-muted-foreground mt-1">
          Activity and upsell bookings for {meta.name}.
        </p>
      </div>

      <DataTable<MockExperienceBooking>
        data={filtered}
        columns={columns}
        keyExtractor={(e) => e.id}
        filterChips={filterChips}
        activeFilter={filter}
        onFilterChange={setFilter}
        emptyTitle="No experience bookings"
        emptyDescription="No bookings match this filter."
        actions={[
          { label: 'Mark Completed', onClick: () => toast.success('Marked as completed') },
          { label: 'Cancel Booking', variant: 'destructive', onClick: () => toast.success('Booking cancelled') }
        ]}
      />
    </div>
  );
}
