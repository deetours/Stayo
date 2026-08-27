'use client';

import React, { useState } from 'react';
import { DataTable, Column, FilterChip } from '@/components/patterns/DataTable';
import { usePropertyData, MockStaff } from '@/lib/mock-data';
import { toast } from 'sonner';

const STATUS_COLORS: Record<MockStaff['status'], string> = {
  active: 'bg-status-ok/10 text-status-ok border-status-ok/30',
  offline: 'bg-surface-2 text-muted-foreground border-border',
  'on-leave': 'bg-status-warn/10 text-status-warn border-status-warn/30',
};

const columns: Column<MockStaff>[] = [
  { key: 'name', header: 'Name', sortable: true, render: (s) => <span className="font-medium text-foreground">{s.name}</span> },
  { key: 'role', header: 'Role', sortable: true, render: (s) => <span className="text-muted-foreground">{s.role}</span> },
  { key: 'shift', header: 'Shift', sortable: true, render: (s) => <span className="text-muted-foreground">{s.shift}</span> },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    render: (s) => (
      <span className={`px-2 py-0.5 rounded-full text-caption font-medium uppercase border ${STATUS_COLORS[s.status]}`}>
        {s.status}
      </span>
    ),
  },
];

export default function StaffPage() {
  const { mockStaff, meta } = usePropertyData();
  const [filter, setFilter] = useState('all');

  const filterChips: FilterChip[] = [
    { id: 'all', label: 'All Staff', count: mockStaff.length },
    { id: 'active', label: 'Active', count: mockStaff.filter((s) => s.status === 'active').length },
  ];

  const filtered = mockStaff.filter((s) => {
    if (filter === 'all') return true;
    return s.status === filter;
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-heading-lg font-semibold tracking-tight text-foreground">Staff</h1>
        <p className="text-body-sm text-muted-foreground mt-1">
          Manage team members, roles, and shifts for {meta.name}.
        </p>
      </div>

      <DataTable<MockStaff>
        data={filtered}
        columns={columns}
        keyExtractor={(s) => s.id}
        filterChips={filterChips}
        activeFilter={filter}
        onFilterChange={setFilter}
        emptyTitle="No staff found"
        emptyDescription="No team members match this filter."
        actions={[
          { label: 'Edit Profile', onClick: () => toast.success('Editing staff profile') },
        ]}
      />
    </div>
  );
}
