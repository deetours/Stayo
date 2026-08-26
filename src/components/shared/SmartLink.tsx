'use client';

import React from 'react';
import Link from 'next/link';
import { isRouteBuilt } from '@/lib/routes';

interface SmartLinkProps extends Omit<React.ComponentProps<typeof Link>, 'href'> {
  href: string;
  comingSoonLabel?: string;
}

// Renders a real Link for a built route, or a visually-disabled placeholder
// for one that isn't — the same "Coming Soon" pattern AppSidebar already
// uses, applied everywhere else a route gets linked to.
export function SmartLink({ href, className, children, comingSoonLabel = 'Coming soon', ...rest }: SmartLinkProps) {
  if (isRouteBuilt(href)) {
    return (
      <Link href={href} className={className} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <div
      title={comingSoonLabel}
      aria-disabled="true"
      className={`${className ?? ''} opacity-40 pointer-events-none cursor-not-allowed`}
    >
      {children}
    </div>
  );
}
