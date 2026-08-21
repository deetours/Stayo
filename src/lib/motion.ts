import { Variants, Easing } from 'framer-motion';

export const durations = {
  instant: 0.1,
  fast: 0.15,
  standard: 0.22,
  deliberate: 0.4,
  cinematic: 0.8
};

export const eases = {
  standard: [0.2, 0, 0, 1] as [number, number, number, number],
  decelerate: [0, 0, 0, 1] as [number, number, number, number],
  accelerate: [0.3, 0, 1, 1] as [number, number, number, number],
  spring: { type: 'spring', mass: 1, stiffness: 280, damping: 26 } as const
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { duration: durations.standard, ease: eases.standard } 
  }
};

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: durations.deliberate, ease: eases.decelerate } 
  }
};

export const slideFromRight: Variants = {
  hidden: { x: '100%' },
  visible: { 
    x: '0%', 
    transition: { duration: durations.standard, ease: eases.decelerate } 
  },
  exit: {
    x: '100%',
    transition: { duration: durations.fast, ease: eases.accelerate }
  }
};

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', mass: 1, stiffness: 280, damping: 26 }
  }
};
