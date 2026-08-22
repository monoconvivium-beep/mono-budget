import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { leggiProvenienza, notaProvenienza, nuovoCodice, SITO } from "./origine";

describe("leggiProvenienza — le targhe nell'indirizzo", () => {
  it("legge il canale del banco", () => {
    expect(leggiProvenienza("?da=edicola")).toEqual({ da: "edicola" });
  });

  it("legge il codice amico e lo mette in maiuscolo", () => {
    expect(leggiProvenienza("?amico=pane-42")).toEqual({ amico: "PANE-42" });
  });

  it("legge tutte e due le targhe insieme", () => {
    expect(leggiProvenienza("?da=Banco-MONO&amico=MELA-77")).toEqual({
      da: "banco-mono",
      amico: "MELA-77",
    });
  });

  it("senza targhe non inventa niente", () => {
    expect(leggiProvenienza("")).toEqual({});
    expect(leggiProvenienza("?v=123")).toEqual({});
  });

  it("butta via i caratteri che non c'entrano: quello che arriva è testo di chiunque", () => {
    expect(leggiProvenienza("?da=edicola%20rosa!")).toEqual({ da: "edicolarosa" });
    expect(leggiProvenienza("?da=%3Cscript%3E")).toEqual({ da: "script" });
  });

  it("taglia le targhe chilometriche", () => {
    const lunga = "a".repeat(80);
    expect(leggiProvenienza(`?da=${lunga}`).da).toHaveLength(24);
  });

  it("non lascia trattini penzoloni ai bordi", () => {
    expect(leggiProvenienza("?da=--edicola--")).toEqual({ da: "edicola" });
  });
});

describe("notaProvenienza — la riga per la rubrica", () => {
  it("scrive tutte e due le targhe nel formato fisso", () => {
    expect(notaProvenienza({ da: "edicola", amico: "PANE-42" })).toBe(
      "[mono-money] da=edicola · amico=PANE-42",
    );
  });

  it("scrive solo quella che c'è", () => {
    expect(notaProvenienza({ da: "banco" })).toBe("[mono-money] da=banco");
    expect(notaProvenienza({ amico: "FICO-10" })).toBe("[mono-money] amico=FICO-10");
  });

  it("senza targhe non scrive niente: la colonna resta vuota", () => {
    expect(notaProvenienza({})).toBeNull();
  });
});

describe("nuovoCodice — il codice da dire al banco", () => {
  it("ha la forma PAROLA-NUMERO, col numero a due cifre", () => {
    for (let i = 0; i < 50; i++) {
      expect(nuovoCodice()).toMatch(/^[A-Z]{3,7}-[1-9]\d$/);
    }
  });

  it("col caso bloccato è sempre lo stesso: si può riprovare", () => {
    expect(nuovoCodice(() => 0)).toBe("PANE-10");
    expect(nuovoCodice(() => 0.999999)).toBe("UVA-99");
  });

  it("un codice generato passa il filtro dell'indirizzo senza perdere pezzi", () => {
    const codice = nuovoCodice();
    expect(leggiProvenienza(`?amico=${codice}`)).toEqual({ amico: codice });
  });
});

/**
 * DUE PORTE, DUE INDIRIZZI — e nessuno dei due scritto a mano in una schermata.
 *
 * 🔴 Da dove nasce (21/8/2026): nel Convivium c'era un bottone solo, «Vieni a
 * lavorare con noi», che apriva la **presentazione del progetto**. Chi cercava
 * lavoro leggeva il progetto sociale, e chi voleva capire cos'è MonoConvivium
 * non aveva nessuna porta col suo nome. Un'etichetta che dice una cosa e ne fa
 * un'altra è peggio di un bottone mancante: chi l'ha già toccata non ci torna.
 */
describe("gli indirizzi del sito", () => {
  it("il progetto e il lavoro non finiscono nello stesso posto", () => {
    expect(SITO.convivium).not.toBe(SITO.lavoraConNoi);
  });

  it("sono indirizzi veri del sito della bottega, non segnaposto", () => {
    for (const url of Object.values(SITO)) {
      expect(url).toMatch(/^https:\/\/monobottega\.it\//);
    }
  });

  it("il progetto si apre in un tocco: niente file da scaricare in mezzo", () => {
    // Sua scelta del 21/8: «così non devono scaricare niente». Un link a un
    // `.pdf` qui dentro sarebbe di nuovo il passaggio in più.
    for (const url of Object.values(SITO)) expect(url).not.toMatch(/\.pdf$/);
  });

  it("la schermata del Convivium li prende da qui, non li riscrive a mano", () => {
    // Un indirizzo scritto dentro una schermata è un indirizzo che nessuno
    // ricontrolla il giorno che il sito cambia — lezione del trasloco del 15/8.
    const schermata = readFileSync(
      new URL("../routes/convivium.tsx", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"),
      "utf8",
    );
    expect(schermata).toContain("SITO.convivium");
    expect(schermata).toContain("SITO.lavoraConNoi");
    expect(schermata).toContain("Scopri il progetto");
    expect(schermata).not.toMatch(/href="https:\/\/monobottega\.it/);
  });
});
