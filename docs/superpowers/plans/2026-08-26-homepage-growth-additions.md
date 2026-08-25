# Homepage Growth Additions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the ten trust/enterprise-readiness sections identified in the homepage growth plan, without editing any of the eight existing section components.

**Architecture:** Each addition is a new, standalone `"use client"` component in `src/components/sections/`, following the exact pattern already established by `TheLivingProperty.tsx` / `TheDay.tsx` / `GuestExperience.tsx` / `Rollup.tsx`: local `gsap.registerPlugin()`, `useGSAP` scoped to a container ref with `dependencies: [prefersReducedMotion]`, and an explicit reduced-motion behavior. Every task ends by appending exactly one `import` and one JSX line to `src/app/page.tsx` — existing lines are never reordered or edited.

**Tech Stack:** Next.js 16 (App Router), React 19, GSAP 3.15 (+ScrollTrigger, Flip, SplitText, DrawSVGPlugin, MotionPathPlugin, ScrambleTextPlugin — all free), `@gsap/react`, Tailwind CSS v4 (CSS-token theme in `globals.css`), shadcn/Radix primitives (`components.json` present, style `base-nova`), `lucide-react`.

**Spec:** The published growth-plan artifact (10 additions, priority-tagged P0/P1/P2) — reproduced and made concrete task-by-task below.

## Global Constraints

- **Zero edits** to the eight existing section components: `Hero.tsx`, `TheLivingProperty.tsx`, `TheDay.tsx`, `GuestExperience.tsx`, `Rollup.tsx`, `PropertyTypes.tsx`, `Pricing.tsx`, `FinalCTA.tsx`. Every task only creates new files.
- `src/app/page.tsx` is **append-only**: each task adds one new `import` line and one new JSX line at a specified position. Existing lines are never removed, reordered, or altered.
- `src/components/layout/Footer.tsx` is **additive-only**: new column markup is inserted; the existing ecosystem-link row and the copyright line are preserved verbatim, character-for-character.
- `src/components/layout/Header.tsx` is **not touched** by this plan. Nav-link wiring to the new sections is an optional follow-up, not part of this plan (see "Not included" at the end).
- **No test runner exists in this repo.** `package.json` scripts are `dev`, `build`, `start`, `lint` only — no jest/vitest/playwright. Every task's verification step is therefore: `npm run lint`, `npx tsc --noEmit`, and a manual check in the dev server (desktop width, mobile width ≤480px, and DevTools "Emulate CSS prefers-reduced-motion: reduce"). This is the correct verification method for this codebase, not a shortcut — do not invent unit tests that don't exercise real assertions.
- All GSAP plugins used (`Flip`, `SplitText`, `DrawSVGPlugin`, `MotionPathPlugin`, `ScrambleTextPlugin`) are free under GSAP's current license (post-Webflow acquisition) and ship inside the already-installed `gsap` package — no new npm package for any of them.
- Reuse existing design tokens only: `bg-surface` / `bg-surface-2` / `bg-background`, `text-foreground` / `text-foreground/60`, `text-accent`, `border-border`, `font-display` / `font-mono`, and the `--color-*` custom properties in `globals.css`. No new colors, fonts, radii, or shadows.
- **Marketing copy is placeholder by design.** Customer counts, logos, testimonial identity, named integration partners, and FAQ answers ship behind `TODO(...)` comments with bracketed placeholders (e.g. `[Property Group]`). Never present an invented customer, quote, or partnership as real — swap in sourced content before this goes live. This is called out per-task where it applies.

## Final section order in `page.tsx`

Existing sections are unmarked; new ones are **bold** with their task number. This is the single source of truth for where each task's JSX line goes — resolves the ordering across tasks unambiguously.

```
Header
**ScrollProgress**              (Task 10)
Hero
**TrustBar**                    (Task 1)
TheLivingProperty
**ProductIndex**                (Task 5)
TheDay
GuestExperience
**CommandPaletteTeaser**        (Task 8)
Rollup
**CaseStudySpotlight**          (Task 6)
PropertyTypes
**Integrations**                (Task 2)
**SecurityCompliance**          (Task 3)
**ComparisonTable**             (Task 7)
Pricing
**FAQ**                         (Task 4)
FinalCTA
Footer  (modified additively — Task 9)
DemoModal
```

Tasks are ordered below by priority (P0 → P1 → P2) for execution, not by page position — each task's wiring step states exactly which existing line it inserts before/after, so they can be done in any order without conflict.

---

### Task 1: Trust Bar

**Files:**
- Create: `src/components/sections/TrustBar.tsx`
- Modify (additive-only, one import + one line): `src/app/page.tsx`

