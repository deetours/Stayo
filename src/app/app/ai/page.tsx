'use client';

import React from 'react';
import { usePropertyData } from '@/lib/mock-data';
import { Sparkles, Send } from 'lucide-react';

export default function AIPage() {
  const { meta } = usePropertyData();

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] font-sans max-w-4xl mx-auto w-full">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-heading-lg font-semibold tracking-tight text-foreground">StayO AI Command</h1>
          <p className="text-body-sm text-muted-foreground mt-1">
            Natural language assistant for {meta.name}.
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden border border-border rounded-md bg-surface shadow-e0">
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          <div className="flex justify-start">
             <div className="bg-surface-2 border border-border rounded-xl rounded-tl-none p-4 max-w-[80%]">
                <p className="text-body-sm text-foreground">
                  Hello! I am your StayO Assistant. I can help you query reservations, check room status, draft guest messages, or analyze revenue. What would you like to do?
                </p>
             </div>
          </div>
          
          {/* Prompts */}
          <div className="flex flex-wrap gap-2 mt-4">
             {['"Show me tomorrow\'s VIP arrivals"', '"Draft a welcome message for Room 102"', '"What is our current occupancy?"'].map((prompt, i) => (
               <button key={i} className="px-3 py-1.5 rounded-full border border-border bg-surface text-caption text-muted-foreground hover:border-accent hover:text-accent transition-colors">
                 {prompt}
               </button>
             ))}
          </div>
        </div>

        <div className="p-4 border-t border-border bg-surface-2/30">
          <div className="relative flex items-center">
            <input 
              type="text" 
              placeholder="Ask anything..." 
              className="w-full bg-surface border border-border rounded-full py-3 pl-4 pr-12 text-body-sm focus:outline-none focus:ring-1 focus:ring-accent"
            />
            <button className="absolute right-2 w-8 h-8 flex items-center justify-center rounded-full bg-accent text-accent-foreground hover:opacity-90 transition-opacity">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
