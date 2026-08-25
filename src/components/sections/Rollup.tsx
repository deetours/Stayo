"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Building2, ArrowDown, CheckCheck } from "lucide-react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

gsap.registerPlugin(ScrollTrigger);

const PROPERTIES = [
  { name: "StayO Boutique", occ: 82 },
  { name: "StayO Hills", occ: 61 },
  { name: "StayO Peak", occ: 76 },
];
const GROUP_TOTAL = 73; // average of PROPERTIES

function Words({ text }: { text: string }) {
  return (
    <>
      {text.split(" ").map((word, i) => (
        <span key={i} className="word inline-block">
          {word}&nbsp;
        </span>
      ))}
    </>
  );
}

export function Rollup() {
  const containerRef = useRef<HTMLDivElement>(null);
  const campaignCardRef = useRef<HTMLDivElement>(null);
  const targetCountRef = useRef<HTMLSpanElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const sentRef = useRef<HTMLDivElement>(null);

  const rollupCardRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const countRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);
  const arrowRef = useRef<HTMLDivElement>(null);
  const totalCardRef = useRef<HTMLDivElement>(null);
  const totalCountRef = useRef<HTMLSpanElement>(null);

  const prefersReducedMotion = useReducedMotion();

  useGSAP(() => {
    if (prefersReducedMotion) return;

    const tl = gsap.timeline({
      scrollTrigger: { trigger: containerRef.current, start: "top 70%" },
    });

    // Campaign card
    tl.from(campaignCardRef.current, { autoAlpha: 0, y: 24, duration: 0.5, ease: "power2.out" })
      .from(campaignCardRef.current!.querySelectorAll(".word"), {
        autoAlpha: 0, y: 6, duration: 0.3, stagger: 0.03, ease: "power2.out",
      }, "-=0.2");

    const targetObj = { val: 0 };
    tl.to(targetObj, {
      val: 450,
      duration: 1,
      ease: "power2.out",
      onUpdate: () => {
        if (targetCountRef.current) targetCountRef.current.textContent = `${Math.round(targetObj.val)}`;
      },
    }, "-=0.1")
      .from(progressBarRef.current, {
        scaleX: 0, transformOrigin: "left", duration: 0.9, ease: "power2.out",
      }, "<")
      .from(sentRef.current, { autoAlpha: 0, y: 4, duration: 0.3 }, "-=0.1");

    // Rollup card
    tl.from(rollupCardRef.current, { autoAlpha: 0, y: 24, duration: 0.5, ease: "power2.out" }, "-=0.9")
      .from(lineRef.current, {
        scaleY: 0, transformOrigin: "top", duration: 0.9, ease: "power2.inOut",
      }, "-=0.2");

    PROPERTIES.forEach((p, i) => {
      const obj = { val: 0 };
      tl.to(nodeRefs.current[i], {
        backgroundColor: "#d97706", scale: 1.3, duration: 0.2, ease: "power2.out",
      }, i === 0 ? "-=0.7" : "-=0.55")
        .to(obj, {
          val: p.occ,
          duration: 0.55,
          ease: "power2.out",
          onUpdate: () => {
            if (countRefs.current[i]) countRefs.current[i]!.textContent = `${Math.round(obj.val)}%`;
          },
        }, "<")
        .from(barRefs.current[i], {
          scaleX: 0, transformOrigin: "left", duration: 0.55, ease: "power2.out",
        }, "<");
    });

    const totalObj = { val: 0 };
    tl.from(arrowRef.current, { autoAlpha: 0, y: -6, duration: 0.3 }, "-=0.2")
      .from(totalCardRef.current, { autoAlpha: 0, scale: 0.92, duration: 0.4, ease: "back.out(1.7)" }, "-=0.1")
      .to(totalObj, {
        val: GROUP_TOTAL,
        duration: 0.8,
        ease: "power2.out",
        onUpdate: () => {
          if (totalCountRef.current) totalCountRef.current.textContent = `${Math.round(totalObj.val)}`;
        },
      }, "<")
      .to(totalCardRef.current, {
        boxShadow: "0 0 40px -5px rgba(217,119,6,0.35)", duration: 0.5, ease: "power2.out",
      }, "-=0.3");
  }, { scope: containerRef, dependencies: [prefersReducedMotion], revertOnUpdate: true });

  return (
    <section ref={containerRef} className="w-full bg-background py-32 px-6 md:px-12 border-t border-border/50 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-24">
          <h2 className="font-display text-4xl md:text-5xl font-normal tracking-tight text-foreground mb-6">
            Revenue & Scale
          </h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            StayO turns data into yield. From targeted marketing campaigns to portfolio-wide performance rollups, scale your operations without scaling your headcount.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-stretch gap-8">

          {/* Left: The Marketing Agent */}
          <div ref={campaignCardRef} className="flex-1 bg-surface border border-border p-8 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-6">StayO Campaign Manager</div>
              <h3 className="text-2xl font-medium mb-4 text-foreground">Smarter Outreach</h3>
              <p className="text-foreground/60 text-sm leading-relaxed mb-8">
                Identify gaps in occupancy and automatically generate targeted email campaigns for past guests with a high likelihood to return.
              </p>
            </div>

            <div className="p-5 bg-background border border-border rounded-xl">
              <div className="text-xs text-foreground/60 mb-2">Campaign generated:</div>
              <div className="text-sm font-medium text-foreground mb-3">
                <Words text={'"Winter Escape to the Hills"'} />
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-accent mb-3">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                Targeting <span ref={targetCountRef}>450</span> past guests
              </div>
              <div className="h-1 rounded-full bg-accent/15 overflow-hidden mb-2">
                <div ref={progressBarRef} className="h-full w-full bg-accent rounded-full" />
              </div>
              <div ref={sentRef} className="flex items-center gap-1.5 text-[11px] text-status-ok">
                <CheckCheck className="w-3.5 h-3.5" />
                Sent · 41% open rate
              </div>
            </div>
          </div>

          {/* Right: The Rollup Visual */}
          <div ref={rollupCardRef} className="flex-1 bg-surface border border-border p-8 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-b from-transparent to-accent/5 pointer-events-none" />
            <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-8 self-start w-full">Portfolio View</div>

            <div className="relative w-full max-w-sm flex flex-col gap-3 z-10">
              {/* Vertical rollup line running behind the property rows */}
              <div className="absolute left-4 top-4 bottom-13 w-px bg-border/40 z-0">
                <div ref={lineRef} className="w-full h-full bg-linear-to-b from-accent/70 to-accent" />
              </div>

              {PROPERTIES.map((p, i) => (
                <div
                  key={p.name}
                  className="relative p-4 rounded-xl bg-background border border-border flex items-center justify-between shadow-sm z-10"
                >
                  <div className="flex items-center gap-3">
                    <div
                      ref={(el) => { nodeRefs.current[i] = el; }}
                      className="w-8 h-8 rounded bg-surface flex items-center justify-center border border-border transition-colors"
                    >
                      <Building2 className="w-4 h-4 text-foreground/60" />
                    </div>
                    <span className="font-medium text-sm">{p.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1 w-12 rounded-full bg-border overflow-hidden hidden sm:block">
                      <div
                        ref={(el) => { barRefs.current[i] = el; }}
                        className="h-full bg-accent rounded-full"
                        style={{ width: `${p.occ}%` }}
                      />
                    </div>
                    <div className="text-sm font-mono w-11 text-right">
                      <span ref={(el) => { countRefs.current[i] = el; }}>{p.occ}%</span>
                    </div>
                  </div>
                </div>
              ))}

              <div ref={arrowRef} className="flex justify-center mt-1 z-10 relative bg-surface py-2">
                <ArrowDown className="w-5 h-5 text-accent" />
              </div>

              {/* Rollup Total */}
              <div
                ref={totalCardRef}
                className="mt-2 p-5 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-between z-10 shadow-[0_0_30px_-5px_rgba(217,119,6,0.2)]"
              >
                <span className="font-semibold text-accent">Group Total</span>
                <div className="text-xl font-mono font-bold text-accent">
                  <span ref={totalCountRef}>{GROUP_TOTAL}</span>% <span className="text-[10px] font-sans font-normal opacity-80 uppercase ml-1 tracking-wider">Avg Occ</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
