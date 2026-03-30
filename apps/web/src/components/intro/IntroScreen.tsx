'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface IntroScreenProps {
  onComplete: () => void;
}

export function IntroScreen({ onComplete }: IntroScreenProps) {
  const prefersReducedMotion = useReducedMotion();
  const [ready, setReady] = useState(false);

  const skip = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('boarding-intro-seen', '1');
    }
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.sessionStorage.getItem('boarding-intro-seen') === '1') {
      onComplete();
      return;
    }

    const holdTimer = window.setTimeout(() => setReady(true), prefersReducedMotion ? 120 : 420);
    const autoAdvance = window.setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem('boarding-intro-seen', '1');
      }
      onComplete();
    }, prefersReducedMotion ? 360 : 1240);

    return () => {
      window.clearTimeout(holdTimer);
      window.clearTimeout(autoAdvance);
    };
  }, [onComplete, prefersReducedMotion]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        skip();
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [skip]);

  return (
    <div
      className="fixed inset-0 z-50 cursor-pointer select-none overflow-hidden"
      style={{ background: '#FAFAF8', color: '#1A1A1A' }}
      onClick={skip}
      role="button"
      tabIndex={0}
      aria-label="Skip intro"
    >
      <div className="gs-container relative flex min-h-dvh flex-col justify-between py-10 sm:py-12">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.28em]" style={{ color: '#9CA3AF' }}>
          <span className="font-display" style={{ fontSize: 16, fontStyle: 'italic', letterSpacing: '-0.01em', textTransform: 'none', color: '#1A1A1A' }}>Boarding</span>
          <span>never miss a flight again</span>
        </div>

        <div className="grid items-end gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, x: prefersReducedMotion ? 0 : 28 }}
            animate={ready ? { opacity: 1, x: 0 } : { opacity: 0, x: prefersReducedMotion ? 0 : 28 }}
            transition={{
              duration: prefersReducedMotion ? 0.14 : 0.5,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <div
              className="font-display max-w-4xl"
              style={{
                fontSize: 'clamp(3.5rem, 11vw, 7.5rem)',
                fontStyle: 'italic',
                fontWeight: 400,
                lineHeight: 0.92,
                letterSpacing: '-0.02em',
                color: '#1A1A1A',
              }}
            >
              Let&apos;s move
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: prefersReducedMotion ? 0 : 40 }}
            animate={ready ? { opacity: 1, x: 0 } : { opacity: 0, x: prefersReducedMotion ? 0 : 40 }}
            transition={{
              delay: prefersReducedMotion ? 0 : 0.08,
              duration: prefersReducedMotion ? 0.14 : 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="max-w-sm justify-self-start text-sm leading-relaxed lg:justify-self-end"
            style={{ color: '#9CA3AF' }}
          >
            Flight-aware timing first. Shared rides only if the timing still works for everyone.
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: prefersReducedMotion ? 0 : 0.45, duration: 0.25 }}
          style={{ fontSize: 14, color: '#D4D4D8' }}
        >
          Tap, click, or press Enter to skip
        </motion.div>
      </div>
    </div>
  );
}
