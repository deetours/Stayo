"use client";

import React from "react";
import { MagneticButton } from "@/components/shared/MagneticButton";

export function FinalCTA() {
  return (
    <section className="w-full bg-surface py-32 px-6 border-t border-border relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-full bg-accent/5 blur-[120px] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground mb-6">
          Everything at your property, <br className="hidden md:block" />
          <span className="text-accent">mostly running itself.</span>
        </h2>
        <p className="text-lg text-foreground/60 mb-10 max-w-2xl mx-auto">
          Join the forward-thinking properties running their entire operation on StayO's AI platform.
        </p>
        
        <div className="flex justify-center">
          <MagneticButton 
            size="lg"
            className="font-semibold"
            onClick={() => {
              window.dispatchEvent(new CustomEvent("open-demo-modal"));
            }}
          >
            Book a Demo
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
