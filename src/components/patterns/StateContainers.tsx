'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border rounded-md bg-surface/40 my-4">
      <div className="w-12 h-12 rounded-full bg-surface-2 border border-border flex items-center justify-center text-accent mb-4">
        {icon || (
          <svg
            className="w-6 h-6 stroke-current stroke-[1.5]"
            viewBox="0 0 24 24"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="9" y1="9" x2="15" y2="9" />
            <line x1="9" y1="13" x2="15" y2="13" />
            <line x1="9" y1="17" x2="11" y2="17" />
          </svg>
        )}
      </div>
      <h4 className="text-heading-sm font-medium text-foreground mb-1">{title}</h4>
      <p className="text-body-sm text-muted-foreground max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full border border-border rounded-md overflow-hidden bg-surface">
      <div className="h-11 bg-surface-2 border-b border-border flex items-center px-4 gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-3.5 bg-border rounded-sm animate-pulse flex-1" />
        ))}
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="h-11 flex items-center px-4 gap-4">
            {Array.from({ length: cols }).map((_, c) => (
              <div
                key={c}
                className="h-3 bg-surface-2 rounded-sm animate-pulse"
                style={{ width: `${Math.max(40, (c + 1) * 20)}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function BoardSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
      {Array.from({ length: columns }).map((_, i) => (
        <div key={i} className="bg-surface border border-border rounded-md p-3 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div className="h-4 w-24 bg-surface-2 rounded-sm animate-pulse" />
            <div className="h-4 w-6 bg-surface-2 rounded-full animate-pulse" />
          </div>
          {Array.from({ length: 3 }).map((_, j) => (
            <div key={j} className="h-24 bg-surface-2 rounded-md animate-pulse p-3 space-y-2">
              <div className="h-3 w-16 bg-border rounded-sm" />
              <div className="h-3 w-28 bg-border rounded-sm" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'An error occurred while loading this data. Please try again.',
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border border-status-crit/30 rounded-md bg-status-crit/5 my-4">
      <div className="w-10 h-10 rounded-full bg-status-crit/10 text-status-crit flex items-center justify-center mb-3">
        <AlertTriangle className="w-5 h-5" />
      </div>
      <h4 className="text-heading-sm font-medium text-foreground mb-1">{title}</h4>
      <p className="text-body-sm text-muted-foreground max-w-sm mb-4">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="bg-surface hover:bg-surface-2">
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </Button>
      )}
    </div>
  );
}
