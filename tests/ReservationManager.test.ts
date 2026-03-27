import { ReservationManager } from '../src/ReservationManager.js';
import type { Reservation } from '../src/types.js';

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

  it('should throw an error if the end date is not after the start date', () => {
    const reservation: Reservation = {
      id: '2',
      name: 'Invalid Dates',
      start: new Date('2026-05-10T10:00:00'),
      end: new Date('2026-05-10T10:00:00'),
    };
    expect(() => manager.createReservation(reservation)).toThrow('End date must be after start date');
  });

  it('should throw an error if the reservation overlaps with an existing one', () => {
    manager.createReservation({
      id: '1',
      name: 'R1',
      start: new Date('2026-05-10T10:00:00'),
      end: new Date('2026-05-10T12:00:00'),
    });

    const r2: Reservation = {
      id: '2',
      name: 'Overlapping R2',
      start: new Date('2026-05-10T11:00:00'),
      end: new Date('2026-05-10T13:00:00'),
    };
    expect(() => manager.createReservation(r2)).toThrow('Reservation overlaps with an existing one');
  });

  it('should allow a reservation that starts exactly when another ends', () => {
    manager.createReservation({
      id: '1',
      name: 'R1',
      start: new Date('2026-05-10T10:00:00'),
      end: new Date('2026-05-10T12:00:00'),
    });

    const r2: Reservation = {
      id: '2',
      name: 'Adjacent R2',
      start: new Date('2026-05-10T12:00:00'),
      end: new Date('2026-05-10T14:00:00'),
    };
    manager.createReservation(r2);
    expect(manager.getReservations()).toHaveLength(2);
  });
});

describe('ReservationManager - Cancellation', () => {
  let manager: ReservationManager;

  beforeEach(() => {
    manager = new ReservationManager();
  });

  it('should cancel a reservation if requested at least 48h before start', () => {
    const start = new Date('2026-05-10T10:00:00');
    const reservation: Reservation = {
      id: '1',
      name: 'R1',
      start,
      end: new Date('2026-05-12T10:00:00'),
    };
    manager.createReservation(reservation);

    const requestDate = new Date('2026-05-08T10:00:00'); // Exactly 48h before

    manager.cancelReservation('1', requestDate);
    expect(manager.getReservations()).toHaveLength(0);
  });

  it('should throw an error if cancellation is requested less than 48h before start', () => {
    const start = new Date('2026-05-10T10:00:00');
    const reservation: Reservation = {
      id: '1',
      name: 'R1',
      start,
      end: new Date('2026-05-12T10:00:00'),
    };
    manager.createReservation(reservation);

    const requestDate = new Date('2026-05-08T10:00:01'); // Less than 48h before

    expect(() => manager.cancelReservation('1', requestDate)).toThrow('Cancellation must be done at least 48h before');
  });

  it('should throw an error if the reservation does not exist', () => {
    const requestDate = new Date();
    expect(() => manager.cancelReservation('999', requestDate)).toThrow('Reservation not found');
  });
});

describe('ReservationManager - SearchByDate', () => {
  let manager: ReservationManager;

  beforeEach(() => {
    manager = new ReservationManager();
  });

  it('should return active reservations at a given date', () => {
    const r1: Reservation = {
      id: '1',
      name: 'R1',
      start: new Date('2026-05-08T00:00:00'),
      end: new Date('2026-05-10T00:00:00'),
    };
    const r2: Reservation = {
      id: '2',
      name: 'R2',
      start: new Date('2026-05-10T00:00:00'),
      end: new Date('2026-05-12T00:00:00'),
    };
    manager.createReservation(r1);
    manager.createReservation(r2);

    // 9 May is in R1
    const search1 = new Date('2026-05-09T12:00:00');
    expect(manager.searchByDate(search1)).toEqual([r1]);

    // 11 May is in R2
    const search2 = new Date('2026-05-11T12:00:00');
    expect(manager.searchByDate(search2)).toEqual([r2]);

    // 7 May is before R1
    const search3 = new Date('2026-05-07T12:00:00');
    expect(manager.searchByDate(search3)).toEqual([]);
  });

  it('should handle boundaries correctly (exclusive end)', () => {
    const r1: Reservation = {
      id: '1',
      name: 'R1',
      start: new Date('2026-05-08T00:00:00'),
      end: new Date('2026-05-10T00:00:00'),
    };
    manager.createReservation(r1);

    // Exactly at start -> included
    expect(manager.searchByDate(new Date('2026-05-08T00:00:00'))).toEqual([r1]);

    // Exactly at end -> excluded (to allow adjacent reservations)
    expect(manager.searchByDate(new Date('2026-05-10T00:00:00'))).toEqual([]);
  });
});
