"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { Problem } from "@/components/sections/Problem";
import { CommandCentre } from "@/components/sections/CommandCentre";
import { Agents } from "@/components/sections/Agents";
import { PropertyTypes } from "@/components/sections/PropertyTypes";
import { Rollup } from "@/components/sections/Rollup";
import { Bridge } from "@/components/sections/Bridge";
import { Pricing } from "@/components/sections/Pricing";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { DemoModal } from "@/components/shared/DemoModal";

export default function Home() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <main className="flex min-h-screen flex-col w-full overflow-hidden">
      <Header />
      
      <div className="flex-1">
        <Hero />
        <Problem />
        <CommandCentre />
        <Agents />
        <PropertyTypes />
        <Rollup />
        <Bridge />
        <Pricing />
        <FinalCTA />
      </div>

      <Footer />
      <DemoModal />
    </main>
  );
}
