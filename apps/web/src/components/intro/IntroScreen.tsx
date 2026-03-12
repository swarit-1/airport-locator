'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface IntroScreenProps {
  onComplete: () => void;
}

export function IntroScreen({ onComplete }: IntroScreenProps) {
  const [ready, setReady] = useState(false);
  const prefersReducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  const skip = useCallback(() => {
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    // Brief hold before auto-advance
    const holdTimer = setTimeout(() => setReady(true), 200);
    const autoAdvance = setTimeout(() => {
      onComplete();
    }, prefersReducedMotion ? 500 : 1600);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(autoAdvance);
    };
  }, [onComplete, prefersReducedMotion]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        skip();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [skip]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-500 cursor-pointer select-none"
      onClick={skip}
      role="button"
      tabIndex={0}
      aria-label="Skip intro"
    >
      <motion.h1
        className="text-5xl sm:text-7xl lg:text-hero font-extrabold text-white tracking-tight"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={
          ready
            ? { opacity: 1, scale: 1 }
            : { opacity: 0, scale: 0.95 }
        }
        transition={{
          duration: prefersReducedMotion ? 0.1 : 0.5,
          ease: [0.34, 1.56, 0.64, 1],
        }}
      >
        Let&rsquo;s move
      </motion.h1>
      <motion.p
        className="absolute bottom-8 text-sm text-white/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      >
        Tap anywhere to skip
      </motion.p>
    </div>
  );
}
