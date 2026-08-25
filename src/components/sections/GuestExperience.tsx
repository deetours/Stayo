"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { CheckCheck, Languages } from "lucide-react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

gsap.registerPlugin(ScrollTrigger);

const LANGUAGES = ["EN", "ES", "FR", "中文", "AR"];

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

export function GuestExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pillsRowRef = useRef<HTMLDivElement>(null);
  const card1Ref = useRef<HTMLDivElement>(null);
  const connector1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const connector2Ref = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  const prefersReducedMotion = useReducedMotion();

  useGSAP(() => {
    if (prefersReducedMotion) return;

    // Ambient "understands every language" pill sweep — plays only while in view.
    const pills = pillsRowRef.current!.querySelectorAll<HTMLElement>(".lang-pill");
    const pillTl = gsap.timeline({ repeat: -1, paused: true });
    pills.forEach((pill, i) => {
      pillTl
        .to(pill, {
          backgroundColor: "rgba(217,119,6,0.15)",
          borderColor: "rgba(217,119,6,0.5)",
          color: "#d97706",
          duration: 0.35,
          ease: "power2.out",
        }, i * 0.85)
        .to(pill, {
          backgroundColor: "rgba(0,0,0,0)",
          borderColor: "#292624",
          color: "#8f8a86",
          duration: 0.35,
          ease: "power2.in",
        }, i * 0.85 + 0.6);
    });

    ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) => (self.isActive ? pillTl.play() : pillTl.pause()),
    });

    // Main left-to-right trace: request -> intelligence -> resolution.
    const tl = gsap.timeline({
      scrollTrigger: { trigger: containerRef.current, start: "top 75%" },
    });

    tl.from(card1Ref.current, { autoAlpha: 0, y: 24, duration: 0.5, ease: "power2.out" })
      .from(card1Ref.current!.querySelectorAll(".word"), {
        autoAlpha: 0, y: 6, duration: 0.3, stagger: 0.02, ease: "power2.out",
      }, "-=0.2")
      .from(card1Ref.current!.querySelector(".translate-caption"), {
        autoAlpha: 0, y: 4, duration: 0.3,
      }, "-=0.1")
      .from(connector1Ref.current, {
        scaleX: 0, transformOrigin: "left", duration: 0.4, ease: "power2.inOut",
      }, "-=0.05")
      .from(card2Ref.current, { autoAlpha: 0, y: 24, duration: 0.5, ease: "power2.out" }, "-=0.15")
      .from(card2Ref.current!.querySelectorAll(".intel-row"), {
        autoAlpha: 0, x: -8, duration: 0.3, stagger: 0.12, ease: "power2.out",
      }, "-=0.2")
      .from(bannerRef.current, {
        autoAlpha: 0, scale: 0.92, duration: 0.35, ease: "back.out(1.7)",
      }, "-=0.05")
      .from(connector2Ref.current, {
        scaleX: 0, transformOrigin: "left", duration: 0.4, ease: "power2.inOut",
      })
      .from(card3Ref.current, { autoAlpha: 0, y: 24, duration: 0.5, ease: "power2.out" }, "-=0.15")
      .from(card3Ref.current!.querySelector(".staff-note"), {
        autoAlpha: 0, y: 10, duration: 0.3,
      }, "-=0.2")
      .from(card3Ref.current!.querySelectorAll(".word"), {
        autoAlpha: 0, y: 6, duration: 0.3, stagger: 0.015, ease: "power2.out",
      }, "-=0.05")
      .from(receiptRef.current, { autoAlpha: 0, scale: 0.7, duration: 0.3, ease: "back.out(2)" });
  }, { scope: containerRef, dependencies: [prefersReducedMotion], revertOnUpdate: true });

  return (
    <section ref={containerRef} className="py-32 px-6 bg-surface-2 border-t border-border/50 overflow-hidden">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">Guest Experience</h2>
          <p className="text-foreground/60 text-lg max-w-xl mx-auto">
            Instant, multi-lingual, and deeply connected to your property&apos;s ground truth.
          </p>
        </div>

        <div ref={pillsRowRef} className="flex items-center justify-center gap-2 mb-16 flex-wrap">
          <Languages className="w-3.5 h-3.5 text-muted-foreground mr-1" />
          {LANGUAGES.map((lang) => (
            <span
              key={lang}
              className="lang-pill px-2.5 py-1 rounded-full border border-border text-[10px] font-mono uppercase tracking-widest text-muted-foreground"
            >
              {lang}
            </span>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-stretch justify-center">
          {/* Step 1 */}
          <div ref={card1Ref} className="flex-1 bg-surface border border-border p-6 rounded-2xl flex flex-col">
            <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-4">1. The Request</div>
            <div className="p-4 bg-status-info/10 border border-status-info/20 text-status-info rounded-xl rounded-bl-none self-start max-w-[92%] text-sm mb-3">
              <Words text={'"On arrive tard ce soir. On peut avoir des serviettes en plus pour la 301 ?"'} />
            </div>
            <div className="translate-caption flex items-center gap-1.5 text-[11px] text-foreground/40 mb-auto">
              <Languages className="w-3 h-3" />
              Auto-translated from French
            </div>
            <div className="mt-6 text-xs text-foreground/50 font-mono flex justify-between items-center">
              <span>via WhatsApp</span>
              <span>11:02 PM</span>
            </div>
          </div>

          {/* Connector 1 (desktop only) */}
          <div className="hidden md:flex items-center justify-center w-5 shrink-0">
            <div ref={connector1Ref} className="h-px w-full bg-linear-to-r from-transparent via-accent to-accent" />
          </div>

          {/* Step 2 */}
          <div ref={card2Ref} className="flex-1 bg-surface border border-border p-6 rounded-2xl flex flex-col">
            <div className="text-[10px] font-mono text-accent uppercase tracking-widest mb-4">2. StayO Intelligence</div>
            <div className="space-y-3 mb-auto">
              <div className="intel-row flex items-center gap-2 text-sm text-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                Intent: Service Request
              </div>
              <div className="intel-row flex items-center gap-2 text-sm text-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                Item: Towels (Quantity: Extra)
              </div>
              <div className="intel-row flex items-center gap-2 text-sm text-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                Target: Room 301
              </div>
            </div>
            <div ref={bannerRef} className="mt-6 p-3 bg-accent/10 border border-accent/20 rounded-lg text-xs text-accent text-center">
              Task Created & Auto-Replied
            </div>
          </div>

          {/* Connector 2 (desktop only) */}
          <div className="hidden md:flex items-center justify-center w-5 shrink-0">
            <div ref={connector2Ref} className="h-px w-full bg-linear-to-r from-accent via-accent to-transparent" />
          </div>

          {/* Step 3 */}
          <div ref={card3Ref} className="flex-1 bg-surface border border-border p-6 rounded-2xl flex flex-col">
            <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-4">3. The Resolution</div>
            <div className="staff-note p-4 bg-border/50 border border-border rounded-xl mb-4 text-sm">
              <span className="font-semibold block mb-1">Night Staff</span>
              Deliver extra towels to Room 301.
            </div>
            <div className="p-4 bg-status-ok/10 border border-status-ok/20 text-status-ok rounded-xl rounded-br-none self-end max-w-[92%] text-sm mb-auto">
              <Words text={"“Certainly. I’ve let the night staff know, they will be in your room when you arrive.”"} />
            </div>
            <div ref={receiptRef} className="mt-3 self-end flex items-center gap-1 text-[11px] text-status-ok">
              <CheckCheck className="w-3.5 h-3.5" />
              Read · Delivered
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
