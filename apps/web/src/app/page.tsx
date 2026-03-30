'use client';

import { useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { airportSeeds, airportProfileSeeds } from '@boarding/db';

// ─── Data ──────────────────────────────────────────────────────────────

const AIRPORTS_DISPLAY = ['JFK', 'LAX', 'ORD', 'ATL', 'DEN', 'SFO', 'SEA', 'DFW'];

function getSecurityLevel(iata: string): { label: string; color: string } {
  const profile = airportProfileSeeds
    .flat()
    .find((p) => p.iata_code === iata && p.flight_type === 'domestic');
  const avg = profile?.avg_security_wait_minutes ?? 18;
  if (avg <= 18) return { label: 'Low', color: 'var(--status-green)' };
  if (avg <= 22) return { label: 'Moderate', color: 'var(--status-amber)' };
  return { label: 'Busy', color: 'var(--status-red)' };
}

function getCity(iata: string): string {
  return airportSeeds.find((a) => a.iata_code === iata)?.city ?? iata;
}

const TIMELINE_STEPS = [
  { icon: '⌂', label: 'Leave home', time: '7:15 AM', detail: null },
  { icon: '│', label: 'Traffic', time: null, detail: '34 min · Google Routes' },
  { icon: '✈', label: 'Arrive airport', time: '7:49 AM', detail: null },
  { icon: '│', label: 'Security', time: null, detail: '~18 min · historical avg' },
  { icon: '│', label: 'Walk to gate', time: null, detail: '11 min · Terminal B' },
  { icon: '◎', label: 'At gate', time: '8:18 AM', detail: '45 min buffer · balanced' },
];

const CIRCLES_DATA = [
  { from: 'Capitol Hill', to: 'SEA', time: '7:10 AM', riders: 3, savings: '$14' },
  { from: 'Wicker Park', to: 'ORD', time: '5:40 AM', riders: 2, savings: '$18' },
  { from: 'Midtown', to: 'JFK', time: '12:15 PM', riders: 4, savings: '$22' },
];

const STEPS = [
  { num: '01', label: 'Enter your flight number' },
  { num: '02', label: 'We pull traffic, security, gate data' },
  { num: '03', label: 'One clear leave time' },
  { num: '04', label: 'Share a ride if timing works' },
];

// ─── Scroll reveal hook ────────────────────────────────────────────────

function useScrollReveal() {
  const observed = useRef(new Set<Element>());

  const observe = useCallback((el: HTMLElement | null) => {
    if (!el || observed.current.has(el)) return;
    observed.current.add(el);

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      el.classList.add('visible');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Also reveal child .reveal and .timeline-step elements
            entry.target.querySelectorAll('.reveal, .timeline-step').forEach((child) => {
              child.classList.add('visible');
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    );
    observer.observe(el);
  }, []);

  return observe;
}

// ─── Page ──────────────────────────────────────────────────────────────

export default function LandingPage() {
  const observe = useScrollReveal();

  // Auto-reveal hero on mount
  const heroRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const delay = prefersReduced ? 0 : 100;
    const timer = setTimeout(() => {
      el.classList.add('visible');
      el.querySelectorAll('.reveal').forEach((child) => child.classList.add('visible'));
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100dvh' }}>
      {/* ─── Header ─────────────────────────────────────────── */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          background: 'var(--bg)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="gs-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
          <Link href="/" style={{ textDecoration: 'none', color: 'var(--text)' }}>
            <span
              className="font-display"
              style={{
                fontSize: 20,
                fontStyle: 'italic',
                letterSpacing: '-0.01em',
                color: 'var(--text)',
              }}
            >
              Boarding
            </span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Link
              href="/login"
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                transition: 'color 0.15s',
              }}
            >
              Sign in
            </Link>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* ─── Hero ──────────────────────────────────────────── */}
        <section
          style={{
            minHeight: 'calc(100dvh - 56px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            paddingBottom: 80,
          }}
        >
          <div className="gs-container stagger" ref={heroRef} style={{ maxWidth: 540, textAlign: 'center', margin: '0 auto' }}>
            <p
              className="reveal"
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                marginBottom: 24,
              }}
            >
              BOARDING
            </p>

            <h1
              className="reveal font-display"
              style={{
                fontSize: 'clamp(2.5rem, 7vw, 3.75rem)',
                fontStyle: 'italic',
                lineHeight: 1.08,
                letterSpacing: '-0.015em',
                color: 'var(--text)',
                marginBottom: 20,
                fontWeight: 400,
              }}
            >
              Know exactly when{'\u00A0'}to leave for the airport.
            </h1>

            <p
              className="reveal"
              style={{
                fontSize: 15,
                lineHeight: 1.6,
                color: 'var(--text-secondary)',
                maxWidth: 400,
                margin: '0 auto 40px',
              }}
            >
              Flight lookup &rarr; traffic &rarr; security &rarr; gate.
              <br />
              One leave time.
            </p>

            <div className="reveal" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <Link
                href="/trip/new"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'var(--accent)',
                  color: '#FFFFFF',
                  fontSize: 15,
                  fontWeight: 600,
                  padding: '14px 32px',
                  borderRadius: 999,
                  textDecoration: 'none',
                  transition: 'background 0.15s, transform 0.1s',
                  minHeight: 48,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-hover)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)'; }}
              >
                Let&apos;s move
                <span style={{ fontSize: 18 }}>&rarr;</span>
              </Link>

              <Link
                href="#airports"
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                  borderBottom: '1px solid transparent',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderBottomColor = 'var(--text-muted)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderBottomColor = 'transparent'; }}
              >
                or browse airports
              </Link>
            </div>
          </div>
        </section>

        {/* ─── Section A: Departure Preview ─────────────────── */}
        <section
          ref={observe}
          className="reveal"
          style={{ paddingBottom: 96 }}
        >
          <div className="gs-container" style={{ maxWidth: 540, margin: '0 auto' }}>
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                marginBottom: 16,
                textAlign: 'center',
              }}
            >
              Example recommendation
            </p>

            {/* Dark preview card */}
            <div
              className="stagger"
              style={{
                background: '#1C1C1C',
                borderRadius: 16,
                padding: '28px 24px',
                color: '#FFFFFF',
              }}
            >
              {/* Flight header */}
              <div className="reveal" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.5)' }}>
                  AUS &rarr; SEA
                </span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
                  Delta 1286 &middot; Tue, Apr 1
                </span>
              </div>

              {/* Leave by time */}
              <div className="reveal" style={{ marginTop: 16, marginBottom: 28 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
                  Leave by
                </div>
                <div className="font-display" style={{ fontSize: 40, fontStyle: 'italic', letterSpacing: '-0.02em', color: '#FFFFFF' }}>
                  7:15 AM
                </div>
              </div>

              {/* Timeline */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {TIMELINE_STEPS.map((step, i) => (
                  <div
                    key={step.label}
                    className="timeline-step"
                    style={{
                      transitionDelay: `${i * 80}ms`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '8px 0',
                      borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    <span style={{ width: 18, fontSize: 13, color: 'rgba(255,255,255,0.3)', textAlign: 'center', flexShrink: 0 }}>
                      {step.icon}
                    </span>
                    <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: step.time ? '#FFFFFF' : 'rgba(255,255,255,0.55)' }}>
                      {step.label}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: step.time ? 600 : 400, color: step.time ? 'var(--accent)' : 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>
                      {step.time ?? step.detail}
                    </span>
                  </div>
                ))}
              </div>

              {/* Buffer badge */}
              <div className="reveal" style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
                <span style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.4)',
                  background: 'rgba(255,255,255,0.06)',
                  padding: '5px 14px',
                  borderRadius: 999,
                  letterSpacing: '0.04em',
                }}>
                  ✓ 45 min buffer &middot; balanced
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Section B: Airport Grid ──────────────────────── */}
        <section
          id="airports"
          ref={observe}
          className="reveal"
          style={{ paddingBottom: 96 }}
        >
          <div className="gs-container" style={{ maxWidth: 540, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
              <p style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
              }}>
                Airports
              </p>
              <Link
                href="/airport/SEA"
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                  borderBottom: '1px solid var(--border)',
                  paddingBottom: 1,
                  transition: 'color 0.15s',
                }}
              >
                View all
              </Link>
            </div>

            <div
              className="stagger"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
              }}
            >
              {AIRPORTS_DISPLAY.map((iata, i) => {
                const city = getCity(iata);
                const security = getSecurityLevel(iata);
                return (
                  <Link
                    key={iata}
                    href={`/airport/${iata}`}
                    className="reveal"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      padding: '16px 18px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: 12,
                      textDecoration: 'none',
                      color: 'inherit',
                      transition: 'border-color 0.15s',
                      transitionDelay: `${i * 60}ms`,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)' }}>
                        {iata}
                      </span>
                      <span style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: security.color,
                        background: `${security.color}14`,
                        padding: '2px 8px',
                        borderRadius: 999,
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                      }}>
                        {security.label}
                      </span>
                    </div>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      {city}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── Section C: Ride Circles ──────────────────────── */}
        <section
          ref={observe}
          className="reveal"
          style={{ paddingBottom: 96 }}
        >
          <div className="gs-container" style={{ maxWidth: 540, margin: '0 auto' }}>
            <p style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              marginBottom: 6,
            }}>
              Ride Circles
            </p>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.5 }}>
              Share rides to the airport. Only when timing works.
            </p>

            <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {CIRCLES_DATA.map((circle, i) => (
                <Link
                  key={circle.from}
                  href="/circles"
                  className="reveal"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 0',
                    borderBottom: i < CIRCLES_DATA.length - 1 ? '1px solid var(--border)' : 'none',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.65'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                      {circle.from} &rarr; {circle.to}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      {circle.time} &middot; {circle.riders} riders &middot; save ~{circle.savings}
                    </div>
                  </div>
                  <span style={{ fontSize: 16, color: 'var(--text-muted)' }}>&rarr;</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Section D: How It Works ──────────────────────── */}
        <section
          ref={observe}
          className="reveal"
          style={{ paddingBottom: 96 }}
        >
          <div className="gs-container" style={{ maxWidth: 540, margin: '0 auto' }}>
            <p style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              marginBottom: 24,
            }}>
              How it works
            </p>

            <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {STEPS.map((step, i) => (
                <div
                  key={step.num}
                  className="reveal"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '16px 0',
                    borderBottom: i < STEPS.length - 1 ? '1px solid var(--border)' : 'none',
                  }}
                >
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'var(--accent)',
                    fontVariantNumeric: 'tabular-nums',
                    width: 24,
                    flexShrink: 0,
                  }}>
                    {step.num}
                  </span>
                  <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)' }}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ─── Footer ──────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '40px 0' }}>
        <div className="gs-container" style={{ maxWidth: 540, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24 }}>
            <span className="font-display" style={{ fontSize: 18, fontStyle: 'italic', color: 'var(--text)' }}>
              Boarding
            </span>
            <div style={{ display: 'flex', gap: 20 }}>
              <Link href="/trip/new" style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', textDecoration: 'none' }}>
                Plan trip
              </Link>
              <Link href="/circles" style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', textDecoration: 'none' }}>
                Ride circles
              </Link>
              <Link href="/styleguide" style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', textDecoration: 'none' }}>
                Styleguide
              </Link>
            </div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            U.S. airports &middot; Open assumptions
          </p>
        </div>
      </footer>

      {/* ─── Bottom Tab Bar (visual) ─────────────────────────── */}
      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: 'var(--bg-card)',
          borderTop: '1px solid var(--border)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 0,
          maxWidth: 400,
          margin: '0 auto',
        }}>
          {[
            { label: 'Home', href: '/', active: true, icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            )},
            { label: 'Trips', href: '/trip/new', active: false, icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
              </svg>
            )},
            { label: 'Circles', href: '/circles', active: false, icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            )},
            { label: 'Profile', href: '/profile', active: false, icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )},
          ].map((tab) => (
            <Link
              key={tab.label}
              href={tab.href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                padding: '10px 24px',
                textDecoration: 'none',
                minHeight: 44,
                minWidth: 44,
                position: 'relative',
              }}
            >
              <span style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={tab.active ? 'var(--accent)' : 'var(--text-muted)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {/* Re-render the icon's inner elements with correct stroke */}
                </svg>
                {/* Use the icon directly */}
                <span style={{ color: tab.active ? 'var(--accent)' : 'var(--text-muted)' }}>
                  {/* Clone icon with correct stroke */}
                  <span style={{ display: 'flex' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{
                      __html: tab.label === 'Home'
                        ? '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>'
                        : tab.label === 'Trips'
                        ? '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>'
                        : tab.label === 'Circles'
                        ? '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'
                        : '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'
                    }} />
                  </span>
                </span>
              </span>
              <span style={{
                fontSize: 10,
                fontWeight: tab.active ? 600 : 500,
                color: tab.active ? 'var(--accent)' : 'var(--text-muted)',
                letterSpacing: '0.02em',
              }}>
                {tab.label}
              </span>
              {tab.active && (
                <span style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 20,
                  height: 2,
                  borderRadius: 1,
                  background: 'var(--accent)',
                }} />
              )}
            </Link>
          ))}
        </div>
      </nav>

      {/* Bottom spacer for tab bar */}
      <div style={{ height: 72 }} />
    </div>
  );
}
