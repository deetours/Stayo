"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { useGSAP } from "@gsap/react";
import { CheckCheck } from "lucide-react";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin);

const RESULTS = [
  { id: "block", label: "Block Room 214 — Maintenance" },
  { id: "message", label: "Message all in-house guests" },
  { id: "report", label: "Generate weekly ADR report" },
];

export function CommandPaletteTeaser() {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const toastRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  const prefersReducedMotion = useReducedMotion();

  useGSAP(() => {
    if (prefersReducedMotion) return;

    gsap.set(toastRef.current, { autoAlpha: 0, y: 8 });
    gsap.set(rowRefs.current, { autoAlpha: 0.35 });

    const tl = gsap.timeline({
      scrollTrigger: { trigger: containerRef.current, start: "top 65%" },
      repeat: -1,
      repeatDelay: 1.5,
    });

    tl.to(inputRef.current, {
      duration: 1.1,
      scrambleText: { text: "block room 214", chars: "lowerCase", revealDelay: 0.3, speed: 0.4 },
    })
      .to(rowRefs.current[0], { autoAlpha: 1, backgroundColor: "var(--color-surface-2)", duration: 0.25 }, "+=0.2")
      .to(rowRefs.current.slice(1), { autoAlpha: 0.2, duration: 0.25 }, "<")
      .to(toastRef.current, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" }, "+=0.3")
      .to(toastRef.current, { autoAlpha: 0, y: -8, duration: 0.3, ease: "power2.in" }, "+=1.2")
      .to(inputRef.current, { duration: 0.3, scrambleText: { text: "", chars: "" } }, "<")
      .set(rowRefs.current, { autoAlpha: 0.35, backgroundColor: "transparent" });
  }, { scope: containerRef, dependencies: [prefersReducedMotion], revertOnUpdate: true });

  return (
    <section ref={containerRef} className="w-full bg-surface-2 py-32 px-6 border-t border-border/50 flex flex-col items-center">
      <div className="text-center mb-12 max-w-xl">
        <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-4">For your team</div>
        <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">Everything, one keystroke away.</h2>
        <p className="text-lg text-foreground/60">
          The same command palette your staff already uses inside StayO — built for people who&apos;d rather type than click.
        </p>
      </div>

      <div className="relative w-full max-w-lg">
        <Command className="border border-border shadow-2xl">
          <div className="flex items-center px-4 py-3.5 border-b border-border bg-surface-2/50">
            <span className="text-muted-foreground mr-3 text-sm">⌘K</span>
            <div ref={inputRef} className="text-sm text-foreground font-mono min-h-[1.25rem]" />
          </div>
          <CommandList>
            <CommandGroup>
              {RESULTS.map((r, i) => (
                <div key={r.id} ref={(el) => { rowRefs.current[i] = el; }} className="rounded-md">
                  <CommandItem className="rounded-md pointer-events-none">{r.label}</CommandItem>
                </div>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>

        <div ref={toastRef} className="absolute -bottom-4 left-1/2 -translate-x-1/2 translate-y-full flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-status-ok/10 border border-status-ok/20 text-status-ok text-xs">
          <CheckCheck className="w-3.5 h-3.5" />
          Task created
        </div>
      </div>
    </section>
  );
}
