"use client";

import React from "react";
import { motion } from "framer-motion";
import { Building2, ArrowDown } from "lucide-react";
import { slideUp } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export function Rollup() {
  const prefersReducedMotion = useReducedMotion();
  const transitionProps = prefersReducedMotion ? {} : { 
    initial: "hidden",
    whileInView: "visible",
    viewport: { once: true, margin: "-100px" }
  };

  return (
    <section className="w-full bg-background py-32 px-6 md:px-12 border-t border-border/50">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          {...transitionProps}
          variants={slideUp}
          className="text-center mb-24"
        >
          <h2 className="font-display text-4xl md:text-5xl font-normal tracking-tight text-foreground mb-6">
            Revenue & Scale
          </h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            StayO turns data into yield. From targeted marketing campaigns to portfolio-wide performance rollups, scale your operations without scaling your headcount.
          </p>
        </motion.div>

        <div className="flex flex-col md:flex-row items-stretch gap-8">
          
          {/* Left: The Marketing Agent (from old Agents section) */}
          <motion.div 
            {...transitionProps}
            variants={slideUp}
            className="flex-1 bg-surface border border-border p-8 rounded-2xl flex flex-col justify-between"
          >
            <div>
              <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-6">StayO Campaign Manager</div>
              <h3 className="text-2xl font-medium mb-4 text-foreground">Smarter Outreach</h3>
              <p className="text-foreground/60 text-sm leading-relaxed mb-8">
                Identify gaps in occupancy and automatically generate targeted email campaigns for past guests with a high likelihood to return.
              </p>
            </div>
            
            <div className="p-5 bg-background border border-border rounded-xl">
              <div className="text-xs text-foreground/60 mb-2">Campaign generated:</div>
              <div className="text-sm font-medium text-foreground mb-3">"Winter Escape to the Hills"</div>
              <div className="flex items-center gap-2 text-xs font-mono text-accent">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                Targeting 450 past guests
              </div>
            </div>
          </motion.div>

          {/* Right: The Rollup Visual */}
          <motion.div 
            {...transitionProps}
            variants={slideUp}
            custom={1}
            className="flex-1 bg-surface border border-border p-8 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-accent/5 pointer-events-none" />
            <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-8 self-start w-full">Portfolio View</div>
            
            <div className="relative w-full max-w-sm flex flex-col gap-3 z-10">
              {/* Properties */}
              <div className="p-4 rounded-xl bg-background border border-border flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-surface flex items-center justify-center border border-border">
                    <Building2 className="w-4 h-4 text-foreground/60" />
                  </div>
                  <span className="font-medium text-sm">StayO Boutique</span>
                </div>
                <div className="text-sm font-mono"><span className="text-accent mr-1">●</span> 82%</div>
              </div>

              <div className="p-4 rounded-xl bg-background border border-border flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-surface flex items-center justify-center border border-border">
                    <Building2 className="w-4 h-4 text-foreground/60" />
                  </div>
                  <span className="font-medium text-sm">StayO Hills</span>
                </div>
                <div className="text-sm font-mono"><span className="text-accent mr-1">●</span> 64%</div>
              </div>

              {/* Connecting lines */}
              <div className="absolute top-1/2 bottom-[40px] left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-transparent via-accent/50 to-accent z-0" />
              
              <div className="flex justify-center mt-4 z-10 relative bg-surface py-2">
                <ArrowDown className="w-5 h-5 text-accent" />
              </div>

              {/* Rollup Total */}
              <div className="mt-2 p-5 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-between z-10 shadow-[0_0_30px_-5px_rgba(217,119,6,0.2)]">
                <span className="font-semibold text-accent">Group Total</span>
                <div className="text-xl font-mono font-bold text-accent">73% <span className="text-[10px] font-sans font-normal opacity-80 uppercase ml-1 tracking-wider">Avg Occ</span></div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
