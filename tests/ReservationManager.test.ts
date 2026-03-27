import { ReservationManager } from '../src/ReservationManager';
import { Reservation } from '../src/types';

describe('ReservationManager - Creation', () => {
  let manager: ReservationManager;

  beforeEach(() => {
    manager = new ReservationManager();
  });

  it('should create a valid reservation', () => {
    const reservation: Reservation = {
      id: '1',
      name: 'Test Reservation',
      start: new Date('2026-05-08T10:00:00'),
      end: new Date('2026-05-10T10:00:00'),
    };

    manager.createReservation(reservation);
    expect(manager.getReservations()).toContainEqual(reservation);
  });
});
