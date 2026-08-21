'use client';

import React from 'react';
import { ArrowRight, Check, SlidersHorizontal, X } from 'lucide-react';

export interface DiffField {
  label: string;
  before: string | number;
  after: string | number;
  unit?: string;
}

export interface ApprovalItem {
  id: string;
  title: string;
  sourceAgent: string;
  reason: string;
  timestamp: string;
  confidence?: number;
  diffs: DiffField[];
  impactSummary?: string;
}

export interface ApprovalFlowProps {
  items: ApprovalItem[];
  onApprove: (id: string) => void;
  onAdjust: (id: string) => void;
  onDismiss: (id: string) => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function ApprovalFlow({
  items,
  onApprove,
  onAdjust,
  onDismiss,
  emptyTitle = 'No pending approvals',
  emptyDescription = 'All AI recommendations and proposed changes have been reviewed.',
}: ApprovalFlowProps) {
  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border rounded-md bg-surface/40">
        <div className="w-12 h-12 rounded-full bg-surface-2 border border-border flex items-center justify-center text-accent mb-3">
          <Check className="w-6 h-6 stroke-[2]" />
        </div>
        <h4 className="text-heading-sm font-medium text-foreground mb-1">{emptyTitle}</h4>
        <p className="text-body-sm text-muted-foreground max-w-sm">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      {items.map((item) => (
        <div
          key={item.id}
          className="p-4 rounded-md bg-surface border border-border hover:border-muted-foreground/40 transition-colors shadow-[var(--shadow-e0)] space-y-4"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-caption font-semibold uppercase tracking-wider text-accent px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20">
                  {item.sourceAgent}
                </span>
                <span className="text-caption text-muted-foreground font-mono">
                  {item.timestamp}
                </span>
                {item.confidence && (
                  <span className="text-caption font-mono text-muted-foreground">
                    • {Math.round(item.confidence * 100)}% confidence
                  </span>
                )}
              </div>
              <h4 className="text-heading-sm font-semibold text-foreground mt-1.5">
                {item.title}
              </h4>
              <p className="text-body-sm text-muted-foreground mt-0.5">{item.reason}</p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onDismiss(item.id)}
                className="px-3 py-1.5 rounded-sm bg-surface-2 border border-border text-muted-foreground hover:text-foreground text-body-sm font-medium hover:bg-border transition-colors cursor-pointer"
              >
                Dismiss
              </button>
              <button
                onClick={() => onAdjust(item.id)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-sm bg-surface-2 border border-border text-foreground hover:bg-border text-body-sm font-medium transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Adjust
              </button>
              <button
                onClick={() => onApprove(item.id)}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-sm bg-accent text-accent-foreground text-body-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
                Approve
              </button>
            </div>
          </div>

          {/* Before / After Diff Comparison Grid */}
          <div className="bg-surface-2 rounded-sm border border-border p-3 space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {item.diffs.map((diff, dIdx) => {
                const isChanged = diff.before !== diff.after;

                return (
                  <div
                    key={dIdx}
                    className="p-2.5 rounded-sm bg-surface border border-border flex flex-col justify-between"
                  >
                    <span className="text-caption text-muted-foreground uppercase tracking-wider mb-1.5">
                      {diff.label}
                    </span>
                    <div className="flex items-center gap-2.5 font-mono text-body-md">
                      <span className="text-muted-foreground line-through opacity-70">
                        {diff.before}
                        {diff.unit}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span
                        className={`font-semibold ${
                          isChanged ? 'text-accent' : 'text-foreground'
                        }`}
                      >
                        {diff.after}
                        {diff.unit}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {item.impactSummary && (
              <div className="text-caption text-accent font-medium pt-1 px-1">
                Expected impact: {item.impactSummary}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
