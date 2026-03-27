import type { Reservation } from './types.js';

export class GestionnaireReservations {
  private reservations: Reservation[] = [];

  creerReservation(reservation: Reservation): void {
    if (reservation.end <= reservation.start) {
      throw new Error('La date de fin doit être après la date de début');
    }

    const aUnChevauchement = this.reservations.some(r => {
      return (reservation.start < r.end && reservation.end > r.start);
    });

    if (aUnChevauchement) {
      throw new Error('La réservation chevauche une réservation existante');
    }

    this.reservations.push(reservation);
  }

  annulerReservation(id: string, dateDemande: Date): void {
    const index = this.reservations.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error('Réservation non trouvée');
    }

    const reservation = this.reservations[index];
    const diffEnMillisecondes = reservation.start.getTime() - dateDemande.getTime();
    const diffEnHeures = diffEnMillisecondes / (1000 * 60 * 60);

    if (diffEnHeures < 48) {
      throw new Error("L'annulation doit être faite au moins 48h avant le début");
    }

    this.reservations.splice(index, 1);
  }

  rechercherParDate(date: Date): Reservation[] {
    return this.reservations.filter(r => 
      date >= r.start && date < r.end
    );
  }

  obtenirReservations(): Reservation[] {
    return this.reservations;
  }
}
