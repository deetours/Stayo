"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { MagneticButton } from "@/components/shared/MagneticButton";

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return (
    <section 
      ref={containerRef}
      className="relative min-h-[90vh] pt-32 pb-20 flex flex-col items-center justify-center overflow-hidden"
    >
      <motion.div 
        style={{ opacity, y }}
        className="container mx-auto px-4 sm:px-6 relative z-10 flex flex-col items-center"
      >
        <div className="max-w-4xl mx-auto text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="flex items-center justify-center gap-2 mb-8"
          >
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border/50 text-[10px] font-mono tracking-widest uppercase text-foreground/70">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Intelligence Active
            </div>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-5xl md:text-7xl lg:text-8xl font-normal tracking-tight leading-[1.1] mb-8 text-foreground"
          >
            Your entire property. <br className="hidden md:block" />
            <span className="text-foreground/50">Working as one.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="text-lg md:text-xl text-foreground/60 mb-10 max-w-2xl mx-auto font-sans font-light"
          >
            The operating system for hotels, resorts, and cabins. <br className="hidden sm:block" />
            StayO connects every guest, room, and task into a single living system.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <MagneticButton 
              size="lg"
              className="w-full sm:w-auto font-medium"
              onClick={() => {
                window.dispatchEvent(new CustomEvent("open-demo-modal"));
              }}
            >
              Run your property with StayO
            </MagneticButton>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Ambient architectural texture instead of glowing dots */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      }} />
    </section>
  );
}
