import { Reservation } from './types';

export class ReservationManager {
  private reservations: Reservation[] = [];

  createReservation(reservation: Reservation): void {
    // To be implemented
  }

  getReservations(): Reservation[] {
    return this.reservations;
  }
}
