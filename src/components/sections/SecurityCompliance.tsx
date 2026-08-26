"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { useGSAP } from "@gsap/react";
import { Shield, Lock, Clock, Users, RotateCw, Globe2 } from "lucide-react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);

// TODO(compliance): only list certifications StayO actually holds today.
// Do not add SOC 2 / ISO badges until they are certified — a fabricated
// badge is a worse trust signal than none.
const SAFEGUARDS = [
  { icon: Lock, label: "Encrypted in transit & at rest", desc: "TLS 1.2+ for every request, encrypted storage for guest and payment data." },
  { icon: Shield, label: "PCI DSS-compliant payments", desc: "Card data never touches StayO servers directly." },
  { icon: RotateCw, label: "Daily automated backups", desc: "Point-in-time recovery across every property in your portfolio." },
  { icon: Users, label: "Role-based staff access", desc: "Front desk, housekeeping, and ownership each see only what they need." },
  { icon: Clock, label: "99.9% uptime target", desc: "Monitored infrastructure with on-call incident response." },
  { icon: Globe2, label: "GDPR-ready guest data handling", desc: "Guest data export and deletion on request, by design." },
];

export function SecurityCompliance() {
  const containerRef = useRef<HTMLDivElement>(null);
  const iconRefs = useRef<(SVGSVGElement | null)[]>([]);

  const prefersReducedMotion = useReducedMotion();

  useGSAP(() => {
    if (prefersReducedMotion) return;

    iconRefs.current.forEach((svg, i) => {
      if (!svg) return;
      const shapes = svg.querySelectorAll("path, circle, rect, line, polyline");
      gsap.set(shapes, { drawSVG: "0%" });
      gsap.to(shapes, {
        drawSVG: "100%",
        duration: 0.6,
        ease: "power2.out",
        stagger: 0.04,
        delay: i * 0.06,
        scrollTrigger: { trigger: containerRef.current, start: "top 75%" },
      });
    });
  }, { scope: containerRef, dependencies: [prefersReducedMotion], revertOnUpdate: true });

  return (
    <section id="security" ref={containerRef} className="w-full bg-surface py-32 px-6 border-t border-border/50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-4">Security &amp; Compliance</div>
          <h2 className="font-display text-3xl md:text-4xl text-foreground">Built to pass your IT team&apos;s checklist.</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SAFEGUARDS.map((item, i) => (
            <div key={item.label} className="p-6 rounded-2xl border border-border bg-background flex flex-col gap-3">
              <item.icon ref={(el) => { iconRefs.current[i] = el; }} className="w-6 h-6 text-accent" strokeWidth={1.5} />
              <div className="font-medium text-foreground">{item.label}</div>
              <p className="text-sm text-foreground/60 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
