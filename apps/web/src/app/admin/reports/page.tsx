'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Flag, CheckCircle2, XCircle, Eye } from 'lucide-react';

type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';

interface DemoReport {
  id: string;
  reporter: string;
  reported_user: string | null;
  circle_id?: string;
  reason: string;
  details: string;
  status: ReportStatus;
  created_at: string;
}

const demoReports: DemoReport[] = [
  {
    id: '1',
    reporter: 'alice@demo.gateshare.app',
    reported_user: 'suspicious@example.com',
    reason: 'spam',
    details: 'User was posting spam messages in the circle chat.',
    status: 'pending' as const,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '2',
    reporter: 'bob@demo.gateshare.app',
    reported_user: null,
    circle_id: 'circle-3',
    reason: 'inappropriate',
    details: 'Circle description contains inappropriate language.',
    status: 'pending' as const,
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
];

export default function AdminReportsPage() {
  const [reports, setReports] = useState(demoReports);

  const updateStatus = (id: string, status: 'resolved' | 'dismissed') => {
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  return (
    <div className="min-h-dvh bg-surface-secondary">
      <header className="border-b border-ink-100 bg-surface-primary">
        <div className="gs-container flex items-center gap-3 py-3">
          <Link href="/admin" className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-surface-secondary transition-colors -ml-2">
            <ChevronLeft className="h-5 w-5 text-ink-600" />
          </Link>
          <h1 className="text-lg font-bold text-ink-900">Reports &amp; Moderation</h1>
          <span className="gs-badge gs-badge-warning">
            {reports.filter((r) => r.status === 'pending').length} pending
          </span>
        </div>
      </header>

      <div className="gs-container py-6">
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="rounded-xl border border-ink-200 bg-surface-primary p-5">
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  report.status === 'pending' ? 'bg-warning-50' : report.status === 'resolved' ? 'bg-success-50' : 'bg-ink-50'
                }`}>
                  <Flag className={`h-5 w-5 ${
                    report.status === 'pending' ? 'text-warning-500' : report.status === 'resolved' ? 'text-success-500' : 'text-ink-400'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-ink-900 capitalize">{report.reason}</span>
                    <span className={`gs-badge ${
                      report.status === 'pending' ? 'gs-badge-warning' :
                      report.status === 'resolved' ? 'gs-badge-success' :
                      'bg-ink-100 text-ink-500'
                    }`}>
                      {report.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-ink-600">{report.details}</p>
                  <div className="mt-2 text-xs text-ink-400 space-y-0.5">
                    <p>Reported by: {report.reporter}</p>
                    {report.reported_user && <p>Reported user: {report.reported_user}</p>}
                    <p>Filed: {new Date(report.created_at).toLocaleString()}</p>
                  </div>
                  {report.status === 'pending' && (
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => updateStatus(report.id, 'resolved')}
                        className="inline-flex items-center gap-1 rounded-lg bg-success-50 px-3 py-1.5 text-xs font-semibold text-success-500 hover:bg-success-100 transition-colors"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Resolve
                      </button>
                      <button
                        onClick={() => updateStatus(report.id, 'dismissed')}
                        className="inline-flex items-center gap-1 rounded-lg bg-ink-50 px-3 py-1.5 text-xs font-semibold text-ink-500 hover:bg-ink-100 transition-colors"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
