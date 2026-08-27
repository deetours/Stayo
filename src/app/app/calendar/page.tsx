'use client';

import React from 'react';
import { usePropertyData } from '@/lib/mock-data';
import { Calendar as CalendarIcon } from 'lucide-react';

export default function CalendarPage() {
  const { meta, mockRooms } = usePropertyData();

  // A real calendar would use a library like fullcalendar or a custom tape chart.
  // This is a UI shell.
  const days = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] font-sans">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-heading-lg font-semibold tracking-tight text-foreground">Calendar</h1>
          <p className="text-body-sm text-muted-foreground mt-1">
            Tape chart and reservations for {meta.name}.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 bg-surface border border-border rounded-md text-body-sm font-medium hover:bg-surface-2">
            Today
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto border border-border rounded-md bg-surface shadow-e0">
        <div className="min-w-[1000px]">
          {/* Header Row */}
          <div className="flex border-b border-border bg-surface-2 sticky top-0 z-10">
            <div className="w-48 shrink-0 border-r border-border p-3 font-semibold text-caption uppercase text-muted-foreground bg-surface-2">
              Rooms
            </div>
            <div className="flex-1 flex">
              {days.map((d, i) => (
                <div key={i} className="flex-1 border-r border-border p-2 text-center">
                  <div className="text-caption text-muted-foreground">{d.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                  <div className="text-body-md font-semibold text-foreground">{d.getDate()}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Grid Rows */}
          {mockRooms.map((room) => (
            <div key={room.number} className="flex border-b border-border hover:bg-surface-2/50 transition-colors group">
              <div className="w-48 shrink-0 border-r border-border p-3">
                <div className="font-semibold text-foreground text-body-sm">{room.number}</div>
                <div className="text-caption text-muted-foreground truncate">{room.type}</div>
              </div>
              <div className="flex-1 flex relative">
                {days.map((_, i) => (
                  <div key={i} className="flex-1 border-r border-border/50 p-2"></div>
                ))}
                
                {/* Dummy Booking Block - just to show the UI pattern */}
                {room.status === 'occupied' && (
                  <div className="absolute top-2 bottom-2 left-[10%] right-[60%] bg-accent/20 border border-accent rounded-sm px-2 py-1 overflow-hidden z-0">
                    <div className="text-caption font-semibold text-accent truncate">Booked</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
