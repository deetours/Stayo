"use client";

import React from "react";
import { Calendar, User, Phone, Globe, Smartphone } from "lucide-react";

const bookings = [
  { room: "101", guest: "A. Sharma", channel: "MakeMyTrip", icon: Globe, color: "text-blue-400 bg-blue-500/10 border-blue-500/20", days: 3, start: 0 },
  { room: "102", guest: "R. Kapoor", channel: "Direct", icon: User, color: "text-accent bg-accent/10 border-accent/20", days: 2, start: 1 },
  { room: "103", guest: "S. Gupta", channel: "WhatsApp", icon: Smartphone, color: "text-green-400 bg-green-500/10 border-green-500/20", days: 4, start: 0 },
  { room: "104", guest: "M. Singh", channel: "Booking.com", icon: Globe, color: "text-blue-400 bg-blue-500/10 border-blue-500/20", days: 1, start: 2 },
  { room: "105", guest: "Walk-in", channel: "Front Desk", icon: Phone, color: "text-purple-400 bg-purple-500/10 border-purple-500/20", days: 2, start: 3 },
];

export function MockReservationCalendar() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];

  return (
    <div className="w-full max-w-xl mx-auto rounded-xl bg-surface/80 p-4 border border-border shadow-2xl backdrop-blur-md">
      <div className="flex items-center gap-3 mb-4 border-b border-border pb-3">
        <div className="p-2 rounded-lg bg-accent/10">
          <Calendar className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground leading-none mb-1">Unified Calendar</h3>
          <p className="text-xs text-foreground/50">All channels, one view</p>
        </div>
      </div>

      <div className="flex text-xs text-foreground/50 mb-2 pl-12">
        {days.map((day) => (
          <div key={day} className="flex-1 text-center py-1">{day}</div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {bookings.map((booking, i) => (
          <div key={i} className="flex items-center gap-3 relative h-10">
            <div className="w-8 text-xs font-mono text-foreground/50 text-right shrink-0">{booking.room}</div>
            
            {/* The calendar grid line behind */}
            <div className="absolute left-12 right-0 top-0 bottom-0 flex">
              {[0,1,2,3,4].map(d => (
                <div key={d} className="flex-1 border-l border-border/30 h-full" />
              ))}
            </div>

            {/* The actual booking bar */}
            <div className="relative flex-1 h-full">
              <div 
                className={`absolute top-1 bottom-1 rounded-md border flex items-center px-2 gap-2 overflow-hidden shadow-sm ${booking.color}`}
                style={{ 
                  left: `${(booking.start / 5) * 100}%`, 
                  width: `${(booking.days / 5) * 100}%` 
                }}
              >
                <booking.icon className="w-3 h-3 shrink-0" />
                <span className="text-xs font-medium whitespace-nowrap hidden sm:inline-block">
                  {booking.guest}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
