'use client';

import { Accessibility, Baby, Luggage, ShieldCheck, Users } from 'lucide-react';
import { StepShell } from './StepShell';

interface DetailsStepProps {
  form: {
    has_checked_bags: boolean;
    bag_count: number;
    party_size: number;
    traveling_with_kids: boolean;
    accessibility_needs: boolean;
    has_tsa_precheck: boolean;
    has_clear: boolean;
  };
  onUpdate: (updates: Record<string, unknown>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function DetailsStep({ form, onUpdate, onNext, onBack }: DetailsStepProps) {
  return (
    <StepShell
      title="Tell us what makes this trip slower or faster."
      subtitle="This is where the airport path becomes personal: checked bags, how many people are with you, and whether you move through security differently."
      step={3}
      onBack={onBack}
      footer={
        <button onClick={onNext} className="gs-btn-primary w-full sm:w-auto">
          Next: Preferences
        </button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="space-y-6">
          <section className="rounded-[2rem] border border-black/6 bg-white/78 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eef3ff] text-brand-700">
                <Luggage className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold tracking-tight text-ink-900">Checked bags</h3>
                <p className="text-sm text-ink-500">Bag check adds both counter time and the walk back into security.</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                onClick={() => onUpdate({ has_checked_bags: false, bag_count: 0 })}
                className={`gs-chip ${!form.has_checked_bags ? 'gs-chip-active' : ''}`}
              >
                Carry-on only
              </button>
              <button
                onClick={() => onUpdate({ has_checked_bags: true, bag_count: Math.max(1, form.bag_count) })}
                className={`gs-chip ${form.has_checked_bags ? 'gs-chip-active' : ''}`}
              >
                I&apos;m checking bags
              </button>
            </div>
            {form.has_checked_bags ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {[1, 2, 3, 4].map((count) => (
                  <button
                    key={count}
                    onClick={() => onUpdate({ bag_count: count })}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                      form.bag_count === count
                        ? 'bg-brand-600 text-white'
                        : 'bg-[#f4f0e8] text-ink-700 hover:bg-[#ebe4d7]'
                    }`}
                  >
                    {count} bag{count > 1 ? 's' : ''}
                  </button>
                ))}
              </div>
            ) : null}
          </section>

          <section className="rounded-[2rem] border border-black/6 bg-white/78 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eef3ff] text-brand-700">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold tracking-tight text-ink-900">Party size</h3>
                <p className="text-sm text-ink-500">Groups move differently than solo travelers, especially curbside and through security.</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((count) => (
                <button
                  key={count}
                  onClick={() => onUpdate({ party_size: count })}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    form.party_size === count
                      ? 'bg-brand-600 text-white'
                      : 'bg-[#f4f0e8] text-ink-700 hover:bg-[#ebe4d7]'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-black/6 bg-white/78 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eef3ff] text-brand-700">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold tracking-tight text-ink-900">Security access</h3>
                <p className="text-sm text-ink-500">Trusted-traveler programs change the wait-time path, not just the confidence level.</p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              <button
                onClick={() => onUpdate({ has_tsa_precheck: !form.has_tsa_precheck })}
                className={`flex w-full items-center justify-between rounded-[1.5rem] px-4 py-3 text-left transition-colors ${
                  form.has_tsa_precheck ? 'bg-brand-50 text-brand-700' : 'bg-[#f4f0e8] text-ink-700 hover:bg-[#ebe4d7]'
                }`}
              >
                <span>
                  <span className="block text-sm font-semibold">TSA PreCheck</span>
                  <span className="block text-xs text-current/70">Use expedited screening if you have it.</span>
                </span>
                <span className="text-xs font-semibold uppercase tracking-[0.16em]">
                  {form.has_tsa_precheck ? 'On' : 'Off'}
                </span>
              </button>
              <button
                onClick={() => onUpdate({ has_clear: !form.has_clear })}
                className={`flex w-full items-center justify-between rounded-[1.5rem] px-4 py-3 text-left transition-colors ${
                  form.has_clear ? 'bg-brand-50 text-brand-700' : 'bg-[#f4f0e8] text-ink-700 hover:bg-[#ebe4d7]'
                }`}
              >
                <span>
                  <span className="block text-sm font-semibold">CLEAR</span>
                  <span className="block text-xs text-current/70">Use the identity shortcut if that is part of your airport path.</span>
                </span>
                <span className="text-xs font-semibold uppercase tracking-[0.16em]">
                  {form.has_clear ? 'On' : 'Off'}
                </span>
              </button>
            </div>
          </section>
        </div>

        <aside className="rounded-[2rem] border border-black/6 bg-[#eef3ff] p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
            Access needs
          </div>
          <div className="mt-5 space-y-3">
            <button
              onClick={() => onUpdate({ traveling_with_kids: !form.traveling_with_kids })}
              className={`flex w-full items-center gap-3 rounded-[1.5rem] px-4 py-3 text-left transition-colors ${
                form.traveling_with_kids ? 'bg-white text-ink-900' : 'bg-white/65 text-ink-700 hover:bg-white'
              }`}
            >
              <Baby className="h-4 w-4 text-brand-700" />
              <div>
                <div className="text-sm font-semibold">Traveling with kids</div>
                <div className="text-xs text-ink-500">Adds slower transitions between curb, security, and gate.</div>
              </div>
            </button>

            <button
              onClick={() => onUpdate({ accessibility_needs: !form.accessibility_needs })}
              className={`flex w-full items-center gap-3 rounded-[1.5rem] px-4 py-3 text-left transition-colors ${
                form.accessibility_needs ? 'bg-white text-ink-900' : 'bg-white/65 text-ink-700 hover:bg-white'
              }`}
            >
              <Accessibility className="h-4 w-4 text-brand-700" />
              <div>
                <div className="text-sm font-semibold">Accessibility needs</div>
                <div className="text-xs text-ink-500">Expands walking and transfer assumptions in the timeline.</div>
              </div>
            </button>
          </div>
        </aside>
      </div>
    </StepShell>
  );
}
