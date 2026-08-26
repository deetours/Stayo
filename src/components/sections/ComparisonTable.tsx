"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Check, X, Minus } from "lucide-react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

gsap.registerPlugin(ScrollTrigger);

type Cell = "yes" | "no" | "partial";

const ROWS: { feature: string; stayo: Cell; legacy: Cell; sheets: Cell }[] = [
  { feature: "Real-time multi-property sync", stayo: "yes", legacy: "partial", sheets: "no" },
  { feature: "AI guest messaging", stayo: "yes", legacy: "no", sheets: "no" },
  { feature: "Automated housekeeping routing", stayo: "yes", legacy: "partial", sheets: "no" },
  { feature: "Revenue recommendations", stayo: "yes", legacy: "partial", sheets: "no" },
  { feature: "Setup time", stayo: "yes", legacy: "no", sheets: "yes" },
  { feature: "Dedicated support", stayo: "yes", legacy: "partial", sheets: "no" },
];

function Mark({ state }: { state: Cell }) {
  if (state === "yes") return <Check className="w-4 h-4 text-status-ok mx-auto" />;
  if (state === "no") return <X className="w-4 h-4 text-foreground/30 mx-auto" />;
  return <Minus className="w-4 h-4 text-foreground/40 mx-auto" />;
}

export function ComparisonTable() {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useGSAP(() => {
    if (prefersReducedMotion) return;
    gsap.from(containerRef.current, {
      autoAlpha: 0,
      y: 16,
      duration: 0.6,
      ease: "power2.out",
      scrollTrigger: { trigger: containerRef.current, start: "top 78%" },
    });
  }, { scope: containerRef, dependencies: [prefersReducedMotion] });

  return (
    <section className="w-full bg-background py-32 px-6 border-t border-border/50">
      <div ref={containerRef} className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">Why properties switch.</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[560px]">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-4 text-sm font-medium text-foreground/60">Feature</th>
                <th className="py-4 text-sm font-semibold text-accent">StayO</th>
                <th className="py-4 text-sm font-medium text-foreground/60">Legacy PMS</th>
                <th className="py-4 text-sm font-medium text-foreground/60">Spreadsheets + WhatsApp</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.feature} className="border-b border-border/30">
                  <td className="py-4 text-sm text-foreground">{row.feature}</td>
                  <td className="py-4"><Mark state={row.stayo} /></td>
                  <td className="py-4"><Mark state={row.legacy} /></td>
                  <td className="py-4"><Mark state={row.sheets} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
