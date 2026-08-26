"use client";

import React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// TODO(sales): replace with the real objections your team hears most often
// before a hotel group signs — these are illustrative placeholders.
const FAQS = [
  { q: "How long does migration from our current PMS take?", a: "Most independent properties are live within 5–10 business days. Multi-property groups typically plan for 2–4 weeks, run property-by-property so no location goes dark mid-switch." },
  { q: "Can you import our existing reservations and guest history?", a: "Yes — we import active and upcoming reservations, guest profiles, and folio history from your current system as part of onboarding." },
  { q: "What does training and onboarding look like for staff?", a: "A dedicated onboarding specialist runs live sessions for front desk, housekeeping, and management, and StayO Intelligence handles the repetitive parts of the workflow from day one." },
  { q: "Do you support multiple currencies and languages?", a: "Yes — pricing, invoicing, and guest messaging all support multiple currencies and languages, including automatic translation for guest conversations." },
  { q: "What's the contract term, and can we cancel?", a: "Month-to-month is available on Starter and Growth. Enterprise plans are typically annual with a defined SLA — talk to us about what fits your group." },
  { q: "What support do we get after go-live?", a: "Every plan includes email and chat support; Growth and Enterprise add priority response times and a named account manager." },
];

export function FAQ() {
  return (
    <section id="faq" className="w-full bg-background py-32 px-6 border-t border-border/50">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">Questions before you switch.</h2>
          <p className="text-lg text-foreground/60">The things procurement and ops teams usually ask before signing.</p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((item, i) => (
            <AccordionItem key={item.q} value={`item-${i}`} className="border-border">
              <AccordionTrigger className="text-left text-foreground hover:no-underline">{item.q}</AccordionTrigger>
              <AccordionContent className="text-foreground/60 leading-relaxed">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
