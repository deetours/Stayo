"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { TheLivingProperty } from "@/components/sections/TheLivingProperty";
import { TheDay } from "@/components/sections/TheDay";
import { GuestExperience } from "@/components/sections/GuestExperience";
import { PropertyTypes } from "@/components/sections/PropertyTypes";
import { Rollup } from "@/components/sections/Rollup";
import { Pricing } from "@/components/sections/Pricing";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { DemoModal } from "@/components/shared/DemoModal";

gsap.registerPlugin(ScrollTrigger);

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

    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
    };
  }, []);

  return (
    <main className="flex min-h-screen flex-col w-full overflow-hidden">
      <Header />
      
      <div className="flex-1">
        <Hero />
        <TheLivingProperty />
        <TheDay />
        <GuestExperience />
        <Rollup />
        <PropertyTypes />
        <Pricing />
        <FinalCTA />
      </div>

      <Footer />
      <DemoModal />
    </main>
  );
}
