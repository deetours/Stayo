"use client";

import React from "react";
import { User, History, Heart, MessageCircle } from "lucide-react";

export function MockGuestProfile() {
  return (
    <div className="w-full max-w-xl mx-auto rounded-xl bg-surface/80 p-0 border border-border shadow-2xl backdrop-blur-md overflow-hidden flex flex-col md:flex-row">
      {/* Left sidebar */}
      <div className="bg-surface-hover/50 p-6 border-b md:border-b-0 md:border-r border-border flex flex-col items-center justify-center min-w-[200px]">
        <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mb-4 border-2 border-accent/30">
          <User className="w-8 h-8 text-accent" />
        </div>
        <h3 className="font-semibold text-lg">Vikram Singh</h3>
        <p className="text-sm text-foreground/50 mb-3">+91 98765 43210</p>
        <span className="px-3 py-1 bg-accent/10 text-accent border border-accent/20 rounded-full text-xs font-medium">
          VIP Guest
        </span>
      </div>

      {/* Right content */}
      <div className="p-6 flex-1 flex flex-col gap-5">
        <div>
          <div className="flex items-center gap-2 mb-2 text-foreground/70">
            <History className="w-4 h-4" />
            <h4 className="text-sm font-medium">Stay History</h4>
          </div>
          <div className="flex gap-4">
            <div className="flex-1 p-3 bg-background rounded-lg border border-border">
              <div className="text-2xl font-semibold mb-1">12</div>
              <div className="text-[10px] text-foreground/50 uppercase tracking-wider">Past Stays</div>
            </div>
            <div className="flex-1 p-3 bg-background rounded-lg border border-border">
              <div className="text-2xl font-semibold mb-1 font-mono">₹4.2L</div>
              <div className="text-[10px] text-foreground/50 uppercase tracking-wider">Lifetime Value</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 text-foreground/70">
              <Heart className="w-4 h-4" />
              <h4 className="text-sm font-medium">Preferences</h4>
            </div>
            <ul className="text-sm text-foreground/80 space-y-1.5 list-disc pl-4 marker:text-accent">
              <li>High floor preferred</li>
              <li>Extra pillows</li>
              <li>Late check-out</li>
            </ul>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-2 text-foreground/70">
              <MessageCircle className="w-4 h-4" />
              <h4 className="text-sm font-medium">Last Request</h4>
            </div>
            <div className="p-2.5 bg-background border border-border rounded-lg text-xs text-foreground/80 italic relative">
              "Could we arrange an airport pickup for tomorrow at 9 AM?"
              <div className="absolute -left-1.5 top-3 w-3 h-3 bg-background border-l border-t border-border rotate-[-45deg]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
