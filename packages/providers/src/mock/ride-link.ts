import type { GeoPoint, RideLink } from '@gateshare/domain';
import type { RideLinkProvider } from '../interfaces';

export class MockRideLinkProvider implements RideLinkProvider {
  async getRideLink(
    origin: GeoPoint,
    destination: GeoPoint,
    provider: 'uber' | 'lyft',
  ): Promise<RideLink> {
    const distKm = haversineKm(origin, destination);
    const baseCents = Math.round(800 + distKm * 180); // ~$8 base + $1.80/km
    const minutes = Math.round((distKm / 48) * 60);

    if (provider === 'uber') {
      return {
        provider: 'uber',
        deep_link: `uber://?action=setPickup&pickup[latitude]=${origin.lat}&pickup[longitude]=${origin.lng}&dropoff[latitude]=${destination.lat}&dropoff[longitude]=${destination.lng}`,
        web_link: `https://m.uber.com/ul/?action=setPickup&pickup[latitude]=${origin.lat}&pickup[longitude]=${origin.lng}&dropoff[latitude]=${destination.lat}&dropoff[longitude]=${destination.lng}`,
        estimated_price_cents: baseCents,
        estimated_minutes: minutes,
      };
    }

    return {
      provider: 'lyft',
      deep_link: `lyft://ridetype?id=lyft&pickup[latitude]=${origin.lat}&pickup[longitude]=${origin.lng}&destination[latitude]=${destination.lat}&destination[longitude]=${destination.lng}`,
      web_link: `https://ride.lyft.com/ridetype?id=lyft&pickup[latitude]=${origin.lat}&pickup[longitude]=${origin.lng}&destination[latitude]=${destination.lat}&destination[longitude]=${destination.lng}`,
      estimated_price_cents: Math.round(baseCents * 0.95),
      estimated_minutes: minutes,
    };
  }
}

function haversineKm(a: GeoPoint, b: GeoPoint): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const calc =
    sinDLat * sinDLat +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * sinDLng * sinDLng;
  return R * 2 * Math.atan2(Math.sqrt(calc), Math.sqrt(1 - calc));
}
