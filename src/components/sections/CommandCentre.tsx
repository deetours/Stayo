"use client";

import React, { useRef, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MockReservationCalendar } from "@/components/ui/MockReservationCalendar";
import { MockHousekeepingBoard } from "@/components/ui/MockHousekeepingBoard";
import { MockGuestProfile } from "@/components/ui/MockGuestProfile";
import { MockOwnerAgentAnswer } from "@/components/ui/MockOwnerAgentAnswer";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    id: "step-1",
    label: "One Inventory",
    desc: "Reservations from every channel flowing into a single live calendar.",
  },
  {
    id: "step-2",
    label: "Housekeeping, Live",
    desc: "Real-time room status updating from dirty to ready without walkie-talkies.",
  },
  {
    id: "step-3",
    label: "Guests Who Feel Known",
    desc: "Every preference, past stay, and request instantly visible.",
  },
  {
    id: "step-4",
    label: "Ask StayO",
    desc: "Get plain-language answers about your property's performance in seconds.",
  },
];

export function CommandCentre() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const visualContainerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.innerWidth < 768;

    if (prefersReducedMotion || isMobile) {
      // Return early, let normal scrolling handle it
      return;
    }

    const ctx = gsap.context(() => {
      const texts = gsap.utils.toArray<HTMLElement>(".cc-text-step");
      const visuals = gsap.utils.toArray<HTMLElement>(".cc-visual-step");

      // Hide all except first
      gsap.set(texts.slice(1), { autoAlpha: 0, y: 20 });
      gsap.set(visuals.slice(1), { autoAlpha: 0, scale: 0.95 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=400%", // 400vh for 4 steps
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        }
      });

      // We have 4 steps. Let's create a transition for each.
      // Progress ranges:
      // 0.00 - 0.25: Step 1 holds
      // 0.25 - 0.35: Transition 1 -> 2
      // 0.35 - 0.50: Step 2 holds
      // 0.50 - 0.60: Transition 2 -> 3
      // 0.60 - 0.75: Step 3 holds
      // 0.75 - 0.85: Transition 3 -> 4
      // 0.85 - 1.00: Step 4 holds

      // The timeline length is arbitrary, we'll use 10 units of time
      const DURATION = 1;
      const PAUSE = 1.5;

      // 1st pause
      tl.to({}, { duration: PAUSE });

      // Step 1 to Step 2
      tl.to(texts[0], { autoAlpha: 0, y: -20, duration: DURATION }, "trans1")
        .to(visuals[0], { autoAlpha: 0, scale: 1.05, duration: DURATION }, "trans1")
        .to(texts[1], { autoAlpha: 1, y: 0, duration: DURATION }, "trans1")
        .to(visuals[1], { autoAlpha: 1, scale: 1, duration: DURATION }, "trans1");

      tl.to({}, { duration: PAUSE });

      // Step 2 to Step 3
      tl.to(texts[1], { autoAlpha: 0, y: -20, duration: DURATION }, "trans2")
        .to(visuals[1], { autoAlpha: 0, scale: 1.05, duration: DURATION }, "trans2")
        .to(texts[2], { autoAlpha: 1, y: 0, duration: DURATION }, "trans2")
        .to(visuals[2], { autoAlpha: 1, scale: 1, duration: DURATION }, "trans2");

      tl.to({}, { duration: PAUSE });

      // Step 3 to Step 4
      tl.to(texts[2], { autoAlpha: 0, y: -20, duration: DURATION }, "trans3")
        .to(visuals[2], { autoAlpha: 0, scale: 1.05, duration: DURATION }, "trans3")
        .to(texts[3], { autoAlpha: 1, y: 0, duration: DURATION }, "trans3")
        .to(visuals[3], { autoAlpha: 1, scale: 1, duration: DURATION }, "trans3");

      tl.to({}, { duration: PAUSE });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="command-centre" className="relative w-full bg-surface" ref={containerRef}>
      {/* Mobile/Fallback layout (non-pinned) */}
      <div className="md:hidden flex flex-col gap-16 py-20 px-6">
        {steps.map((step, i) => (
          <div key={step.id} className="flex flex-col gap-6">
            <div>
              <div className="text-sm font-semibold tracking-wider text-accent uppercase mb-2">
                {step.label}
              </div>
              <h2 className="text-2xl font-semibold leading-tight text-foreground">
                {step.desc}
              </h2>
            </div>
            <div className="w-full">
              {i === 0 && <MockReservationCalendar />}
              {i === 1 && <MockHousekeepingBoard />}
              {i === 2 && <MockGuestProfile />}
              {i === 3 && <MockOwnerAgentAnswer />}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop pinned layout */}
      <div className="hidden md:flex h-screen w-full max-w-7xl mx-auto px-12 items-center justify-between gap-12">
        {/* Left side text */}
        <div className="w-1/3 relative h-64" ref={textContainerRef}>
          {steps.map((step, i) => (
            <div 
              key={`text-${step.id}`} 
              className="cc-text-step absolute inset-0 flex flex-col justify-center"
            >
              <div className="text-sm font-semibold tracking-wider text-accent uppercase mb-4">
                {step.label}
              </div>
              <h2 className="text-3xl lg:text-4xl font-semibold leading-tight text-foreground">
                {step.desc}
              </h2>
            </div>
          ))}
        </div>

        {/* Right side visuals */}
        <div className="w-2/3 relative h-[500px] flex items-center justify-center" ref={visualContainerRef}>
          {steps.map((step, i) => (
            <div 
              key={`visual-${step.id}`} 
              className="cc-visual-step absolute inset-0 w-full flex items-center justify-center"
            >
              {i === 0 && <MockReservationCalendar />}
              {i === 1 && <MockHousekeepingBoard />}
              {i === 2 && <MockGuestProfile />}
              {i === 3 && <MockOwnerAgentAnswer />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
