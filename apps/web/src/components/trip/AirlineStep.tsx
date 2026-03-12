'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Search } from 'lucide-react';
import { StepShell } from './StepShell';
import type { AirlineRule } from '@/lib/repositories';

interface AirlineStepProps {
  airlines: AirlineRule[];
  selected: string;
  onSelect: (iata: string, name: string) => void;
}

const AIRLINE_TONES: Record<string, string> = {
  AA: 'bg-[#f5e8e4] text-[#8f3d24]',
  DL: 'bg-[#e8efff] text-[#234cb7]',
  UA: 'bg-[#e8ecf4] text-[#274168]',
  WN: 'bg-[#fbf0dc] text-[#9b5a08]',
};

export function AirlineStep({ airlines, selected, onSelect }: AirlineStepProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(
    () => airlines.filter((airline) =>
      airline.name.toLowerCase().includes(search.toLowerCase()) ||
      airline.iata_code.toLowerCase().includes(search.toLowerCase()),
    ),
    [airlines, search],
  );

  return (
    <StepShell
      title="Which airline are you travelling with?"
      subtitle="We start with the carrier because its bag cutoff, boarding cadence, and gate-close rules shape the whole leave-time recommendation."
      step={1}
    >
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-start">
        <div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              placeholder="Search Delta, United, Southwest..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="gs-input !h-14 !rounded-full !border-black/8 !bg-white/80 !pl-11 !shadow-none"
              autoFocus
            />
          </div>

          <div className="mt-6 overflow-hidden rounded-[2rem] border border-black/6 bg-white/78 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            {filtered.map((airline, index) => (
              <motion.button
                key={airline.iata_code}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.24, delay: index * 0.025 }}
                onClick={() => onSelect(airline.iata_code, airline.name)}
                className={`grid w-full gap-4 border-b border-black/6 px-5 py-4 text-left transition-colors last:border-b-0 sm:grid-cols-[6rem_minmax(0,1fr)_auto] sm:items-center ${
                  selected === airline.iata_code ? 'bg-brand-50/70' : 'hover:bg-black/[0.02]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-11 min-w-11 items-center justify-center rounded-full text-sm font-bold ${AIRLINE_TONES[airline.iata_code] ?? 'bg-black/5 text-ink-700'}`}>
                    {airline.iata_code}
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-400 sm:hidden">
                    Airline
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="text-lg font-semibold tracking-tight text-ink-900">
                    {airline.name}
                  </div>
                  <div className="mt-1 text-sm text-ink-500">
                    Live flight lookup when available. Manual fallback if not.
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm font-semibold text-ink-500">
                  <span>{selected === airline.iata_code ? 'Selected' : 'Choose'}</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </motion.button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="mt-6 rounded-[1.75rem] border border-dashed border-black/10 px-5 py-8 text-center text-sm text-ink-500">
              No airline matched “{search}”. Try the carrier name or two-letter IATA code.
            </div>
          ) : null}
        </div>

        <div className="rounded-[2rem] border border-black/6 bg-white/72 p-6">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
            Why this step exists
          </div>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-ink-600">
            <p>
              Airline policy is the first hard constraint. Checked bags and gate-close times move the entire airport timeline earlier.
            </p>
            <p>
              After you pick the carrier, GateShare can try to resolve the flight number and prefill the rest of the trip.
            </p>
          </div>
        </div>
      </div>
    </StepShell>
  );
}
