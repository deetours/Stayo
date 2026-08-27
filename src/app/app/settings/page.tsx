'use client';

import React, { useState } from 'react';
import { usePropertyData } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { meta } = usePropertyData();
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'policies', label: 'Policies' },
    { id: 'taxes', label: 'Taxes & Fees' },
    { id: 'notifications', label: 'Notifications' },
  ];

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div>
        <h1 className="text-heading-lg font-semibold tracking-tight text-foreground">Settings</h1>
        <p className="text-body-sm text-muted-foreground mt-1">
          Configuration and property settings for {meta.name}.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 flex flex-col gap-1 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-left px-4 py-2.5 rounded-md text-body-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-accent/10 text-accent'
                  : 'text-muted-foreground hover:bg-surface-2 hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Pane */}
        <div className="flex-1 bg-surface border border-border shadow-e0 rounded-md p-6">
          {activeTab === 'general' && (
            <div className="space-y-6 max-w-xl">
              <h2 className="text-heading-sm font-semibold text-foreground">Property Details</h2>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-caption font-medium text-foreground">Property Name</label>
                  <input type="text" defaultValue={meta.name} className="w-full p-2 bg-surface border border-border rounded-md text-body-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent" />
                </div>
                <div className="space-y-1">
                  <label className="text-caption font-medium text-foreground">Property Type</label>
                  <input type="text" defaultValue={meta.type} className="w-full p-2 bg-surface border border-border rounded-md text-body-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent" />
                </div>
              </div>
              <div className="pt-4 border-t border-border">
                <Button onClick={() => toast.success('Settings saved')}>Save Changes</Button>
              </div>
            </div>
          )}

          {activeTab !== 'general' && (
            <div className="h-64 flex items-center justify-center text-muted-foreground text-body-sm italic border border-dashed border-border/50 rounded-md">
              {tabs.find(t => t.id === activeTab)?.label} configuration coming soon.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
