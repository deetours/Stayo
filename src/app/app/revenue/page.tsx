'use client';

import React from 'react';
import { usePropertyData } from '@/lib/mock-data';

export default function RevenuePage() {
  const { meta, mockPayments, mockReservations } = usePropertyData();
  
  const totalRevenue = mockPayments
    .filter(p => p.status === 'success')
    .reduce((sum, p) => sum + p.amount, 0);
    
  const pendingRevenue = mockPayments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div>
        <h1 className="text-heading-lg font-semibold tracking-tight text-foreground">Revenue</h1>
        <p className="text-body-sm text-muted-foreground mt-1">
          Financial overview and key metrics for {meta.name}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 rounded-md bg-surface border border-border shadow-e0 flex flex-col justify-between">
          <span className="text-caption text-muted-foreground uppercase tracking-wider font-medium">Total Revenue Collected (MTD)</span>
          <span className="font-mono text-display-md font-bold text-accent mt-2">₹{totalRevenue.toLocaleString('en-IN')}</span>
        </div>
        <div className="p-6 rounded-md bg-surface border border-border shadow-e0 flex flex-col justify-between">
          <span className="text-caption text-muted-foreground uppercase tracking-wider font-medium">Pending Payments</span>
          <span className="font-mono text-display-md font-bold text-status-warn mt-2">₹{pendingRevenue.toLocaleString('en-IN')}</span>
        </div>
      </div>
      
      <div className="h-64 rounded-md border border-dashed border-border/50 flex items-center justify-center text-muted-foreground text-body-sm">
         [Revenue charts and advanced analytics coming soon]
      </div>
    </div>
  );
}
