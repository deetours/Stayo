"use client";

import React from "react";
import { Check } from "lucide-react";
import { MagneticButton } from "@/components/shared/MagneticButton";

const plans = [
  {
    name: "Starter",
    rooms: "Up to 15 rooms",
    desc: "For boutique homestays and small independent hotels.",
    features: [
      "Unified Calendar & Booking Engine",
      "WhatsApp Guest Messaging",
      "Basic Room Assignment",
      "StayO Intelligence (Lite)",
    ],
    highlighted: false,
  },
  {
    name: "Growth",
    rooms: "Up to 75 rooms",
    desc: "For resorts and growing hospitality groups.",
    features: [
      "Everything in Starter",
      "Multi-Property Rollup",
      "Automated Housekeeping Workflows",
      "StayO Intelligence (Full)",
      "Revenue & Pricing Recommendations",
    ],
    highlighted: true,
  },
  {
    name: "Enterprise",
    rooms: "Unlimited rooms",
    desc: "For large groups needing custom workflows.",
    features: [
      "Everything in Growth",
      "Custom ERP/PMS Integrations",
      "Dedicated Account Manager",
      "White-labeled Guest App",
      "SLA & Priority Support",
    ],
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="w-full bg-background py-32 px-6 md:px-12 border-t border-border/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-normal tracking-tight text-foreground mb-4">
            Simple, scale-friendly pricing.
          </h2>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto font-light">
            Contact us for a tailored quote based on your property size and specific needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {plans.map((plan, i) => (
            <div 
              key={plan.name}
              className={`relative p-8 rounded-2xl border transition-all ${
                plan.highlighted 
                  ? "bg-surface border-accent/50 md:scale-105 shadow-2xl z-10" 
                  : "bg-surface/50 border-border z-0"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Most Popular
                </div>
              )}
              
              <h3 className="text-2xl font-semibold mb-2">{plan.name}</h3>
              <div className="text-accent font-medium mb-4">{plan.rooms}</div>
              <p className="text-foreground/60 text-sm mb-8 h-10">{plan.desc}</p>
              
              <div className="mb-8">
                <div className="text-3xl font-bold font-mono tracking-tight">Contact Us</div>
                <div className="text-xs text-foreground/40 mt-1 uppercase tracking-wider">Custom Quote</div>
              </div>
              
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <div className={`mt-0.5 rounded-full p-0.5 ${plan.highlighted ? "bg-accent/20" : "bg-foreground/10"}`}>
                      <Check className={`w-3 h-3 ${plan.highlighted ? "text-accent" : "text-foreground/60"}`} />
                    </div>
                    <span className="text-sm text-foreground/80 leading-snug">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <MagneticButton 
                variant={plan.highlighted ? "primary" : "outline"}
                className="w-full"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("open-demo-modal"));
                }}
              >
                Get a Quote
              </MagneticButton>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
