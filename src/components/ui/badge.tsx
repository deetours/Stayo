import * as React from 'react';
import { cn } from '@/lib/utils';

const badgeVariants = {
  ok: 'bg-status-ok/10 text-status-ok border-status-ok/30',
  warn: 'bg-status-warn/10 text-status-warn border-status-warn/30',
  crit: 'bg-status-crit/10 text-status-crit border-status-crit/30',
  info: 'bg-status-info/10 text-status-info border-status-info/30',
  neutral: 'bg-surface-2 text-muted-foreground border-border',
  accent: 'bg-accent/15 text-accent border-accent/30',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof badgeVariants;
}

// Codifies the status-pill color map that was hand-copied per page (e.g.
// front-desk/page.tsx's STATUS_COLORS) into one reusable primitive.
export function Badge({ className, variant = 'neutral', ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-caption font-medium uppercase border',
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  );
}
