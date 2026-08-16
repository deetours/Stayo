"use client";

import React from "react";
import { Sparkles, Trash2, CheckCircle2, UserCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const statuses = [
  { id: "dirty", label: "Dirty", icon: Trash2, color: "text-red-400 bg-red-400/10 border-red-400/20" },
  { id: "cleaning", label: "Cleaning", icon: Clock, color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  { id: "ready", label: "Ready", icon: CheckCircle2, color: "text-accent bg-accent/10 border-accent/20" },
];

const rooms = [
  { num: "201", type: "Suite", status: "dirty", staff: "Unassigned" },
  { num: "202", type: "Deluxe", status: "cleaning", staff: "Maria" },
  { num: "203", type: "Standard", status: "ready", staff: "John" },
  { num: "204", type: "Suite", status: "ready", staff: "Maria" },
];

export function MockHousekeepingBoard() {
  return (
    <div className="w-full max-w-xl mx-auto rounded-xl bg-surface/80 p-4 border border-border shadow-2xl backdrop-blur-md">
      <div className="flex items-center gap-3 mb-6 border-b border-border pb-3">
        <div className="p-2 rounded-lg bg-accent/10">
          <Sparkles className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground leading-none mb-1">Housekeeping, Live</h3>
          <p className="text-xs text-foreground/50">Auto-assigned based on check-ins</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {rooms.map((room) => {
          const statusObj = statuses.find(s => s.id === room.status)!;
          const Icon = statusObj.icon;
          
          return (
            <div 
              key={room.num}
              className={cn(
                "p-3 rounded-lg border flex flex-col gap-3 transition-all",
                statusObj.color,
                "hover:-translate-y-1 hover:shadow-lg"
              )}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-mono font-semibold">{room.num}</div>
                  <div className="text-[10px] opacity-70">{room.type}</div>
                </div>
                <Icon className="w-4 h-4 opacity-80" />
              </div>
              
              <div className="flex items-center gap-1.5 mt-auto">
                <UserCircle className="w-3.5 h-3.5 opacity-60" />
                <span className="text-[10px] font-medium opacity-80">{room.staff}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
