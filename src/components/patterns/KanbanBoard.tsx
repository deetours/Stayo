'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical, ChevronRight, Check } from 'lucide-react';
import { BoardSkeleton } from './StateContainers';

export interface KanbanItem {
  id: string;
  title: string;
  subtitle?: string;
  status: string; // Column ID
  priority?: 'urgent' | 'high' | 'normal' | 'low';
  assignee?: {
    name: string;
    avatar?: string;
    initials?: string;
  };
  tags?: string[];
  meta?: React.ReactNode;
}

export interface KanbanColumn {
  id: string;
  title: string;
  color?: string;
}

export interface KanbanBoardProps {
  columns: KanbanColumn[];
  items: KanbanItem[];
  onItemMove: (itemId: string, targetStatus: string) => void;
  onItemClick?: (item: KanbanItem) => void;
  isLoading?: boolean;
}

export function KanbanBoard({
  columns,
  items,
  onItemMove,
  onItemClick,
  isLoading,
}: KanbanBoardProps) {
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOverColId, setDragOverColId] = useState<string | null>(null);
  const [advanceMobileItemId, setAdvanceMobileItemId] = useState<string | null>(null);

  if (isLoading) {
    return <BoardSkeleton columns={columns.length} />;
  }

  const handleDragStart = (id: string) => {
    setDraggedItemId(id);
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    setDragOverColId(colId);
  };

  const handleDragLeave = () => {
    setDragOverColId(null);
  };

  const handleDrop = (colId: string) => {
    if (draggedItemId) {
      onItemMove(draggedItemId, colId);
    }
    setDraggedItemId(null);
    setDragOverColId(null);
  };

  const getPriorityBadge = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return <span className="w-2.5 h-2.5 rounded-full bg-status-crit animate-pulse" title="Urgent" />;
      case 'high':
        return <span className="w-2.5 h-2.5 rounded-full bg-status-warn" title="High Priority" />;
      case 'normal':
        return <span className="w-2.5 h-2.5 rounded-full bg-status-info" title="Normal" />;
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-flow-col md:auto-cols-fr gap-4 w-full overflow-x-auto pb-4">
      {columns.map((col) => {
        const colItems = items.filter((item) => item.status === col.id);
        const isOver = dragOverColId === col.id;

        return (
          <div
            key={col.id}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={handleDragLeave}
            onDrop={() => handleDrop(col.id)}
            className={`flex flex-col min-w-[260px] bg-surface rounded-md border transition-all duration-fast ${
              isOver ? 'border-accent bg-surface/80' : 'border-border'
            }`}
          >
            {/* Column Header */}
            <div className="p-3.5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-heading-sm font-semibold text-foreground">
                  {col.title}
                </span>
                <span className="font-mono text-caption px-2 py-0.5 rounded-full bg-surface-2 text-muted-foreground">
                  {colItems.length}
                </span>
              </div>
            </div>

            {/* Column Cards Container */}
            <div className="flex-1 p-2.5 space-y-2.5 min-h-[350px]">
              {colItems.length === 0 ? (
                <div className="h-full flex items-center justify-center p-6 text-center text-muted-foreground/60 text-body-sm italic border border-dashed border-border/50 rounded-md">
                  All caught up ?
                </div>
              ) : (
                colItems.map((item) => {
                  const isUrgent = item.priority === 'urgent';

                  return (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={() => handleDragStart(item.id)}
                      onClick={() => onItemClick?.(item)}
                      className={`group p-3 rounded-md bg-surface-2 border border-border shadow-[var(--shadow-e1)] hover:border-muted-foreground/40 transition-all duration-fast cursor-grab active:cursor-grabbing relative select-none ${
                        isUrgent ? 'border-status-warn/40 bg-status-warn/5' : ''
                      }`}
                    >
                      {/* Priority dot & Title */}
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="font-medium text-body-md text-foreground">
                          {item.title}
                        </div>
                        <div className="flex items-center gap-1">
                          {getPriorityBadge(item.priority)}
                          {/* Mobile quick advance button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setAdvanceMobileItemId(
                                advanceMobileItemId === item.id ? null : item.id
                              );
                            }}
                            className="md:hidden p-1 text-muted-foreground hover:text-foreground"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {item.subtitle && (
                        <p className="text-body-sm text-muted-foreground mb-2.5">
                          {item.subtitle}
                        </p>
                      )}

                      {/* Mobile quick move menu */}
                      {advanceMobileItemId === item.id && (
                        <div className="md:hidden my-2 p-2 bg-surface rounded-sm border border-border space-y-1">
                          <div className="text-caption text-muted-foreground uppercase mb-1">
                            Move to:
                          </div>
                          <div className="grid grid-cols-2 gap-1">
                            {columns
                              .filter((c) => c.id !== item.status)
                              .map((c) => (
                                <button
                                  key={c.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onItemMove(item.id, c.id);
                                    setAdvanceMobileItemId(null);
                                  }}
                                  className="text-left text-body-sm px-2 py-1 bg-surface-2 rounded-sm text-foreground hover:bg-accent/20"
                                >
                                  {c.title}
                                </button>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Footer: Avatar & Meta */}
                      <div className="flex items-center justify-between pt-2 border-t border-border/50 text-caption text-muted-foreground">
                        {item.assignee ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-accent/20 text-accent font-medium flex items-center justify-center text-[10px]">
                              {item.assignee.initials || item.assignee.name.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="truncate max-w-[90px]">{item.assignee.name}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/60 italic">Unassigned</span>
                        )}

                        {item.meta && <div>{item.meta}</div>}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
