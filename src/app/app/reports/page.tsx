'use client';

import React from 'react';
import { usePropertyData } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function ReportsPage() {
  const { meta } = usePropertyData();

  const handleDownload = (reportName: string) => {
    toast.success(`Generating ${reportName}...`);
  };

  const reports = [
    { title: 'Monthly Occupancy Report', description: 'Detailed breakdown of room occupancy and ADR for the current month.' },
    { title: 'Tax & Compliance', description: 'Export of all taxable transactions, GST breakdown, and city tax.' },
    { title: 'Police / Local Authority Export', description: 'Automated CSV of all checked-in guests required for local compliance.' },
    { title: 'Revenue by Channel', description: 'Comparison of direct bookings vs OTAs (Booking.com, Airbnb).' },
  ];

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div>
        <h1 className="text-heading-lg font-semibold tracking-tight text-foreground">Reports</h1>
        <p className="text-body-sm text-muted-foreground mt-1">
          Exportable operational and financial data for {meta.name}.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {reports.map((r, i) => (
          <div key={i} className="p-5 rounded-md bg-surface border border-border shadow-e0 flex flex-col justify-between space-y-4 hover:border-muted-foreground/40 transition-colors">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-foreground font-medium text-body-md">
                <FileText className="w-4 h-4 text-accent" />
                {r.title}
              </div>
              <p className="text-body-sm text-muted-foreground">{r.description}</p>
            </div>
            
            <div className="flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => handleDownload(r.title)}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
