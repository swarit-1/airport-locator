'use client';

import { Luggage, Users, Baby, Accessibility } from 'lucide-react';
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
      title="Travel details"
      subtitle="These help us fine-tune your timing."
      step={3}
      onBack={onBack}
      footer={
        <button onClick={onNext} className="gs-btn-primary w-full sm:w-auto">
          Next: Preferences
        </button>
      }
    >
      <div className="space-y-8 max-w-lg">
        {/* Bags */}
        <div>
          <h3 className="text-base font-semibold text-ink-900 flex items-center gap-2">
            <Luggage className="h-5 w-5 text-ink-500" />
            Checked bags
          </h3>
          <div className="mt-3 flex gap-3">
            <button
              onClick={() => onUpdate({ has_checked_bags: false, bag_count: 0 })}
              className={`gs-chip flex-1 justify-center ${!form.has_checked_bags ? 'gs-chip-active' : ''}`}
            >
              Carry-on only
            </button>
            <button
              onClick={() => onUpdate({ has_checked_bags: true, bag_count: Math.max(1, form.bag_count) })}
              className={`gs-chip flex-1 justify-center ${form.has_checked_bags ? 'gs-chip-active' : ''}`}
            >
              Checking bags
            </button>
          </div>
          {form.has_checked_bags && (
            <div className="mt-3">
              <label htmlFor="bag_count" className="gs-label">How many?</label>
              <div className="flex items-center gap-3">
                {[1, 2, 3, 4].map((n) => (
                  <button
                    key={n}
                    onClick={() => onUpdate({ bag_count: n })}
                    className={`h-11 w-11 rounded-lg border-2 text-sm font-semibold transition-all ${
                      form.bag_count === n
                        ? 'border-brand-500 bg-brand-50 text-brand-600'
                        : 'border-ink-200 text-ink-600 hover:border-ink-300'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Party size */}
        <div>
          <h3 className="text-base font-semibold text-ink-900 flex items-center gap-2">
            <Users className="h-5 w-5 text-ink-500" />
            Party size
          </h3>
          <div className="mt-3 flex items-center gap-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => onUpdate({ party_size: n })}
                className={`h-11 w-11 rounded-lg border-2 text-sm font-semibold transition-all ${
                  form.party_size === n
                    ? 'border-brand-500 bg-brand-50 text-brand-600'
                    : 'border-ink-200 text-ink-600 hover:border-ink-300'
                }`}
              >
                {n}
              </button>
            ))}
            <span className="text-sm text-ink-400">
              {form.party_size === 1 ? 'Just you' : `${form.party_size} travelers`}
            </span>
          </div>
        </div>

        {/* Trusted Traveler */}
        <div>
          <h3 className="text-base font-semibold text-ink-900 mb-3">Trusted traveler programs</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`flex h-6 w-6 items-center justify-center rounded-md border-2 transition-all ${
                form.has_tsa_precheck ? 'border-brand-500 bg-brand-500' : 'border-ink-300 group-hover:border-ink-400'
              }`}>
                {form.has_tsa_precheck && (
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <input
                type="checkbox"
                checked={form.has_tsa_precheck}
                onChange={(e) => onUpdate({ has_tsa_precheck: e.target.checked })}
                className="sr-only"
              />
              <div>
                <span className="text-sm font-medium text-ink-900">TSA PreCheck</span>
                <span className="block text-xs text-ink-400">Faster security screening</span>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`flex h-6 w-6 items-center justify-center rounded-md border-2 transition-all ${
                form.has_clear ? 'border-brand-500 bg-brand-500' : 'border-ink-300 group-hover:border-ink-400'
              }`}>
                {form.has_clear && (
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <input
                type="checkbox"
                checked={form.has_clear}
                onChange={(e) => onUpdate({ has_clear: e.target.checked })}
                className="sr-only"
              />
              <div>
                <span className="text-sm font-medium text-ink-900">CLEAR</span>
                <span className="block text-xs text-ink-400">Skip the ID check line</span>
              </div>
            </label>
          </div>
        </div>

        {/* Kids and accessibility */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className={`flex h-6 w-6 items-center justify-center rounded-md border-2 transition-all ${
              form.traveling_with_kids ? 'border-brand-500 bg-brand-500' : 'border-ink-300 group-hover:border-ink-400'
            }`}>
              {form.traveling_with_kids && (
                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <input
              type="checkbox"
              checked={form.traveling_with_kids}
              onChange={(e) => onUpdate({ traveling_with_kids: e.target.checked })}
              className="sr-only"
            />
            <div className="flex items-center gap-2">
              <Baby className="h-4 w-4 text-ink-400" />
              <span className="text-sm font-medium text-ink-900">Traveling with kids</span>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className={`flex h-6 w-6 items-center justify-center rounded-md border-2 transition-all ${
              form.accessibility_needs ? 'border-brand-500 bg-brand-500' : 'border-ink-300 group-hover:border-ink-400'
            }`}>
              {form.accessibility_needs && (
                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <input
              type="checkbox"
              checked={form.accessibility_needs}
              onChange={(e) => onUpdate({ accessibility_needs: e.target.checked })}
              className="sr-only"
            />
            <div className="flex items-center gap-2">
              <Accessibility className="h-4 w-4 text-ink-400" />
              <span className="text-sm font-medium text-ink-900">Accessibility needs</span>
            </div>
          </label>
        </div>
      </div>
    </StepShell>
  );
}
