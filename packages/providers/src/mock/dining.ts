import type { AirportDiningProvider } from '../interfaces';
import type { AirportRestaurant, AirportRestaurantDetail } from '@boarding/domain';
import { diningSeeds } from '@boarding/db';

export class MockDiningProvider implements AirportDiningProvider {
  async getRestaurants(airportIata: string, terminal?: string, gate?: string): Promise<AirportRestaurant[]> {
    let results = diningSeeds.filter((r) => r.airport_iata === airportIata);

    if (terminal) {
      results = results.filter((r) => r.terminal === terminal);
    }

    if (gate) {
      results = results.filter((r) => r.near_gates.includes(gate));
    }

    return results;
  }

  async getRestaurantDetail(restaurantId: string): Promise<AirportRestaurantDetail> {
    const restaurant = diningSeeds.find((r) => r.id === restaurantId);
    if (!restaurant) {
      throw new Error(`Restaurant ${restaurantId} not found`);
    }
    return { ...restaurant, reviews: [], menu_items: [] };
  }
}
