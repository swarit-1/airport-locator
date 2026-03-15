'use client';

import { ChevronLeft } from 'lucide-react';

interface StepShellProps {
  title: string;
  subtitle?: string;
  step?: number;
  totalSteps?: number;
  onBack?: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const stepCopy: Record<number, { eyebrow: string; note: string }> = {
  1: {
    eyebrow: 'Airline rules first',
    note: 'Boarding, bag cutoffs, and gate-close assumptions should come from the carrier before anything else.',
  },
  2: {
    eyebrow: 'Resolve the flight',
    note: 'If live flight lookup is available, we fill airport, time, gate context, and keep manual override open.',
  },
  3: {
    eyebrow: 'Travel conditions',
    note: 'Bags, group size, kids, and accessibility all change the timing path through the airport.',
  },
  4: {
    eyebrow: 'Risk before idle time',
    note: 'Boarding prefers avoiding a missed flight first, then trims dead time with your risk profile.',
  },
};

export function StepShell({
  title,
  subtitle,
  step,
  totalSteps = 4,
  onBack,
  children,
  footer,
}: StepShellProps) {
  const currentStep = step ?? 1;
  const detail = stepCopy[currentStep] ?? stepCopy[1]!;

  return (
    <div className="min-h-dvh bg-[#f4f0e8] text-ink-900">
      <header className="sticky top-0 z-10 border-b border-black/6 bg-[#f4f0e8]/88 backdrop-blur-xl">
        <div className="gs-container flex items-center gap-3 py-4">
          {onBack ? (
            <button
              onClick={onBack}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-black/8 bg-white/70 transition-colors hover:bg-white"
              aria-label="Go back"
            >
              <ChevronLeft className="h-4 w-4 text-ink-700" />
            </button>
          ) : (
            <div className="flex h-10 items-center text-xs font-semibold uppercase tracking-[0.22em] text-ink-500">
              Boarding
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-500">
              Boarding
            </div>
          </div>
          {step ? (
            <div className="flex items-center gap-2">
              <span className="hidden text-xs font-semibold uppercase tracking-[0.18em] text-ink-400 sm:inline">
                Step {currentStep}
              </span>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalSteps }, (_, index) => (
                  <div
                    key={index}
                    className={`transition-all duration-300 ${
                      index + 1 < currentStep
                        ? 'h-1.5 w-8 rounded-full bg-brand-600'
                        : index + 1 === currentStep
                          ? 'h-1.5 w-10 rounded-full bg-brand-400'
                          : 'h-px w-8 bg-black/12'
                    }`}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </header>

      <main className="gs-container flex-1 py-8 sm:py-10 lg:py-14">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-16">
          <section className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">
              {detail.eyebrow}
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl sm:leading-[1.02]">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-600 sm:text-lg">
                {subtitle}
              </p>
            ) : null}
            <div className="mt-10">{children}</div>
          </section>

          <aside className="hidden lg:block">
            <div className="sticky top-28 rounded-[2rem] border border-black/6 bg-white/72 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">
                Progress
              </div>
              <div className="mt-5 space-y-4">
                {Array.from({ length: totalSteps }, (_, index) => {
                  const itemStep = index + 1;
                  const active = itemStep === currentStep;
                  const complete = itemStep < currentStep;

                  return (
                    <div key={itemStep} className="grid grid-cols-[auto_1fr] items-start gap-3">
                      <div
                        className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                          complete
                            ? 'bg-brand-600 text-white'
                            : active
                              ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-200'
                              : 'bg-black/4 text-ink-500'
                        }`}
                      >
                        {itemStep}
                      </div>
                      <div>
                        <div className={`text-sm font-semibold ${active || complete ? 'text-ink-900' : 'text-ink-500'}`}>
                          {stepCopy[itemStep]?.eyebrow ?? `Step ${itemStep}`}
                        </div>
                        {active ? (
                          <p className="mt-1 text-sm leading-relaxed text-ink-500">
                            {detail.note}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </main>

      {footer ? (
        <footer className="sticky bottom-0 z-10 border-t border-black/6 bg-[#f4f0e8]/92 backdrop-blur-xl">
          <div className="gs-container flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl text-sm leading-relaxed text-ink-500">
              Safety-first timing. If live data is unavailable, Boarding falls back gracefully and tells you when it did.
            </p>
            <div className="sm:min-w-[18rem] sm:justify-end">{footer}</div>
          </div>
        </footer>
      ) : null}
    </div>
  );
}
