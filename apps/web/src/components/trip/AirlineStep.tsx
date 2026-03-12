'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plane, Search } from 'lucide-react';
import { StepShell } from './StepShell';
import type { DemoAirline } from '@/lib/demo-data';

interface AirlineStepProps {
  airlines: DemoAirline[];
  selected: string;
  onSelect: (iata: string, name: string) => void;
}

const AIRLINE_COLORS: Record<string, string> = {
  AA: 'bg-red-50 border-red-200 text-red-700',
  DL: 'bg-blue-50 border-blue-200 text-blue-700',
  UA: 'bg-indigo-50 border-indigo-200 text-indigo-700',
  WN: 'bg-amber-50 border-amber-200 text-amber-700',
};

const AIRLINE_ACCENT: Record<string, string> = {
  AA: 'bg-red-500',
  DL: 'bg-blue-600',
  UA: 'bg-indigo-600',
  WN: 'bg-amber-500',
};

export function AirlineStep({ airlines, selected, onSelect }: AirlineStepProps) {
  const [search, setSearch] = useState('');
  const filtered = airlines.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.iata_code.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <StepShell
      title="Which airline are you travelling with?"
      subtitle="We'll use this to look up bag rules and boarding times."
      step={1}
    >
      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-400" />
        <input
          type="text"
          placeholder="Search airlines..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="gs-input pl-12"
          autoFocus
        />
      </div>

      {/* Airline list */}
      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((airline, i) => (
          <motion.button
            key={airline.iata_code}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.25 }}
            onClick={() => onSelect(airline.iata_code, airline.name)}
            className={`group flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all duration-150
              ${
                selected === airline.iata_code
                  ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-500/20'
                  : 'border-ink-100 bg-surface-primary hover:border-ink-200 hover:shadow-sm'
              }
            `}
          >
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-lg border ${
                AIRLINE_COLORS[airline.iata_code] ?? 'bg-ink-50 border-ink-200 text-ink-600'
              }`}
            >
              <span className="text-sm font-bold">{airline.iata_code}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-ink-900">{airline.name}</div>
              <div className="flex items-center gap-2 mt-0.5">
                <div className={`h-1 w-6 rounded-full ${AIRLINE_ACCENT[airline.iata_code] ?? 'bg-ink-300'}`} />
                <span className="text-xs text-ink-400">{airline.iata_code}</span>
              </div>
            </div>
            <Plane className="h-5 w-5 text-ink-300 group-hover:text-ink-500 transition-colors" />
          </motion.button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-8 text-center">
          <p className="text-ink-500">No airlines found for &ldquo;{search}&rdquo;</p>
          <p className="mt-1 text-sm text-ink-400">Try a different search or select from the list above</p>
        </div>
      )}
    </StepShell>
  );
}
