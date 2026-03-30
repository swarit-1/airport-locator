import { useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as api from '../services/api';

const POLL_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

interface ActiveTrip {
  trip_id: string;
  airline_iata: string;
  flight_number: string;
  departure_date: string;
  departure_time: string;
  airport_iata: string;
  terminal: string | null;
  gate: string | null;
  status: 'on_time' | 'delayed' | 'cancelled' | 'gate_changed';
  delay_minutes: number;
  status_message: string | null;
  last_status_check: string | null;
  [key: string]: unknown;
}

type StatusChangeCallback = (update: {
  type: 'delay' | 'gate_change' | 'cancelled' | 'on_time';
  message: string;
  trip: ActiveTrip;
}) => void;

/**
 * Polls the flight status API every 5 minutes for the active trip.
 * Calls onStatusChange when a change is detected and persists updates to AsyncStorage.
 */
export function useFlightStatusPolling(onStatusChange?: StatusChangeCallback) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkStatus = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem('activeTrip');
      if (!raw) return;

      const trip: ActiveTrip = JSON.parse(raw);

      // Don't poll for past flights
      const depTime = new Date(`${trip.departure_date}T${trip.departure_time}:00`);
      if (depTime.getTime() < Date.now() - 2 * 60 * 60 * 1000) return;

      const res = await api.lookupFlight(
        `${trip.airline_iata}${trip.flight_number}`,
        trip.departure_date,
      );

      if (!res.found || !res.flight) return;

      const flight = res.flight;
      let changed = false;
      let updateType: 'delay' | 'gate_change' | 'cancelled' | 'on_time' = 'on_time';
      let message = '';

      // Check for cancellation
      if (flight.status === 'cancelled' && trip.status !== 'cancelled') {
        trip.status = 'cancelled';
        trip.status_message = 'Flight has been cancelled';
        updateType = 'cancelled';
        message = 'Your flight has been cancelled';
        changed = true;
      }
      // Check for delay
      else if (flight.delay_minutes > 0 && flight.delay_minutes !== trip.delay_minutes) {
        trip.status = 'delayed';
        trip.delay_minutes = flight.delay_minutes;
        trip.status_message = `Delayed ${flight.delay_minutes} min — new departure ${flight.departure_time}`;
        if (flight.departure_time) {
          trip.departure_time = flight.departure_time;
        }
        updateType = 'delay';
        message = `Flight delayed ${flight.delay_minutes} minutes`;
        changed = true;
      }
      // Check for gate change
      else if (flight.gate && flight.gate !== trip.gate) {
        const oldGate = trip.gate;
        trip.gate = flight.gate;
        trip.terminal = flight.terminal ?? trip.terminal;
        trip.status = 'gate_changed';
        trip.status_message = `Gate changed${oldGate ? ` from ${oldGate}` : ''} to ${flight.gate}`;
        updateType = 'gate_change';
        message = `Gate changed to ${flight.gate}`;
        changed = true;
      }
      // Back to on time
      else if (flight.delay_minutes === 0 && trip.status === 'delayed') {
        trip.status = 'on_time';
        trip.delay_minutes = 0;
        trip.status_message = null;
        updateType = 'on_time';
        message = 'Flight is back on schedule';
        changed = true;
      }

      trip.last_status_check = new Date().toISOString();
      await AsyncStorage.setItem('activeTrip', JSON.stringify(trip));

      if (changed && onStatusChange) {
        onStatusChange({ type: updateType, message, trip });
      }
    } catch {
      // Silently fail — polling should not crash the app
    }
  }, [onStatusChange]);

  useEffect(() => {
    // Check immediately on mount
    checkStatus();

    intervalRef.current = setInterval(checkStatus, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [checkStatus]);

  return { checkNow: checkStatus };
}
