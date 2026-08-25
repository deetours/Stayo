"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { setPreviewSession } from "@/lib/session";

export function Header() {
  const router = useRouter();

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const enterPreview = () => {
    setPreviewSession();
    router.push("/app/dashboard");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 md:py-6 mix-blend-difference">
      <Link href="/" className="font-display text-2xl tracking-widest text-white">
        STAYO
      </Link>

      <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/80">
        <button onClick={() => scrollToSection("the-day")} className="hover:text-white transition-colors">
          Intelligence
        </button>
        <button onClick={() => scrollToSection("pricing")} className="hover:text-white transition-colors">
          Pricing
        </button>
        <button onClick={enterPreview} className="hover:text-white transition-colors">
          See a live preview
        </button>
      </nav>

      <div className="flex items-center gap-4">
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent("open-demo-modal"));
          }}
          className="hidden md:block text-sm font-medium text-white/80 hover:text-white transition-colors cursor-pointer"
        >
          Book a Demo
        </button>
        <MagneticButton
          variant="primary"
          size="sm"
          className="bg-white text-black hover:bg-white/90 font-semibold"
          onClick={() => router.push("/register")}
        >
          Get Started
        </MagneticButton>
      </div>
    </header>
  );
}
