import type {
  TrafficResult,
  FlightInfo,
  WaitTimeResult,
  RideLink,
  CostEstimate,
  GeoPoint,
} from '@gateshare/domain';

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
  sendPush(userId: string, title: string, body: string): Promise<void>;
  sendEmail(email: string, subject: string, html: string): Promise<void>;
}
