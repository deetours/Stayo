'use client';

import React from 'react';
import { usePropertyData } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Zap, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function AutomationsPage() {
  const { meta } = usePropertyData();

  const rules = [
    { name: 'Pre-Arrival WhatsApp', trigger: '1 day before Check-in', action: 'Send WhatsApp template "Welcome Guide"', status: 'active' },
    { name: 'Review Request', trigger: '2 days after Checkout', action: 'Send Email template "How was your stay?"', status: 'active' },
    { name: 'VIP Alert', trigger: 'VIP Guest Created', action: 'Notify Staff Channel', status: 'inactive' },
  ];

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-heading-lg font-semibold tracking-tight text-foreground">Automations</h1>
          <p className="text-body-sm text-muted-foreground mt-1">
            Workflow rules and automated messaging for {meta.name}.
          </p>
        </div>
        <Button onClick={() => toast.success('Rule builder opening...')}>
          <Plus className="w-4 h-4 mr-2" />
          Create Rule
        </Button>
      </div>

      <div className="space-y-4">
        {rules.map((rule, i) => (
          <div key={i} className="p-5 rounded-md bg-surface border border-border shadow-e0 flex items-center justify-between group hover:border-accent/40 transition-colors">
            <div className="flex items-center gap-4">
               <div className={`w-10 h-10 rounded-full flex items-center justify-center ${rule.status === 'active' ? 'bg-status-info/10 text-status-info' : 'bg-surface-2 text-muted-foreground'}`}>
                 <Zap className="w-5 h-5" />
               </div>
               <div>
                 <h3 className="font-semibold text-body-md text-foreground">{rule.name}</h3>
                 <div className="text-body-sm text-muted-foreground mt-0.5">
                   <span className="font-medium">When:</span> {rule.trigger} <span className="mx-2 text-border">|</span> <span className="font-medium">Then:</span> {rule.action}
                 </div>
               </div>
            </div>
            
            <div className="flex items-center gap-3">
               <span className={`px-2 py-0.5 rounded-full text-caption font-medium uppercase border ${rule.status === 'active' ? 'bg-status-info/10 text-status-info border-status-info/30' : 'bg-surface-2 text-muted-foreground border-border'}`}>
                 {rule.status}
               </span>
               <button className="text-caption text-accent hover:underline font-medium">Edit</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
