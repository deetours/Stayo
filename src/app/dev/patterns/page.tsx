'use client';

import React, { useState } from 'react';
import { DataTable, Column, FilterChip } from '@/components/patterns/DataTable';
import { KanbanBoard, KanbanColumn, KanbanItem } from '@/components/patterns/KanbanBoard';
import { DetailDrawer, TabItem } from '@/components/patterns/DetailDrawer';
import { AgentPanel, ChatMessage } from '@/components/patterns/AgentPanel';
import { ApprovalFlow, ApprovalItem } from '@/components/patterns/ApprovalFlow';
import { EmptyState, TableSkeleton, BoardSkeleton, ErrorState } from '@/components/patterns/StateContainers';
import { Sliders, RefreshCw, Layers, Table as TableIcon, Layout, Bot, CheckCircle } from 'lucide-react';
import { usePropertyData, MockReservation } from '@/lib/mock-data';

export default function PatternsDevPage() {
  const { mockReservations, mockHousekeepingTasks } = usePropertyData();
  const [activeSection, setActiveSection] = useState<'table' | 'board' | 'drawer' | 'agent' | 'approval' | 'states'>('table');

  // State toggles
  const [dataState, setDataState] = useState<'populated' | 'empty' | 'loading' | 'error'>('populated');

  // Table state
  const [filter, setFilter] = useState('all');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [drawerTab, setDrawerTab] = useState('overview');

  // Seed Data for Table
  const rawReservations: MockReservation[] = mockReservations;

  const columns: Column<MockReservation>[] = [
    { key: 'id', header: 'ID', sortable: true, render: (r) => <span className="font-mono text-muted-foreground">{r.id}</span> },
    { key: 'guestName', header: 'Guest', sortable: true, render: (r) => <span className="font-medium text-foreground">{r.guestName}</span> },
    { key: 'roomNumber', header: 'Room', sortable: true, render: (r) => <span className="font-mono font-medium px-2 py-0.5 rounded-sm bg-surface-2 border border-border">{r.roomNumber}</span> },
    { key: 'dates', header: 'Stay Dates', render: (r) => <span className="text-muted-foreground">{r.checkIn} – {r.checkOut}</span> },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (r) => {
        const colors = {
          'checked-in': 'bg-status-ok/10 text-status-ok border-status-ok/30',
          'confirmed': 'bg-status-info/10 text-status-info border-status-info/30',
          'checked-out': 'bg-surface-2 text-muted-foreground border-border',
          'cancelled': 'bg-status-crit/10 text-status-crit border-status-crit/30',
        };
        return (
          <span className={`px-2 py-0.5 rounded-full text-caption font-medium uppercase border ${colors[r.status]}`}>
            {r.status}
          </span>
        );
      },
    },
    { key: 'channel', header: 'Channel', sortable: true, render: (r) => <span className="text-body-sm text-muted-foreground">{r.channel}</span> },
    { key: 'amount', header: 'Total', align: 'right', sortable: true, render: (r) => <span className="font-mono font-semibold text-foreground">{r.amount}</span> },
  ];

  const filterChips: FilterChip[] = [
    { id: 'all', label: 'All Reservations', count: 5 },
    { id: 'today', label: 'Arriving Today', count: 2 },
    { id: 'in-house', label: 'In-House', count: 1 },
    { id: 'cancelled', label: 'Cancelled', count: 1 },
  ];

  // Seed Data for Kanban Board
  const kanbanColumns: KanbanColumn[] = [
    { id: 'dirty', title: 'Dirty' },
    { id: 'cleaning', title: 'Cleaning' },
    { id: 'inspected', title: 'Inspected' },
    { id: 'ready', title: 'Ready' },
  ];

  const [kanbanItems, setKanbanItems] = useState<KanbanItem[]>(
    mockHousekeepingTasks.map((t) => ({
      id: t.id,
      title: t.roomLabel,
      subtitle: t.subtitle,
      status: t.status,
      priority: t.priority,
      assignee: t.assignee,
      meta: t.meta,
    }))
  );

  // Seed Data for Agent Panel
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'user',
      text: 'Do we have any rate anomalies this weekend for the Pine Suites?',
      timestamp: '10:42 AM',
    },
    {
      id: 'm-2',
      sender: 'agent',
      text: 'Occupancy is pacing at 88% for 22–24 Aug, 15% higher than normal. Current rate is ₹8,500.',
      timestamp: '10:43 AM',
      structuredData: [
        { label: 'Current Pace', value: '88%', subtext: '+15% vs 30d avg' },
        { label: 'Competitor Avg', value: '₹10,400', subtext: '3 comp hotels sold out' },
      ],
      proposedAction: {
        id: 'act-901',
        type: 'pricing',
        title: 'Increase Pine Suite rate for 22–24 Aug',
        description: 'Adjust weekend base rate to capture peak demand window.',
        details: {
          'Current Rate': '₹8,500/night',
          'Suggested Rate': '₹10,200/night',
          'Projected Gain': '+₹24,000 across 4 rooms',
        },
        status: 'pending',
      },
    },
  ]);

  // Seed Data for Approvals
  const approvalItems: ApprovalItem[] = [
    {
      id: 'app-1',
      title: 'Pine Suite Weekend Surge Pricing',
      sourceAgent: 'Revenue Agent',
      reason: 'Local festival detected + 3 comp set properties fully booked for 22-24 Aug.',
      timestamp: '12 min ago',
      confidence: 0.94,
      diffs: [
        { label: 'Base Rate', before: '₹8,500', after: '₹10,200' },
        { label: 'Min Stay', before: '1 night', after: '2 nights' },
        { label: 'Cancellation Policy', before: 'Flexible (24h)', after: 'Strict (72h)' },
      ],
      impactSummary: '+₹34,000 estimated weekend revenue uplift',
    },
    {
      id: 'app-2',
      title: 'WhatsApp Pre-Arrival Concierge Sequence',
      sourceAgent: 'Concierge Agent',
      reason: '4 VIP guests arriving tomorrow have not selected meal preference or pickup.',
      timestamp: '34 min ago',
      confidence: 0.88,
      diffs: [
        { label: 'Trigger Time', before: 'Day of arrival (9 AM)', after: 'T-24h (2 PM today)' },
        { label: 'Message Template', before: 'Standard Welcome', after: 'VIP Personal Welcome + Cab Transfer' },
      ],
      impactSummary: 'Reduces front-desk check-in friction by 4 min/guest',
    },
  ];

  const drawerTabs: TabItem[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'folio', label: 'Folio & Charges', count: 2 },
    { id: 'messages', label: 'Communication History', count: 4 },
    { id: 'activity', label: 'Activity Log' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-8 space-y-8 max-w-7xl mx-auto font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-caption font-semibold uppercase tracking-wider mb-2">
            Batch 1 · Shared Interaction Patterns
          </div>
          <h1 className="text-display-md font-bold tracking-tight">Pattern Library & Verification</h1>
          <p className="text-body-md text-muted-foreground mt-1">
            Standard interaction primitives verified against states (Empty / Loading / Error / Populated).
          </p>
        </div>

        {/* Global State Toggles */}
        <div className="flex items-center gap-2 bg-surface p-1.5 rounded-md border border-border">
          <span className="text-caption uppercase tracking-wider text-muted-foreground px-2 font-medium">
            State:
          </span>
          {(['populated', 'empty', 'loading', 'error'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setDataState(st)}
              className={`px-3 py-1 rounded-sm text-body-sm font-medium capitalize transition-all cursor-pointer ${
                dataState === st
                  ? 'bg-accent text-accent-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-surface-2'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto">
        {[
          { id: 'table', label: 'DataTable', icon: TableIcon },
          { id: 'board', label: 'KanbanBoard', icon: Layout },
          { id: 'drawer', label: 'DetailDrawer', icon: Layers },
          { id: 'agent', label: 'AgentPanel', icon: Bot },
          { id: 'approval', label: 'ApprovalFlow', icon: CheckCircle },
          { id: 'states', label: 'StateContainers', icon: Sliders },
        ].map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id as any)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-body-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-surface-2 text-accent border border-accent/40 shadow-xs'
                  : 'bg-surface text-muted-foreground border border-border hover:text-foreground hover:bg-surface-2'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>

      {/* Section Content */}
      <div className="mt-6">
        {/* 1. DATA TABLE */}
        {activeSection === 'table' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-heading-md font-semibold">Data Table Pattern</h3>
                <p className="text-body-sm text-muted-foreground">
                  Sticky header, 44px zebra-free row height, filter chips, bulk selection, and hover actions.
                </p>
              </div>
            </div>

            <DataTable<MockReservation>
              data={dataState === 'empty' ? [] : rawReservations}
              columns={columns}
              keyExtractor={(r) => r.id}
              filterChips={filterChips}
              activeFilter={filter}
              onFilterChange={(f) => setFilter(f)}
              isLoading={dataState === 'loading'}
              error={dataState === 'error' ? 'Failed to fetch reservations from the server.' : null}
              onRetry={() => setDataState('populated')}
              onRowClick={(item) => {
                setSelectedRecord(item);
                setDrawerOpen(true);
              }}
              actions={[
                {
                  label: 'View details',
                  onClick: (item) => {
                    setSelectedRecord(item);
                    setDrawerOpen(true);
                  },
                },
              ]}
              bulkActions={[
                {
                  label: 'Batch Check-In',
                  onClick: (items) => alert(`Checking in ${items.length} guests`),
                },
                {
                  label: 'Cancel Bookings',
                  variant: 'destructive',
                  onClick: (items) => alert(`Cancelling ${items.length} reservations`),
                },
              ]}
              emptyTitle="No reservations found"
              emptyDescription="There are currently no reservations booked for this filter."
              emptyActionLabel="Add Reservation"
              onEmptyAction={() => alert('New Reservation Triggered')}
            />
          </div>
        )}

        {/* 2. KANBAN BOARD */}
        {activeSection === 'board' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-heading-md font-semibold">Kanban Board Pattern</h3>
              <p className="text-body-sm text-muted-foreground">
                Column WIP counts, status dot, priority flag, drag-and-drop with mobile quick-move menu.
              </p>
            </div>

            <KanbanBoard
              columns={kanbanColumns}
              items={dataState === 'empty' ? [] : kanbanItems}
              isLoading={dataState === 'loading'}
              onItemMove={(itemId, targetStatus) => {
                setKanbanItems((prev) =>
                  prev.map((it) => (it.id === itemId ? { ...it, status: targetStatus } : it))
                );
              }}
              onItemClick={(item) => {
                setSelectedRecord(item);
                setDrawerOpen(true);
              }}
            />
          </div>
        )}

        {/* 3. DETAIL DRAWER */}
        {activeSection === 'drawer' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-heading-md font-semibold">Detail Drawer Pattern</h3>
              <p className="text-body-sm text-muted-foreground">
                60% width on desktop, Esc & backdrop close, sticky tab sub-header, and sticky footer.
              </p>
            </div>

            <button
              onClick={() => {
                setSelectedRecord(rawReservations[0]);
                setDrawerOpen(true);
              }}
              className="px-4 py-2 rounded-md bg-accent text-accent-foreground font-medium text-body-sm hover:opacity-90 transition-all cursor-pointer"
            >
              Open Sample Drawer (RES-8921)
            </button>
          </div>
        )}

        {/* 4. AGENT PANEL */}
        {activeSection === 'agent' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-heading-md font-semibold">Agent Panel Pattern</h3>
              <p className="text-body-sm text-muted-foreground">
                Chat thread with distinct bordered proposed-action cards (Approve / Edit / Reject).
              </p>
            </div>

            <div className="h-[560px] max-w-2xl">
              <AgentPanel
                messages={dataState === 'empty' ? [] : messages}
                isThinking={dataState === 'loading'}
                onSendMessage={(text) => {
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: `m-${Date.now()}`,
                      sender: 'user',
                      text,
                      timestamp: 'Just now',
                    },
                  ]);
                }}
                onApproveAction={(id) => alert(`Approved Action: ${id}`)}
                onRejectAction={(id) => alert(`Rejected Action: ${id}`)}
                onEditAction={(id) => alert(`Editing Action: ${id}`)}
              />
            </div>
          </div>
        )}

        {/* 5. APPROVAL FLOW */}
        {activeSection === 'approval' && (
          <div className="space-y-4 max-w-3xl">
            <div>
              <h3 className="text-heading-md font-semibold">Approval Flow Pattern</h3>
              <p className="text-body-sm text-muted-foreground">
                Two-column before/after diff with center arrow icon and fast approval triggers.
              </p>
            </div>

            <ApprovalFlow
              items={dataState === 'empty' ? [] : approvalItems}
              onApprove={(id) => alert(`Approved ${id}`)}
              onAdjust={(id) => alert(`Adjust ${id}`)}
              onDismiss={(id) => alert(`Dismissed ${id}`)}
            />
          </div>
        )}

        {/* 6. STATE CONTAINERS */}
        {activeSection === 'states' && (
          <div className="space-y-8">
            <div>
              <h3 className="text-heading-md font-semibold">Standard State Containers</h3>
              <p className="text-body-sm text-muted-foreground">
                Uniform line-art empty states, skeleton loaders, and error states.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="text-body-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Empty State
                </h4>
                <EmptyState
                  title="No Tasks Assigned"
                  description="You have cleared all housekeeping rooms assigned to you for today."
                  actionLabel="Claim Next Room"
                  onAction={() => alert('Claiming next room')}
                />
              </div>

              <div className="space-y-2">
                <h4 className="text-body-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Error State
                </h4>
                <ErrorState
                  title="Sync Failed"
                  message="Unable to reach channel manager. Your local changes are preserved."
                  onRetry={() => alert('Retrying sync')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-body-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Table Skeleton
              </h4>
              <TableSkeleton rows={3} cols={4} />
            </div>
          </div>
        )}
      </div>

      {/* Shared Detail Drawer Instance */}
      <DetailDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedRecord ? selectedRecord.guestName || selectedRecord.title : 'Details'}
        subtitle={selectedRecord ? `ID: ${selectedRecord.id}` : undefined}
        tabs={drawerTabs}
        activeTab={drawerTab}
        onTabChange={(t) => setDrawerTab(t)}
        badge={
          selectedRecord?.status && (
            <span className="font-mono text-caption px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30 uppercase">
              {selectedRecord.status}
            </span>
          )
        }
        footerActions={
          <>
            <button
              onClick={() => setDrawerOpen(false)}
              className="px-4 py-2 rounded-sm bg-surface-2 border border-border text-foreground hover:bg-border text-body-sm font-medium transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => {
                alert('Saved changes');
                setDrawerOpen(false);
              }}
              className="px-4 py-2 rounded-sm bg-accent text-accent-foreground text-body-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
            >
              Save Changes
            </button>
          </>
        }
      >
        <div className="space-y-6">
          {drawerTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-md bg-surface-2 border border-border">
                  <div className="text-caption text-muted-foreground">Room Assigned</div>
                  <div className="font-mono text-body-lg font-semibold text-foreground mt-0.5">
                    {selectedRecord?.roomNumber || '102'}
                  </div>
                </div>
                <div className="p-3 rounded-md bg-surface-2 border border-border">
                  <div className="text-caption text-muted-foreground">Channel</div>
                  <div className="text-body-lg font-medium text-foreground mt-0.5">
                    {selectedRecord?.channel || 'Direct'}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-md bg-surface-2 border border-border space-y-3">
                <h5 className="text-body-md font-semibold text-foreground">Guest Preferences & AI Notes</h5>
                <p className="text-body-sm text-muted-foreground">
                  Prefers quiet room away from elevator. Requested extra towels on 21 Aug via WhatsApp concierge.
                </p>
                <div className="inline-flex items-center gap-1.5 text-caption text-accent font-medium">
                  <span>✓ Verified by Concierge Agent</span>
                </div>
              </div>
            </div>
          )}

          {drawerTab === 'folio' && (
            <div className="p-4 rounded-md bg-surface-2 border border-border space-y-3">
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="text-body-sm text-muted-foreground">Room Charges (3 nights)</span>
                <span className="font-mono font-medium text-foreground">₹12,000</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="text-body-sm text-muted-foreground">F&B Room Service</span>
                <span className="font-mono font-medium text-foreground">₹2,200</span>
              </div>
              <div className="flex justify-between items-center pt-1 font-semibold">
                <span className="text-body-md text-foreground">Total Balance Due</span>
                <span className="font-mono text-heading-sm text-accent">₹14,200</span>
              </div>
            </div>
          )}

          {drawerTab === 'messages' && (
            <div className="space-y-3">
              <div className="p-3 rounded-md bg-surface-2 border border-border text-body-sm space-y-1">
                <div className="flex justify-between text-caption text-muted-foreground">
                  <span>WhatsApp · Inbound</span>
                  <span className="font-mono">Yesterday, 4:12 PM</span>
                </div>
                <p className="text-foreground">"Hi, can we request late checkout around 1:00 PM tomorrow?"</p>
              </div>
              <div className="p-3 rounded-md bg-accent/10 border border-accent/20 text-body-sm space-y-1">
                <div className="flex justify-between text-caption text-accent">
                  <span>Concierge Agent · Auto-Replied</span>
                  <span className="font-mono">Yesterday, 4:13 PM</span>
                </div>
                <p className="text-foreground">"Certainly! Your late checkout at 1:00 PM is approved for Room 102."</p>
              </div>
            </div>
          )}

          {drawerTab === 'activity' && (
            <div className="text-body-sm text-muted-foreground italic">
              No recent modifications logged today.
            </div>
          )}
        </div>
      </DetailDrawer>
    </div>
  );
}


