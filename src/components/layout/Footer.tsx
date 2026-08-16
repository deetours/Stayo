"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t border-border/50 bg-background py-8">
      <div className="container mx-auto px-6 flex flex-col items-center justify-center gap-4">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm font-medium text-foreground/60">
          <Link href="https://trailo.girivah.com" className="hover:text-foreground transition-colors">
            Trailo
          </Link>
          <span className="w-1 h-1 rounded-full bg-foreground/30"></span>
          <Link href="/" className="text-foreground">
            StayO
          </Link>
          <span className="w-1 h-1 rounded-full bg-foreground/30"></span>
          <Link href="https://rido.girivah.com" className="hover:text-foreground transition-colors">
            Rido
          </Link>
          <span className="w-1 h-1 rounded-full bg-foreground/30"></span>
          <Link href="https://girivah.com" className="hover:text-foreground transition-colors">
            Girivah
          </Link>
        </div>
        <p className="text-xs text-foreground/40 text-center">
          © {new Date().getFullYear()} Girivah. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
