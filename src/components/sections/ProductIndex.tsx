"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CalendarCheck, Sparkles, ClipboardList, LineChart, MessageCircle, Building2 } from "lucide-react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

gsap.registerPlugin(ScrollTrigger);

const AUTOPLAY_SECONDS = 4.5;

const MODULES = [
  { id: "pms", icon: CalendarCheck, name: "Unified PMS", desc: "One calendar for every room, every property, every channel — no more tab-switching between systems to see what's actually happening tonight." },
  { id: "intel", icon: Sparkles, name: "StayO Intelligence", desc: "Reads every request the moment it lands and routes it to the right person, in the right order, before staff have to triage it themselves." },
  { id: "hk", icon: ClipboardList, name: "Housekeeping", desc: "Tasks reshuffle themselves the moment a guest checks out — no radio calls, no walking the floor to find out what's clean." },
  { id: "rev", icon: LineChart, name: "Revenue Intelligence", desc: "Rates adjust to demand while you sleep, weighing pace, comp set, and events so you're never the last to reprice." },
  { id: "guest", icon: MessageCircle, name: "Guest Messaging", desc: "Multi-lingual, instant, and grounded in your property's ground truth — never a generic bot answer to a specific question." },
  { id: "rollup", icon: Building2, name: "Multi-Property Rollup", desc: "Every property's performance, one portfolio view — built for the morning you need the whole picture before your first coffee." },
] as const;

type ModuleId = (typeof MODULES)[number]["id"];

function ModuleVisual({ id }: { id: ModuleId }) {
  switch (id) {
    case "pms":
      return (
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 21 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "aspect-square rounded-[3px]",
                [4, 5, 11, 12, 13, 18].includes(i) ? "bg-accent/70" : "bg-surface-2"
              )}
            />
          ))}
        </div>
      );
    case "intel":
      return (
        <div className="flex flex-col gap-2">
          {["Late checkout — Rm 302", "Extra towels — Rm 118", "AC not cooling — Rm 214"].map((row, i) => (
            <div key={row} className="flex items-center gap-2 rounded-lg bg-surface-2 px-3 py-2">
              <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", i === 2 ? "bg-accent" : "bg-foreground/20")} />
              <span className="text-xs text-foreground/70 truncate">{row}</span>
              {i === 2 && <span className="ml-auto text-[9px] font-mono text-accent shrink-0">routed</span>}
            </div>
          ))}
        </div>
      );
    case "hk":
      return (
        <div className="flex flex-col gap-2">
          {["Rm 101 — Turnover", "Rm 205 — Refresh", "Rm 340 — Deep clean"].map((row, i) => (
            <div key={row} className="flex items-center gap-2.5 rounded-lg bg-surface-2 px-3 py-2">
              <span
                className={cn(
                  "w-3.5 h-3.5 rounded-full border shrink-0",
                  i === 0 ? "bg-accent border-accent" : "border-foreground/25"
                )}
              />
              <span className={cn("text-xs truncate", i === 0 ? "text-foreground/40 line-through" : "text-foreground/70")}>{row}</span>
            </div>
          ))}
        </div>
      );
    case "rev":
      return (
        <div className="flex items-end gap-2 h-24">
          {[38, 52, 44, 68, 80, 60, 90].map((h, i) => (
            <div key={i} className="flex-1 rounded-t-[3px] bg-surface-2 relative overflow-hidden" style={{ height: "100%" }}>
              <div
                className={cn("absolute bottom-0 left-0 right-0 rounded-t-[3px]", i === 6 ? "bg-accent" : "bg-foreground/15")}
                style={{ height: `${h}%` }}
              />
            </div>
          ))}
        </div>
      );
    case "guest":
      return (
        <div className="flex flex-col gap-2">
          <div className="self-start max-w-[80%] rounded-2xl rounded-bl-sm bg-surface-2 px-3 py-2 text-xs text-foreground/70">
            ¿Tienen check-in temprano disponible?
          </div>
          <div className="self-end max-w-[80%] rounded-2xl rounded-br-sm bg-accent/15 border border-accent/30 px-3 py-2 text-xs text-foreground/80">
            Yes — 11am works today, no charge.
          </div>
        </div>
      );
    case "rollup":
      return (
        <div className="flex flex-col gap-2">
          {["Harbor House", "The Fernwood", "Casa Del Sol"].map((name, i) => (
            <div key={name} className="flex items-center justify-between rounded-lg bg-surface-2 px-3 py-2">
              <span className="text-xs text-foreground/70">{name}</span>
              <span className={cn("text-xs font-mono", i === 0 ? "text-status-ok" : "text-foreground/50")}>
                {["94% occ", "81% occ", "88% occ"][i]}
              </span>
            </div>
          ))}
        </div>
      );
  }
}

