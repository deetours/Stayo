"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

// TODO(marketing/partnerships): swap these category labels for named, confirmed
// integration partners once partnerships/legal signs off. Do not ship a named
// third-party brand or logo here without written confirmation the integration
// exists — an unconfirmed partnership claim is a real, not cosmetic, risk.
const INTEGRATIONS = [
  { id: "channel", label: "Channel Manager", angle: -90 },
  { id: "pay", label: "Payments", angle: -18 },
  { id: "book", label: "Booking Engine", angle: 54 },
  { id: "acct", label: "Accounting", angle: 126 },
  { id: "ota", label: "OTA Distribution", angle: 198 },
];

const RADIUS = 150;
const CENTER = 200;

function nodePosition(angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: CENTER + RADIUS * Math.cos(rad), y: CENTER + RADIUS * Math.sin(rad) };
}

export function Integrations() {
  const containerRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<(SVGCircleElement | null)[]>([]);

  const prefersReducedMotion = useReducedMotion();

  useGSAP(() => {
    if (prefersReducedMotion) return;

    const tl = gsap.timeline({
      scrollTrigger: { trigger: containerRef.current, start: "top 70%" },
    });

    INTEGRATIONS.forEach((node, i) => {
      const dot = dotRefs.current[i];
      if (!dot) return;
      tl.fromTo(
        dot,
        { autoAlpha: 0, scale: 0.6 },
        {
          autoAlpha: 1,
          scale: 1,
          duration: 1,
          ease: "power2.inOut",
          motionPath: {
            path: `#spoke-${node.id}`,
            align: `#spoke-${node.id}`,
            alignOrigin: [0.5, 0.5],
            autoRotate: false,
          },
        },
        i * 0.15
      );
    });
  }, { scope: containerRef, dependencies: [prefersReducedMotion], revertOnUpdate: true });

  return (
    <section id="integrations" ref={containerRef} className="w-full bg-background py-32 px-6 border-t border-border/50 flex flex-col items-center">
      <div className="text-center mb-16 max-w-2xl">
        <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">Works with what you already run.</h2>
        <p className="text-lg text-foreground/60">StayO sits in the middle of your existing stack instead of asking you to replace it.</p>
      </div>

      <svg viewBox="0 0 400 400" className="w-full max-w-md" role="img" aria-label="StayO connected to channel manager, payments, booking engine, accounting, and OTA distribution">
        {INTEGRATIONS.map((node) => {
          const { x, y } = nodePosition(node.angle);
          return (
            <path key={node.id} id={`spoke-${node.id}`} d={`M ${x} ${y} L ${CENTER} ${CENTER}`} fill="none" stroke="var(--color-border)" strokeWidth="1.5" />
          );
        })}

        {INTEGRATIONS.map((node, i) => {
          const { x, y } = nodePosition(node.angle);
          return (
            <g key={node.id}>
              <circle cx={x} cy={y} r="34" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1.5" />
              <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="8" fontFamily="var(--font-mono)" fill="var(--color-foreground)">
                {node.label.split(" ")[0]}
              </text>
              <circle ref={(el) => { dotRefs.current[i] = el; }} r="4" fill="var(--color-accent)" opacity={prefersReducedMotion ? 0 : undefined} />
            </g>
          );
        })}

        <circle cx={CENTER} cy={CENTER} r="44" fill="var(--color-accent)" opacity="0.12" />
        <circle cx={CENTER} cy={CENTER} r="30" fill="var(--color-surface)" stroke="var(--color-accent)" strokeWidth="1.5" />
        <text x={CENTER} y={CENTER} textAnchor="middle" dominantBaseline="middle" fontSize="11" fontFamily="var(--font-display)" fill="var(--color-accent)">
          STAYO
        </text>
      </svg>

      <div className="flex flex-wrap justify-center gap-3 mt-12">
        {INTEGRATIONS.map((node) => (
          <div key={node.id} className="px-4 py-2 rounded-full bg-surface border border-border text-sm text-foreground/80">
            {node.label}
          </div>
        ))}
      </div>
    </section>
  );
}
