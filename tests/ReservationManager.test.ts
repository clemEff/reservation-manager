import { GestionnaireReservations } from '../src/ReservationManager.js';
import type { Reservation } from '../src/types.js';

describe("Tests du Gestionnaire de Réservations", () => {
  let gestionnaire: GestionnaireReservations;

  beforeEach(() => {
    gestionnaire = new GestionnaireReservations();
  });

  describe("Création de réservation", () => {
    it("devrait accepter une réservation simple si tout est bon", () => {
      const res: Reservation = {
        id: "1",
        name: "Jean Dupont",
        start: new Date("2026-06-01T10:00:00"),
        end: new Date("2026-06-01T12:00:00")
      };
      gestionnaire.creerReservation(res);
      expect(gestionnaire.obtenirReservations()).toHaveLength(1);
    });

    it("doit bloquer si la fin est avant le début", () => {
      const res: Reservation = {
        id: "2",
        name: "Erreur Date",
        start: new Date("2026-06-01T12:00:00"),
        end: new Date("2026-06-01T10:00:00")
      };
      expect(() => gestionnaire.creerReservation(res)).toThrow("La date de fin doit être après la date de début");
    });

    it("ne doit pas permettre deux réservations en même temps", () => {
      gestionnaire.creerReservation({
        id: "1",
        name: "R1",
        start: new Date("2026-06-01T10:00:00"),
        end: new Date("2026-06-01T12:00:00")
      });

      const r2: Reservation = {
        id: "2",
        name: "R2",
        start: new Date("2026-06-01T11:00:00"),
        end: new Date("2026-06-01T13:00:00")
      };
      expect(() => gestionnaire.creerReservation(r2)).toThrow("La réservation chevauche une réservation existante");
    });

    it("autorise une réservation qui commence pile quand l'autre finit", () => {
      gestionnaire.creerReservation({
        id: "1",
        name: "R1",
        start: new Date("2026-06-01T10:00:00"),
        end: new Date("2026-06-01T12:00:00")
      });

      const r2: Reservation = {
        id: "2",
        name: "R2",
        start: new Date("2026-06-01T12:00:00"),
        end: new Date("2026-06-01T14:00:00")
      };
      gestionnaire.creerReservation(r2);
      expect(gestionnaire.obtenirReservations()).toHaveLength(2);
    });
  });

  describe("Annulation", () => {
    it("doit fonctionner si on s'y prend 48h à l'avance", () => {
      const debut = new Date("2026-06-10T10:00:00");
      gestionnaire.creerReservation({
        id: "1",
        name: "Test",
        start: debut,
        end: new Date("2026-06-11T10:00:00")
      });

      const demande = new Date("2026-06-08T10:00:00"); 
      gestionnaire.annulerReservation("1", demande);
      expect(gestionnaire.obtenirReservations()).toHaveLength(0);
    });

    it("doit refuser si c'est trop tard (moins de 48h)", () => {
      const debut = new Date("2026-06-10T10:00:00");
      gestionnaire.creerReservation({ id: "1", name: "T", start: debut, end: new Date("2026-06-11T10:00:00") });

      const tropTard = new Date("2026-06-08T10:00:01");
      expect(() => gestionnaire.annulerReservation("1", tropTard)).toThrow("L'annulation doit être faite au moins 48h avant le début");
    });

    it("renvoie une erreur si l'id n'existe pas", () => {
      expect(() => gestionnaire.annulerReservation("999", new Date())).toThrow("Réservation non trouvée");
    });
  });

  describe("Recherche", () => {
    it("doit trouver les réservations à une date précise", () => {
      const r1: Reservation = {
        id: "1",
        name: "R1",
        start: new Date("2026-05-10T00:00:00"),
        end: new Date("2026-05-12T00:00:00")
      };
      gestionnaire.creerReservation(r1);

      const date = new Date("2026-05-11T10:00:00");
      expect(gestionnaire.rechercherParDate(date)).toContain(r1);
    });

    it("ne doit pas inclure la réservation si on est pile à l'heure de fin", () => {
      const r1: Reservation = {
        id: "1",
        name: "R1",
        start: new Date("2026-05-10T08:00:00"),
        end: new Date("2026-05-10T10:00:00")
      };
      gestionnaire.creerReservation(r1);

      expect(gestionnaire.rechercherParDate(new Date("2026-05-10T10:00:00"))).toHaveLength(0);
    });
  });
});
