"use client";

import React from "react";
import { motion } from "framer-motion";
import { Building2, ArrowDown } from "lucide-react";

export function Rollup() {
  return (
    <section className="w-full bg-background py-32 px-6 md:px-12">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-16">
        
        <div className="w-full md:w-1/2">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-6">
            Multi-property? <br/>
            <span className="text-accent">One command centre.</span>
          </h2>
          <p className="text-lg text-foreground/70 mb-8">
            Manage your entire portfolio from a single login. View consolidated revenue, staff performance, and group-wide occupancy, or drill down into individual properties with one click.
          </p>
        </div>

        <div className="w-full md:w-1/2 flex flex-col items-center">
          <div className="relative w-full max-w-sm flex flex-col gap-3">
            {/* Properties */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-4 rounded-xl bg-surface border border-border flex items-center justify-between z-10 relative"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-background flex items-center justify-center border border-border">
                  <Building2 className="w-4 h-4 text-foreground/60" />
                </div>
                <span className="font-medium text-sm">StayO Boutique</span>
              </div>
              <div className="text-sm font-mono"><span className="text-accent mr-1">●</span> 82%</div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="p-4 rounded-xl bg-surface border border-border flex items-center justify-between z-10 relative"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-background flex items-center justify-center border border-border">
                  <Building2 className="w-4 h-4 text-foreground/60" />
                </div>
                <span className="font-medium text-sm">StayO Hills Resort</span>
              </div>
              <div className="text-sm font-mono"><span className="text-accent mr-1">●</span> 64%</div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="p-4 rounded-xl bg-surface border border-border flex items-center justify-between z-10 relative"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-background flex items-center justify-center border border-border">
                  <Building2 className="w-4 h-4 text-foreground/60" />
                </div>
                <span className="font-medium text-sm">StayO Lakeside</span>
              </div>
              <div className="text-sm font-mono"><span className="text-accent mr-1">●</span> 91%</div>
            </motion.div>

            {/* Connecting lines */}
            <div className="absolute top-1/2 bottom-[-40px] left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-transparent via-accent/50 to-accent z-0" />
            
            <div className="flex justify-center mt-6 z-10">
              <ArrowDown className="w-5 h-5 text-accent animate-bounce" />
            </div>

            {/* Rollup Total */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="mt-2 p-5 rounded-xl bg-accent/10 border-2 border-accent/20 flex items-center justify-between z-10 shadow-[0_0_30px_-5px_rgba(16,185,129,0.2)]"
            >
              <span className="font-semibold text-accent">Group Total</span>
              <div className="text-xl font-mono font-bold text-accent">79% <span className="text-xs font-sans font-normal opacity-80 uppercase ml-1">Avg</span></div>
            </motion.div>
          </div>
        </div>

      </div>
    </section>
  );
}
