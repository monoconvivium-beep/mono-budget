import { describe, expect, it } from "vitest";

import { leggiProvenienza, notaProvenienza, nuovoCodice } from "./origine";

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
