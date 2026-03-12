'use client';

import { Car, Gauge, Loader2, ParkingCircle, Shield, Train, UserCheck, Zap } from 'lucide-react';
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

const rideModes = [
  { value: 'rideshare', label: 'Rideshare', desc: 'Pickup uncertainty matters most here.', icon: Car },
  { value: 'friend_dropoff', label: 'Friend dropoff', desc: 'Simpler curbside handoff.', icon: UserCheck },
  { value: 'self_drive', label: 'Self-drive', desc: 'Parking adds friction before the terminal.', icon: ParkingCircle },
  { value: 'transit', label: 'Transit', desc: 'Assume less pickup variance, more schedule dependency.', icon: Train },
];

const riskProfiles = [
  { value: 'conservative', label: 'Play it safe', desc: 'More breathing room before boarding.', icon: Shield },
  { value: 'balanced', label: 'Balanced', desc: 'A practical margin without wasting the whole morning.', icon: Gauge },
  { value: 'aggressive', label: 'Cut it close', desc: 'Minimal buffer. GateShare still protects hard constraints first.', icon: Zap },
];

export function PreferencesStep({ form, onUpdate, onCompute, onBack, computing }: PreferencesStepProps) {
  return (
    <StepShell
      title="Choose the ride context and your comfort level."
      subtitle="These are the final dials. Ride mode affects pickup uncertainty, and risk profile changes how much buffer we add after the hard airport constraints are set."
      step={4}
      onBack={onBack}
      footer={
        <button
          onClick={onCompute}
          disabled={computing}
          className="gs-btn-primary w-full gap-2 sm:w-auto"
        >
          {computing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Building your timing
            </>
          ) : (
            'Get my leave time'
          )}
        </button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="space-y-6">
          <section className="rounded-[2rem] border border-black/6 bg-white/78 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
              Ride mode
            </div>
            <div className="mt-5 space-y-3">
              {rideModes.map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => onUpdate({ ride_mode: mode.value })}
                  className={`flex w-full items-start justify-between gap-4 rounded-[1.75rem] px-4 py-4 text-left transition-colors ${
                    form.ride_mode === mode.value ? 'bg-brand-50 text-ink-900' : 'bg-[#f4f0e8] text-ink-800 hover:bg-[#ebe4d7]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-full ${form.ride_mode === mode.value ? 'bg-white text-brand-700' : 'bg-white/80 text-ink-600'}`}>
                      <mode.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-base font-semibold tracking-tight">{mode.label}</div>
                      <div className="mt-1 text-sm leading-relaxed text-ink-500">{mode.desc}</div>
                    </div>
                  </div>
                  <span className="pt-1 text-xs font-semibold uppercase tracking-[0.16em] text-ink-400">
                    {form.ride_mode === mode.value ? 'Active' : 'Choose'}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-black/6 bg-white/78 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
              Risk profile
            </div>
            <div className="mt-5 space-y-3">
              {riskProfiles.map((profile) => (
                <button
                  key={profile.value}
                  onClick={() => onUpdate({ risk_profile: profile.value })}
                  className={`flex w-full items-start justify-between gap-4 rounded-[1.75rem] px-4 py-4 text-left transition-colors ${
                    form.risk_profile === profile.value ? 'bg-brand-50 text-ink-900' : 'bg-[#f4f0e8] text-ink-800 hover:bg-[#ebe4d7]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-full ${form.risk_profile === profile.value ? 'bg-white text-brand-700' : 'bg-white/80 text-ink-600'}`}>
                      <profile.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-base font-semibold tracking-tight">{profile.label}</div>
                      <div className="mt-1 text-sm leading-relaxed text-ink-500">{profile.desc}</div>
                    </div>
                  </div>
                  <span className="pt-1 text-xs font-semibold uppercase tracking-[0.16em] text-ink-400">
                    {form.risk_profile === profile.value ? 'Active' : 'Choose'}
                  </span>
                </button>
              ))}
            </div>
          </section>
        </div>

        <aside className="rounded-[2rem] border border-black/6 bg-[#eef3ff] p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
            Recommendation policy
          </div>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-ink-600">
            <p>
              GateShare always protects hard constraints first: bag cutoff, security entry, and gate arrival.
            </p>
            <p>
              Your risk profile changes the softer buffer around those milestones. It does not ignore airline or airport rules.
            </p>
          </div>
        </aside>
      </div>
    </StepShell>
  );
}
