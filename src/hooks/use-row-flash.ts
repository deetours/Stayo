'use client';

import { useRef, useState } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

// A brief success-color flash on a DataTable row after a state-changing
// action resolves (Check In, Record Payment, ...) — reuses the dashboard's
// useGSAP-scoped, reduced-motion-gated pattern (see dashboard/page.tsx's
// Flip-on-dependency-change effect) rather than introducing a new one.
// Targets rows via DataTable's `data-row-id` attribute, so no per-row refs
// are needed.
export function useRowFlash() {
  const containerRef = useRef<HTMLDivElement>(null);
  const flashRowId = useRef<string | null>(null);
  const [flashNonce, setFlashNonce] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  const flashRow = (rowId: string) => {
    flashRowId.current = rowId;
    setFlashNonce((n) => n + 1);
  };

  useGSAP(
    () => {
      if (prefersReducedMotion || !flashRowId.current || !containerRef.current) return;
      const el = containerRef.current.querySelector(`[data-row-id="${flashRowId.current}"]`);
      if (!el) return;
      // #10b981 mirrors --color-status-ok — GSAP's color interpolation
      // needs a concrete value rather than a var() reference.
      gsap.fromTo(
        el,
        { backgroundColor: '#10b981', opacity: 0.15 },
        {
          backgroundColor: 'transparent',
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
          clearProps: 'backgroundColor,opacity',
        }
      );
    },
    { dependencies: [flashNonce], scope: containerRef }
  );

  return { containerRef, flashRow };
}
