import { GestionnaireReservations } from '../src/ReservationManager.js';
describe("GestionnaireReservations - Création", () => {
    let gestionnaire;
    beforeEach(() => {
        gestionnaire = new GestionnaireReservations();
    });
    it("devrait créer une réservation valide", () => {
        const reservation = {
            id: "1",
            name: "Réservation Test",
            start: new Date("2026-05-08T10:00:00"),
            end: new Date("2026-05-10T10:00:00"),
        };
        gestionnaire.creerReservation(reservation);
        expect(gestionnaire.obtenirReservations()).toContainEqual(reservation);
    });
    it("devrait lever une erreur si la date de fin n'est pas après la date de début", () => {
        const reservation = {
            id: "2",
            name: "Dates Invalides",
            start: new Date("2026-05-10T10:00:00"),
            end: new Date("2026-05-10T10:00:00"),
        };
        expect(() => gestionnaire.creerReservation(reservation)).toThrow("La date de fin doit être après la date de début");
    });
    it("devrait lever une erreur si la réservation en chevauche une autre", () => {
        gestionnaire.creerReservation({
            id: "1",
            name: "R1",
            start: new Date("2026-05-10T10:00:00"),
            end: new Date("2026-05-10T12:00:00"),
        });
        const r2 = {
            id: "2",
            name: "R2 en chevauchement",
            start: new Date("2026-05-10T11:00:00"),
            end: new Date("2026-05-10T13:00:00"),
        };
        expect(() => gestionnaire.creerReservation(r2)).toThrow("La réservation chevauche une réservation existante");
    });
    it("devrait autoriser une réservation qui commence exactement à la fin d'une autre", () => {
        gestionnaire.creerReservation({
            id: "1",
            name: "R1",
            start: new Date("2026-05-10T10:00:00"),
            end: new Date("2026-05-10T12:00:00"),
        });
        const r2 = {
            id: "2",
            name: "R2 adjacente",
            start: new Date("2026-05-10T12:00:00"),
            end: new Date("2026-05-10T14:00:00"),
        };
        gestionnaire.creerReservation(r2);
        expect(gestionnaire.obtenirReservations()).toHaveLength(2);
    });
});
describe("GestionnaireReservations - Annulation", () => {
    let gestionnaire;
    beforeEach(() => {
        gestionnaire = new GestionnaireReservations();
    });
    it("devrait annuler une réservation si demandée au moins 48h avant le début", () => {
        const début = new Date("2026-05-10T10:00:00");
        const reservation = {
            id: "1",
            name: "R1",
            start: début,
            end: new Date("2026-05-12T10:00:00"),
        };
        gestionnaire.creerReservation(reservation);
        const dateDemande = new Date("2026-05-08T10:00:00"); // Exactement 48h avant
        gestionnaire.annulerReservation("1", dateDemande);
        expect(gestionnaire.obtenirReservations()).toHaveLength(0);
    });
    it("devrait lever une erreur si l'annulation est demandée moins de 48h avant le début", () => {
        const début = new Date("2026-05-10T10:00:00");
        const reservation = {
            id: "1",
            name: "R1",
            start: début,
            end: new Date("2026-05-12T10:00:00"),
        };
        gestionnaire.creerReservation(reservation);
        const dateDemande = new Date("2026-05-08T10:00:01"); // Moins de 48h avant
        expect(() => gestionnaire.annulerReservation("1", dateDemande)).toThrow("L'annulation doit être faite au moins 48h avant le début");
    });
    it("devrait lever une erreur si la réservation n'existe pas", () => {
        const dateDemande = new Date();
        expect(() => gestionnaire.annulerReservation("999", dateDemande)).toThrow("Réservation non trouvée");
    });
});
describe("GestionnaireReservations - RechercheParDate", () => {
    let gestionnaire;
    beforeEach(() => {
        gestionnaire = new GestionnaireReservations();
    });
    it("devrait retourner les réservations actives à une date donnée", () => {
        const r1 = {
            id: "1",
            name: "R1",
            start: new Date("2026-05-08T00:00:00"),
            end: new Date("2026-05-10T00:00:00"),
        };
        const r2 = {
            id: "2",
            name: "R2",
            start: new Date("2026-05-10T00:00:00"),
            end: new Date("2026-05-12T00:00:00"),
        };
        gestionnaire.creerReservation(r1);
        gestionnaire.creerReservation(r2);
        // 9 mai est dans R1
        const recherche1 = new Date("2026-05-09T12:00:00");
        expect(gestionnaire.rechercherParDate(recherche1)).toEqual([r1]);
        // 11 mai est dans R2
        const recherche2 = new Date("2026-05-11T12:00:00");
        expect(gestionnaire.rechercherParDate(recherche2)).toEqual([r2]);
        // 7 mai est avant R1
        const recherche3 = new Date("2026-05-07T12:00:00");
        expect(gestionnaire.rechercherParDate(recherche3)).toEqual([]);
    });
    it("devrait gérer les limites correctement (fin exclusive)", () => {
        const r1 = {
            id: "1",
            name: "R1",
            start: new Date("2026-05-08T00:00:00"),
            end: new Date("2026-05-10T00:00:00"),
        };
        gestionnaire.creerReservation(r1);
        // Exactement au début -> inclus
        expect(gestionnaire.rechercherParDate(new Date("2026-05-08T00:00:00"))).toEqual([r1]);
        // Exactement à la fin -> exclu (pour permettre les réservations adjacentes)
        expect(gestionnaire.rechercherParDate(new Date("2026-05-10T00:00:00"))).toEqual([]);
    });
});
//# sourceMappingURL=ReservationManager.test.js.map