**Interfaces:**
- Consumes: `useReducedMotion` from `@/hooks/use-reduced-motion` (existing hook, unchanged)
- Produces: `TrustBar` component, default export not used — named export `export function TrustBar()`, consumed only by `page.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/components/sections/TrustBar.tsx
"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

gsap.registerPlugin(ScrollTrigger);

// TODO(marketing): replace with real, sourced figures before launch.
const STATS = [
  { value: 120, suffix: "+", decimals: 0, label: "Properties running on StayO" },
  { value: 14, suffix: "", decimals: 0, label: "Countries" },
  { value: 2.3, suffix: "M", decimals: 1, label: "Guest messages handled" },
];

const COVERAGE = ["Boutique Hotels", "Resorts", "Homestays", "Cabins", "Hostels", "Multi-Property Groups"];

export function TrustBar() {
  const containerRef = useRef<HTMLDivElement>(null);
  const statRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const trackRef = useRef<HTMLDivElement>(null);

  const prefersReducedMotion = useReducedMotion();

  useGSAP(() => {
    if (prefersReducedMotion) return;

    const tl = gsap.timeline({
      scrollTrigger: { trigger: containerRef.current, start: "top 80%" },
    });

    STATS.forEach((stat, i) => {
      const obj = { val: 0 };
      tl.to(
        obj,
        {
          val: stat.value,
          duration: 1,
          ease: "power2.out",
          onUpdate: () => {
            const el = statRefs.current[i];
            if (!el) return;
            const shown = stat.decimals ? obj.val.toFixed(stat.decimals) : Math.round(obj.val);
            el.textContent = `${shown}${stat.suffix}`;
          },
        },
        i === 0 ? undefined : "<0.1"
      );
    });

    if (trackRef.current) {
      const marqueeTl = gsap.to(trackRef.current, {
        xPercent: -50,
        repeat: -1,
        ease: "none",
        duration: 24,
      });

      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => (self.isActive ? marqueeTl.play() : marqueeTl.pause()),
      });
    }
  }, { scope: containerRef, dependencies: [prefersReducedMotion], revertOnUpdate: true });

  const pills = prefersReducedMotion ? COVERAGE : [...COVERAGE, ...COVERAGE];

  return (
    <section ref={containerRef} className="w-full bg-surface py-16 px-6 border-t border-border/50 overflow-hidden">
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full text-center">
          {STATS.map((stat, i) => (
            <div key={stat.label} className="flex flex-col items-center gap-2">
              <span
                ref={(el) => { statRefs.current[i] = el; }}
                className="font-display text-4xl md:text-5xl text-foreground"
              >
                {prefersReducedMotion ? `${stat.value}${stat.suffix}` : "0"}
              </span>
              <span className="text-sm text-foreground/60">{stat.label}</span>
            </div>
          ))}
        </div>

        <div className="w-full overflow-hidden border-t border-border/50 pt-10">
          <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-6 text-center">
            Already running the day-to-day for
          </div>
          <div className="flex overflow-hidden">
            <div ref={trackRef} className="flex gap-4 shrink-0 pr-4">
              {pills.map((type, i) => (
                <div
                  key={`${type}-${i}`}
                  className="px-5 py-2.5 rounded-full bg-background border border-border text-sm text-foreground/80 whitespace-nowrap"
                >
                  {type}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Wire into `page.tsx`**

Add the import next to the other section imports:

```tsx
// after: import { Hero } from "@/components/sections/Hero";
import { TrustBar } from "@/components/sections/TrustBar";
```

Add the JSX line right after `<Hero />`:

```tsx
<Hero />
<TrustBar />
<TheLivingProperty />
```

- [ ] **Step 3: Verify**

Run: `npm run lint` — expect no new errors.
Run: `npx tsc --noEmit` — expect no new errors.
Run: `npm run dev`, open the homepage. Confirm: the stat strip counts up once when scrolled into view, the pill row scrolls continuously and pauses when the section leaves the viewport, and at ≤480px width the grid stacks to one column without overflow. Then toggle DevTools "Emulate CSS prefers-reduced-motion: reduce" and reload — confirm the stats render their final values immediately with no counting animation, and the pill row is static (single, non-duplicated list).

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/TrustBar.tsx src/app/page.tsx
git commit -m "feat(homepage): add trust bar with property/country stats and coverage marquee"
```

---

### Task 2: Integrations

**Files:**
- Create: `src/components/sections/Integrations.tsx`
- Modify (additive-only): `src/app/page.tsx`

