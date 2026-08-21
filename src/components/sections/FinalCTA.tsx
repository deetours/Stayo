"use client";

import React from "react";
import { MagneticButton } from "@/components/shared/MagneticButton";

export function FinalCTA() {
  return (
    <section className="w-full bg-surface py-32 px-6 border-t border-border relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-full bg-accent/5 blur-[120px] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className="font-display text-4xl md:text-5xl lg:text-7xl font-normal tracking-tight text-foreground mb-6">
          Run your property <br className="hidden md:block" />
          <span className="text-foreground/50">with StayO.</span>
        </h2>
        <p className="text-lg text-foreground/60 mb-10 max-w-2xl mx-auto font-light">
          Connect your guests, rooms, and staff into one living system.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <MagneticButton 
            size="lg"
            className="font-semibold w-full sm:w-auto"
            onClick={() => {
              window.dispatchEvent(new CustomEvent("open-demo-modal"));
            }}
          >
            Book a Demo
          </MagneticButton>
          <a 
            href="/app/dashboard"
            className="px-8 py-3 rounded-full border border-border/50 text-foreground/80 hover:text-foreground hover:bg-surface-2 transition-colors text-sm font-medium w-full sm:w-auto"
          >
            See the Dashboard
          </a>
        </div>
      </div>
    </section>
  );
}
