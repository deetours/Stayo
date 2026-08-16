"use client";

import React from "react";

export function Bridge() {
  return (
    <section className="w-full bg-surface py-20 px-6 md:px-12 border-t border-border">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-foreground mb-8">
          The Girivah Ecosystem
        </h2>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12 text-lg">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-foreground/80">Trailo</span>
            <span className="text-foreground/40">—</span>
            <span className="text-foreground/60">the world outside the property</span>
          </div>
          
          <div className="hidden md:block w-px h-8 bg-border"></div>
          <div className="md:hidden w-8 h-px bg-border my-2"></div>
          
          <div className="flex items-center gap-3">
            <span className="font-semibold text-accent">StayO</span>
            <span className="text-foreground/40">—</span>
            <span className="text-accent/80">the world inside the property</span>
          </div>
        </div>
        
        <p className="mt-10 text-sm text-foreground/50 max-w-lg mx-auto">
          A trip planned and booked on Trailo flows seamlessly into a stay managed by StayO. One connected guest journey.
        </p>
      </div>
    </section>
  );
}
