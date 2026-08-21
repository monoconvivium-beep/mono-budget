/**
 * LE SPESE FISSE — quello che l'app NON deve fare.
 *
 * 🔴 Da dove nasce (21/8/2026): «affitto, luce e gas, gli abbonamenti — la
 * spesa è sempre la stessa, non bisogna ridirlo». Segnare una spesa al posto di
 * qualcuno è una cosa delicata: un movimento in più o in meno cambia il suo
 * bilancio. Queste prove difendono i tre modi in cui potrebbe sbagliare, e sono
 * tutti e tre modi di **scrivere una spesa che non c'è stata**.
 */
import { describe, expect, it } from "vitest";

import { giornoBuono, meseDi, mesiDaSegnare, pesoAnnuale, quandoSegnare } from "./fisse";

const affitto = {
  id: "f1",
  cosa: "Affitto",
  importo: 700,
  categoria: "Affitto",
  giorno: 5,
  daQuando: "2026-06",
  attiva: true,
};

describe("quando si segna una spesa fissa", () => {
  it("dal mese in cui è nata fino a oggi, non prima", () => {
    // ⚠️ Maggio non c'è: la fissa è nata a giugno, e quello che non è stato
    // segnato prima non se lo inventa nessuno.
    const mesi = mesiDaSegnare(affitto, new Date(2026, 7, 20), []);
    expect(mesi).toEqual(["2026-06", "2026-07", "2026-08"]);
  });

  it("il mese in corso solo dal giorno in poi", () => {
    // Il 3 del mese l'affitto del 5 non è ancora uscito: scriverlo vorrebbe
    // dire mettere nel bilancio una spesa che non è stata fatta.
    expect(mesiDaSegnare(affitto, new Date(2026, 7, 3), [])).toEqual(["2026-06", "2026-07"]);
    expect(mesiDaSegnare(affitto, new Date(2026, 7, 5), [])).toContain("2026-08");
  });

  it("MAI due volte lo stesso mese", () => {
    // 🔑 È la prova che conta: aprire l'app dieci volte in un giorno non deve
    // segnare dieci affitti.
    const mesi = mesiDaSegnare(affitto, new Date(2026, 7, 20), ["2026-06", "2026-07", "2026-08"]);
    expect(mesi).toEqual([]);
  });

  it("una fissa spenta non segna niente", () => {
    expect(mesiDaSegnare({ ...affitto, attiva: false }, new Date(2026, 7, 20), [])).toEqual([]);
  });

  it("una fissa nata nel futuro non segna niente", () => {
    expect(mesiDaSegnare({ ...affitto, daQuando: "2027-01" }, new Date(2026, 7, 20), [])).toEqual(
      [],
    );
  });

  it("dopo due anni di telefono chiuso non arrivano trenta movimenti insieme", () => {
    // La rete: si recuperano gli ultimi dodici, non tutta la storia.
    const mesi = mesiDaSegnare({ ...affitto, daQuando: "2024-01" }, new Date(2026, 7, 20), []);
    expect(mesi).toHaveLength(12);
    expect(mesi[mesi.length - 1]).toBe("2026-08");
  });

  it("passa da dicembre a gennaio senza inciampare", () => {
    const mesi = mesiDaSegnare({ ...affitto, daQuando: "2026-11" }, new Date(2027, 0, 10), []);
    expect(mesi).toEqual(["2026-11", "2026-12", "2027-01"]);
  });
});

describe("il giorno del mese", () => {
  it("si ferma a 28: il 31 di febbraio non esiste", () => {
    // Un difetto che si vedrebbe una volta l'anno è un difetto che nessuno
    // collega più alla sua causa.
    expect(giornoBuono(31)).toBe(28);
    expect(giornoBuono(0)).toBe(1);
    expect(giornoBuono(-4)).toBe(1);
    expect(giornoBuono(15)).toBe(15);
  });

  it("si segna alle 9 del mattino, non a mezzanotte", () => {
    // A mezzanotte la riga finisce nel giorno prima per chi la guarda.
    const quando = new Date(quandoSegnare("2026-08", 5));
    expect(quando.getDate()).toBe(5);
    expect(quando.getMonth()).toBe(7);
    expect(quando.getHours()).toBe(9);
  });

  it("il mese si scrive sempre a due cifre", () => {
    expect(meseDi(new Date(2026, 0, 9))).toBe("2026-01");
    expect(meseDi(new Date(2026, 11, 31))).toBe("2026-12");
  });
});

describe("quanto pesano", () => {
  it("all'anno, che è il numero che convince", () => {
    expect(pesoAnnuale([affitto, { ...affitto, id: "f2", importo: 12.99 }])).toBeCloseTo(
      8555.88,
      2,
    );
  });

  it("le spente non contano", () => {
    expect(pesoAnnuale([{ ...affitto, attiva: false }])).toBe(0);
  });
});
