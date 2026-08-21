"use client";

import React from "react";
import { motion } from "framer-motion";
import { slideUp } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

const types = [
  "Boutique Hotels",
  "Resorts",
  "Homestays",
  "Cabins",
  "Hostels",
  "Multi-Property Groups",
];

export function PropertyTypes() {
  const prefersReducedMotion = useReducedMotion();
  const transitionProps = prefersReducedMotion ? {} : { 
    initial: "hidden",
    whileInView: "visible",
    viewport: { once: true, margin: "-100px" }
  };

  return (
    <section className="w-full bg-surface py-32 px-6 md:px-12 border-t border-b border-border/50">
      <div className="max-w-6xl mx-auto flex flex-col items-center">
        
        {/* The Ecosystem (Elevated Bridge) */}
        <motion.div 
          {...transitionProps}
          variants={slideUp}
          className="text-center mb-24 w-full"
        >
          <h2 className="font-display text-2xl md:text-3xl tracking-widest text-foreground/40 uppercase mb-12">
            The Girivah Ecosystem
          </h2>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-16 text-2xl md:text-4xl font-display">
            <div className="flex flex-col items-center gap-2">
              <span className="text-foreground/80">Trailo</span>
              <span className="text-sm font-sans font-normal tracking-wide text-foreground/40">the world outside the property</span>
            </div>
            
            <div className="hidden md:block w-px h-16 bg-border/50"></div>
            <div className="md:hidden w-16 h-px bg-border/50 my-4"></div>
            
            <div className="flex flex-col items-center gap-2">
              <span className="text-accent">STAYO</span>
              <span className="text-sm font-sans font-normal tracking-wide text-accent/60">the world inside the property</span>
            </div>
          </div>
          
          <p className="mt-12 text-foreground/60 max-w-lg mx-auto leading-relaxed">
            A trip planned and booked on Trailo flows seamlessly into a stay managed by StayO. One connected guest journey.
          </p>
        </motion.div>

        {/* Shrunk Property Types Strip */}
        <motion.div 
          {...transitionProps}
          variants={slideUp}
          custom={1}
          className="w-full border-t border-border/50 pt-16 flex flex-col items-center"
        >
          <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-8 text-center">
            Built for every kind of property
          </div>
          
          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            {types.map((type) => (
              <div
                key={type}
                className="px-4 py-2 rounded-full bg-background border border-border text-sm text-foreground/80"
              >
                {type}
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
