import { describe, expect, it } from "vitest";

import { interpreta } from "./parse";

/**
 * «QUATTRO E SESSANTA SONO 4,60.»
 *
 * Richiesta esplicita del 4/8/2026. Prima l'app spezzava la frase in due spese
 * — una da 4 e una da 60 — perché la «e» la trattava sempre come separatore.
 *
 * ⚠️ Resta il caso che NESSUNA app può risolvere: quando è il riconoscimento
 * vocale a scrivere direttamente «460», il testo che arriva è identico a un
 * affitto da 460 €. Lì non si indovina: si segnala e si propone (vedi in fondo).
 */

const primo = (frase: string) => interpreta(frase)[0];

describe("i prezzi detti con la e", () => {
  it("«quattro e sessanta» è 4,60 e non due spese", () => {
    const m = interpreta("quattro e sessanta");

    expect(m).toHaveLength(1);
    expect(m[0]?.importo).toBe(4.6);
  });

  it("funziona anche con la categoria attaccata", () => {
    const m = interpreta("quattro e sessanta al bar");

    expect(m).toHaveLength(1);
    expect(m[0]?.importo).toBe(4.6);
    expect(m[0]?.categoria).toBe("Bar");
  });

  it("continua a funzionare col modo che si insegnava prima", () => {
    expect(primo("quattro euro e sessanta")?.importo).toBe(4.6);
    expect(primo("quattro euro e sessanta centesimi")?.importo).toBe(4.6);
    expect(primo("quattro virgola sessanta")?.importo).toBe(4.6);
  });

  it("anche in cifre, non solo a parole", () => {
    expect(primo("4 e 60 farmacia")?.importo).toBe(4.6);
  });

  it("«cento e venti» NON è 100,20", () => {
    // Un prezzo con i centesimi comincia sotto i cento. Nessuno legge
    // «centoventi» dicendo «cento e venti» per intendere 100,20.
    expect(primo("cento e venti")?.importo).not.toBe(100.2);
  });

  it("due spese vere con le categorie restano due", () => {
    // È qui che la «e» separa davvero: dopo c'è una spesa intera, non un numero nudo.
    const m = interpreta("dieci euro bar e venti di spesa");

    expect(m).toHaveLength(2);
    expect(m[0]?.importo).toBe(10);
    expect(m[1]?.importo).toBe(20);
  });

  it("il decimale già scritto non si tocca", () => {
    // "4,80 e 20" non deve diventare 4,8020: i centesimi ci sono già.
    const m = interpreta("4,80 bar e 20 di spesa");

    expect(m[0]?.importo).toBe(4.8);
    expect(m).toHaveLength(2);
  });

  it("quando è il telefono a scrivere 460, l'app lo dice invece di indovinare", () => {
    // ⚠️ Il testo che arriva è indistinguibile da un affitto da 460 €.
    // La regola non si tocca: non si trasforma mai un importo di nascosto.
    const m = primo("460 farmacia");

    expect(m?.importo).toBe(460);
    expect(m?.importoSospetto).toBe(true);
    expect(m?.importoAlternativo).toBe(4.6);
  });

  it("un importo tondo non viene messo in dubbio per niente", () => {
    const m = primo("500 affitto");

    expect(m?.importo).toBe(500);
    expect(m?.importoSospetto).toBe(false);
  });
});
