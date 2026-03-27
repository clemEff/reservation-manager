import type { Reservation } from './types.js';

export class ReservationManager {
  private reservations: Reservation[] = [];

  createReservation(reservation: Reservation): void {
    this.reservations.push(reservation);
  }

  cancelReservation(id: string, requestDate: Date): void {
    const index = this.reservations.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error('Reservation not found');
    }

    const reservation = this.reservations[index];
    const diffInMilliseconds = reservation.start.getTime() - requestDate.getTime();
    const diffInHours = diffInMilliseconds / (1000 * 60 * 60);

    if (diffInHours < 48) {
      throw new Error('Cancellation must be done at least 48h before start');
    }

    this.reservations.splice(index, 1);
  }

  searchByDate(date: Date): Reservation[] {
    return this.reservations.filter(r => 
      date >= r.start && date < r.end
    );
  }

  getReservations(): Reservation[] {
    return this.reservations;
  }
}
