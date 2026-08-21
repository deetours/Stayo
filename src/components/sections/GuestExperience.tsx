"use client";

import React from "react";
import { motion } from "framer-motion";
import { slideUp } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export function GuestExperience() {
  const prefersReducedMotion = useReducedMotion();
  const transitionProps = prefersReducedMotion ? {} : { 
    initial: "hidden",
    whileInView: "visible",
    viewport: { once: true, margin: "-100px" }
  };

  return (
    <section className="py-32 px-6 bg-surface-2 border-t border-border/50">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          {...transitionProps}
          variants={slideUp}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">Guest Experience</h2>
          <p className="text-foreground/60 text-lg">Instant, multi-lingual, and deeply connected to your property's ground truth.</p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-stretch justify-center">
          {/* Step 1 */}
          <motion.div 
            {...transitionProps}
            variants={slideUp}
            custom={1}
            className="flex-1 bg-surface border border-border p-6 rounded-2xl flex flex-col"
          >
            <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-4">1. The Request</div>
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl rounded-bl-none self-start max-w-[90%] text-sm mb-auto">
              "We're arriving late tonight. Can we get extra towels in 301?"
            </div>
            <div className="mt-6 text-xs text-foreground/50 font-mono flex justify-between items-center">
              <span>via WhatsApp</span>
              <span>11:02 PM</span>
            </div>
          </motion.div>

          {/* Step 2 */}
          <motion.div 
            {...transitionProps}
            variants={slideUp}
            custom={2}
            className="flex-1 bg-surface border border-border p-6 rounded-2xl flex flex-col"
          >
            <div className="text-[10px] font-mono text-accent uppercase tracking-widest mb-4">2. StayO Intelligence</div>
            <div className="space-y-3 mb-auto">
              <div className="flex items-center gap-2 text-sm text-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                Intent: Service Request
              </div>
              <div className="flex items-center gap-2 text-sm text-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                Item: Towels (Quantity: Extra)
              </div>
              <div className="flex items-center gap-2 text-sm text-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                Target: Room 301
              </div>
            </div>
            <div className="mt-6 p-3 bg-accent/10 border border-accent/20 rounded-lg text-xs text-accent text-center">
              Task Created & Auto-Replied
            </div>
          </motion.div>

          {/* Step 3 */}
          <motion.div 
            {...transitionProps}
            variants={slideUp}
            custom={3}
            className="flex-1 bg-surface border border-border p-6 rounded-2xl flex flex-col"
          >
            <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-4">3. The Resolution</div>
            <div className="p-4 bg-border/50 border border-border rounded-xl mb-4 text-sm">
              <span className="font-semibold block mb-1">Night Staff</span>
              Deliver extra towels to Room 301.
            </div>
            <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl rounded-br-none self-end max-w-[90%] text-sm mb-auto">
              "Certainly. I've let the night staff know, they will be in your room when you arrive."
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
