import type { Reservation } from './types.js';

export class ReservationManager {
  private reservations: Reservation[] = [];

  createReservation(reservation: Reservation): void {
    if (reservation.end <= reservation.start) {
      throw new Error('End date must be after start date');
    }

    const hasOverlap = this.reservations.some(r => {
      return (reservation.start < r.end && reservation.end > r.start);
    });

    if (hasOverlap) {
      throw new Error('Reservation overlaps with an existing one');
    }

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
