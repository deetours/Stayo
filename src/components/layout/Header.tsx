"use client";

import Link from "next/link";
import { MagneticButton } from "@/components/shared/MagneticButton";

export function Header() {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 md:py-6 mix-blend-difference">
      <Link href="/" className="text-xl font-semibold tracking-tight text-white">
        StayO
      </Link>
      
      <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/80">
        <button onClick={() => scrollToSection("product")} className="hover:text-white transition-colors">
          Product
        </button>
        <button onClick={() => scrollToSection("pricing")} className="hover:text-white transition-colors">
          Pricing
        </button>
        <button onClick={() => scrollToSection("customers")} className="hover:text-white transition-colors">
          Customers
        </button>
      </nav>

      <div className="flex items-center gap-4">
        <MagneticButton
          variant="primary"
          size="sm"
          className="bg-white text-black hover:bg-white/90 font-semibold"
          onClick={() => {
            // Trigger demo modal - to be implemented
            window.dispatchEvent(new CustomEvent("open-demo-modal"));
          }}
        >
          Book a Demo
        </MagneticButton>
      </div>
    </header>
  );
}
