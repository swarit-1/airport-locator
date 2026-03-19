import type { CheckInProvider } from '../interfaces';
import type { CheckInResult, CheckInStatus } from '@boarding/domain';

const SUPPORTED_AIRLINES = ['AA', 'DL', 'UA', 'WN'];

export class MockCheckInProvider implements CheckInProvider {
  async checkIn(airline: string, confirmationCode: string, lastName: string): Promise<CheckInResult> {
    if (!this.isSupported(airline)) {
      return {
        success: false,
        boarding_pass_url: null,
        seat_assignment: null,
        boarding_group: null,
        error_message: `Auto check-in not supported for ${airline}`,
        checked_in_at: null,
      };
    }

    // Mock: random seat assignment
    const row = Math.floor(Math.random() * 30) + 1;
    const seat = String.fromCharCode(65 + Math.floor(Math.random() * 6));

    return {
      success: true,
      boarding_pass_url: null,
      seat_assignment: `${row}${seat}`,
      boarding_group: row <= 10 ? 'A' : row <= 20 ? 'B' : 'C',
      error_message: null,
      checked_in_at: new Date().toISOString(),
    };
  }

  async getCheckInStatus(_airline: string, _confirmationCode: string): Promise<CheckInStatus> {
    return 'available';
  }

  isSupported(airline: string): boolean {
    return SUPPORTED_AIRLINES.includes(airline.toUpperCase());
  }
}
