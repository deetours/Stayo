'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

const buttonVariants = {
  primary: 'bg-accent text-accent-foreground hover:opacity-90 active:scale-[0.98]',
  secondary: 'bg-surface-2 border border-border text-foreground hover:bg-border',
  outline: 'border border-border text-foreground hover:bg-surface-2',
  ghost: 'text-muted-foreground hover:text-foreground hover:bg-surface-2',
  destructive: 'bg-status-crit/10 text-status-crit hover:bg-status-crit/20',
};

const buttonSizes = {
  default: 'px-4 py-2 text-body-sm',
  sm: 'px-3 py-1.5 text-body-sm',
  icon: 'p-2',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
  loading?: boolean;
}

// The one shared button primitive for the dashboard shell — codifies the
// rounded-sm/hover/active-scale conventions that were previously hand-copied
// per page, and adds the two states that were missing everywhere except
// StateContainers' EmptyState: a visible keyboard-focus ring and a loading
// state.
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'default', loading = false, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        data-slot="button"
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-1.5 rounded-sm font-medium transition-all duration-instant cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
          buttonVariants[variant],
          buttonSizes[size],
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
