'use client';

import React, { useState } from 'react';
import { ChevronUp, ChevronDown, MoreHorizontal, Check } from 'lucide-react';
import { EmptyState, TableSkeleton, ErrorState } from './StateContainers';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

export interface FilterChip {
  id: string;
  label: string;
  count?: number;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  filterChips?: FilterChip[];
  activeFilter?: string;
  onFilterChange?: (filterId: string) => void;
  onRowClick?: (item: T) => void;
  actions?: {
    icon?: React.ReactNode;
    label: string;
    onClick: (item: T, e: React.MouseEvent) => void;
    // Consequential ops (Check In, Record Payment) get accent weight so they
    // read as distinct from a generic "View" — everything defaults to the
    // existing muted treatment when omitted.
    variant?: 'primary' | 'default' | 'destructive';
  }[];
  bulkActions?: {
    label: string;
    onClick: (selectedItems: T[]) => void;
    variant?: 'default' | 'destructive';
  }[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  onEmptyAction?: () => void;
  emptyActionLabel?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  keyExtractor,
  filterChips,
  activeFilter,
  onFilterChange,
  onRowClick,
  actions,
  bulkActions,
  isLoading,
  error,
  onRetry,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no items matching your criteria.',
  onEmptyAction,
  emptyActionLabel,
}: DataTableProps<T>) {
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  if (isLoading) {
    return <TableSkeleton rows={6} cols={columns.length + 1} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  if (!data || data.length === 0) {
    return (
      <div>
        {filterChips && filterChips.length > 0 && (
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
            {filterChips.map((chip) => {
              const isActive = chip.id === activeFilter;
              return (
                <button
                  key={chip.id}
                  onClick={() => onFilterChange?.(chip.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-caption font-medium uppercase tracking-wider transition-all duration-fast cursor-pointer ${
                    isActive
                      ? 'bg-accent/15 text-accent border border-accent/30'
                      : 'bg-surface text-muted-foreground border border-border hover:bg-surface-2 hover:text-foreground'
                  }`}
                >
                  <span>{chip.label}</span>
                  {chip.count !== undefined && (
                    <span className="font-mono text-[10px] opacity-75">({chip.count})</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          actionLabel={emptyActionLabel}
          onAction={onEmptyAction}
        />
      </div>
    );
  }

  // Handle Sort
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortKey) return 0;
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (aVal === bVal) return 0;
    if (aVal === undefined || aVal === null) return 1;
    if (bVal === undefined || bVal === null) return -1;
    const res = aVal > bVal ? 1 : -1;
    return sortDir === 'asc' ? res : -res;
  });

  const toggleSelectAll = () => {
    if (selectedKeys.size === data.length) {
      setSelectedKeys(new Set());
    } else {
      setSelectedKeys(new Set(data.map(keyExtractor)));
    }
  };

  const toggleSelectRow = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedKeys);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSelectedKeys(next);
  };

  const hasSelection = selectedKeys.size > 0;
  const selectedItems = data.filter((item) => selectedKeys.has(keyExtractor(item)));

  const actionVariantClass = (variant: 'primary' | 'default' | 'destructive' | undefined, dense: boolean) => {
    if (variant === 'primary') return 'text-accent hover:bg-accent/10';
    if (variant === 'destructive') return 'text-status-crit hover:bg-status-crit/10';
    return `text-muted-foreground hover:text-foreground ${dense ? 'hover:bg-border' : 'hover:bg-surface-2'}`;
  };

  return (
    <div className="w-full space-y-3">
      {/* Top Filter Chips and Bulk Actions Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {filterChips && filterChips.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {filterChips.map((chip) => {
              const isActive = chip.id === activeFilter;
              return (
                <button
                  key={chip.id}
                  onClick={() => onFilterChange?.(chip.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-caption font-medium uppercase tracking-wider transition-all duration-fast cursor-pointer ${
                    isActive
                      ? 'bg-accent/15 text-accent border border-accent/30'
                      : 'bg-surface text-muted-foreground border border-border hover:bg-surface-2 hover:text-foreground'
                  }`}
                >
                  <span>{chip.label}</span>
                  {chip.count !== undefined && (
                    <span className="font-mono text-[10px] opacity-75">({chip.count})</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {hasSelection && bulkActions && bulkActions.length > 0 && (
          <div className="flex items-center gap-2 bg-surface border border-border px-3 py-1 rounded-md">
            <span className="text-body-sm font-medium text-foreground">
              {selectedKeys.size} selected
            </span>
            <div className="h-4 w-px bg-border mx-1" />
            {bulkActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => action.onClick(selectedItems)}
                className={`px-2.5 py-1 text-body-sm rounded-sm font-medium transition-all duration-instant cursor-pointer ${
                  action.variant === 'destructive'
                    ? 'bg-status-crit/20 text-status-crit hover:bg-status-crit/30'
                    : 'bg-surface-2 text-foreground hover:bg-border'
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Card list — below sm, where a horizontally-scrolled table and
          hover-only row actions are both unreachable by touch. */}
      <div className="sm:hidden space-y-2.5">
        {sortedData.map((item) => {
          const key = keyExtractor(item);
          const isSelected = selectedKeys.has(key);

          return (
            <div
              key={key}
              data-row-id={key}
              onClick={() => onRowClick?.(item)}
              className={`p-3.5 rounded-md border shadow-e0 space-y-2.5 ${
                onRowClick ? 'cursor-pointer' : ''
              } ${isSelected ? 'bg-accent/5 border-accent/30' : 'bg-surface border-border'}`}
            >
              <div className="flex items-center justify-between gap-2">
                <div
                  onClick={(e) => toggleSelectRow(key, e)}
                  className={`w-5 h-5 rounded-sm border flex items-center justify-center cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-accent border-accent text-accent-foreground'
                      : 'border-muted-foreground/30'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                </div>

                {actions && actions.length > 0 && (
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    {actions.map((act, aIdx) => (
                      <Tooltip key={aIdx}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={(e) => act.onClick(item, e)}
                            className={`p-1.5 rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-surface ${actionVariantClass(act.variant, false)}`}
                          >
                            {act.icon || <MoreHorizontal className="w-4 h-4" />}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>{act.label}</TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                )}
              </div>

              <div className="divide-y divide-border/50">
                {columns.map((col) => (
                  <div key={col.key} className="flex items-center justify-between gap-3 py-1.5 first:pt-0 last:pb-0">
                    <span className="text-caption text-muted-foreground uppercase tracking-wide shrink-0">
                      {col.header}
                    </span>
                    <span className="text-body-sm text-foreground text-right truncate min-w-0">
                      {col.render ? col.render(item) : item[col.key]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Table */}
      <div className="hidden sm:block border border-border rounded-md overflow-hidden bg-surface shadow-e0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="h-11 bg-surface border-b border-border text-caption font-medium uppercase tracking-wider text-muted-foreground sticky top-0 z-10 select-none">
                <th className="w-10 px-4 text-center">
                  <div
                    onClick={toggleSelectAll}
                    className={`w-4 h-4 rounded-sm border flex items-center justify-center cursor-pointer transition-colors ${
                      selectedKeys.size === data.length && data.length > 0
                        ? 'bg-accent border-accent text-accent-foreground'
                        : selectedKeys.size > 0
                        ? 'bg-accent/40 border-accent text-accent-foreground'
                        : 'border-muted-foreground/40 hover:border-foreground'
                    }`}
                  >
                    {selectedKeys.size > 0 && <Check className="w-3 h-3 stroke-[2.5]" />}
                  </div>
                </th>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    style={{ width: col.width }}
                    onClick={() => col.sortable && handleSort(col.key)}
                    className={`px-4 py-2 ${
                      col.sortable ? 'cursor-pointer hover:text-foreground' : ''
                    } ${
                      col.align === 'right'
                        ? 'text-right'
                        : col.align === 'center'
                        ? 'text-center'
                        : 'text-left'
                    }`}
                  >
                    <div className={`inline-flex items-center gap-1.5 ${col.align === 'right' ? 'justify-end' : ''}`}>
                      <span>{col.header}</span>
                      {col.sortable && sortKey === col.key && (
                        <span>
                          {sortDir === 'asc' ? (
                            <ChevronUp className="w-3.5 h-3.5 text-accent" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-accent" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                {actions && actions.length > 0 && (
                  <th className="w-12 px-4 text-right"></th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-body-md text-foreground">
              {sortedData.map((item) => {
                const key = keyExtractor(item);
                const isSelected = selectedKeys.has(key);

                return (
                  <tr
                    key={key}
                    data-row-id={key}
                    onClick={() => onRowClick?.(item)}
                    className={`group h-[44px] transition-colors duration-fast ${
                      onRowClick ? 'cursor-pointer' : ''
                    } ${
                      isSelected
                        ? 'bg-accent/5'
                        : 'hover:bg-surface-2'
                    }`}
                  >
                    <td className="w-10 px-4 text-center" onClick={(e) => toggleSelectRow(key, e)}>
                      <div
                        className={`w-4 h-4 rounded-sm border flex items-center justify-center cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-accent border-accent text-accent-foreground'
                            : 'border-muted-foreground/30 group-hover:border-muted-foreground'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
                      </div>
                    </td>
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-4 py-2.5 truncate ${
                          col.align === 'right'
                            ? 'text-right'
                            : col.align === 'center'
                            ? 'text-center'
                            : 'text-left'
                        }`}
                      >
                        {col.render ? col.render(item) : item[col.key]}
                      </td>
                    ))}
                    {actions && actions.length > 0 && (
                      <td
                        className="w-12 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-1 transition-all duration-fast">
                          {actions.map((act, aIdx) => (
                            <Tooltip key={aIdx}>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={(e) => act.onClick(item, e)}
                                  className={`p-1 rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-surface ${actionVariantClass(act.variant, true)}`}
                                >
                                  {act.icon || <MoreHorizontal className="w-4 h-4" />}
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>{act.label}</TooltipContent>
                            </Tooltip>
                          ))}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
