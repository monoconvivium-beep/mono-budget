import { describe, expect, it } from "vitest";

import { euro } from "./parse";
import { dellAnno, delMese, perCategoria, riepilogo, versoCsv } from "./statistiche";
import type { Movimento } from "./store";

describe("come si scrivono i soldi", () => {
  it("mette il punto delle migliaia anche sotto le diecimila", () => {
    // La regola dei numeri italiana non lo mette («1500,00»), ma i soldi si
    // scrivono così su ogni scontrino e ogni busta paga.
    expect(euro(1500)).toBe("1.500,00 €");
    expect(euro(4.8)).toBe("4,80 €");
    expect(euro(0)).toBe("0,00 €");
    expect(euro(1234567.5)).toBe("1.234.567,50 €");
  });
});

function mov(p: Partial<Movimento> & { importo: number }): Movimento {
  return {
    id: Math.random().toString(36).slice(2),
    data: "2026-08-02T10:30:00.000Z",
    categoria: "Bar",
    etichetta: "Caffè",
    tipo: "uscita",
    metodo: null,
    testo: "un caffè",
    ...p,
  };
}

describe("dove sono finiti i soldi", () => {
  it("mette la categoria più grossa per prima", () => {
    const voci = perCategoria(
      [
        mov({ importo: 10, categoria: "Bar" }),
        mov({ importo: 50, categoria: "Casa" }),
        mov({ importo: 40, categoria: "Salute" }),
      ],
      "uscita",
    );

    expect(voci.map((v) => v.categoria)).toEqual(["Casa", "Salute", "Bar"]);
    expect(voci[0]?.totale).toBe(50);
    expect(voci[0]?.quota).toBeCloseTo(0.5);
  });

  it("somma i movimenti della stessa categoria e li conta", () => {
    const voci = perCategoria(
      [
        mov({ importo: 3.5, categoria: "Bar" }),
        mov({ importo: 1.2, categoria: "Bar" }),
        mov({ importo: 2.3, categoria: "Bar" }),
      ],
      "uscita",
    );

    expect(voci).toHaveLength(1);
    expect(voci[0]?.totale).toBe(7);
    expect(voci[0]?.quantiMovimenti).toBe(3);
    expect(voci[0]?.quota).toBe(1);
  });

  it("non mescola le entrate con le uscite", () => {
    const dati = [
      mov({ importo: 100, categoria: "Casa", tipo: "entrata" }),
      mov({ importo: 20, categoria: "Casa", tipo: "uscita" }),
    ];

    expect(perCategoria(dati, "uscita")[0]?.totale).toBe(20);
    expect(perCategoria(dati, "entrata")[0]?.totale).toBe(100);
  });

  it("le categorie vuote non compaiono, e senza niente non c'è niente", () => {
    // Una fetta da zero è una riga da leggere che non dice niente.
    expect(perCategoria([mov({ importo: 5, categoria: "Bar" })], "uscita")).toHaveLength(1);
    expect(perCategoria([], "uscita")).toEqual([]);
  });

  it("a parità di totale l'ordine non balla", () => {
    // Due schermate uguali devono restare uguali: se no sembra che i conti si muovano.
    const dati = [mov({ importo: 10, categoria: "Salute" }), mov({ importo: 10, categoria: "Bar" })];

    expect(perCategoria(dati, "uscita").map((v) => v.categoria)).toEqual(["Bar", "Salute"]);
    expect(perCategoria([...dati].reverse(), "uscita").map((v) => v.categoria)).toEqual([
      "Bar",
      "Salute",
    ]);
  });
});

describe("il riepilogo", () => {
  it("conta entrate, uscite e differenza", () => {
    const r = riepilogo([
      mov({ importo: 1000, tipo: "entrata" }),
      mov({ importo: 300 }),
      mov({ importo: 200 }),
    ]);

    expect(r.entrate).toBe(1000);
    expect(r.uscite).toBe(500);
    expect(r.differenza).toBe(500);
    expect(r.quantiMovimenti).toBe(3);
    expect(r.spesaMedia).toBe(250);
  });

  it("la differenza diventa negativa se si spende più di quanto entra", () => {
    expect(riepilogo([mov({ importo: 100, tipo: "entrata" }), mov({ importo: 180 })]).differenza).toBe(
      -80,
    );
  });

  it("senza uscite la spesa media è zero, non una divisione per zero", () => {
    expect(riepilogo([mov({ importo: 50, tipo: "entrata" })]).spesaMedia).toBe(0);
    expect(riepilogo([]).spesaMedia).toBe(0);
  });
});

describe("i periodi", () => {
  const dati = [
    mov({ importo: 10, data: "2026-01-15T10:00:00.000Z" }),
    mov({ importo: 20, data: "2026-08-02T10:00:00.000Z" }),
    mov({ importo: 30, data: "2025-08-02T10:00:00.000Z" }),
  ];

  it("il mese prende solo quel mese di quell'anno", () => {
    // ⚠️ agosto 2026 e agosto 2025 sono mesi diversi: contano tutti e due i pezzi.
    expect(delMese(dati, 2026, 7)).toHaveLength(1);
    expect(delMese(dati, 2025, 7)).toHaveLength(1);
    expect(delMese(dati, 2026, 0)).toHaveLength(1);
    expect(delMese(dati, 2026, 5)).toHaveLength(0);
  });

  it("l'anno prende tutti i mesi di quell'anno", () => {
    expect(dellAnno(dati, 2026)).toHaveLength(2);
    expect(dellAnno(dati, 2025)).toHaveLength(1);
  });
});

describe("l'esportazione per il foglio di calcolo", () => {
  const riga = (csv: string, n: number) => csv.split("\r\n")[n] ?? "";

  it("separa col punto e virgola e scrive i decimali con la virgola", () => {
    // Con la virgola come separatore, Excel italiano mette tutto in una casella.
    // Con il punto decimale, «4.80» diventa testo o una data.
    const csv = versoCsv([mov({ importo: 4.8, categoria: "Bar", etichetta: "Caffè" })]);

    expect(riga(csv, 1)).toContain(";4,80;");
    expect(riga(csv, 1).split(";")).toHaveLength(8);
  });

  it("comincia col segno che salva gli accenti", () => {
    // Senza, «Caffè» si legge «CaffÃ¨».
    expect(versoCsv([])).toMatch(/^﻿/);
  });

  it("protegge un testo che contiene il separatore", () => {
    const csv = versoCsv([mov({ importo: 1, etichetta: 'pane; latte e "burro"' })]);

    expect(riga(csv, 1)).toContain('"pane; latte e ""burro"""');
  });

  it("scrive la data all'italiana e mette i movimenti in ordine di tempo", () => {
    const csv = versoCsv([
      mov({ importo: 2, data: "2026-08-02T10:00:00.000Z", etichetta: "dopo" }),
      mov({ importo: 1, data: "2026-01-15T10:00:00.000Z", etichetta: "prima" }),
    ]);

    expect(riga(csv, 1)).toContain("prima");
    expect(riga(csv, 1)).toMatch(/^15\/01\/2026;/);
    expect(riga(csv, 2)).toContain("dopo");
  });

  it("l'intestazione è in italiano e c'è sempre, anche senza movimenti", () => {
    // La prima riga porta davanti il segno degli accenti: si toglie per leggerla.
    expect(riga(versoCsv([]), 0).replace(/^﻿/, "")).toBe(
      "Data;Ora;Tipo;Importo;Categoria;Descrizione;Metodo;Detto",
    );
  });
});
