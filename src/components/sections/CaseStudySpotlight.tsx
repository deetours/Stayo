"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

gsap.registerPlugin(ScrollTrigger, SplitText);

// TODO(marketing): replace with a real customer, quote, and metrics before
// this ships. Do not present an invented customer as real.
const CASE_STUDY = {
  name: "[Guest Name]",
  title: "General Manager, [Property Group]",
  quote: "We stopped losing bookings to a slow inbox. StayO answers guests before our front desk even sees the message, and the whole portfolio rolls up into one number every morning.",
  metrics: [
    { value: 32, suffix: "%", prefix: "-", label: "Front-desk calls" },
    { value: 18, suffix: "%", prefix: "+", label: "Direct bookings" },
    { value: 6, suffix: " hrs/wk", prefix: "", label: "Reclaimed" },
  ],
};

export function CaseStudySpotlight() {
  const containerRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLParagraphElement>(null);
  const metricRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const prefersReducedMotion = useReducedMotion();

  useGSAP(() => {
    if (prefersReducedMotion) return;

    const split = SplitText.create(quoteRef.current, { type: "lines", mask: "lines" });

    const tl = gsap.timeline({
      scrollTrigger: { trigger: containerRef.current, start: "top 70%" },
    });

    tl.from(split.lines, { yPercent: 110, autoAlpha: 0, duration: 0.6, stagger: 0.08, ease: "power3.out" });

    CASE_STUDY.metrics.forEach((metric, i) => {
      const obj = { val: 0 };
      tl.to(
        obj,
        {
          val: metric.value,
          duration: 0.8,
          ease: "power2.out",
          onUpdate: () => {
            const el = metricRefs.current[i];
            if (el) el.textContent = `${metric.prefix}${Math.round(obj.val)}${metric.suffix}`;
          },
        },
        i === 0 ? "-=0.2" : "<0.1"
      );
    });

    return () => split.revert();
  }, { scope: containerRef, dependencies: [prefersReducedMotion], revertOnUpdate: true });

  return (
    <section ref={containerRef} className="w-full bg-surface py-32 px-6 border-t border-border/50">
      <div className="max-w-4xl mx-auto grid md:grid-cols-[1fr_auto] gap-12 items-center">
        <div>
          <div className="text-[10px] font-mono text-accent uppercase tracking-widest mb-6">Case Study</div>
          <p ref={quoteRef} className="font-display text-2xl md:text-3xl text-foreground leading-snug mb-8">
            &ldquo;{CASE_STUDY.quote}&rdquo;
          </p>
          <div className="text-sm text-foreground/60">
            <span className="text-foreground font-medium">{CASE_STUDY.name}</span> — {CASE_STUDY.title}
          </div>
        </div>

        <div className="flex md:flex-col gap-6 md:gap-8 md:border-l md:border-border/50 md:pl-12">
          {CASE_STUDY.metrics.map((metric, i) => (
            <div key={metric.label} className="text-center md:text-left">
              <div ref={(el) => { metricRefs.current[i] = el; }} className="font-mono text-3xl text-accent">
                {prefersReducedMotion ? `${metric.prefix}${metric.value}${metric.suffix}` : "0"}
              </div>
              <div className="text-xs text-foreground/50 mt-1">{metric.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
