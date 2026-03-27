import type { Reservation } from './types.js';

export class GestionnaireReservations {
  private reservations: Reservation[] = [];

  creerReservation(reservation: Reservation): void {
    if (reservation.end <= reservation.start) {
      throw new Error("La date de fin doit être après la date de début");
    }

    const chevauchement = this.reservations.some(r => 
      reservation.start < r.end && reservation.end > r.start
    );

    if (chevauchement) {
      throw new Error("La réservation chevauche une réservation existante");
    }

    this.reservations.push(reservation);
  }

  annulerReservation(id: string, dateDemande: Date): void {
    const reservation = this.reservations.find(r => r.id === id);
    
    if (!reservation) {
      throw new Error("Réservation non trouvée");
    }

    const diffHeures = (reservation.start.getTime() - dateDemande.getTime()) / (1000 * 3600);

    if (diffHeures < 48) {
      throw new Error("L'annulation doit être faite au moins 48h avant le début");
    }

    this.reservations = this.reservations.filter(r => r.id !== id);
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
