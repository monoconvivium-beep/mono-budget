import { describe, expect, it } from "vitest";

import { BASI, FAMIGLIE_BASI, interpretaIngrediente, interpretaPasso, trovaBase } from "./cucina";

describe("interpretaIngrediente — dal parlato alla riga di ricettario", () => {
  it("converte numero in parole e misura: l'esempio del provino", () => {
    expect(interpretaIngrediente("trecento grammi di fagioli borlotti")).toBe(
      "300 g fagioli borlotti",
    );
  });

  it("«un litro e mezzo di brodo» → 1,5 l brodo", () => {
    expect(interpretaIngrediente("un litro e mezzo di brodo")).toBe("1,5 l brodo");
  });

  it("«sale quanto basta» → sale q.b.", () => {
    expect(interpretaIngrediente("sale quanto basta")).toBe("sale q.b.");
  });

  it("«quanto basta di sale» → sale q.b.", () => {
    expect(interpretaIngrediente("quanto basta di sale")).toBe("sale q.b.");
  });

  it("«mezzo litro di latte» → 0,5 l latte", () => {
    expect(interpretaIngrediente("mezzo litro di latte")).toBe("0,5 l latte");
  });

  it("gli etti si dicono ma non si scrivono: diventano grammi", () => {
    expect(interpretaIngrediente("due etti di prosciutto cotto")).toBe("200 g prosciutto cotto");
    expect(interpretaIngrediente("un etto di salame")).toBe("100 g salame");
  });

  it("quantità senza misura: «quattro tuorli» → 4 tuorli", () => {
    expect(interpretaIngrediente("quattro tuorli")).toBe("4 tuorli");
  });

  it("il «di» resta quando NON viene dopo una misura: «una bacca di vaniglia»", () => {
    expect(interpretaIngrediente("una bacca di vaniglia")).toBe("1 bacca di vaniglia");
  });

  it("misura attaccata al numero, come la scrive la gente: «300g zucchero»", () => {
    expect(interpretaIngrediente("300g zucchero")).toBe("300 g zucchero");
  });

  it("una riga già in ordine resta uguale", () => {
    expect(interpretaIngrediente("1,5 l brodo")).toBe("1,5 l brodo");
  });

  it("«un paio di carote» → 2 carote", () => {
    expect(interpretaIngrediente("un paio di carote")).toBe("2 carote");
  });

  it("«un chilo e mezzo di farina» → 1,5 kg farina (il mezzo dopo la misura)", () => {
    expect(interpretaIngrediente("un chilo e mezzo di farina")).toBe("1,5 kg farina");
  });

  it("senza quantità non inventa niente: esce pulita ma intera", () => {
    expect(interpretaIngrediente("  rosmarino   fresco ")).toBe("rosmarino fresco");
  });

  it("numeri composti: «centocinquanta grammi di burro» → 150 g burro", () => {
    expect(interpretaIngrediente("centocinquanta grammi di burro")).toBe("150 g burro");
  });

  it("il vuoto resta vuoto", () => {
    expect(interpretaIngrediente("   ")).toBe("");
  });
});

describe("interpretaPasso — il procedimento", () => {
  it("maiuscola in testa e punto in fondo", () => {
    expect(interpretaPasso("metti a bagno i fagioli la sera prima")).toBe(
      "Metti a bagno i fagioli la sera prima.",
    );
  });

  it("non raddoppia il punto se c'è già", () => {
    expect(interpretaPasso("Gira finché scrive.")).toBe("Gira finché scrive.");
  });

  it("rispetta punto esclamativo e interrogativo", () => {
    expect(interpretaPasso("non aprire il forno!")).toBe("Non aprire il forno!");
  });
});

describe("le basi dello chef", () => {
  it("sono il canone allargato: almeno 15, con le tre di partenza e le due chieste da lui", () => {
    expect(BASI.length).toBeGreaterThanOrEqual(15);
    const slugs = BASI.map((b) => b.slug);
    for (const s of [
      "crema-pasticcera",
      "crema-inglese",
      "pan-di-spagna",
      "crostata-alla-frutta",
      "mousse-al-cioccolato",
    ]) {
      expect(slugs).toContain(s);
    }
  });

  it("gli slug sono unici: due nomi che si somigliano valgono meno di zero", () => {
    const slugs = BASI.map((b) => b.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("ogni base appartiene a una famiglia vera, e nessuna famiglia resta vuota", () => {
    for (const b of BASI) expect(FAMIGLIE_BASI).toContain(b.famiglia);
    for (const f of FAMIGLIE_BASI) {
      expect(BASI.some((b) => b.famiglia === f)).toBe(true);
    }
  });

  it("ognuna ha ingredienti e passi, nessuna scatola vuota", () => {
    for (const b of BASI) {
      expect(b.ingredienti.length).toBeGreaterThanOrEqual(2);
      expect(b.passi.length).toBeGreaterThanOrEqual(3);
      expect(b.dosi.length).toBeGreaterThan(3);
      expect(b.sotto.length).toBeGreaterThan(5);
    }
  });

  it("le righe delle basi sono già nel formato del ricettario: l'interprete non le cambierebbe", () => {
    /* Se una dose fosse scritta «300 grammi di zucchero», l'interprete la
       riscriverebbe diversa da com'è stampata: le basi devono dare l'esempio. */
    for (const b of BASI) {
      for (const r of b.ingredienti) {
        expect(interpretaIngrediente(r)).toBe(r);
      }
    }
  });

  it("trovaBase risponde per slug e tace per il resto", () => {
    expect(trovaBase("crema-pasticcera")?.nome).toBe("Crema pasticcera");
    expect(trovaBase("tiramisu")).toBeUndefined();
  });
});
