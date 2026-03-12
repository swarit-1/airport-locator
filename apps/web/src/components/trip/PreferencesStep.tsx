'use client';

import { Car, UserCheck, ParkingCircle, Train, Shield, Gauge, Zap, Loader2 } from 'lucide-react';
import { StepShell } from './StepShell';

interface PreferencesStepProps {
  form: {
    ride_mode: string;
    risk_profile: string;
  };
  onUpdate: (updates: Record<string, unknown>) => void;
  onCompute: () => void;
  onBack: () => void;
  computing: boolean;
}

const RIDE_MODES = [
  { value: 'rideshare', label: 'Rideshare', desc: 'Uber, Lyft, etc.', icon: Car },
  { value: 'friend_dropoff', label: 'Friend dropoff', desc: 'Someone is driving you', icon: UserCheck },
  { value: 'self_drive', label: 'Self-drive', desc: 'Driving + parking', icon: ParkingCircle },
  { value: 'transit', label: 'Transit', desc: 'Bus, train, light rail', icon: Train },
];

const RISK_PROFILES = [
  { value: 'conservative', label: 'Play it safe', desc: 'Extra buffer. Arrive with time to spare.', icon: Shield },
  { value: 'balanced', label: 'Balanced', desc: 'Comfortable margin without too much waiting.', icon: Gauge },
  { value: 'aggressive', label: 'Cut it close', desc: 'Minimal buffer. You know what you\'re doing.', icon: Zap },
];

export function PreferencesStep({ form, onUpdate, onCompute, onBack, computing }: PreferencesStepProps) {
  return (
    <StepShell
      title="How are you getting there?"
      subtitle="Last step. This affects your timing calculation."
      step={4}
      onBack={onBack}
      footer={
        <button
          onClick={onCompute}
          disabled={computing}
          className="gs-btn-primary w-full sm:w-auto gap-2"
        >
          {computing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Calculating...
            </>
          ) : (
            'Get my leave time'
          )}
        </button>
      }
    >
      <div className="space-y-10 max-w-lg">
        {/* Ride mode */}
        <div>
          <h3 className="text-base font-semibold text-ink-900 mb-4">Getting to the airport</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {RIDE_MODES.map((mode) => (
              <button
                key={mode.value}
                onClick={() => onUpdate({ ride_mode: mode.value })}
                className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all duration-150 ${
                  form.ride_mode === mode.value
                    ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-500/20'
                    : 'border-ink-100 hover:border-ink-200 hover:shadow-sm'
                }`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  form.ride_mode === mode.value ? 'bg-brand-100 text-brand-600' : 'bg-surface-secondary text-ink-500'
                }`}>
                  <mode.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-ink-900">{mode.label}</div>
                  <div className="text-xs text-ink-500">{mode.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Risk profile */}
        <div>
          <h3 className="text-base font-semibold text-ink-900 mb-1">Your comfort level</h3>
          <p className="text-sm text-ink-500 mb-4">
            This adjusts how much buffer time we add.
          </p>
          <div className="space-y-3">
            {RISK_PROFILES.map((profile) => (
              <button
                key={profile.value}
                onClick={() => onUpdate({ risk_profile: profile.value })}
                className={`flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all duration-150 ${
                  form.risk_profile === profile.value
                    ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-500/20'
                    : 'border-ink-100 hover:border-ink-200 hover:shadow-sm'
                }`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  form.risk_profile === profile.value ? 'bg-brand-100 text-brand-600' : 'bg-surface-secondary text-ink-500'
                }`}>
                  <profile.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-ink-900">{profile.label}</div>
                  <div className="text-xs text-ink-500">{profile.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </StepShell>
  );
}
