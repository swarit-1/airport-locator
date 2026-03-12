'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, Plane, Flag, Shield } from 'lucide-react';
import { getAdminRulesRepo, getReportRepo } from '@/lib/repositories';
import { useHydrated } from '@/hooks/use-hydrated';

const adminLinks = [
  { href: '/admin/airports', label: 'Airport Rules', desc: 'Edit walking times, security estimates, and bag drop rules', icon: Building2, count: 0 },
  { href: '/admin/airlines', label: 'Airline Policies', desc: 'Edit bag cutoffs, boarding times, and gate close rules', icon: Plane, count: 0 },
  { href: '/admin/reports', label: 'Reports & Moderation', desc: 'Review user reports and moderate content', icon: Flag, count: 0 },
];

export default function AdminPage() {
  const hydrated = useHydrated();
  const [counts, setCounts] = useState({
    airports: 0,
    airlines: 0,
    reports: 0,
  });

  useEffect(() => {
    if (!hydrated) return;

    const rulesRepo = getAdminRulesRepo();
    const reportRepo = getReportRepo();
    setCounts({
      airports: rulesRepo.getAirports().length,
      airlines: rulesRepo.getAirlines().length,
      reports: reportRepo.getAll().filter((report) => report.status === 'pending').length,
    });
  }, [hydrated]);

  if (!hydrated) {
    return <div className="min-h-dvh bg-surface-secondary" />;
  }

  return (
    <div className="min-h-dvh bg-surface-secondary">
      <header className="border-b border-ink-100 bg-surface-primary">
        <div className="gs-container flex items-center gap-3 py-4">
          <Shield className="h-5 w-5 text-brand-500" />
          <div>
            <h1 className="text-xl font-bold text-ink-900">Admin</h1>
            <p className="text-sm text-ink-500">GateShare operations</p>
          </div>
          <div className="flex-1" />
          <Link href="/" className="text-sm text-ink-500 hover:text-ink-700 transition-colors">
            Back to app
          </Link>
        </div>
      </header>

      <div className="gs-container py-8">
        <div className="grid gap-4 sm:grid-cols-2">
          {adminLinks.map((link) => {
            const count =
              link.href === '/admin/airports' ? counts.airports :
              link.href === '/admin/airlines' ? counts.airlines :
              link.href === '/admin/reports' ? counts.reports :
              link.count;

            return (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-start gap-4 rounded-xl border border-ink-200 bg-surface-primary p-5 hover:border-ink-300 hover:shadow-sm transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-500 shrink-0">
                <link.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-ink-900">{link.label}</h2>
                  {count ? (
                    <span className="gs-badge bg-ink-100 text-ink-600">{count}</span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-ink-500">{link.desc}</p>
              </div>
            </Link>
          );})}
        </div>
      </div>
    </div>
  );
}
