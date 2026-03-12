import Link from 'next/link';
import { ArrowRight, Clock3, MapPin, ShieldCheck, Users } from 'lucide-react';

const airportCodes = ['SEA', 'LAX', 'SFO', 'DEN', 'DFW', 'ORD', 'ATL', 'JFK', 'LGA', 'MCO'];

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-[#f4f0e8] text-ink-900">
      <header className="border-b border-black/6 bg-brand-500 text-white">
        <nav className="gs-container flex items-center justify-between py-5">
          <div>
            <div className="text-xl font-semibold tracking-tight">GateShare</div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-[0.24em] text-white/65">
              never miss a flight again
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-white/78 transition-colors hover:text-white">
              Sign in
            </Link>
            <Link href="/trip/new" className="gs-btn-primary !rounded-full !bg-white !px-5 !py-2.5 !text-brand-700 hover:!bg-white/92">
              Start a trip
            </Link>
          </div>
        </nav>

        <div className="gs-container grid gap-12 py-16 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:py-24">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-white/62">
              Airport timing and shared ride coordination
            </p>
            <h1 className="mt-6 max-w-4xl text-[clamp(3.25rem,9vw,6.6rem)] font-semibold leading-[0.92] tracking-[-0.055em] text-white">
              never miss a flight again
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-white/82 sm:text-xl">
              GateShare turns traffic, airport rules, wait-time assumptions, and your comfort level into one clear leave time. Then it shows ride circles only if they still protect the timing.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/trip/new" className="gs-btn-primary gap-2 !rounded-full !bg-white !text-brand-700 hover:!bg-white/92">
                Get my leave time
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/circles" className="gs-btn-secondary !rounded-full !border-white/25 !bg-transparent !text-white hover:!bg-white/10">
                Browse ride circles
              </Link>
            </div>
          </div>

          <div className="grid gap-4 self-end">
            <div className="rounded-[2rem] border border-white/14 bg-white/10 p-5 backdrop-blur-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/65">
                Recommendation preview
              </div>
              <div className="mt-6">
                <div className="text-sm text-white/70">Leave by</div>
                <div className="mt-2 text-5xl font-semibold tracking-[-0.04em] text-white">11:15 AM</div>
                <div className="mt-2 text-sm text-white/75">SEA · Delta 1286 · balanced profile</div>
              </div>
              <div className="mt-6 space-y-3">
                {[
                  ['Traffic from Capitol Hill', '34 min'],
                  ['Security estimate', '18 min'],
                  ['Walk to gate', '11 min'],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between border-t border-white/12 pt-3 text-sm">
                    <span className="text-white/76">{label}</span>
                    <span className="font-semibold text-white">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] bg-white px-5 py-5 text-ink-900 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
                Ride circle preview
              </div>
              <div className="mt-4 flex items-start justify-between gap-4">
                <div>
                  <div className="text-lg font-semibold tracking-tight">Downtown Seattle to SEA</div>
                  <div className="mt-1 text-sm text-ink-500">3 riders · save about $14 each · detour under 8 min</div>
                </div>
                <Users className="mt-1 h-5 w-5 text-brand-600" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="py-20">
          <div className="gs-container grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">
                Why this is trustworthy
              </p>
              <h2 className="mt-4 max-w-xl text-4xl font-semibold leading-[1.02] tracking-[-0.04em] text-ink-900">
                It shows the reasoning, not just a time.
              </h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="border-t border-black/8 pt-4">
                <Clock3 className="h-5 w-5 text-brand-600" />
                <h3 className="mt-4 text-lg font-semibold tracking-tight">One leave time, plus a window</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">
                  The recommendation gives a single leave time, a reasonable window, and milestone timestamps you can actually act on.
                </p>
              </div>
              <div className="border-t border-black/8 pt-4">
                <ShieldCheck className="h-5 w-5 text-brand-600" />
                <h3 className="mt-4 text-lg font-semibold tracking-tight">Safety before savings</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">
                  Ride circles only make sense if each traveler still preserves a safe airport threshold after the detour.
                </p>
              </div>
              <div className="border-t border-black/8 pt-4">
                <MapPin className="h-5 w-5 text-brand-600" />
                <h3 className="mt-4 text-lg font-semibold tracking-tight">Airport-specific assumptions</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">
                  Walking time, security assumptions, and bag-check timing are data-driven and editable in admin, not scattered constants.
                </p>
              </div>
              <div className="border-t border-black/8 pt-4">
                <Users className="h-5 w-5 text-brand-600" />
                <h3 className="mt-4 text-lg font-semibold tracking-tight">Circles, not gig driving</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">
                  GateShare coordinates compatible travelers. It does not create a peer-driver marketplace or handle payments in v1.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-black/6 bg-white py-20">
          <div className="gs-container grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">
                Product preview
              </p>
              <h2 className="mt-4 text-4xl font-semibold leading-[1.02] tracking-[-0.04em] text-ink-900">
                The product is designed to feel decisive, not busy.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-600">
                Start with the flight. Resolve what you can. Explain the recommendation in plain language. Only then invite a shared ride if it still fits.
              </p>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-black/6 bg-[#f8f5ee]">
              <div className="grid gap-0 border-b border-black/6 px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-ink-400 sm:grid-cols-[1.2fr_0.85fr_0.95fr]">
                <span>Flow</span>
                <span>Output</span>
                <span>Intent</span>
              </div>
              {[
                ['Airline + flight', 'Bag rules, gate timing, airport context', 'Resolve hard timing constraints first'],
                ['Travel details', 'Origin, bags, group size, access needs', 'Adjust the path through the airport'],
                ['Recommendation', 'Leave time, window, milestones, why this time', 'Make the timing legible and trustworthy'],
                ['Ride circles', 'Eligible shared rides only', 'Reduce cost only when the timing still works'],
              ].map(([label, output, intent]) => (
                <div key={label} className="grid gap-3 border-b border-black/6 px-5 py-4 last:border-b-0 sm:grid-cols-[1.2fr_0.85fr_0.95fr]">
                  <div className="text-base font-semibold tracking-tight text-ink-900">{label}</div>
                  <div className="text-sm leading-relaxed text-ink-600">{output}</div>
                  <div className="text-sm leading-relaxed text-ink-500">{intent}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="gs-container grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:gap-16">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">
                Coverage and data posture
              </p>
              <h2 className="mt-4 text-4xl font-semibold leading-[1.02] tracking-[-0.04em] text-ink-900">
                U.S.-only for launch, with inspectable assumptions.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-600">
                The MVP runs end to end in local demo mode. When provider keys are added, the same flow can switch to live flight lookup and traffic-backed estimates without changing the product structure.
              </p>
            </div>
            <div className="flex flex-wrap content-start gap-3">
              {airportCodes.map((code) => (
                <Link
                  key={code}
                  href={`/airport/${code}`}
                  className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-semibold text-ink-800 transition-colors hover:border-brand-500 hover:text-brand-700"
                >
                  {code}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-20">
          <div className="gs-container">
            <div className="rounded-[2.5rem] bg-ink-900 px-6 py-12 text-white sm:px-10">
              <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/55">
                    Start with a real trip
                  </p>
                  <h2 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.02] tracking-[-0.04em]">
                    Keep the trip simple. Make the timing legible. Share the ride only if it still makes sense.
                  </h2>
                </div>
                <Link href="/trip/new" className="gs-btn-primary gap-2 !rounded-full !bg-white !text-ink-900 hover:!bg-white/92">
                  Plan your trip
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-black/6 py-10">
        <div className="gs-container flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-base font-semibold tracking-tight text-ink-900">GateShare</div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">
              never miss a flight again
            </div>
          </div>
          <div className="flex gap-6 text-sm text-ink-500">
            <Link href="/trip/new" className="transition-colors hover:text-ink-900">Plan trip</Link>
            <Link href="/circles" className="transition-colors hover:text-ink-900">Ride circles</Link>
            <Link href="/styleguide" className="transition-colors hover:text-ink-900">Styleguide</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
