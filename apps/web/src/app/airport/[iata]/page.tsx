import Link from 'next/link';
import { ArrowRight, Shield, MapPin } from 'lucide-react';
import { airportSeeds, airportProfileSeeds } from '@boarding/db';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  return airportSeeds.map((a) => ({ iata: a.iata_code }));
}

export function generateMetadata({ params }: { params: { iata: string } }) {
  const airport = airportSeeds.find((a) => a.iata_code === params.iata.toUpperCase());
  if (!airport) return {};
  return {
    title: `${airport.iata_code} Airport Timing — Boarding`,
    description: `Know exactly when to leave for ${airport.name}. Get personalized timing recommendations for ${airport.iata_code}.`,
  };
}

export default function AirportPage({ params }: { params: { iata: string } }) {
  const iata = params.iata.toUpperCase();
  const airport = airportSeeds.find((a) => a.iata_code === iata);
  if (!airport) notFound();

  const domesticProfile = airportProfileSeeds.find(
    (p) => p.iata_code === iata && p.flight_type === 'domestic',
  );
  const intlProfile = airportProfileSeeds.find(
    (p) => p.iata_code === iata && p.flight_type === 'international',
  );

  return (
    <div className="min-h-dvh">
      {/* Hero */}
      <div className="bg-brand-500 text-white">
        <div className="gs-container py-12 sm:py-20">
          <Link href="/" className="text-sm text-white/70 hover:text-white transition-colors">
            &larr; Boarding
          </Link>
          <h1 className="mt-4 text-3xl sm:text-5xl font-extrabold tracking-tight">
            {airport.iata_code}
          </h1>
          <p className="mt-2 text-xl text-white/80">{airport.name}</p>
          <p className="mt-1 text-base text-white/60">
            {airport.city}, {airport.state}
          </p>
          <Link href="/trip/new" className="gs-btn-primary !bg-white !text-brand-600 mt-8 gap-2">
            Plan your trip from {airport.iata_code}
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* Timing info */}
      <div className="gs-container py-12">
        <h2 className="text-2xl font-bold text-ink-900 mb-8">What to expect at {airport.iata_code}</h2>

        <div className="grid gap-8 sm:grid-cols-2">
          {/* Domestic */}
          {domesticProfile && (
            <div className="rounded-xl border border-ink-200 p-6">
              <h3 className="text-lg font-semibold text-ink-900 mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-brand-500" />
                Domestic flights
              </h3>
              <dl className="space-y-3">
                {[
                  { label: 'Curb to bag drop', value: `${domesticProfile.curb_to_bag_drop_minutes} min` },
                  { label: 'Bag drop to security', value: `${domesticProfile.bag_drop_to_security_minutes} min` },
                  { label: 'Security to farthest gate', value: `${domesticProfile.security_to_gate_minutes} min` },
                  { label: 'Average security wait', value: `${domesticProfile.avg_security_wait_minutes} min` },
                  { label: 'Peak security wait', value: `${domesticProfile.peak_security_wait_minutes} min` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <dt className="text-ink-600">{label}</dt>
                    <dd className="font-semibold text-ink-900">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* International */}
          {intlProfile && (
            <div className="rounded-xl border border-ink-200 p-6">
              <h3 className="text-lg font-semibold text-ink-900 mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-brand-500" />
                International flights
              </h3>
              <dl className="space-y-3">
                {[
                  { label: 'Curb to bag drop', value: `${intlProfile.curb_to_bag_drop_minutes} min` },
                  { label: 'Bag drop to security', value: `${intlProfile.bag_drop_to_security_minutes} min` },
                  { label: 'Security to farthest gate', value: `${intlProfile.security_to_gate_minutes} min` },
                  { label: 'Average security wait', value: `${intlProfile.avg_security_wait_minutes} min` },
                  { label: 'Peak security wait', value: `${intlProfile.peak_security_wait_minutes} min` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <dt className="text-ink-600">{label}</dt>
                    <dd className="font-semibold text-ink-900">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>

        <div className="mt-12 text-center">
          <p className="text-ink-500">
            These are Boarding&rsquo;s current estimates for {airport.iata_code}.
            Your personal recommendation will factor in your specific travel details.
          </p>
          <Link href="/trip/new" className="gs-btn-primary mt-4 gap-2">
            Get your personalized timing
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