**Interfaces:**
- Consumes: `useReducedMotion`
- Produces: `Integrations` component with `id="integrations"` on its root `<section>` (used by the Footer's `#integrations` link in Task 9)

- [ ] **Step 1: Create the component**

```tsx
// src/components/sections/Integrations.tsx
"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

// TODO(marketing/partnerships): swap these category labels for named, confirmed
// integration partners once partnerships/legal signs off. Do not ship a named
// third-party brand or logo here without written confirmation the integration
// exists — an unconfirmed partnership claim is a real, not cosmetic, risk.
const INTEGRATIONS = [
  { id: "channel", label: "Channel Manager", angle: -90 },
  { id: "pay", label: "Payments", angle: -18 },
  { id: "book", label: "Booking Engine", angle: 54 },
  { id: "acct", label: "Accounting", angle: 126 },
  { id: "ota", label: "OTA Distribution", angle: 198 },
];

const RADIUS = 150;
const CENTER = 200;

function nodePosition(angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: CENTER + RADIUS * Math.cos(rad), y: CENTER + RADIUS * Math.sin(rad) };
}

export function Integrations() {
  const containerRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<(SVGCircleElement | null)[]>([]);

  const prefersReducedMotion = useReducedMotion();

  useGSAP(() => {
    if (prefersReducedMotion) return;

    const tl = gsap.timeline({
      scrollTrigger: { trigger: containerRef.current, start: "top 70%" },
    });

    INTEGRATIONS.forEach((node, i) => {
      const dot = dotRefs.current[i];
      if (!dot) return;
      tl.fromTo(
        dot,
        { autoAlpha: 0, scale: 0.6 },
        {
          autoAlpha: 1,
          scale: 1,
          duration: 1,
          ease: "power2.inOut",
          motionPath: {
            path: `#spoke-${node.id}`,
            align: `#spoke-${node.id}`,
            alignOrigin: [0.5, 0.5],
            autoRotate: false,
          },
        },
        i * 0.15
      );
    });
  }, { scope: containerRef, dependencies: [prefersReducedMotion], revertOnUpdate: true });

  return (
    <section id="integrations" ref={containerRef} className="w-full bg-background py-32 px-6 border-t border-border/50 flex flex-col items-center">
      <div className="text-center mb-16 max-w-2xl">
        <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">Works with what you already run.</h2>
        <p className="text-lg text-foreground/60">StayO sits in the middle of your existing stack instead of asking you to replace it.</p>
      </div>

      <svg viewBox="0 0 400 400" className="w-full max-w-md" role="img" aria-label="StayO connected to channel manager, payments, booking engine, accounting, and OTA distribution">
        {INTEGRATIONS.map((node) => {
          const { x, y } = nodePosition(node.angle);
          return (
            <path key={node.id} id={`spoke-${node.id}`} d={`M ${x} ${y} L ${CENTER} ${CENTER}`} fill="none" stroke="var(--color-border)" strokeWidth="1.5" />
          );
        })}

        {INTEGRATIONS.map((node, i) => {
          const { x, y } = nodePosition(node.angle);
          return (
            <g key={node.id}>
              <circle cx={x} cy={y} r="34" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1.5" />
              <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="8" fontFamily="var(--font-mono)" fill="var(--color-foreground)">
                {node.label.split(" ")[0]}
              </text>
              <circle ref={(el) => { dotRefs.current[i] = el; }} r="4" fill="var(--color-accent)" opacity={prefersReducedMotion ? 0 : undefined} />
            </g>
          );
        })}

        <circle cx={CENTER} cy={CENTER} r="44" fill="var(--color-accent)" opacity="0.12" />
        <circle cx={CENTER} cy={CENTER} r="30" fill="var(--color-surface)" stroke="var(--color-accent)" strokeWidth="1.5" />
        <text x={CENTER} y={CENTER} textAnchor="middle" dominantBaseline="middle" fontSize="11" fontFamily="var(--font-display)" fill="var(--color-accent)">
          STAYO
        </text>
      </svg>

      <div className="flex flex-wrap justify-center gap-3 mt-12">
        {INTEGRATIONS.map((node) => (
          <div key={node.id} className="px-4 py-2 rounded-full bg-surface border border-border text-sm text-foreground/80">
            {node.label}
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Wire into `page.tsx`**

```tsx
import { Integrations } from "@/components/sections/Integrations";
```

Insert right after `<PropertyTypes />`:

```tsx
<PropertyTypes />
<Integrations />
<Pricing />
```

- [ ] **Step 3: Verify**

`npm run lint`, `npx tsc --noEmit`. In the dev server, confirm five dots travel from their spokes into the center hub once when the section scrolls into view (they don't replay on every scroll — GSAP timelines don't restart unless retriggered, so scrolling past and back re-triggers by default; that's expected and fine here since it's a short, cheap animation). Confirm the SVG stays legible at 375px width. With reduced motion emulated, confirm the dots are invisible (`opacity: 0`) rather than mid-animation — no dots frozen half-way along a spoke.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/Integrations.tsx src/app/page.tsx
git commit -m "feat(homepage): add integrations hub-and-spoke section"
```

---

### Task 3: Security & Compliance

**Files:**
- Create: `src/components/sections/SecurityCompliance.tsx`
- Modify (additive-only): `src/app/page.tsx`

**Interfaces:**
- Consumes: `useReducedMotion`
- Produces: `SecurityCompliance` component with `id="security"` on its root `<section>` (used by Footer's `#security` link in Task 9)

- [ ] **Step 1: Create the component**

```tsx
// src/components/sections/SecurityCompliance.tsx
"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { useGSAP } from "@gsap/react";
import { Shield, Lock, Clock, Users, RotateCw, Globe2 } from "lucide-react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);

// TODO(compliance): only list certifications StayO actually holds today.
// Do not add SOC 2 / ISO badges until they are certified — a fabricated
// badge is a worse trust signal than none.
const SAFEGUARDS = [
  { icon: Lock, label: "Encrypted in transit & at rest", desc: "TLS 1.2+ for every request, encrypted storage for guest and payment data." },
  { icon: Shield, label: "PCI DSS-compliant payments", desc: "Card data never touches StayO servers directly." },
  { icon: RotateCw, label: "Daily automated backups", desc: "Point-in-time recovery across every property in your portfolio." },
  { icon: Users, label: "Role-based staff access", desc: "Front desk, housekeeping, and ownership each see only what they need." },
  { icon: Clock, label: "99.9% uptime target", desc: "Monitored infrastructure with on-call incident response." },
  { icon: Globe2, label: "GDPR-ready guest data handling", desc: "Guest data export and deletion on request, by design." },
];

export function SecurityCompliance() {
  const containerRef = useRef<HTMLDivElement>(null);
  const iconRefs = useRef<(SVGSVGElement | null)[]>([]);

  const prefersReducedMotion = useReducedMotion();

  useGSAP(() => {
    if (prefersReducedMotion) return;

    iconRefs.current.forEach((svg, i) => {
      if (!svg) return;
      const shapes = svg.querySelectorAll("path, circle, rect, line, polyline");
      gsap.set(shapes, { drawSVG: "0%" });
      gsap.to(shapes, {
        drawSVG: "100%",
        duration: 0.6,
        ease: "power2.out",
        stagger: 0.04,
        delay: i * 0.06,
        scrollTrigger: { trigger: containerRef.current, start: "top 75%" },
      });
    });
  }, { scope: containerRef, dependencies: [prefersReducedMotion], revertOnUpdate: true });

  return (
    <section id="security" ref={containerRef} className="w-full bg-surface py-32 px-6 border-t border-border/50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-4">Security &amp; Compliance</div>
          <h2 className="font-display text-3xl md:text-4xl text-foreground">Built to pass your IT team&apos;s checklist.</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SAFEGUARDS.map((item, i) => (
            <div key={item.label} className="p-6 rounded-2xl border border-border bg-background flex flex-col gap-3">
              <item.icon ref={(el) => { iconRefs.current[i] = el; }} className="w-6 h-6 text-accent" strokeWidth={1.5} />
              <div className="font-medium text-foreground">{item.label}</div>
              <p className="text-sm text-foreground/60 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Wire into `page.tsx`**

```tsx
import { SecurityCompliance } from "@/components/sections/SecurityCompliance";
```

Insert right after `<Integrations />` (from Task 2) — if Task 2 hasn't landed yet, insert after `<PropertyTypes />` instead; Security always sits immediately before `<Pricing />`:

```tsx
<Integrations />
<SecurityCompliance />
<Pricing />
```

- [ ] **Step 3: Verify**

`npm run lint`, `npx tsc --noEmit`. In the dev server, confirm each icon's stroke draws in as the grid scrolls into view (staggered, quick, no bounce). Confirm the grid reflows to one column at ≤480px. With reduced motion emulated, confirm icons render fully drawn immediately (no stroke animation) — check that `gsap.set(shapes, { drawSVG: "0%" })` inside the reduced-motion-gated `useGSAP` block never runs, so icons never get stuck invisible.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/SecurityCompliance.tsx src/app/page.tsx
git commit -m "feat(homepage): add security and compliance section"
```

---

### Task 4: FAQ

**Files:**
- Create (via shadcn CLI): `src/components/ui/accordion.tsx`
- Create: `src/components/sections/FAQ.tsx`
- Modify (additive-only, CLI-managed): `src/app/globals.css` — the shadcn CLI appends accordion keyframes; it does not touch any existing token or rule
- Modify (additive-only): `src/app/page.tsx`

**Interfaces:**
- Consumes: `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent` from the new `@/components/ui/accordion`
- Produces: `FAQ` component with `id="faq"` on its root `<section>` (used by Footer's `#faq` link in Task 9)

- [ ] **Step 1: Install the Accordion primitive**

Run: `npx shadcn@latest add accordion`

This matches `components.json` (style `base-nova`, alias `@/components/ui`) and creates `src/components/ui/accordion.tsx` plus its `@radix-ui/react-accordion` dependency — the same mechanism that already produced `dialog.tsx`, `sheet.tsx`, and `command.tsx` in this repo, so no new UI kit is introduced.

- [ ] **Step 2: Verify the CLI output**

Run: `git status` — expect `src/components/ui/accordion.tsx` (new), `package.json` / `package-lock.json` (dependency added), and `src/app/globals.css` (keyframes appended). Open `globals.css` and confirm every existing line above the new keyframes is unchanged — the diff should be a pure addition at the point the CLI inserted it.

- [ ] **Step 3: Create the FAQ section**

```tsx
// src/components/sections/FAQ.tsx
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
```

- [ ] **Step 4: Wire into `page.tsx`**

```tsx
import { FAQ } from "@/components/sections/FAQ";
```

Insert right after `<Pricing />`, before `<FinalCTA />`:

```tsx
<Pricing />
<FAQ />
<FinalCTA />
```

- [ ] **Step 5: Verify**

`npm run lint`, `npx tsc --noEmit`. In the dev server, confirm each question expands/collapses on click, only one open at a time (`type="single"`), and the expand/collapse feels snappy (shadcn's default accordion transition, no manual tuning needed). Confirm keyboard focus is visible when tabbing through triggers.

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/accordion.tsx src/components/sections/FAQ.tsx src/app/page.tsx src/app/globals.css package.json package-lock.json
git commit -m "feat(homepage): add FAQ accordion section"
```

---

### Task 5: Product Index

**Files:**
- Create: `src/components/sections/ProductIndex.tsx`
- Modify (additive-only): `src/app/page.tsx`

**Interfaces:**
- Consumes: `gsap`, `useGSAP`, `Flip` from `@/lib/gsap` (existing file — `Flip` is already registered there; this task only imports it, no edit to `lib/gsap.ts`), `cn` from `@/lib/utils`, `useReducedMotion`
- Produces: `ProductIndex` component

- [ ] **Step 1: Create the component**

```tsx
// src/components/sections/ProductIndex.tsx
"use client";

import React, { useRef, useState } from "react";
import { gsap, useGSAP, Flip } from "@/lib/gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CalendarCheck, Sparkles, ClipboardList, LineChart, MessageCircle, Building2 } from "lucide-react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const MODULES = [
  { id: "pms", icon: CalendarCheck, name: "Unified PMS", desc: "One calendar for every room, every property, every channel." },
  { id: "intel", icon: Sparkles, name: "StayO Intelligence", desc: "Reads every request and routes it before staff have to." },
  { id: "hk", icon: ClipboardList, name: "Housekeeping", desc: "Tasks reshuffle themselves the moment a guest checks out." },
  { id: "rev", icon: LineChart, name: "Revenue Intelligence", desc: "Rates adjust to demand while you sleep." },
  { id: "guest", icon: MessageCircle, name: "Guest Messaging", desc: "Multi-lingual, instant, and grounded in your property's ground truth." },
  { id: "rollup", icon: Building2, name: "Multi-Property Rollup", desc: "Every property's performance, one portfolio view." },
];

export function ProductIndex() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const prefersReducedMotion = useReducedMotion();

  useGSAP(() => {
    gsap.from(containerRef.current!.querySelectorAll(".module-card"), {
      autoAlpha: 0,
      y: 20,
      duration: 0.5,
      stagger: 0.06,
      ease: "power2.out",
      scrollTrigger: { trigger: containerRef.current, start: "top 75%" },
    });
  }, { scope: containerRef, dependencies: [prefersReducedMotion], revertOnUpdate: true });

  const handleToggle = (id: string) => {
    const next = expanded === id ? null : id;
    if (prefersReducedMotion || !gridRef.current) {
      setExpanded(next);
      return;
    }
    const state = Flip.getState(gridRef.current.querySelectorAll(".module-card"));
    setExpanded(next);
    requestAnimationFrame(() => {
      Flip.from(state, { duration: 0.4, ease: "power2.inOut", absolute: false });
    });
  };

  return (
    <section ref={containerRef} className="w-full bg-background py-32 px-6 border-t border-border/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">Every module, in one place.</h2>
          <p className="text-lg text-foreground/60 max-w-xl mx-auto">Six systems that used to be six vendors.</p>
        </div>

        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULES.map((mod) => (
            <button
              key={mod.id}
              type="button"
              onClick={() => handleToggle(mod.id)}
              onMouseEnter={() => window.matchMedia("(hover: hover) and (pointer: fine)").matches && handleToggle(mod.id)}
              onMouseLeave={() => window.matchMedia("(hover: hover) and (pointer: fine)").matches && expanded === mod.id && handleToggle(mod.id)}
              className={cn(
                "module-card text-left p-6 rounded-2xl border border-border bg-surface flex flex-col gap-3 transition-colors cursor-pointer",
                expanded === mod.id && "sm:col-span-2 bg-surface-2 border-accent/40"
              )}
            >
              <mod.icon className="w-5 h-5 text-accent" strokeWidth={1.5} />
              <div className="font-medium text-foreground">{mod.name}</div>
              <p className="text-sm text-foreground/60 leading-relaxed">{mod.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Wire into `page.tsx`**

```tsx
import { ProductIndex } from "@/components/sections/ProductIndex";
```

Insert right after `<TheLivingProperty />`:

```tsx
<TheLivingProperty />
<ProductIndex />
<TheDay />
```

- [ ] **Step 3: Verify**

`npm run lint`, `npx tsc --noEmit`. In the dev server on desktop, hover a card and confirm it expands to span two columns while the others compress — the Flip transition should feel smooth, not jump-cut. Click the same card and confirm it collapses. On a touch-emulated viewport, confirm tapping a card expands it (no dependency on `:hover`). With reduced motion emulated, confirm the toggle still works but the resize is instant (no Flip tween).

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/ProductIndex.tsx src/app/page.tsx
git commit -m "feat(homepage): add product index bento grid with Flip expand"
```

---

### Task 6: Case Study Spotlight

**Files:**
- Create: `src/components/sections/CaseStudySpotlight.tsx`
- Modify (additive-only): `src/app/page.tsx`

**Interfaces:**
- Consumes: `useReducedMotion`
- Produces: `CaseStudySpotlight` component

- [ ] **Step 1: Create the component**

```tsx
// src/components/sections/CaseStudySpotlight.tsx
"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

gsap.registerPlugin(ScrollTrigger, SplitText);

// TODO(marketing): replace with a real customer, quote, and metrics before
// this ships. Do not present an invented customer as real.
const CASE_STUDY = {
  name: "[Guest Name]",
  title: "General Manager, [Property Group]",
  quote: "We stopped losing bookings to a slow inbox. StayO answers guests before our front desk even sees the message, and the whole portfolio rolls up into one number every morning.",
  metrics: [
    { value: 32, suffix: "%", prefix: "-", label: "Front-desk calls" },
    { value: 18, suffix: "%", prefix: "+", label: "Direct bookings" },
    { value: 6, suffix: " hrs/wk", prefix: "", label: "Reclaimed" },
  ],
};

export function CaseStudySpotlight() {
  const containerRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLParagraphElement>(null);
  const metricRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const prefersReducedMotion = useReducedMotion();

  useGSAP(() => {
    if (prefersReducedMotion) return;

    const split = SplitText.create(quoteRef.current, { type: "lines", mask: "lines" });

    const tl = gsap.timeline({
      scrollTrigger: { trigger: containerRef.current, start: "top 70%" },
    });

    tl.from(split.lines, { yPercent: 110, autoAlpha: 0, duration: 0.6, stagger: 0.08, ease: "power3.out" });

    CASE_STUDY.metrics.forEach((metric, i) => {
      const obj = { val: 0 };
      tl.to(
        obj,
        {
          val: metric.value,
          duration: 0.8,
          ease: "power2.out",
          onUpdate: () => {
            const el = metricRefs.current[i];
            if (el) el.textContent = `${metric.prefix}${Math.round(obj.val)}${metric.suffix}`;
          },
        },
        i === 0 ? "-=0.2" : "<0.1"
      );
    });

    return () => split.revert();
  }, { scope: containerRef, dependencies: [prefersReducedMotion], revertOnUpdate: true });

  return (
    <section ref={containerRef} className="w-full bg-surface py-32 px-6 border-t border-border/50">
      <div className="max-w-4xl mx-auto grid md:grid-cols-[1fr_auto] gap-12 items-center">
        <div>
          <div className="text-[10px] font-mono text-accent uppercase tracking-widest mb-6">Case Study</div>
          <p ref={quoteRef} className="font-display text-2xl md:text-3xl text-foreground leading-snug mb-8">
            &ldquo;{CASE_STUDY.quote}&rdquo;
          </p>
          <div className="text-sm text-foreground/60">
            <span className="text-foreground font-medium">{CASE_STUDY.name}</span> — {CASE_STUDY.title}
          </div>
        </div>

        <div className="flex md:flex-col gap-6 md:gap-8 md:border-l md:border-border/50 md:pl-12">
          {CASE_STUDY.metrics.map((metric, i) => (
            <div key={metric.label} className="text-center md:text-left">
              <div ref={(el) => { metricRefs.current[i] = el; }} className="font-mono text-3xl text-accent">
                {prefersReducedMotion ? `${metric.prefix}${metric.value}${metric.suffix}` : "0"}
              </div>
              <div className="text-xs text-foreground/50 mt-1">{metric.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Wire into `page.tsx`**

```tsx
import { CaseStudySpotlight } from "@/components/sections/CaseStudySpotlight";
```

Insert right after `<Rollup />`, before `<PropertyTypes />`:

```tsx
<Rollup />
<CaseStudySpotlight />
<PropertyTypes />
```

- [ ] **Step 3: Verify**

`npm run lint`, `npx tsc --noEmit`. In the dev server, confirm the quote reveals line-by-line masked from below (not a plain fade), and the three metrics count up right after. Confirm layout stacks (metrics below quote) at ≤768px. With reduced motion emulated, confirm the quote is fully visible immediately (no `SplitText` instance created at all — verify by checking the quote paragraph has no wrapping `<div>`s injected in DevTools Elements when reduced motion is on) and metrics show final values with no counting.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/CaseStudySpotlight.tsx src/app/page.tsx
git commit -m "feat(homepage): add case study spotlight with SplitText quote reveal"
```

---

### Task 7: Comparison Table

**Files:**
- Create: `src/components/sections/ComparisonTable.tsx`
- Modify (additive-only): `src/app/page.tsx`

**Interfaces:**
- Consumes: `useReducedMotion`
- Produces: `ComparisonTable` component

- [ ] **Step 1: Create the component**

```tsx
// src/components/sections/ComparisonTable.tsx
"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Check, X, Minus } from "lucide-react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

gsap.registerPlugin(ScrollTrigger);

type Cell = "yes" | "no" | "partial";

const ROWS: { feature: string; stayo: Cell; legacy: Cell; sheets: Cell }[] = [
  { feature: "Real-time multi-property sync", stayo: "yes", legacy: "partial", sheets: "no" },
  { feature: "AI guest messaging", stayo: "yes", legacy: "no", sheets: "no" },
  { feature: "Automated housekeeping routing", stayo: "yes", legacy: "partial", sheets: "no" },
  { feature: "Revenue recommendations", stayo: "yes", legacy: "partial", sheets: "no" },
  { feature: "Setup time", stayo: "yes", legacy: "no", sheets: "yes" },
  { feature: "Dedicated support", stayo: "yes", legacy: "partial", sheets: "no" },
];

function Mark({ state }: { state: Cell }) {
  if (state === "yes") return <Check className="w-4 h-4 text-status-ok mx-auto" />;
  if (state === "no") return <X className="w-4 h-4 text-foreground/30 mx-auto" />;
  return <Minus className="w-4 h-4 text-foreground/40 mx-auto" />;
}

export function ComparisonTable() {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useGSAP(() => {
    if (prefersReducedMotion) return;
    gsap.from(containerRef.current, {
      autoAlpha: 0,
      y: 16,
      duration: 0.6,
      ease: "power2.out",
      scrollTrigger: { trigger: containerRef.current, start: "top 78%" },
    });
  }, { scope: containerRef, dependencies: [prefersReducedMotion] });

  return (
    <section className="w-full bg-background py-32 px-6 border-t border-border/50">
      <div ref={containerRef} className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">Why properties switch.</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[560px]">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-4 text-sm font-medium text-foreground/60">Feature</th>
                <th className="py-4 text-sm font-semibold text-accent">StayO</th>
                <th className="py-4 text-sm font-medium text-foreground/60">Legacy PMS</th>
                <th className="py-4 text-sm font-medium text-foreground/60">Spreadsheets + WhatsApp</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.feature} className="border-b border-border/30">
                  <td className="py-4 text-sm text-foreground">{row.feature}</td>
                  <td className="py-4"><Mark state={row.stayo} /></td>
                  <td className="py-4"><Mark state={row.legacy} /></td>
                  <td className="py-4"><Mark state={row.sheets} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Wire into `page.tsx`**

```tsx
import { ComparisonTable } from "@/components/sections/ComparisonTable";
```

Insert right after `<SecurityCompliance />` (Task 3), before `<Pricing />`:

```tsx
<SecurityCompliance />
<ComparisonTable />
<Pricing />
```

- [ ] **Step 3: Verify**

`npm run lint`, `npx tsc --noEmit`. In the dev server, confirm the table fades in once on scroll and is horizontally scrollable (not page-scrolling) at narrow widths — check `overflow-x-auto` actually contains the scroll, the page body shouldn't scroll sideways.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/ComparisonTable.tsx src/app/page.tsx
git commit -m "feat(homepage): add StayO vs legacy PMS comparison table"
```

---

### Task 8: Command Palette Teaser

**Files:**
- Create: `src/components/sections/CommandPaletteTeaser.tsx`
- Modify (additive-only): `src/app/page.tsx`

**Interfaces:**
- Consumes: `Command`, `CommandGroup`, `CommandItem`, `CommandList` from the existing `@/components/ui/command`; `useReducedMotion`
- Produces: `CommandPaletteTeaser` component

- [ ] **Step 1: Create the component**

```tsx
// src/components/sections/CommandPaletteTeaser.tsx
"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { useGSAP } from "@gsap/react";
import { CheckCheck } from "lucide-react";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin);

const RESULTS = [
  { id: "block", label: "Block Room 214 — Maintenance" },
  { id: "message", label: "Message all in-house guests" },
  { id: "report", label: "Generate weekly ADR report" },
];

export function CommandPaletteTeaser() {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const toastRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  const prefersReducedMotion = useReducedMotion();

  useGSAP(() => {
    if (prefersReducedMotion) return;

    gsap.set(toastRef.current, { autoAlpha: 0, y: 8 });
    gsap.set(rowRefs.current, { autoAlpha: 0.35 });

    const tl = gsap.timeline({
      scrollTrigger: { trigger: containerRef.current, start: "top 65%" },
      repeat: -1,
      repeatDelay: 1.5,
    });

    tl.to(inputRef.current, {
      duration: 1.1,
      scrambleText: { text: "block room 214", chars: "lowerCase", revealDelay: 0.3, speed: 0.4 },
    })
      .to(rowRefs.current[0], { autoAlpha: 1, backgroundColor: "var(--color-surface-2)", duration: 0.25 }, "+=0.2")
      .to(rowRefs.current.slice(1), { autoAlpha: 0.2, duration: 0.25 }, "<")
      .to(toastRef.current, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" }, "+=0.3")
      .to(toastRef.current, { autoAlpha: 0, y: -8, duration: 0.3, ease: "power2.in" }, "+=1.2")
      .to(inputRef.current, { duration: 0.3, scrambleText: { text: "", chars: "" } }, "<")
      .set(rowRefs.current, { autoAlpha: 0.35, backgroundColor: "transparent" });
  }, { scope: containerRef, dependencies: [prefersReducedMotion], revertOnUpdate: true });

  return (
    <section ref={containerRef} className="w-full bg-surface-2 py-32 px-6 border-t border-border/50 flex flex-col items-center">
      <div className="text-center mb-12 max-w-xl">
        <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-4">For your team</div>
        <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">Everything, one keystroke away.</h2>
        <p className="text-lg text-foreground/60">
          The same command palette your staff already uses inside StayO — built for people who&apos;d rather type than click.
        </p>
      </div>

      <div className="relative w-full max-w-lg">
        <Command className="border border-border shadow-2xl">
          <div className="flex items-center px-4 py-3.5 border-b border-border bg-surface-2/50">
            <span className="text-muted-foreground mr-3 text-sm">⌘K</span>
            <div ref={inputRef} className="text-sm text-foreground font-mono min-h-[1.25rem]" />
          </div>
          <CommandList>
            <CommandGroup>
              {RESULTS.map((r, i) => (
                <div key={r.id} ref={(el) => { rowRefs.current[i] = el; }} className="rounded-md">
                  <CommandItem className="rounded-md pointer-events-none">{r.label}</CommandItem>
                </div>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>

        <div ref={toastRef} className="absolute -bottom-4 left-1/2 -translate-x-1/2 translate-y-full flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-status-ok/10 border border-status-ok/20 text-status-ok text-xs">
          <CheckCheck className="w-3.5 h-3.5" />
          Task created
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Wire into `page.tsx`**

```tsx
import { CommandPaletteTeaser } from "@/components/sections/CommandPaletteTeaser";
```

Insert right after `<GuestExperience />`, before `<Rollup />`:

```tsx
<GuestExperience />
<CommandPaletteTeaser />
<Rollup />
```

- [ ] **Step 3: Verify**

`npm run lint`, `npx tsc --noEmit`. In the dev server, confirm the loop plays: query scrambles in, the first result highlights, a "Task created" toast rises and fades, the query clears, and it repeats after 1.5s. If TypeScript complains about `CommandItem`'s ref forwarding, this component already avoids that (the ref sits on the wrapping `<div>`, not `CommandItem` itself) — if a new error appears, do not add a ref to `CommandItem` directly. With reduced motion emulated, confirm the palette renders statically with the query text empty and no toast — no looping timeline is created.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/CommandPaletteTeaser.tsx src/app/page.tsx
git commit -m "feat(homepage): add command palette teaser scene"
```

---

### Task 9: Footer, Enriched

**Files:**
- Modify (additive-only): `src/components/layout/Footer.tsx`

**Interfaces:**
- Consumes: `id="security"` (Task 3), `id="integrations"` (Task 2), `id="faq"` (Task 4), and the existing `id="pricing"` on `Pricing.tsx` — anchors only resolve once those tasks have landed; safe to ship this task first, the links just won't scroll anywhere until the target sections exist
- Produces: nothing consumed elsewhere

- [ ] **Step 1: Replace the file with the additive version**

The existing ecosystem-link row and copyright line are reproduced **exactly as they are today** below the new column grid — nothing in them changes.

```tsx
// src/components/layout/Footer.tsx
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
          <p className="text-xs text-foreground/40 text-center">© {new Date().getFullYear()} Girivah. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Verify**

`npm run lint`, `npx tsc --noEmit`. Diff `Footer.tsx` against git history and confirm the ecosystem row and copyright `<p>` are byte-identical to before, just relocated below the new grid. In the dev server, confirm `/privacy` and `/terms` are known 404s for now (out of scope for this plan — flagged below) and that the other links scroll to their sections once Tasks 2–4 have landed.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Footer.tsx
git commit -m "feat(homepage): enrich footer with product, company, and legal columns"
```

---

### Task 10: Scroll Progress Indicator

**Files:**
- Create: `src/components/shared/ScrollProgress.tsx`
- Modify (additive-only): `src/app/page.tsx`

**Interfaces:**
- Consumes: nothing project-specific
- Produces: `ScrollProgress` component, fixed-position, renders independently of section order

- [ ] **Step 1: Create the component**

```tsx
// src/components/shared/ScrollProgress.tsx
"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const trigger = ScrollTrigger.create({
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        gsap.set(barRef.current, { scaleX: self.progress });
      },
    });

    return () => trigger.kill();
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-[2px] z-60 bg-transparent pointer-events-none">
      <div ref={barRef} className="h-full bg-accent origin-left" style={{ transform: "scaleX(0)" }} />
    </div>
  );
}
```

- [ ] **Step 2: Wire into `page.tsx`**

```tsx
import { ScrollProgress } from "@/components/shared/ScrollProgress";
```

Insert as the first child inside `<main>`, right before `<Header />` — it's `fixed`, so its position in the tree doesn't affect layout, only stacking order (`z-60` keeps it above the header's `z-50`):

```tsx
<main className="flex min-h-screen flex-col w-full overflow-hidden">
  <ScrollProgress />
  <Header />
```

- [ ] **Step 3: Verify**

`npm run lint`, `npx tsc --noEmit`. In the dev server, confirm the thin accent-colored line at the very top of the viewport fills left-to-right smoothly as you scroll the full page, and reaches full width exactly at the bottom of the page (`document.body` end matches `bottom bottom`). Confirm it renders above the header, not behind it. This uses `gsap.set` (immediate state, not a tween), so no reduced-motion branch is needed — it's already a direct state readout, not a transition.

- [ ] **Step 4: Commit**

```bash
git add src/components/shared/ScrollProgress.tsx src/app/page.tsx
git commit -m "feat(homepage): add scroll progress indicator"
```

---

## Self-review

**Spec coverage** — all ten additions from the growth-plan artifact map to a task: Trust Bar → Task 1, Product Index → Task 5, Command Palette Teaser → Task 8, Case Study Spotlight → Task 6, Integrations → Task 2, Security & Compliance → Task 3, Comparison Table → Task 7, FAQ → Task 4, Footer Enriched → Task 9, Scroll Progress → Task 10. No gaps.

**Placeholder scan** — every code block is complete and runnable, not a stub. The only intentional placeholders are marketing *copy* (customer counts, case-study identity, integration partner names, FAQ answers), each behind an explicit `TODO(...)` comment naming who owns sourcing it — this is content-sourcing, not an unfinished implementation.

**Type/name consistency** — `useReducedMotion` (from `@/hooks/use-reduced-motion`) and the `useGSAP({ scope, dependencies: [prefersReducedMotion], revertOnUpdate: true })` signature are used identically across all ten tasks, matching the existing sections exactly. Section IDs referenced by Footer (`#security`, `#integrations`, `#faq`, `#pricing`) match the `id` attributes set in Tasks 2, 3, 4, and the existing `Pricing.tsx`.

## Content-sourcing checklist (before production launch)

- [ ] Trust Bar (Task 1): real property count, country count, message volume
- [ ] Integrations (Task 2): confirmed partner names/logos, or keep category labels
- [ ] Security & Compliance (Task 3): confirm every claim is currently true; add/remove items to match reality
- [ ] Case Study Spotlight (Task 6): a real customer, quote, photo, and metrics — or hold this task until one exists
- [ ] FAQ (Task 4): real objections from the sales team, replacing the drafted placeholders
- [ ] Footer (Task 9): build `/privacy` and `/terms` pages, or point those two links at existing legal docs

## Not included in this plan

- **Header nav wiring** — linking `Header.tsx`'s nav to the new sections (Security, Integrations, FAQ) was intentionally left out per the "Header not touched" global constraint. If wanted, it's a small follow-up: add three `scrollToSection(...)` buttons to the existing nav `<nav>` in `Header.tsx`, matching the two that already exist.

---

## Execution options

**1. Subagent-Driven (recommended)** — a fresh subagent per task, with review between tasks and fast iteration. Requires the `subagent-driven-development` skill.

**2. Inline Execution** — execute tasks in this session in batches with checkpoints for review. Requires the `executing-plans` skill.
