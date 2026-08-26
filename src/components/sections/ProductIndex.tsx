"use client";

import React, { useRef, useState } from "react";
import { gsap, useGSAP, Flip } from "@/lib/gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CalendarCheck, Sparkles, ClipboardList, LineChart, MessageCircle, Building2 } from "lucide-react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const MODULES = [
  { id: "pms", icon: CalendarCheck, name: "Unified PMS", desc: "One calendar for every room, every property, every channel." },
  { id: "intel", icon: Sparkles, name: "StayO Intelligence", desc: "Reads every request and routes it before staff have to." },
  { id: "hk", icon: ClipboardList, name: "Housekeeping", desc: "Tasks reshuffle themselves the moment a guest checks out." },
  { id: "rev", icon: LineChart, name: "Revenue Intelligence", desc: "Rates adjust to demand while you sleep." },
  { id: "guest", icon: MessageCircle, name: "Guest Messaging", desc: "Multi-lingual, instant, and grounded in your property's ground truth." },
  { id: "rollup", icon: Building2, name: "Multi-Property Rollup", desc: "Every property's performance, one portfolio view." },
];

export function ProductIndex() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const prefersReducedMotion = useReducedMotion();

  useGSAP(() => {
    gsap.from(containerRef.current!.querySelectorAll(".module-card"), {
      autoAlpha: 0,
      y: 20,
      duration: 0.5,
      stagger: 0.06,
      ease: "power2.out",
      scrollTrigger: { trigger: containerRef.current, start: "top 75%" },
    });
  }, { scope: containerRef, dependencies: [prefersReducedMotion], revertOnUpdate: true });

  const handleToggle = (id: string) => {
    const next = expanded === id ? null : id;
    if (prefersReducedMotion || !gridRef.current) {
      setExpanded(next);
      return;
    }
    const state = Flip.getState(gridRef.current.querySelectorAll(".module-card"));
    setExpanded(next);
    requestAnimationFrame(() => {
      Flip.from(state, { duration: 0.4, ease: "power2.inOut", absolute: false });
    });
  };

  return (
    <section ref={containerRef} className="w-full bg-background py-32 px-6 border-t border-border/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">Every module, in one place.</h2>
          <p className="text-lg text-foreground/60 max-w-xl mx-auto">Six systems that used to be six vendors.</p>
        </div>

        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULES.map((mod) => (
            <button
              key={mod.id}
              type="button"
              onClick={() => handleToggle(mod.id)}
              onMouseEnter={() => window.matchMedia("(hover: hover) and (pointer: fine)").matches && handleToggle(mod.id)}
              onMouseLeave={() => window.matchMedia("(hover: hover) and (pointer: fine)").matches && expanded === mod.id && handleToggle(mod.id)}
              className={cn(
                "module-card text-left p-6 rounded-2xl border border-border bg-surface flex flex-col gap-3 transition-colors cursor-pointer",
                expanded === mod.id && "sm:col-span-2 bg-surface-2 border-accent/40"
              )}
            >
              <mod.icon className="w-5 h-5 text-accent" strokeWidth={1.5} />
              <div className="font-medium text-foreground">{mod.name}</div>
              <p className="text-sm text-foreground/60 leading-relaxed">{mod.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
