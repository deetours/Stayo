"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

gsap.registerPlugin(ScrollTrigger);

// TODO(marketing): replace with real, sourced figures before launch.
const STATS = [
  { value: 120, suffix: "+", decimals: 0, label: "Properties running on StayO" },
  { value: 14, suffix: "", decimals: 0, label: "Countries" },
  { value: 2.3, suffix: "M", decimals: 1, label: "Guest messages handled" },
];

const COVERAGE = ["Boutique Hotels", "Resorts", "Homestays", "Cabins", "Hostels", "Multi-Property Groups"];

export function TrustBar() {
  const containerRef = useRef<HTMLDivElement>(null);
  const statRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const trackRef = useRef<HTMLDivElement>(null);

  const prefersReducedMotion = useReducedMotion();

  useGSAP(() => {
    if (prefersReducedMotion) return;

    const tl = gsap.timeline({
      scrollTrigger: { trigger: containerRef.current, start: "top 80%" },
    });

    STATS.forEach((stat, i) => {
      const obj = { val: 0 };
      tl.to(
        obj,
        {
          val: stat.value,
          duration: 1,
          ease: "power2.out",
          onUpdate: () => {
            const el = statRefs.current[i];
            if (!el) return;
            const shown = stat.decimals ? obj.val.toFixed(stat.decimals) : Math.round(obj.val);
            el.textContent = `${shown}${stat.suffix}`;
          },
        },
        i === 0 ? undefined : "<0.1"
      );
    });

    if (trackRef.current) {
      const marqueeTl = gsap.to(trackRef.current, {
        xPercent: -50,
        repeat: -1,
        ease: "none",
        duration: 24,
      });

      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => (self.isActive ? marqueeTl.play() : marqueeTl.pause()),
      });
    }
  }, { scope: containerRef, dependencies: [prefersReducedMotion], revertOnUpdate: true });

  const pills = prefersReducedMotion ? COVERAGE : [...COVERAGE, ...COVERAGE];

  return (
    <section ref={containerRef} className="w-full bg-surface py-16 px-6 border-t border-border/50 overflow-hidden">
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full text-center">
          {STATS.map((stat, i) => (
            <div key={stat.label} className="flex flex-col items-center gap-2">
              <span
                ref={(el) => { statRefs.current[i] = el; }}
                className="font-display text-4xl md:text-5xl text-foreground"
              >
                {prefersReducedMotion ? `${stat.value}${stat.suffix}` : "0"}
              </span>
              <span className="text-sm text-foreground/60">{stat.label}</span>
            </div>
          ))}
        </div>

        <div className="w-full overflow-hidden border-t border-border/50 pt-10">
          <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-6 text-center">
            Already running the day-to-day for
          </div>
          <div className="flex overflow-hidden">
            <div ref={trackRef} className="flex gap-4 shrink-0 pr-4">
              {pills.map((type, i) => (
                <div
                  key={`${type}-${i}`}
                  className="px-5 py-2.5 rounded-full bg-background border border-border text-sm text-foreground/80 whitespace-nowrap"
                >
                  {type}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
