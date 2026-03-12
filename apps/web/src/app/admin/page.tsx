'use client';

import Link from 'next/link';
import { Building2, Plane, Activity, Flag, Shield } from 'lucide-react';

const adminLinks = [
  { href: '/admin/airports', label: 'Airport Rules', desc: 'Edit walking times, security estimates, and bag drop rules', icon: Building2, count: 10 },
  { href: '/admin/airlines', label: 'Airline Policies', desc: 'Edit bag cutoffs, boarding times, and gate close rules', icon: Plane, count: 4 },
  { href: '/admin/providers', label: 'Provider Status', desc: 'View data source freshness and configure priorities', icon: Activity },
  { href: '/admin/reports', label: 'Reports & Moderation', desc: 'Review user reports and moderate content', icon: Flag, count: 2 },
];

export default function AdminPage() {
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
          {adminLinks.map((link) => (
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
                  {link.count && (
                    <span className="gs-badge bg-ink-100 text-ink-600">{link.count}</span>
                  )}
                </div>
                <p className="mt-1 text-sm text-ink-500">{link.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
