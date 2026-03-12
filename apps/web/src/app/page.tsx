import Link from 'next/link';
import { ArrowRight, Clock, Users, Shield, MapPin } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-dvh">
      {/* Hero */}
      <header className="relative overflow-hidden bg-brand-500">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600 to-brand-500" />
        <nav className="relative gs-container flex items-center justify-between py-5">
          <div className="text-xl font-bold text-white tracking-tight">GateShare</div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
              Sign in
            </Link>
            <Link
              href="/trip/new"
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-brand-600 shadow-sm hover:bg-white/95 transition-colors"
            >
              Plan your trip
            </Link>
          </div>
        </nav>
        <div className="relative gs-container pb-24 pt-20 sm:pt-28 sm:pb-32">
          <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-hero text-balance">
            Know when to leave.
            <br />
            Share the ride.
          </h1>
          <p className="mt-6 max-w-lg text-lg text-white/80 leading-relaxed">
            GateShare tells you exactly when to leave for the airport — accounting for traffic,
            security, your airline, and your comfort level. Then it helps you find others heading
            the same way.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/trip/new" className="gs-btn-primary !bg-white !text-brand-600 !shadow-xl hover:!bg-white/95 gap-2">
              Plan your trip
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a href="#how-it-works" className="gs-btn-secondary !border-white/30 !text-white hover:!bg-white/10">
              How it works
            </a>
          </div>
        </div>
        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 56" fill="none" className="w-full h-14">
            <path d="M0 56h1440V28C1320 8 1200 0 1080 4S840 28 720 36 480 40 360 32 120 8 0 0v56z" fill="white" />
          </svg>
        </div>
      </header>

      {/* How it works */}
      <section id="how-it-works" className="py-20 sm:py-28">
        <div className="gs-container">
          <h2 className="text-3xl font-bold text-ink-900 sm:text-4xl text-center">
            Airport timing, solved
          </h2>
          <p className="mt-4 text-center text-lg text-ink-600 max-w-2xl mx-auto">
            Stop guessing. GateShare builds a personalized timeline for your trip — from your
            front door to your gate.
          </p>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Clock,
                title: 'Smart timing',
                desc: 'We factor in traffic, security wait times, airline rules, and your preferences to find your ideal leave time.',
              },
              {
                icon: MapPin,
                title: 'Your route',
                desc: 'Real-time traffic from your actual starting point to your specific terminal and gate.',
              },
              {
                icon: Users,
                title: 'Ride circles',
                desc: 'Find travelers heading to the same airport around the same time. Split the ride, save money.',
              },
              {
                icon: Shield,
                title: 'Trust built in',
                desc: 'Verified emails, community groups, and transparency about how recommendations are calculated.',
              },
            ].map((item) => (
              <div key={item.title} className="text-center sm:text-left">
                <div className="mx-auto sm:mx-0 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-500">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-ink-900">{item.title}</h3>
                <p className="mt-2 text-sm text-ink-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Airports */}
      <section className="bg-surface-secondary py-20 sm:py-28">
        <div className="gs-container">
          <h2 className="text-3xl font-bold text-ink-900 text-center">
            Works at major U.S. airports
          </h2>
          <div className="mt-12 flex flex-wrap justify-center gap-3">
            {['SEA', 'LAX', 'SFO', 'DEN', 'DFW', 'ORD', 'ATL', 'JFK', 'LGA', 'MCO'].map(
              (code) => (
                <Link
                  key={code}
                  href={`/airport/${code}`}
                  className="gs-chip hover:border-brand-500"
                >
                  {code}
                </Link>
              ),
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28">
        <div className="gs-container text-center">
          <h2 className="text-3xl font-bold text-ink-900 sm:text-4xl">
            Ready to stop stressing about airport timing?
          </h2>
          <p className="mt-4 text-lg text-ink-600">
            It takes 2 minutes. No account required to get your first recommendation.
          </p>
          <Link href="/trip/new" className="gs-btn-primary mt-8 gap-2">
            Plan your trip
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ink-100 bg-surface-secondary py-12">
        <div className="gs-container flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="text-sm font-semibold text-ink-900">GateShare</div>
          <div className="flex gap-6 text-sm text-ink-500">
            <Link href="/trip/new" className="hover:text-ink-900 transition-colors">Plan trip</Link>
            <Link href="/circles" className="hover:text-ink-900 transition-colors">Ride circles</Link>
            <Link href="/styleguide" className="hover:text-ink-900 transition-colors">Styleguide</Link>
          </div>
          <div className="text-xs text-ink-400">&copy; 2026 GateShare</div>
        </div>
      </footer>
    </div>
  );
}
