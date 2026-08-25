'use client';

import * as React from 'react';
import { Command as CommandPrimitive } from 'cmdk';
import { Search } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

function Command({ className, ...props }: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        'flex h-full w-full flex-col overflow-hidden rounded-lg bg-surface text-foreground',
        className
      )}
      {...props}
    />
  );
}

function CommandDialog({
  children,
  className,
  ...props
}: React.ComponentProps<typeof Dialog> & { className?: string }) {
  return (
    <Dialog {...props}>
      <DialogContent
        showCloseButton={false}
        className={cn('overflow-hidden p-0 max-w-xl', className)}
      >
        <DialogTitle className="sr-only">Command Palette</DialogTitle>
        <DialogDescription className="sr-only">Search pages, guests, and reservations</DialogDescription>
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:text-caption [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
}

function CommandInput({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div className="flex items-center px-4 py-3.5 border-b border-border bg-surface-2/50" cmdk-input-wrapper="">
      <Search className="w-4 h-4 text-muted-foreground mr-3 shrink-0" />
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          'w-full bg-transparent text-body-md text-foreground placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      />
      <span className="font-mono text-caption px-1.5 py-0.5 rounded-sm bg-surface border border-border text-muted-foreground uppercase">
        ESC
      </span>
    </div>
  );
}

function CommandList({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn('max-h-80 overflow-y-auto overflow-x-hidden p-2', className)}
      {...props}
    />
  );
}

function CommandEmpty(props: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className="p-6 text-center text-body-sm text-muted-foreground"
      {...props}
    />
  );
}

function CommandGroup({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn('overflow-hidden text-foreground', className)}
      {...props}
    />
  );
}

function CommandItem({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        'relative flex cursor-pointer select-none items-center justify-between gap-2 rounded-sm p-2.5 text-body-sm outline-none',
        'data-[selected=true]:bg-surface-2 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50',
        className
      )}
      {...props}
    />
  );
}

export { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList };
