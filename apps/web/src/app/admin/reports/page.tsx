'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Flag, CheckCircle2, XCircle } from 'lucide-react';
import { getReportRepo, type StoredReport } from '@/lib/repositories';
import { useHydrated } from '@/hooks/use-hydrated';

export default function AdminReportsPage() {
  const hydrated = useHydrated();
  const [reports, setReports] = useState<StoredReport[]>([]);

  useEffect(() => {
    if (!hydrated) return;

    const reportRepo = getReportRepo();
    setReports(reportRepo.getAll());
  }, [hydrated]);

  const updateStatus = (id: string, status: 'resolved' | 'dismissed') => {
    const reportRepo = getReportRepo();
    reportRepo.updateStatus(id, status);
    setReports(reportRepo.getAll());
  };

  const pendingCount = reports.filter((report) => report.status === 'pending').length;

  if (!hydrated) {
    return <div className="min-h-dvh bg-surface-secondary" />;
  }

  return (
    <div className="min-h-dvh bg-surface-secondary">
      <header className="border-b border-ink-100 bg-surface-primary">
        <div className="gs-container flex items-center gap-3 py-3">
          <Link href="/admin" className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-surface-secondary transition-colors -ml-2">
            <ChevronLeft className="h-5 w-5 text-ink-600" />
          </Link>
          <h1 className="text-lg font-bold text-ink-900">Reports and moderation</h1>
          <span className="gs-badge gs-badge-warning">{pendingCount} pending</span>
        </div>
      </header>

      <div className="gs-container py-6">
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="rounded-3xl border border-ink-200 bg-white p-5">
              <div className="flex items-start gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${report.status === 'pending' ? 'bg-warning-50' : report.status === 'resolved' ? 'bg-success-50' : 'bg-ink-50'}`}>
                  <Flag className={`h-5 w-5 ${report.status === 'pending' ? 'text-warning-500' : report.status === 'resolved' ? 'text-success-500' : 'text-ink-400'}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold capitalize text-ink-900">{report.reason}</span>
                    <span className={`gs-badge ${report.status === 'pending' ? 'gs-badge-warning' : report.status === 'resolved' ? 'gs-badge-success' : 'bg-ink-100 text-ink-500'}`}>{report.status}</span>
                  </div>
                  <p className="mt-2 text-sm text-ink-600">{report.details}</p>
                  <div className="mt-3 space-y-1 text-xs text-ink-400">
                    <p>Reporter: {report.reporter}</p>
                    {report.reported_user && <p>Reported user: {report.reported_user}</p>}
                    {report.circle_id && <p>Circle: {report.circle_id}</p>}
                    <p>Filed: {new Date(report.created_at).toLocaleString()}</p>
                  </div>
                  {report.status === 'pending' && (
                    <div className="mt-4 flex gap-2">
                      <button onClick={() => updateStatus(report.id, 'resolved')} className="inline-flex items-center gap-1 rounded-full bg-success-50 px-3 py-1.5 text-xs font-semibold text-success-500 hover:bg-success-100 transition-colors">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Resolve
                      </button>
                      <button onClick={() => updateStatus(report.id, 'dismissed')} className="inline-flex items-center gap-1 rounded-full bg-ink-100 px-3 py-1.5 text-xs font-semibold text-ink-600 hover:bg-ink-200 transition-colors">
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
