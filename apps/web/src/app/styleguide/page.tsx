'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { colors, typography, spacing, radii, shadows, motion as motionTokens } from '@gateshare/tokens';
import { ArrowRight, Clock, Users, MapPin, Check, AlertTriangle, X, Loader2, Plane } from 'lucide-react';
import Link from 'next/link';

export default function StyleguidePage() {
  const [activeChip, setActiveChip] = useState('balanced');

  return (
    <div className="min-h-dvh bg-surface-secondary">
      <header className="border-b border-ink-100 bg-surface-primary sticky top-0 z-10">
        <div className="gs-container flex items-center justify-between py-4">
          <h1 className="text-xl font-bold text-ink-900">GateShare Design System</h1>
          <Link href="/" className="text-sm text-ink-500 hover:text-ink-700 transition-colors">
            Back to app
          </Link>
        </div>
      </header>

      <div className="gs-container py-8 space-y-16">
        {/* Colors */}
        <section>
          <h2 className="text-2xl font-bold text-ink-900 mb-6">Colors</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-ink-700 mb-3">Brand</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(colors.brand).map(([key, val]) => (
                  <div key={key} className="text-center">
                    <div className="h-12 w-12 rounded-lg border border-ink-100" style={{ backgroundColor: val }} />
                    <span className="text-2xs text-ink-500 mt-1 block">{key}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink-700 mb-3">Ink</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(colors.ink).map(([key, val]) => (
                  <div key={key} className="text-center">
                    <div className="h-12 w-12 rounded-lg border border-ink-100" style={{ backgroundColor: val }} />
                    <span className="text-2xs text-ink-500 mt-1 block">{key}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink-700 mb-3">Semantic</h3>
              <div className="flex gap-4">
                <div className="h-12 w-24 rounded-lg bg-success-500 flex items-center justify-center text-white text-xs font-semibold">Success</div>
                <div className="h-12 w-24 rounded-lg bg-warning-500 flex items-center justify-center text-white text-xs font-semibold">Warning</div>
                <div className="h-12 w-24 rounded-lg bg-error-500 flex items-center justify-center text-white text-xs font-semibold">Error</div>
                <div className="h-12 w-24 rounded-lg bg-info-500 flex items-center justify-center text-white text-xs font-semibold">Info</div>
              </div>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section>
          <h2 className="text-2xl font-bold text-ink-900 mb-6">Typography</h2>
          <div className="space-y-4 bg-surface-primary rounded-xl border border-ink-200 p-6">
            <div className="text-hero font-extrabold text-ink-900">Hero — 72px</div>
            <div className="text-5xl font-extrabold text-ink-900">Display — 48px</div>
            <div className="text-4xl font-bold text-ink-900">Heading 1 — 36px</div>
            <div className="text-3xl font-bold text-ink-900">Heading 2 — 30px</div>
            <div className="text-2xl font-bold text-ink-900">Heading 3 — 24px</div>
            <div className="text-xl font-semibold text-ink-900">Heading 4 — 20px</div>
            <div className="text-lg font-semibold text-ink-900">Large body — 18px</div>
            <div className="text-base text-ink-900">Body — 16px</div>
            <div className="text-sm text-ink-600">Small — 14px</div>
            <div className="text-xs text-ink-500">Caption — 12px</div>
            <div className="text-2xs text-ink-400">Tiny — 10px</div>
          </div>
        </section>

        {/* Buttons */}
        <section>
          <h2 className="text-2xl font-bold text-ink-900 mb-6">Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <button className="gs-btn-primary gap-2">Primary <ArrowRight className="h-4 w-4" /></button>
            <button className="gs-btn-secondary">Secondary</button>
            <button className="gs-btn-primary" disabled>Disabled</button>
            <button className="gs-btn-primary gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading</button>
          </div>
        </section>

        {/* Chips */}
        <section>
          <h2 className="text-2xl font-bold text-ink-900 mb-6">Chips</h2>
          <div className="flex flex-wrap gap-2">
            {['conservative', 'balanced', 'aggressive'].map((c) => (
              <button
                key={c}
                onClick={() => setActiveChip(c)}
                className={`gs-chip capitalize ${activeChip === c ? 'gs-chip-active' : ''}`}
              >
                {c}
              </button>
            ))}
          </div>
        </section>

        {/* Badges */}
        <section>
          <h2 className="text-2xl font-bold text-ink-900 mb-6">Badges</h2>
          <div className="flex flex-wrap gap-3">
            <span className="gs-badge gs-badge-success gap-1"><Check className="h-3 w-3" /> Success</span>
            <span className="gs-badge gs-badge-warning gap-1"><AlertTriangle className="h-3 w-3" /> Warning</span>
            <span className="gs-badge gs-badge-error gap-1"><X className="h-3 w-3" /> Error</span>
            <span className="gs-badge gs-badge-info gap-1"><Clock className="h-3 w-3" /> Info</span>
            <span className="gs-badge bg-brand-100 text-brand-600">Brand</span>
            <span className="gs-badge bg-ink-100 text-ink-600">Neutral</span>
          </div>
        </section>

        {/* Inputs */}
        <section>
          <h2 className="text-2xl font-bold text-ink-900 mb-6">Inputs</h2>
          <div className="max-w-md space-y-4">
            <div>
              <label className="gs-label">Default input</label>
              <input type="text" placeholder="Placeholder text" className="gs-input" />
            </div>
            <div>
              <label className="gs-label">With icon</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-400" />
                <input type="text" placeholder="Search location..." className="gs-input pl-12" />
              </div>
            </div>
            <div>
              <label className="gs-label">Select</label>
              <select className="gs-input">
                <option>Option 1</option>
                <option>Option 2</option>
              </select>
            </div>
          </div>
        </section>

        {/* Cards */}
        <section>
          <h2 className="text-2xl font-bold text-ink-900 mb-6">Cards</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="gs-card">
              <h3 className="text-base font-semibold text-ink-900">Standard card</h3>
              <p className="mt-1 text-sm text-ink-500">Default card with border and padding.</p>
            </div>
            <div className="rounded-xl bg-surface-secondary p-5">
              <h3 className="text-base font-semibold text-ink-900">Surface card</h3>
              <p className="mt-1 text-sm text-ink-500">Subtle background instead of border.</p>
            </div>
          </div>
        </section>

        {/* Shadows */}
        <section>
          <h2 className="text-2xl font-bold text-ink-900 mb-6">Shadows</h2>
          <div className="flex flex-wrap gap-6">
            {['xs', 'sm', 'md', 'lg', 'xl', 'brand'].map((s) => (
              <div
                key={s}
                className={`flex h-20 w-20 items-center justify-center rounded-xl bg-surface-primary text-xs font-semibold text-ink-600 shadow-${s}`}
              >
                {s}
              </div>
            ))}
          </div>
        </section>

        {/* Radii */}
        <section>
          <h2 className="text-2xl font-bold text-ink-900 mb-6">Radii</h2>
          <div className="flex flex-wrap gap-4">
            {Object.entries(radii).map(([key, val]) => (
              <div
                key={key}
                className="flex h-16 w-16 items-center justify-center border-2 border-brand-500 bg-brand-50 text-2xs font-semibold text-brand-600"
                style={{ borderRadius: val }}
              >
                {key}
              </div>
            ))}
          </div>
        </section>

        {/* Motion */}
        <section>
          <h2 className="text-2xl font-bold text-ink-900 mb-6">Motion</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Fade up', anim: { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } } },
              { label: 'Scale in', anim: { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 } } },
              { label: 'Slide right', anim: { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 } } },
            ].map(({ label, anim }) => (
              <motion.div
                key={label}
                {...anim}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                className="rounded-xl border border-ink-200 bg-surface-primary p-5 text-center"
              >
                <div className="text-sm font-semibold text-ink-900">{label}</div>
                <div className="text-xs text-ink-500 mt-1">duration: 400ms</div>
              </motion.div>
            ))}
          </div>
          <div className="mt-4 rounded-xl bg-surface-primary border border-ink-200 p-5">
            <h3 className="text-sm font-semibold text-ink-700 mb-3">Motion tokens</h3>
            <div className="grid gap-2 sm:grid-cols-2 text-xs font-mono text-ink-600">
              {Object.entries(motionTokens.duration).map(([key, val]) => (
                <div key={key} className="flex justify-between">
                  <span>duration.{key}</span>
                  <span className="text-ink-900">{val}</span>
                </div>
              ))}
              {Object.entries(motionTokens.easing).map(([key, val]) => (
                <div key={key} className="flex justify-between">
                  <span>easing.{key}</span>
                  <span className="text-ink-900 truncate ml-2">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* States */}
        <section>
          <h2 className="text-2xl font-bold text-ink-900 mb-6">States</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Empty */}
            <div className="rounded-xl border border-ink-200 bg-surface-primary p-8 text-center">
              <Users className="mx-auto h-10 w-10 text-ink-200" />
              <h3 className="mt-3 text-sm font-semibold text-ink-900">Empty state</h3>
              <p className="mt-1 text-xs text-ink-500">No items to show right now.</p>
              <button className="gs-btn-primary mt-4 text-sm !px-4 !py-2">Take action</button>
            </div>
            {/* Loading */}
            <div className="rounded-xl border border-ink-200 bg-surface-primary p-8 text-center">
              <Loader2 className="mx-auto h-10 w-10 text-brand-500 animate-spin" />
              <h3 className="mt-3 text-sm font-semibold text-ink-900">Loading</h3>
              <p className="mt-1 text-xs text-ink-500">Computing your recommendation...</p>
            </div>
            {/* Success */}
            <div className="rounded-xl border border-success-500 bg-success-50 p-8 text-center">
              <Check className="mx-auto h-10 w-10 text-success-500" />
              <h3 className="mt-3 text-sm font-semibold text-ink-900">Success</h3>
              <p className="mt-1 text-xs text-ink-500">Your trip has been saved.</p>
            </div>
          </div>
        </section>

        {/* Layout */}
        <section>
          <h2 className="text-2xl font-bold text-ink-900 mb-6">Layout</h2>
          <div className="space-y-2 text-sm text-ink-600">
            <p><strong>Container max-width:</strong> 1200px</p>
            <p><strong>Mobile gutter:</strong> 16px (1rem)</p>
            <p><strong>Tablet gutter:</strong> 24px (1.5rem)</p>
            <p><strong>Desktop gutter:</strong> 32px (2rem)</p>
            <p><strong>Min tap target:</strong> 44px</p>
          </div>
        </section>
      </div>
    </div>
  );
}
