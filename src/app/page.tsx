"use client";

import React, { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { TrustBar } from "@/components/sections/TrustBar";
import { TheLivingProperty } from "@/components/sections/TheLivingProperty";
import { ProductIndex } from "@/components/sections/ProductIndex";
import { TheDay } from "@/components/sections/TheDay";
import { GuestExperience } from "@/components/sections/GuestExperience";
import { CommandPaletteTeaser } from "@/components/sections/CommandPaletteTeaser";
import { PropertyTypes } from "@/components/sections/PropertyTypes";
import { Integrations } from "@/components/sections/Integrations";
import { SecurityCompliance } from "@/components/sections/SecurityCompliance";
import { ComparisonTable } from "@/components/sections/ComparisonTable";
import { Rollup } from "@/components/sections/Rollup";
import { CaseStudySpotlight } from "@/components/sections/CaseStudySpotlight";
import { Pricing } from "@/components/sections/Pricing";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { FAQ } from "@/components/sections/FAQ";
import { DemoModal } from "@/components/shared/DemoModal";
import { ScrollProgress } from "@/components/shared/ScrollProgress";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const prefersReducedMotion = useReducedMotion();

  const useSafeLayoutEffect = typeof window !== 'undefined' ? React.useLayoutEffect : useEffect;

  useSafeLayoutEffect(() => {
    if (typeof window !== "undefined") {
      if ("scrollRestoration" in window.history) {
        // Bypass strict linting on history mutation
        Object.assign(window.history, { scrollRestoration: "manual" });
      }
      if (!window.location.hash) {
        window.scrollTo(0, 0);
      }
      ScrollTrigger.clearScrollMemory?.();

      // In-app browsers (Instagram, etc.) restore a frozen copy of the page
      // instead of re-running React effects — "pageshow" fires on that
      // restore (event.persisted) as well as on a normal load, so it's the
      // only reliable hook to re-force the scroll position.
      const handlePageShow = (event: PageTransitionEvent) => {
        if (!window.location.hash) {
          window.scrollTo(0, 0);
        }
        if (event.persisted) {
          ScrollTrigger.refresh();
        }
      };
      window.addEventListener("pageshow", handlePageShow);
      return () => window.removeEventListener("pageshow", handlePageShow);
    }
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    if (!window.location.hash) {
      lenis.scrollTo(0, { immediate: true });
    }

    // Lenis keeps its own internal scroll target — if a bfcache/in-app-browser
    // restore snaps window.scrollY back to 0 without Lenis knowing, its next
    // raf tick will animate back to the stale (restored) position.
    const handlePageShow = () => {
      if (!window.location.hash) {
        lenis.scrollTo(0, { immediate: true });
      }
    };
    window.addEventListener("pageshow", handlePageShow);

    lenis.on("scroll", ScrollTrigger.update);

    const update = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(update);

    gsap.ticker.lagSmoothing(0);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      lenis.destroy();
      gsap.ticker.remove(update);
    };
  }, [prefersReducedMotion]);

  return (
    <main className="flex min-h-screen flex-col w-full overflow-hidden">
      <ScrollProgress />
      <Header />
      
      <div className="flex-1">
        <Hero />
        <TrustBar />
        <TheLivingProperty />
        <ProductIndex />
        <TheDay />
        <GuestExperience />
        <CommandPaletteTeaser />
        <Rollup />
        <CaseStudySpotlight />
        <PropertyTypes />
        <Integrations />
        <SecurityCompliance />
        <ComparisonTable />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </div>

      <Footer />
      <DemoModal />
    </main>
  );
}
