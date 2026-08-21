import React from 'react';

export default function TokensPage() {
  return (
    <div className="p-12 space-y-16 max-w-5xl mx-auto font-sans">
      <div>
        <h1 className="text-display-md mb-2">Design Tokens</h1>
        <p className="text-body-lg text-foreground/70">
          Component preview and token verification.
        </p>
      </div>

      <section className="space-y-6">
        <h2 className="text-heading-lg border-b border-border pb-2">Colors</h2>
        
        <div className="space-y-4">
          <h3 className="text-heading-md">Backgrounds & Surfaces</h3>
          <div className="flex gap-4">
            <div className="w-24 h-24 rounded-md border border-border bg-background flex items-center justify-center text-xs">bg</div>
            <div className="w-24 h-24 rounded-md border border-border bg-surface flex items-center justify-center text-xs">surface</div>
            <div className="w-24 h-24 rounded-md border border-border bg-surface-2 flex items-center justify-center text-xs">surface-2</div>
            <div className="w-24 h-24 rounded-md border border-border bg-surface-hover flex items-center justify-center text-xs">hover</div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-heading-md">Accent & Status</h3>
          <div className="flex gap-4">
            <div className="w-24 h-24 rounded-md border border-border bg-accent flex items-center justify-center text-accent-foreground text-xs font-medium">accent</div>
            <div className="w-24 h-24 rounded-md border border-border bg-status-ok flex items-center justify-center text-background text-xs font-medium">ok</div>
            <div className="w-24 h-24 rounded-md border border-border bg-status-warn flex items-center justify-center text-background text-xs font-medium">warn</div>
            <div className="w-24 h-24 rounded-md border border-border bg-status-crit flex items-center justify-center text-background text-xs font-medium">crit</div>
            <div className="w-24 h-24 rounded-md border border-border bg-status-info flex items-center justify-center text-background text-xs font-medium">info</div>
          </div>
        </div>
      </section>
      
      <section className="space-y-6">
        <h2 className="text-heading-lg border-b border-border pb-2">Typography</h2>
        <div className="space-y-4">
          <div className="text-display-xl">Display XL (64/72)</div>
          <div className="text-display-lg">Display LG (48/56)</div>
          <div className="text-display-md">Display MD (36/44)</div>
          <div className="text-heading-lg">Heading LG (28/36)</div>
          <div className="text-heading-md">Heading MD (22/28)</div>
          <div className="text-heading-sm">Heading SM (17/24)</div>
          <div className="text-body-lg">Body LG (16/24)</div>
          <div className="text-body-md">Body MD (14/20)</div>
          <div className="text-body-sm">Body SM (13/18)</div>
          <div className="text-caption uppercase tracking-wider">Caption (11/16)</div>
          <div className="font-mono text-body-md text-accent">Mono 101-A (14/20)</div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-heading-lg border-b border-border pb-2">Elevation & Radii</h2>
        <div className="flex gap-8">
          <div className="w-32 h-32 bg-surface border border-border rounded-sm flex items-center justify-center text-xs shadow-e0">e0 / sm</div>
          <div className="w-32 h-32 bg-surface border border-border rounded-md flex items-center justify-center text-xs shadow-e1">e1 / md</div>
          <div className="w-32 h-32 bg-surface border border-border rounded-lg flex items-center justify-center text-xs shadow-e2">e2 / lg</div>
          <div className="w-32 h-32 bg-surface border border-border rounded-full flex items-center justify-center text-xs shadow-e3">e3 / full</div>
        </div>
      </section>
    </div>
  );
}
