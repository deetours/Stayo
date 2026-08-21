"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

gsap.registerPlugin(ScrollTrigger);

export function TheLivingProperty() {
  const containerRef = useRef<HTMLDivElement>(null);
  const roomCardRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLSpanElement>(null);
  const logFeedRef = useRef<HTMLDivElement>(null);
  const log1Ref = useRef<HTMLDivElement>(null);
  const log2Ref = useRef<HTMLDivElement>(null);
  const log3Ref = useRef<HTMLDivElement>(null);
  const guestNameRef = useRef<HTMLDivElement>(null);
  const taskRef = useRef<HTMLDivElement>(null);
  const paymentRef = useRef<HTMLDivElement>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);
  
  const prefersReducedMotion = useReducedMotion();

  useGSAP(() => {
    if (prefersReducedMotion) return; // Fallback handles static layout
    
    // Desktop layout animation
    let mm = gsap.matchMedia();
    
    mm.add("(min-width: 768px)", () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          pin: true,
          scrub: 1,
          start: "top top",
          end: "+=300%", // 300vh scroll duration
        }
      });
      
      // Initial state: Room 204 visible. Everything else hidden.
      gsap.set([log1Ref.current, log2Ref.current, log3Ref.current, guestNameRef.current, taskRef.current, paymentRef.current, gridContainerRef.current, wordmarkRef.current], { autoAlpha: 0, y: 20 });
      gsap.set(statusRef.current, { innerText: "—", color: "#a3a3a3" }); // text-muted-foreground
      
      // Phase 1: Reservation
      tl.addLabel("phase1")
        .to(log1Ref.current, { autoAlpha: 1, y: 0, duration: 0.5 })
        .to(statusRef.current, { innerText: "Reserved", color: "#3b82f6", duration: 0.2 }, "<0.2"); // blue-500
        
      // Phase 2: Guest Arrives
      tl.addLabel("phase2", "+=0.5")
        .to(log2Ref.current, { autoAlpha: 1, y: 0, duration: 0.5 })
        .to(guestNameRef.current, { autoAlpha: 1, y: 0, duration: 0.3 }, "<0.2")
        .to(statusRef.current, { innerText: "Occupied", color: "#d97706", duration: 0.2 }, "<0.1"); // accent
        
      // Phase 3: Checkout
      tl.addLabel("phase3", "+=0.5")
        .to(log3Ref.current, { autoAlpha: 1, y: 0, duration: 0.5 })
        .to(statusRef.current, { innerText: "Dirty", color: "#ef4444", duration: 0.2 }, "<0.2") // red-500
        .to(taskRef.current, { autoAlpha: 1, y: 0, duration: 0.4 }, "<0.1");
        
      // Phase 4: Clean -> Ready
      tl.addLabel("phase4", "+=0.5")
        .to(taskRef.current, { borderColor: "#10b981", duration: 0.3 }) // green-500
        .to(statusRef.current, { innerText: "Ready", color: "#10b981", duration: 0.2 }, "<")
        .to(paymentRef.current, { autoAlpha: 1, y: 0, duration: 0.4 }, "<0.2");
        
      // Phase 5: System pulls back to grid
      tl.addLabel("phase5", "+=0.5")
        .to([logFeedRef.current, guestNameRef.current, taskRef.current, paymentRef.current], { autoAlpha: 0, duration: 0.5 })
        .to(roomCardRef.current, { scale: 0.4, x: "-120%", y: "-120%", duration: 1 }, "<")
        .to(gridContainerRef.current, { autoAlpha: 1, y: 0, duration: 1 }, "<0.2");
        
      // Phase 6: Resolve to Wordmark
      tl.addLabel("phase6", "+=0.5")
        .to([gridContainerRef.current, roomCardRef.current], { autoAlpha: 0, scale: 0.9, duration: 0.8 })
        .to(wordmarkRef.current, { autoAlpha: 1, y: 0, scale: 1, duration: 0.8 }, "<0.2");

      return () => tl.kill();
    });

    // Mobile layout animation
    mm.add("(max-width: 767px)", () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          pin: true,
          scrub: 1,
          start: "top top",
          end: "+=200%", // Shorter scroll
        }
      });
      
      gsap.set([log1Ref.current, log2Ref.current, log3Ref.current, guestNameRef.current, taskRef.current, paymentRef.current, wordmarkRef.current], { autoAlpha: 0, y: 20 });
      gsap.set(statusRef.current, { innerText: "—", color: "#a3a3a3" });
      
      tl.addLabel("phase1")
        .to(log1Ref.current, { autoAlpha: 1, y: 0, duration: 0.5 })
        .to(statusRef.current, { innerText: "Reserved", color: "#3b82f6", duration: 0.2 }, "<0.2")
        .addLabel("phase2", "+=0.5")
        .to(log2Ref.current, { autoAlpha: 1, y: 0, duration: 0.5 })
        .to(guestNameRef.current, { autoAlpha: 1, y: 0, duration: 0.3 }, "<0.2")
        .to(statusRef.current, { innerText: "Occupied", color: "#d97706", duration: 0.2 }, "<0.1")
        .addLabel("phase3", "+=0.5")
        .to(log3Ref.current, { autoAlpha: 1, y: 0, duration: 0.5 })
        .to(statusRef.current, { innerText: "Dirty", color: "#ef4444", duration: 0.2 }, "<0.2")
        .to(taskRef.current, { autoAlpha: 1, y: 0, duration: 0.4 }, "<0.1")
        .addLabel("phase4", "+=0.5")
        .to(taskRef.current, { borderColor: "#10b981", duration: 0.3 })
        .to(statusRef.current, { innerText: "Ready", color: "#10b981", duration: 0.2 }, "<")
        .to(paymentRef.current, { autoAlpha: 1, y: 0, duration: 0.4 }, "<0.2")
        .addLabel("phase6", "+=0.5")
        .to([logFeedRef.current, roomCardRef.current, guestNameRef.current, taskRef.current, paymentRef.current], { autoAlpha: 0, duration: 0.5 })
        .to(wordmarkRef.current, { autoAlpha: 1, y: 0, duration: 0.8 }, "<0.2");
        
      return () => tl.kill();
    });
    
    return () => mm.revert();
  }, { scope: containerRef, dependencies: [prefersReducedMotion] });

  if (prefersReducedMotion) {
    return (
      <section className="w-full bg-background py-32 px-6 border-t border-border/50 flex flex-col items-center">
        <h2 className="font-display text-4xl mb-16">Everything responds to everything else.</h2>
        
        {/* Static reduced-motion layout */}
        <div className="w-full max-w-md space-y-6">
          <div className="p-6 rounded-2xl border border-border bg-surface shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-lg">Room 204</span>
              <span className="text-sm font-medium text-green-500">Ready</span>
            </div>
            <div className="text-sm text-foreground/80">Guest: Sarah Jenkins</div>
          </div>
          
          <div className="p-4 rounded-xl border border-green-500/50 bg-green-500/10 text-sm">
            Housekeeping task complete. Ready for next guest.
          </div>
          
          <div className="text-center pt-16">
            <div className="font-display text-5xl mb-4">STAYO</div>
            <div className="text-xl text-foreground/60">Your entire property. Working as one.</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      ref={containerRef}
      className="relative w-full h-screen bg-background border-t border-border/50"
    >
      <div className="absolute inset-0 flex items-center justify-center p-6 overflow-hidden">
        
        <h2 className="absolute top-24 font-display text-3xl md:text-5xl text-foreground text-center z-10 hidden md:block">
          Everything responds to <span className="text-accent">everything else.</span>
        </h2>

        {/* The Scene Container */}
        <div className="relative w-full max-w-5xl h-[500px] flex items-center justify-center">
          
          {/* LEFT: Log Feed */}
          <div ref={logFeedRef} className="absolute left-0 top-1/2 -translate-y-1/2 w-64 space-y-4 hidden md:block">
            <div className="text-[10px] font-mono text-accent uppercase tracking-widest mb-6">StayO Intelligence Log</div>
            <div ref={log1Ref} className="p-3 bg-surface border border-border rounded-lg text-xs text-foreground/80">
              <span className="font-semibold text-foreground block mb-1">10:41 AM</span>
              New direct booking received: Room 204.
            </div>
            <div ref={log2Ref} className="p-3 bg-surface border border-border rounded-lg text-xs text-foreground/80">
              <span className="font-semibold text-foreground block mb-1">03:15 PM</span>
              Keycode activated. Guest in room.
            </div>
            <div ref={log3Ref} className="p-3 bg-surface border border-border rounded-lg text-xs text-foreground/80">
              <span className="font-semibold text-foreground block mb-1">11:02 AM (Next Day)</span>
              Mobile checkout completed.
            </div>
          </div>

          {/* CENTER: The Room */}
          <div ref={roomCardRef} className="relative z-20 w-full max-w-sm p-6 md:p-8 rounded-2xl border border-border bg-surface shadow-2xl">
            <div className="flex justify-between items-center mb-8 border-b border-border/50 pb-4">
              <span className="font-display text-3xl font-medium">Room 204</span>
              <span ref={statusRef} className="text-sm font-semibold tracking-wide uppercase transition-colors">—</span>
            </div>
            
            <div className="space-y-4 min-h-[120px]">
              <div ref={guestNameRef} className="flex justify-between text-sm">
                <span className="text-foreground/50">Guest</span>
                <span className="font-medium">Sarah Jenkins</span>
              </div>
              
              <div ref={taskRef} className="p-3 rounded-lg border border-red-500/50 bg-red-500/5 text-sm flex justify-between items-center transition-colors">
                <span>Housekeeping</span>
                <span className="text-xs font-mono uppercase">Assigned: Maria</span>
              </div>
              
              <div ref={paymentRef} className="flex justify-between text-sm pt-4 border-t border-border/50">
                <span className="text-foreground/50">Folio Balance</span>
                <span className="font-mono">$0.00</span>
              </div>
            </div>
          </div>

          {/* RIGHT/BACKGROUND: The Grid (Phase 5) */}
          <div ref={gridContainerRef} className="absolute inset-0 flex flex-wrap gap-4 items-center justify-center opacity-0 pointer-events-none hidden md:flex">
            {/* Just decorative dummy cards for the pull-back effect */}
            {Array.from({ length: 11 }).map((_, i) => (
              <div key={i} className="w-[150px] h-[100px] rounded-xl border border-border/50 bg-surface/50 opacity-40" />
            ))}
          </div>

          {/* RESOLUTION: Wordmark (Phase 6) */}
          <div ref={wordmarkRef} className="absolute inset-0 flex flex-col items-center justify-center opacity-0 pointer-events-none z-30">
            <div className="font-display text-6xl md:text-8xl tracking-widest text-foreground mb-6">STAYO</div>
            <div className="text-xl md:text-2xl text-foreground/60 font-light text-center">Your entire property. <br className="md:hidden"/>Working as one.</div>
          </div>

        </div>
      </div>
    </section>
  );
}
