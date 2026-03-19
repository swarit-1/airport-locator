import type {
  TrafficResult,
  FlightInfo,
  WaitTimeResult,
  RideLink,
  CostEstimate,
  GeoPoint,
} from '@boarding/domain';

export interface TrafficProvider {
  getTrafficEstimate(
    origin: GeoPoint,
    destination: GeoPoint,
    departAt?: Date,
  ): Promise<TrafficResult>;
}

export interface FlightProvider {
  getFlightInfo(
    airlineIata: string,
    flightNumber: string,
    date: string,
  ): Promise<FlightInfo | null>;
}

export interface WaitTimeProvider {
  getWaitTime(
    airportIata: string,
    terminalId?: string,
  ): Promise<WaitTimeResult>;
}

export interface RideLinkProvider {
  getRideLink(
    origin: GeoPoint,
    destination: GeoPoint,
    provider: 'uber' | 'lyft',
  ): Promise<RideLink>;
}

export interface CostEstimateProvider {
  getEstimate(
    origin: GeoPoint,
    destination: GeoPoint,
    partySize: number,
  ): Promise<CostEstimate>;
}

export interface NotificationProvider {
  sendPush(userId: string, title: string, body: string, data?: Record<string, unknown>): Promise<void>;
  sendEmail(email: string, subject: string, html: string): Promise<void>;
  schedulePush?(userId: string, title: string, body: string, triggerAt: Date, data?: Record<string, unknown>): Promise<string>;
  cancelScheduled?(notificationId: string): Promise<void>;
}

export interface AirportDiningProvider {
  getRestaurants(airportIata: string, terminal?: string, gate?: string): Promise<import('@boarding/domain').AirportRestaurant[]>;
  getRestaurantDetail?(restaurantId: string): Promise<import('@boarding/domain').AirportRestaurantDetail>;
}

export interface CheckInProvider {
  checkIn(airline: string, confirmationCode: string, lastName: string): Promise<import('@boarding/domain').CheckInResult>;
  getCheckInStatus(airline: string, confirmationCode: string): Promise<import('@boarding/domain').CheckInStatus>;
  isSupported(airline: string): boolean;
}

export interface TravelManagementProvider {
  getUpcomingTrips(userId: string): Promise<any[]>;
  syncTrip(tripId: string): Promise<any>;
}
