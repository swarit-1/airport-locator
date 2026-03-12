'use client';

interface AirlineLogoProps {
  iata: string;
  className?: string;
}

export function AirlineLogo({ iata, className }: AirlineLogoProps) {
  if (iata === 'AA') {
    return (
      <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
        <path d="M9 28 23 13h6L15 28Z" fill="#2454C5" />
        <path d="M20 34 34 19h6L26 34Z" fill="#D94545" />
        <path d="M7 35h21l-3 4H4Z" fill="#173B87" />
      </svg>
    );
  }

  if (iata === 'DL') {
    return (
      <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
        <path d="M24 7 39 35H9Z" fill="#C63B3B" />
        <path d="M24 16 32 30H16Z" fill="#173B87" />
      </svg>
    );
  }

  if (iata === 'UA') {
    return (
      <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
        <circle cx="24" cy="24" r="17" fill="none" stroke="#173B87" strokeWidth="2.5" />
        <path d="M12 20c6 3 18 3 24 0" fill="none" stroke="#173B87" strokeWidth="2.5" />
        <path d="M14 27c5 2 15 2 20 0" fill="none" stroke="#173B87" strokeWidth="2.5" />
        <path d="M24 8v32" fill="none" stroke="#173B87" strokeWidth="2.5" />
      </svg>
    );
  }

  if (iata === 'WN') {
    return (
      <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
        <path d="M14 16c2-5 10-7 14-2l2 2-6 7-6-5c-2-1-3-1-4-2Z" fill="#D94545" />
        <path d="M23 12c4-3 9-1 11 4l1 3-8 5-5-7Z" fill="#F2A230" />
        <path d="M18 22 31 14c4 5 2 13-5 15-4 1-8-1-8-7Z" fill="#2454C5" />
      </svg>
    );
  }

  return (
    <div className={className}>
      <div className="flex h-full w-full items-center justify-center rounded-full bg-black/6 text-[0.7rem] font-bold text-ink-700">
        {iata}
      </div>
    </div>
  );
}
