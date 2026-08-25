'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';

function Sheet(props: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger(props: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetPortal(props: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetClose(props: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="sheet-close" {...props} />;
}

// Same Presence-driven transition approach as dialog.tsx, timed to
// --duration-standard (220ms) to match DetailDrawer/AskStayOPanel's
// existing Framer slide timing.
function SheetOverlay({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        'fixed inset-0 z-50 bg-background/80 backdrop-blur-xs opacity-0 data-[state=open]:opacity-100 transition-opacity duration-220 ease-out',
        className
      )}
      {...props}
    />
  );
}

type SheetSide = 'top' | 'right' | 'bottom' | 'left';

const sideClasses: Record<SheetSide, string> = {
  right:
    'inset-y-0 right-0 h-full w-full md:w-[420px] border-l translate-x-full data-[state=open]:translate-x-0',
  left: 'inset-y-0 left-0 h-full w-full md:w-[420px] border-r -translate-x-full data-[state=open]:translate-x-0',
  top: 'inset-x-0 top-0 h-auto border-b -translate-y-full data-[state=open]:translate-y-0',
  bottom: 'inset-x-0 bottom-0 h-auto border-t translate-y-full data-[state=open]:translate-y-0',
};

function SheetContent({
  className,
  children,
  side = 'right',
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & { side?: SheetSide; showCloseButton?: boolean }) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <DialogPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          'fixed z-50 flex flex-col gap-0 bg-surface border-border shadow-[var(--shadow-e3)] outline-none transition-transform duration-220 ease-out',
          sideClasses[side],
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close className="absolute top-3.5 right-4 rounded-sm p-1 text-muted-foreground hover:text-foreground hover:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-ring disabled:pointer-events-none">
            <X className="w-4 h-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="sheet-header" className={cn('flex flex-col gap-1 px-6 py-4 border-b border-border', className)} {...props} />;
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="sheet-title"
      className={cn('text-heading-md font-semibold text-foreground tracking-tight', className)}
      {...props}
    />
  );
}

function SheetDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="sheet-description"
      className={cn('text-body-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

export { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetOverlay, SheetPortal, SheetTitle, SheetTrigger };
