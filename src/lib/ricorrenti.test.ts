/**
 * Le prove delle spese che tornano.
 *
 * 🔑 Qui si prova soprattutto quello che l'app **non deve** dire: chiamare
 * «abbonamento» due caffè presi lo stesso pomeriggio sarebbe peggio che non
 * dire niente — chi lo legge smette di fidarsi anche del resto.
 */
import { describe, expect, it } from "vitest";

import { speseCheTornano, totaleAlMese } from "./ricorrenti";
import type { Movimento } from "./store";

function m(parziale: Partial<Movimento> & { data: string; importo: number }): Movimento {
  return {
    id: Math.random().toString(36).slice(2),
    categoria: "Altro",
    etichetta: "cosa",
    tipo: "uscita",
    metodo: "carta",
    testo: "",
    ...parziale,
  } as Movimento;
}

describe("le spese che tornano", () => {
  it("riconosce una spesa che compare in due mesi diversi", () => {
    const fuori = speseCheTornano([
      m({ data: "2026-06-04T10:00:00Z", importo: 9.99, etichetta: "netflix" }),
      m({ data: "2026-07-04T10:00:00Z", importo: 9.99, etichetta: "netflix" }),
    ]);
    expect(fuori).toHaveLength(1);
    expect(fuori[0]?.etichetta).toBe("netflix");
    expect(fuori[0]?.tipico).toBe(9.99);
    expect(fuori[0]?.mesi).toBe(2);
    expect(fuori[0]?.allAnno).toBeCloseTo(9.99 * 12, 5);
  });

  it("NON chiama abbonamento due spese dello stesso giorno", () => {
    const fuori = speseCheTornano([
      m({ data: "2026-07-04T09:00:00Z", importo: 1.2, etichetta: "caffè" }),
      m({ data: "2026-07-04T17:00:00Z", importo: 1.2, etichetta: "caffè" }),
      m({ data: "2026-07-05T09:00:00Z", importo: 1.2, etichetta: "caffè" }),
    ]);
    expect(fuori).toEqual([]);
  });

  it("lascia respirare gli importi: una bolletta non è mai identica", () => {
    const fuori = speseCheTornano([
      m({ data: "2026-05-10T10:00:00Z", importo: 42, etichetta: "luce" }),
      m({ data: "2026-06-10T10:00:00Z", importo: 48, etichetta: "luce" }),
      m({ data: "2026-07-10T10:00:00Z", importo: 45, etichetta: "luce" }),
    ]);
    expect(fuori).toHaveLength(1);
    expect(fuori[0]?.mesi).toBe(3);
  });

  it("non mette insieme cose diverse che si chiamano uguale", () => {
    // «spesa» da 4 € e «spesa» da 200 € non sono la stessa cosa che torna.
    const fuori = speseCheTornano([
      m({ data: "2026-05-01T10:00:00Z", importo: 4, etichetta: "spesa" }),
      m({ data: "2026-06-01T10:00:00Z", importo: 200, etichetta: "spesa" }),
    ]);
    expect(fuori).toEqual([]);
  });

  it("ignora le entrate: nessuno vuole essere avvisato dello stipendio", () => {
    const fuori = speseCheTornano([
      m({ data: "2026-06-27T10:00:00Z", importo: 1500, etichetta: "stipendio", tipo: "entrata" }),
      m({ data: "2026-07-27T10:00:00Z", importo: 1500, etichetta: "stipendio", tipo: "entrata" }),
    ]);
    expect(fuori).toEqual([]);
  });

  it("ignora quelle nel cestino", () => {
    const fuori = speseCheTornano([
      m({ data: "2026-06-04T10:00:00Z", importo: 9.99, etichetta: "netflix", cestinato: true }),
      m({ data: "2026-07-04T10:00:00Z", importo: 9.99, etichetta: "netflix", cestinato: true }),
    ]);
    expect(fuori).toEqual([]);
  });

  it("maiuscole e spazi non fanno due spese diverse", () => {
    const fuori = speseCheTornano([
      m({ data: "2026-06-04T10:00:00Z", importo: 9.99, etichetta: "Netflix" }),
      m({ data: "2026-07-04T10:00:00Z", importo: 9.99, etichetta: "  netflix " }),
    ]);
    expect(fuori).toHaveLength(1);
    expect(fuori[0]?.mesi).toBe(2);
  });

  it("le mette in ordine di peso annuale e le somma", () => {
    const fuori = speseCheTornano([
      m({ data: "2026-06-04T10:00:00Z", importo: 9.99, etichetta: "netflix" }),
      m({ data: "2026-07-04T10:00:00Z", importo: 9.99, etichetta: "netflix" }),
      m({ data: "2026-06-01T10:00:00Z", importo: 45, etichetta: "palestra" }),
      m({ data: "2026-07-01T10:00:00Z", importo: 45, etichetta: "palestra" }),
    ]);
    expect(fuori.map((r) => r.etichetta)).toEqual(["palestra", "netflix"]);
    expect(totaleAlMese(fuori)).toBeCloseTo(45 + 9.99, 5);
  });

  it("la mediana di due importi NON si arrotonda all'euro", () => {
    // 9,99 e 10,99 fanno 10,49. Con Math.round facevano «10», e sull'anno
    // erano 5,88 € di differenza raccontati come se fossero esatti.
    const fuori = speseCheTornano([
      m({ data: "2026-06-04T10:00:00Z", importo: 9.99, etichetta: "musica" }),
      m({ data: "2026-07-04T10:00:00Z", importo: 10.99, etichetta: "musica" }),
    ]);
    expect(fuori[0]?.tipico).toBe(10.49);
  });

  it("con la lista vuota non inventa niente", () => {
    expect(speseCheTornano([])).toEqual([]);
    expect(totaleAlMese([])).toBe(0);
  });
});
