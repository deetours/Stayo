"use client";

import Link from "next/link";

const FOOTER_COLUMNS = [
  {
    heading: "Product",
    links: [
      { label: "Security & Compliance", href: "#security" },
      { label: "Integrations", href: "#integrations" },
      { label: "Pricing", href: "#pricing" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Girivah", href: "https://girivah.com" },
      { label: "Talk to Sales", href: "mailto:sales@girivah.com" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Security", href: "#security" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="w-full border-t border-border/50 bg-background py-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 pb-12 mb-8 border-b border-border/50 max-w-4xl mx-auto">
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.heading}>
              <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-4">{col.heading}</div>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-center gap-4">
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
      </div>
    </footer>
  );
}
