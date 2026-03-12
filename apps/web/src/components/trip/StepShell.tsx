'use client';

import { ChevronLeft } from 'lucide-react';

interface StepShellProps {
  title: string;
  subtitle?: string;
  step?: number;
  totalSteps?: number;
  onBack?: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function StepShell({
  title,
  subtitle,
  step,
  totalSteps = 4,
  onBack,
  children,
  footer,
}: StepShellProps) {
  return (
    <div className="min-h-dvh flex flex-col bg-surface-primary">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-surface-primary/80 backdrop-blur-md border-b border-ink-100">
        <div className="gs-container flex items-center gap-3 py-3">
          {onBack && (
            <button
              onClick={onBack}
              className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-surface-secondary transition-colors -ml-2"
              aria-label="Go back"
            >
              <ChevronLeft className="h-5 w-5 text-ink-600" />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-ink-400">GateShare</div>
          </div>
          {step && (
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i < step ? 'w-6 bg-brand-500' : i === step ? 'w-6 bg-brand-300' : 'w-1.5 bg-ink-200'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 gs-container py-8 sm:py-12">
        <h1 className="text-2xl sm:text-3xl font-bold text-ink-900 tracking-tight text-balance">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-base text-ink-500 max-w-lg">{subtitle}</p>
        )}
        <div className="mt-8">{children}</div>
      </main>

      {/* Footer */}
      {footer && (
        <footer className="sticky bottom-0 bg-surface-primary/80 backdrop-blur-md border-t border-ink-100">
          <div className="gs-container py-4">{footer}</div>
        </footer>
      )}
    </div>
  );
}
