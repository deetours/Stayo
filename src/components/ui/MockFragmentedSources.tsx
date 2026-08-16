"use client";

import React, { useRef, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const sources = [
  { id: 1, label: "Booking.com", color: "bg-blue-900/50 text-blue-200 border-blue-500/30", startPos: { x: "-40vw", y: "-30vh" } },
  { id: 2, label: "MakeMyTrip", color: "bg-red-900/50 text-red-200 border-red-500/30", startPos: { x: "35vw", y: "-25vh" } },
  { id: 3, label: "WhatsApp", color: "bg-green-900/50 text-green-200 border-green-500/30", startPos: { x: "-30vw", y: "25vh" } },
  { id: 4, label: "Excel", color: "bg-emerald-900/50 text-emerald-200 border-emerald-500/30", startPos: { x: "40vw", y: "30vh" } },
  { id: 5, label: "Paper Register", color: "bg-amber-900/50 text-amber-200 border-amber-500/30", startPos: { x: "-10vw", y: "-40vh" } },
  { id: 6, label: "Front Desk", color: "bg-purple-900/50 text-purple-200 border-purple-500/30", startPos: { x: "15vw", y: "40vh" } },
  { id: 7, label: "Agoda", color: "bg-rose-900/50 text-rose-200 border-rose-500/30", startPos: { x: "-45vw", y: "0vh" } },
  { id: 8, label: "Direct Calls", color: "bg-sky-900/50 text-sky-200 border-sky-500/30", startPos: { x: "45vw", y: "0vh" } },
];

export function MockFragmentedSources() {
  const containerRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const chipsRef = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=250%",
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        }
      });

      // Initial state: center is hidden
      gsap.set(centerRef.current, { scale: 0, opacity: 0 });

      // Stagger chips converging to center
      chipsRef.current.forEach((chip, i) => {
        if (!chip) return;
        
        // Start from scattered positions
        gsap.set(chip, { 
          x: sources[i].startPos.x, 
          y: sources[i].startPos.y,
          opacity: 0.2
        });

        tl.to(chip, {
          x: 0,
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power2.inOut",
        }, i * 0.15); // Staggered start times
      });

      // Reveal the center "StayO" mark after they converge
      tl.to(centerRef.current, {
        scale: 1,
        opacity: 1,
        duration: 0.5,
        ease: "back.out(1.7)"
      }, "-=0.5");

      // Final line reveal is handled in the Problem section component itself
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="w-full h-screen flex flex-col items-center justify-center relative overflow-hidden bg-background">
      <div className="relative w-full h-full flex items-center justify-center">
        {sources.map((source, i) => (
          <div
            key={source.id}
            ref={(el) => { chipsRef.current[i] = el; }}
            className={cn(
              "absolute px-4 py-2 rounded-full border text-sm font-medium whitespace-nowrap shadow-lg backdrop-blur-sm z-10",
              source.color
            )}
          >
            {source.label}
          </div>
        ))}
        
        <div 
          ref={centerRef}
          className="relative z-20 flex items-center justify-center w-32 h-32 rounded-full bg-surface border border-accent/30 shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)] backdrop-blur-md"
        >
          <span className="text-xl font-bold tracking-tight text-white">StayO</span>
          <div className="absolute inset-0 rounded-full border-2 border-accent/20 animate-ping" />
        </div>
      </div>
      
      <div className="absolute bottom-24 left-0 right-0 text-center z-30">
        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-white max-w-3xl mx-auto leading-tight">
          Your software doesn't operate as one system. <br/>
          <span className="text-accent">StayO does.</span>
        </h2>
      </div>
    </div>
  );
}
