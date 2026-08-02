/**
 * MONO MONEY — dove sono finiti i soldi.
 *
 * File PURO: niente React, niente grafica. Riceve dei movimenti e restituisce
 * i conti. Così i numeri si possono provare senza aprire l'app — ed è
 * importante, perché un grafico sbagliato non si vede: sembra solo strano.
 */
import { COLORI_CATEGORIA, type Categoria, type Tipo } from "./parse";
import type { Movimento } from "./store";

export interface VoceCategoria {
  categoria: Categoria;
  totale: number;
  /** Fetta sul totale, da 0 a 1. */
  quota: number;
  quantiMovimenti: number;
  colore: string;
}

/** Solo i movimenti di quel mese. `mese` va da 0 (gennaio) a 11. */
export function delMese(movimenti: readonly Movimento[], anno: number, mese: number): Movimento[] {
  return movimenti.filter((m) => {
    const d = new Date(m.data);
    return d.getFullYear() === anno && d.getMonth() === mese;
  });
}

/** Solo i movimenti di quell'anno. */
export function dellAnno(movimenti: readonly Movimento[], anno: number): Movimento[] {
  return movimenti.filter((m) => new Date(m.data).getFullYear() === anno);
}

/**
 * Quanto è andato in ogni categoria, dalla più grossa alla più piccola.
 *
 * ⚠️ Le categorie **senza niente dentro non compaiono**: una fetta da zero in un
 * grafico è una riga in più da leggere che non dice niente.
 * ⚠️ A parità di totale l'ordine è **alfabetico**, non casuale: due schermate
 * uguali devono restare uguali, altrimenti sembra che i conti si muovano.
 */
export function perCategoria(movimenti: readonly Movimento[], tipo: Tipo): VoceCategoria[] {
  const somme = new Map<Categoria, { totale: number; quanti: number }>();

  for (const m of movimenti) {
    if (m.tipo !== tipo) continue;
    const gia = somme.get(m.categoria) ?? { totale: 0, quanti: 0 };
    somme.set(m.categoria, { totale: gia.totale + m.importo, quanti: gia.quanti + 1 });
  }

  const totale = [...somme.values()].reduce((t, v) => t + v.totale, 0);
  if (totale <= 0) return [];

  return [...somme.entries()]
    .map(([categoria, v]) => ({
      categoria,
      totale: Math.round(v.totale * 100) / 100,
      quota: v.totale / totale,
      quantiMovimenti: v.quanti,
      colore: COLORI_CATEGORIA[categoria],
    }))
    .sort((a, b) => b.totale - a.totale || a.categoria.localeCompare(b.categoria, "it"));
}

/** La riga che si legge per prima: quanto, in quante volte, e quanto in media. */
export interface Riepilogo {
  entrate: number;
  uscite: number;
  /** Positiva se hai messo da parte, negativa se hai speso più di quanto è entrato. */
  differenza: number;
  quantiMovimenti: number;
  /** Spesa media per movimento. Zero se non c'è nessuna uscita. */
  spesaMedia: number;
}

export function riepilogo(movimenti: readonly Movimento[]): Riepilogo {
  const uscite = movimenti.filter((m) => m.tipo === "uscita");
  const entrate = movimenti.filter((m) => m.tipo === "entrata");
  const totaleUscite = uscite.reduce((t, m) => t + m.importo, 0);
  const totaleEntrate = entrate.reduce((t, m) => t + m.importo, 0);

  return {
    entrate: Math.round(totaleEntrate * 100) / 100,
    uscite: Math.round(totaleUscite * 100) / 100,
    differenza: Math.round((totaleEntrate - totaleUscite) * 100) / 100,
    quantiMovimenti: movimenti.length,
    spesaMedia: uscite.length ? Math.round((totaleUscite / uscite.length) * 100) / 100 : 0,
  };
}

/* ------------------------------------------------------ esportazione CSV */

/**
 * I movimenti in un file che si apre con un foglio di calcolo.
 *
 * 🔑 Tre scelte fatte apposta per l'Italia, e nessuna è un dettaglio:
 *  · **punto e virgola** come separatore — con la virgola, Excel italiano mette
 *    tutta la riga in una casella sola;
 *  · **virgola decimale** — «4,80» resta un numero, «4.80» diventa testo o, peggio,
 *    una data;
 *  · **il segno all'inizio del file** (BOM) — senza, gli accenti diventano
 *    scarabocchi e «così» si legge «cosÃ¬».
 */
export function versoCsv(movimenti: readonly Movimento[]): string {
  const intestazione = [
    "Data",
    "Ora",
    "Tipo",
    "Importo",
    "Categoria",
    "Descrizione",
    "Metodo",
    "Detto",
  ];

  const campo = (v: string) => (/[";\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const numero = (n: number) => n.toFixed(2).replace(".", ",");

  const righe = [...movimenti]
    .sort((a, b) => a.data.localeCompare(b.data))
    .map((m) => {
      const d = new Date(m.data);
      const gg = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const ora = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
      return [
        `${gg}/${mm}/${d.getFullYear()}`,
        ora,
        m.tipo === "entrata" ? "Entrata" : "Uscita",
        numero(m.importo),
        m.categoria,
        m.etichetta,
        m.metodo ?? "",
        m.testo,
      ]
        .map(campo)
        .join(";");
    });

  return "﻿" + [intestazione.join(";"), ...righe].join("\r\n") + "\r\n";
}
