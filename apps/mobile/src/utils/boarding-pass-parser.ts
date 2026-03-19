/**
 * BCBP (Bar Coded Boarding Pass) parser.
 *
 * Parses the IATA Resolution 792 standard barcode format
 * found on airline boarding passes (PDF417 or Aztec 2D barcodes).
 *
 * Format: M1LASTNAME/FIRSTNAME    EREF   FROMTOAAFFFFDDDDSS...
 *   - Byte 0: Format code ('M')
 *   - Byte 1: Number of legs (1-4)
 *   - Bytes 2-21: Passenger name (20 chars, padded)
 *   - Byte 22: Electronic ticket indicator ('E')
 *   - Bytes 23-29: Booking reference / PNR (7 chars)
 *   - Bytes 30-32: From airport (3 chars IATA)
 *   - Bytes 33-35: To airport (3 chars IATA)
 *   - Bytes 36-38: Operating carrier (3 chars, right-padded)
 *   - Bytes 39-43: Flight number (5 chars, right-padded)
 *   - Bytes 44-46: Julian date of flight (3 digits, day of year)
 *   - Byte 47: Compartment code (F/C/Y etc.)
 *   - Bytes 48-51: Seat number (4 chars)
 *   - Bytes 52-56: Check-in sequence number (5 chars)
 *   - Byte 57: Passenger status
 */

export interface BCBPData {
  passengerName: string;
  bookingReference: string;
  fromAirport: string;
  toAirport: string;
  airlineCode: string;
  flightNumber: string;
  flightDate: string;
  compartment: string;
  seatNumber: string;
  sequenceNumber: string;
  raw: string;
}

export function parseBCBP(barcode: string): BCBPData {
  if (!barcode || barcode.length < 58) {
    throw new Error(`Invalid BCBP data: too short (${barcode?.length ?? 0} chars, need at least 58)`);
  }

  const formatCode = barcode[0];
  if (formatCode !== 'M') {
    throw new Error(`Invalid format code: expected 'M', got '${formatCode}'`);
  }

  const passengerName = barcode.substring(2, 22).trim();
  const bookingReference = barcode.substring(23, 30).trim();
  const fromAirport = barcode.substring(30, 33).trim();
  const toAirport = barcode.substring(33, 36).trim();
  const airlineCode = barcode.substring(36, 39).trim();
  const flightNumberRaw = barcode.substring(39, 44).trim();
  const julianDay = barcode.substring(44, 47);
  const compartment = barcode[47] ?? '';
  const seatNumber = barcode.substring(48, 52).trim();
  const sequenceNumber = barcode.substring(52, 57).trim();

  // Convert Julian day to date
  const flightDate = julianDayToDate(julianDay);

  // Clean flight number — remove leading zeros
  const flightNumber = flightNumberRaw.replace(/^0+/, '') || '0';

  // Format passenger name
  const formattedName = formatPassengerName(passengerName);

  return {
    passengerName: formattedName,
    bookingReference,
    fromAirport,
    toAirport,
    airlineCode,
    flightNumber,
    flightDate,
    compartment,
    seatNumber,
    sequenceNumber,
    raw: barcode,
  };
}

function julianDayToDate(dayStr: string): string {
  const dayOfYear = parseInt(dayStr, 10);
  if (isNaN(dayOfYear) || dayOfYear < 1 || dayOfYear > 366) {
    return `Day ${dayStr}`;
  }

  // Assume current year
  const year = new Date().getFullYear();
  const date = new Date(year, 0, dayOfYear);
  return date.toISOString().split('T')[0]!;
}

function formatPassengerName(raw: string): string {
  // BCBP format: "LASTNAME/FIRSTNAME"
  const parts = raw.split('/');
  if (parts.length === 2) {
    const last = capitalize(parts[0]!);
    const first = capitalize(parts[1]!);
    return `${first} ${last}`;
  }
  return capitalize(raw);
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}
