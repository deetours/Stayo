import React from 'react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between p-6">
      {/* Brand Header */}
      <div className="flex items-center justify-between max-w-6xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="w-8 h-8 rounded-md bg-accent flex items-center justify-center text-accent-foreground font-bold font-mono text-heading-sm shadow-e1">
            S
          </div>
          <span className="text-heading-sm font-semibold tracking-tight text-foreground group-hover:text-accent transition-colors">
            StayO
          </span>
        </Link>
        <span className="text-caption font-mono uppercase text-muted-foreground tracking-wider">
          Hospitality OS
        </span>
      </div>

      {/* Main Centered Content */}
      <div className="flex-1 flex items-center justify-center my-8">
        <div className="w-full max-w-md bg-surface border border-border rounded-lg p-8 shadow-[var(--shadow-e2)]">
          {children}
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between text-caption text-muted-foreground border-t border-border/50 pt-4">
        <span>© 2026 StayO Technologies Inc.</span>
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          <Link href="/security" className="hover:text-foreground transition-colors">Security</Link>
        </div>
      </div>
    </div>
  );
}


