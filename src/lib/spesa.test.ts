import { describe, expect, it } from "vitest";

import { FRASI_SPESA, fraseSpesa } from "./spesa";
import { interpretaIngrediente } from "./cucina";

describe("le frasi della spesa", () => {
  it("gira in cerchio e non esce mai dall'elenco", () => {
    for (let i = 0; i < FRASI_SPESA.length * 3 + 7; i++) {
      expect(FRASI_SPESA).toContain(fraseSpesa(i));
    }
  });

  it("dopo un giro completo ricomincia dalla stessa", () => {
    expect(fraseSpesa(0)).toBe(fraseSpesa(FRASI_SPESA.length));
    expect(fraseSpesa(3)).toBe(fraseSpesa(FRASI_SPESA.length + 3));
  });

  /* Il giro nasce da un orologio: se il numero arriva negativo — fuso, ora
     legale, telefono con la data storta — deve uscire comunque una frase e
     non un buco nella schermata. */
  it("regge anche i numeri negativi", () => {
    expect(FRASI_SPESA).toContain(fraseSpesa(-1));
    expect(FRASI_SPESA).toContain(fraseSpesa(-999));
  });

  it("due aperture di fila non dicono la stessa cosa", () => {
    for (let i = 0; i < FRASI_SPESA.length; i++) {
      expect(fraseSpesa(i)).not.toBe(fraseSpesa(i + 1));
    }
  });

  it("nessuna frase è vuota e nessuna è ripetuta", () => {
    for (const f of FRASI_SPESA) expect(f.trim().length).toBeGreaterThan(10);
    expect(new Set(FRASI_SPESA).size).toBe(FRASI_SPESA.length);
  });

  /* ⚠️ La differenza col Buongiorno, messa nero su bianco: quelle frasi non
     nominano mai MONO, queste devono farlo — se qualcuno un giorno le mescola
     per sbaglio, questa prova se ne accorge prima dei clienti. */
  it("parlano di MONO: è il loro mestiere", () => {
    const conNome = FRASI_SPESA.filter((f) => /MONO|noi\b|ci pensiamo/i.test(f));
    expect(conNome.length).toBe(FRASI_SPESA.length);
  });
});

describe("la voce della lista", () => {
  /* La lista usa lo stesso interprete del ricettario: quello che si dice
     al banco deve uscire scritto come lo scriverebbe una persona. */
  it("mette in ordine quantità e misura", () => {
    expect(interpretaIngrediente("due etti di prosciutto crudo")).toBe("200 g prosciutto crudo");
    expect(interpretaIngrediente("un chilo di pomodori")).toBe("1 kg pomodori");
    expect(interpretaIngrediente("mezzo litro di latte")).toBe("0,5 l latte");
  });

  it("lascia stare quello che non capisce", () => {
    expect(interpretaIngrediente("pane")).toBe("pane");
    expect(interpretaIngrediente("detersivo per i piatti")).toBe("detersivo per i piatti");
  });
});