export function ProductIndex() {
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const visualCardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [hasEntered, setHasEntered] = useState(false);
  const isFirstRender = useRef(true);
  const cycleTween = useRef<gsap.core.Tween | null>(null);

  const prefersReducedMotion = useReducedMotion();

  const goToIndex = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  useGSAP(() => {
    if (prefersReducedMotion) return;

    gsap.from(listRef.current!.children, {
      autoAlpha: 0,
      x: -12,
      duration: 0.5,
      stagger: 0.06,
      ease: "power2.out",
      scrollTrigger: { trigger: containerRef.current, start: "top 75%" },
    });
    gsap.from(panelRef.current, {
      autoAlpha: 0,
      y: 16,
      duration: 0.5,
      ease: "power2.out",
      scrollTrigger: { trigger: containerRef.current, start: "top 75%" },
    });

    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top 60%",
      once: true,
      onEnter: () => setHasEntered(true),
    });

    return () => trigger.kill();
  }, { scope: containerRef, dependencies: [prefersReducedMotion], revertOnUpdate: true });

  useGSAP(() => {
    if (!panelRef.current) return;

    if (isFirstRender.current) {
      isFirstRender.current = false;
    } else {
      gsap.fromTo(
        panelRef.current,
        { autoAlpha: 0, y: prefersReducedMotion ? 0 : 8 },
        { autoAlpha: 1, y: 0, duration: prefersReducedMotion ? 0.15 : 0.35, ease: "power2.out" }
      );
    }

    cycleTween.current?.kill();
    if (prefersReducedMotion || !hasEntered || !barRef.current) return;

    gsap.set(barRef.current, { scaleY: 0 });
    cycleTween.current = gsap.to(barRef.current, {
      scaleY: 1,
      duration: AUTOPLAY_SECONDS,
      ease: "none",
      onComplete: () => goToIndex((activeIndex + 1) % MODULES.length),
    });
  }, { scope: containerRef, dependencies: [activeIndex, hasEntered, prefersReducedMotion] });

  useEffect(() => {
    return () => {
      cycleTween.current?.kill();
    };
  }, []);

  const pauseCycle = () => cycleTween.current?.pause();
  const resumeCycle = () => cycleTween.current?.resume();

  const handleTabChange = (value: string) => {
    const index = MODULES.findIndex((m) => m.id === value);
    if (index === -1 || index === activeIndex) return;
    setHasEntered(true);
    goToIndex(index);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !glowRef.current || !visualCardRef.current) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const rect = visualCardRef.current.getBoundingClientRect();
    gsap.to(glowRef.current, {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      duration: 0.5,
      ease: "power3.out",
    });
  };

  const active = MODULES[activeIndex];

  return (
    <section ref={containerRef} className="w-full bg-background py-32 px-6 border-t border-border/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">Every module, in one place.</h2>
          <p className="text-lg text-foreground/60 max-w-xl mx-auto">Six systems that used to be six vendors.</p>
        </div>

        <Tabs
          value={active.id}
          onValueChange={handleTabChange}
          orientation="vertical"
          className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 lg:gap-12"
        >
          <TabsList
            ref={listRef}
            onMouseEnter={pauseCycle}
            onMouseLeave={resumeCycle}
            className="flex flex-col gap-1"
          >
            {MODULES.map((mod) => {
              const isActive = mod.id === active.id;
              return (
                <TabsTrigger
                  key={mod.id}
                  value={mod.id}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-4 py-3.5 text-left transition-colors cursor-pointer",
                    isActive ? "bg-surface-2 text-foreground" : "text-foreground/55 hover:text-foreground hover:bg-surface"
                  )}
                >
                  <span className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-border overflow-hidden">
                    {isActive && <div ref={barRef} className="w-full h-full bg-accent origin-top" style={{ transform: "scaleY(0)" }} />}
                  </span>
                  <mod.icon className={cn("w-4 h-4 shrink-0", isActive ? "text-accent" : "text-foreground/40 group-hover:text-foreground/70")} strokeWidth={1.5} />
                  <span className="text-sm font-medium">{mod.name}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <div ref={panelRef} className="flex flex-col gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <active.icon className="w-6 h-6 text-accent" strokeWidth={1.5} />
                <h3 className="font-display text-2xl text-foreground">{active.name}</h3>
              </div>
              <p className="text-foreground/60 leading-relaxed max-w-lg">{active.desc}</p>
            </div>

            <div
              ref={visualCardRef}
              onPointerMove={handlePointerMove}
              className="relative overflow-hidden rounded-2xl border border-border bg-surface p-6"
            >
              <div
                ref={glowRef}
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-accent/10 blur-3xl"
                style={{ left: 0, top: 0 }}
              />
              <div className="relative">
                <ModuleVisual id={active.id} />
              </div>
            </div>
          </div>
        </Tabs>
      </div>
    </section>
  );
}
