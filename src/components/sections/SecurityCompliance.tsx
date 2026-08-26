"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { useGSAP } from "@gsap/react";
import { Shield, Lock, Clock, Users, RotateCw, Globe2 } from "lucide-react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

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

// TODO(compliance): wire this to the real status/monitoring feed before
// launch — these lines are illustrative, not live data.
const MONITORING_FEED = [
  "TLS handshake verified on every connection",
  "Nightly backup completed · 03:00 UTC",
  "0 open vulnerabilities",
  "Access review passed · this week",
  "Uptime 99.97% · trailing 30 days",
  "Guest data export request · fulfilled in 4h",
];

export function SecurityCompliance() {
  const containerRef = useRef<HTMLDivElement>(null);
  const iconRefs = useRef<(SVGSVGElement | null)[]>([]);
  const tickerTrackRef = useRef<HTMLDivElement>(null);

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

    if (tickerTrackRef.current) {
      const tickerTl = gsap.to(tickerTrackRef.current, {
        xPercent: -50,
        repeat: -1,
        ease: "none",
        duration: 28,
      });

      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => (self.isActive ? tickerTl.play() : tickerTl.pause()),
      });
    }
  }, { scope: containerRef, dependencies: [prefersReducedMotion], revertOnUpdate: true });

  const feed = prefersReducedMotion ? MONITORING_FEED : [...MONITORING_FEED, ...MONITORING_FEED];

  return (
    <section id="security" ref={containerRef} className="w-full bg-surface py-32 px-6 border-t border-border/50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-4">Security &amp; Compliance</div>
          <h2 className="font-display text-3xl md:text-4xl text-foreground mb-6">Built to pass your IT team&apos;s checklist.</h2>

          <div className="inline-flex items-center gap-2.5 rounded-full border border-border bg-background px-4 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-status-ok opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-status-ok" />
            </span>
            <span className="text-xs font-mono text-foreground/60">All systems operational</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {SAFEGUARDS.map((item, i) => (
            <div
              key={item.label}
              className={cn(
                "group p-6 rounded-2xl border border-border bg-background flex flex-col gap-3 transition-[transform,border-color,box-shadow] duration-200 ease-out",
                "hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_12px_32px_-16px_rgba(0,0,0,0.5)]"
              )}
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-surface-2 transition-colors duration-200 ease-out group-hover:bg-accent/10">
                <item.icon
                  ref={(el) => { iconRefs.current[i] = el; }}
                  className="w-5 h-5 text-accent transition-transform duration-200 ease-out group-hover:scale-110"
                  strokeWidth={1.5}
                />
              </div>
              <div className="font-medium text-foreground">{item.label}</div>
              <p className="text-sm text-foreground/60 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-border/50 pt-6 overflow-hidden">
          <div className="flex overflow-hidden">
            <div ref={tickerTrackRef} className="flex items-center gap-10 shrink-0 pr-10">
              {feed.map((line, i) => (
                <div key={`${line}-${i}`} className="flex items-center gap-2 whitespace-nowrap">
                  <span className="w-1 h-1 rounded-full bg-status-ok shrink-0" />
                  <span className="text-xs font-mono text-foreground/50">{line}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
