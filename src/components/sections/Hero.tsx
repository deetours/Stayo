"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { MockCommandCentre } from "@/components/ui/MockCommandCentre";
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
      className="relative min-h-screen pt-32 pb-20 flex flex-col items-center justify-center overflow-hidden"
    >
      <motion.div 
        style={{ opacity, y }}
        className="container mx-auto px-4 sm:px-6 relative z-10 flex flex-col items-center"
      >
        <div className="max-w-4xl mx-auto text-center mb-12">
          <motion.h1 
            initial={{ clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0% 100%)", y: 40 }}
            animate={{ clipPath: "polygon(0 0%, 100% 0%, 100% 100%, 0% 100%)", y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-tight mb-6"
          >
            Everything at your property, <br className="hidden md:block" />
            in one place — <span className="text-accent">and mostly running itself.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-lg md:text-xl text-foreground/70 mb-10 max-w-2xl mx-auto"
          >
            The AI operating system for hotels, resorts, homestays and cabins.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <MagneticButton 
              size="lg"
              className="w-full sm:w-auto font-semibold"
              onClick={() => {
                window.dispatchEvent(new CustomEvent("open-demo-modal"));
              }}
            >
              Book a Demo
            </MagneticButton>
            <MagneticButton 
              variant="ghost" 
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => {
                const el = document.getElementById("command-centre");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
            >
              See how it works
            </MagneticButton>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full relative"
        >
          {/* Subtle glow behind the command center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-accent/20 blur-[100px] rounded-full pointer-events-none" />
          
          <MockCommandCentre />
        </motion.div>
      </motion.div>
      
      {/* Background pattern */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{
        backgroundImage: `radial-gradient(circle at center, #262626 1px, transparent 1px)`,
        backgroundSize: `48px 48px`
      }} />
    </section>
  );
}
