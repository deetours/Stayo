"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

gsap.registerPlugin(ScrollTrigger);

export function TheDay() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  
  const event1Ref = useRef<HTMLDivElement>(null);
  const event2Ref = useRef<HTMLDivElement>(null);
  const event3Ref = useRef<HTMLDivElement>(null);
  
  const prefersReducedMotion = useReducedMotion();

  useGSAP(() => {
    if (prefersReducedMotion) return;

    let mm = gsap.matchMedia();
    
    mm.add("(min-width: 768px)", () => {
      // Timeline line draws down
      gsap.fromTo(lineRef.current, 
        { height: "0%" },
        { 
          height: "100%",
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top center",
            end: "bottom center",
            scrub: true
          }
        }
      );

      // Event 1 (Morning)
      gsap.from(event1Ref.current, {
        autoAlpha: 0,
        y: 30,
        scrollTrigger: {
          trigger: event1Ref.current,
          start: "top 80%",
        }
      });

      // Event 2 (Afternoon)
      gsap.from(event2Ref.current, {
        autoAlpha: 0,
        y: 30,
        scrollTrigger: {
          trigger: event2Ref.current,
          start: "top 80%",
        }
      });

      // Event 3 (Evening)
      gsap.from(event3Ref.current, {
        autoAlpha: 0,
        y: 30,
        scrollTrigger: {
          trigger: event3Ref.current,
          start: "top 80%",
        }
      });
    });

    mm.add("(max-width: 767px)", () => {
      [event1Ref, event2Ref, event3Ref].forEach(ref => {
        gsap.from(ref.current, {
          autoAlpha: 0,
          y: 20,
          scrollTrigger: {
            trigger: ref.current,
            start: "top 85%",
          }
        });
      });
    });

    return () => mm.revert();
  }, { scope: containerRef, dependencies: [prefersReducedMotion] });

  return (
    <section 
      id="the-day"
      ref={containerRef}
      className="relative w-full py-32 bg-background flex flex-col items-center border-t border-border/50"
    >
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-32">
          <h2 className="font-display text-4xl md:text-6xl text-foreground mb-6">
            A Day With StayO
          </h2>
          <p className="text-lg text-foreground/60 font-sans font-light max-w-xl mx-auto">
            Silent coordination. StayO connects events across your property seamlessly, from morning to night.
          </p>
        </div>

        <div className="relative border-l-2 border-border/50 md:border-l-0 md:w-full ml-4 md:ml-0 pb-12">
          {/* Central line for desktop that draws down */}
          <div className="hidden md:block absolute top-0 bottom-0 left-1/2 -translate-x-px w-[2px] bg-border/30">
            <div ref={lineRef} className="w-full bg-accent origin-top" />
          </div>

          {/* Morning: Reservations */}
          <div ref={event1Ref} className="relative mb-32 pl-10 md:pl-0 md:w-full flex md:justify-start">
            <div className="absolute left-[-7px] md:left-1/2 md:-translate-x-1/2 top-1.5 w-3 h-3 rounded-full bg-accent border-2 border-background z-10 shadow-[0_0_10px_rgba(217,119,6,0.5)]" />
            <div className="md:w-[45%] md:pr-16 md:text-right">
              <div className="text-xs font-mono text-accent uppercase tracking-widest mb-3">Morning</div>
              <h3 className="text-2xl font-medium text-foreground mb-3">The Inbox is Empty</h3>
              <p className="text-foreground/60 font-light leading-relaxed">Overnight inquiries about weekend suites were answered, booked, and confirmed without a human lifting a finger.</p>
            </div>
            
            <div className="hidden md:block absolute left-1/2 top-3 -translate-y-px w-12 h-[2px] bg-border/50" />
            
            <div className="mt-8 md:mt-0 md:absolute md:left-1/2 md:top-0 md:w-[45%] md:pl-16 text-left">
              <div className="bg-surface border border-border p-5 rounded-xl shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-accent" />
                <div className="text-[10px] font-mono text-accent mb-2 uppercase font-bold tracking-wider">StayO Automated</div>
                <div className="text-sm text-foreground/80 leading-relaxed">"Can I book a suite for next weekend?" → Auto-booked & confirmed into the PMS.</div>
              </div>
            </div>
          </div>

          {/* Afternoon: Housekeeping */}
          <div ref={event2Ref} className="relative mb-32 pl-10 md:pl-0 md:w-full flex md:justify-start">
            <div className="absolute left-[-7px] md:left-1/2 md:-translate-x-1/2 top-1.5 w-3 h-3 rounded-full bg-accent border-2 border-background z-10 shadow-[0_0_10px_rgba(217,119,6,0.5)]" />
            <div className="md:w-[45%] md:pl-16 md:ml-auto">
              <div className="text-xs font-mono text-accent uppercase tracking-widest mb-3">Afternoon</div>
              <h3 className="text-2xl font-medium text-foreground mb-3">Frictionless Turnovers</h3>
              <p className="text-foreground/60 font-light leading-relaxed">As guests check out on their phones, housekeeping tasks instantly reshuffle based on priority and location.</p>
            </div>
            
            <div className="hidden md:block absolute left-1/2 top-3 -translate-y-px w-12 h-[2px] bg-border/50 -translate-x-full" />
            
            <div className="mt-8 md:mt-0 md:absolute md:left-0 md:top-0 md:w-[45%] md:pr-16 md:text-right">
              <div className="bg-surface border border-border p-5 rounded-xl shadow-lg relative overflow-hidden inline-block text-left w-full">
                <div className="absolute top-0 left-0 md:left-auto md:right-0 w-1 h-full bg-blue-500" />
                <div className="text-[10px] font-mono text-blue-500 mb-2 uppercase font-bold tracking-wider">StayO Detected</div>
                <div className="text-sm text-foreground/80 leading-relaxed">"Room 204 checked out early." → Priority cleaning dynamically assigned to floor staff.</div>
              </div>
            </div>
          </div>

          {/* Evening: Revenue */}
          <div ref={event3Ref} className="relative pl-10 md:pl-0 md:w-full flex md:justify-start">
            <div className="absolute left-[-7px] md:left-1/2 md:-translate-x-1/2 top-1.5 w-3 h-3 rounded-full bg-accent border-2 border-background z-10 shadow-[0_0_10px_rgba(217,119,6,0.5)]" />
            <div className="md:w-[45%] md:pr-16 md:text-right">
              <div className="text-xs font-mono text-accent uppercase tracking-widest mb-3">Evening</div>
              <h3 className="text-2xl font-medium text-foreground mb-3">Optimizing While You Sleep</h3>
              <p className="text-foreground/60 font-light leading-relaxed">The system continuously analyzes market comps and search volume, adjusting rates to capture maximum yield.</p>
            </div>
            
            <div className="hidden md:block absolute left-1/2 top-3 -translate-y-px w-12 h-[2px] bg-border/50" />
            
            <div className="mt-8 md:mt-0 md:absolute md:left-1/2 md:top-0 md:w-[45%] md:pl-16 text-left">
              <div className="bg-surface border border-border p-5 rounded-xl shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
                <div className="text-[10px] font-mono text-green-500 mb-2 uppercase font-bold tracking-wider">StayO Recommends</div>
                <div className="text-sm text-foreground/80 leading-relaxed">"High search volume for upcoming holiday." → Weekend ADR automatically increased by 15%.</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
