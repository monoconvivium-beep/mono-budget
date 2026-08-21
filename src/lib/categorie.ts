/**
 * LE CATEGORIE, TUTTE INSIEME: quelle di casa e quelle sue.
 *
 * 🔴 Da dove nasce (21/8/2026): le categorie erano già libere dalla v29, ma si
 * potevano cambiare **solo dalla tendina di una riga di spesa**. Lui ha aperto
 * l'app, ha guardato, e ha detto: «le categorie non sono personalizzabili».
 * Aveva ragione: una cosa che esiste solo dentro un menù a tendina, per chi la
 * usa, non esiste. Da qui la schermata sua, e il bottone che non si può non
 * vedere.
 *
 * 🔑 Tre verbi, e sono diversi apposta:
 * · **aggiungere** una tua (già c'era) — vive in `categoriePersonali`;
 * · **rinominare** una di casa: «Trasporti» diventa «Benzina». Le spese che ci
 *   stavano dentro **si riscrivono**, se no la storia di prima direbbe una cosa
 *   e quella di dopo un'altra;
 * · **spegnere** quella che non usi (i «Tabacchi» di chi non fuma): sparisce
 *   dalla tendina e la voce non ce la mette più. ⚠️ Si **riaccende**: spegnere
 *   non è cancellare, e nessuna spesa si perde.
 *
 * ⛔ «Altro» non si tocca: è la rete di sicurezza dove finisce ciò che l'app non
 * ha capito, e dove tornano le spese di una categoria tolta. Senza, quelle
 * spese non avrebbero un posto dove stare.
 */
import { CATEGORIE, coloreCategoria, type CategoriaPersonale } from "@/lib/parse";

/** La categoria che non si può né spegnere né rinominare. */
export const RETE_DI_SICUREZZA = "Altro";

export type VoceCategoria = {
  nome: string;
  colore: string;
  /** Una delle undici di partenza. Le sue si possono togliere del tutto. */
  diCasa: boolean;
};

export type StatoCategorie = {
  categoriePersonali: CategoriaPersonale[];
  nascoste: string[];
};

/**
 * Quelle che si vedono: prima le undici di casa, poi le sue nell'ordine in cui
 * le ha fatte. ⚠️ «Altro» va **in fondo a tutto**: è la casella dove finisce
 * quello che non sta altrove, e in mezzo all'elenco sembrerebbe una categoria
 * come le altre invece che la fine della lista.
 */
export function categorieAttive(s: StatoCategorie): VoceCategoria[] {
  const spente = new Set(s.nascoste);
  const diCasa = CATEGORIE.filter((c) => !spente.has(c) && c !== RETE_DI_SICUREZZA).map((c) => ({
    nome: c as string,
    colore: coloreCategoria(c, s.categoriePersonali),
    diCasa: true,
  }));
  const sue = s.categoriePersonali
    .filter((c) => !spente.has(c.nome))
    .map((c) => ({ nome: c.nome, colore: c.colore, diCasa: false }));
  const rete = spente.has(RETE_DI_SICUREZZA)
    ? []
    : [
        {
          nome: RETE_DI_SICUREZZA,
          colore: coloreCategoria(RETE_DI_SICUREZZA, s.categoriePersonali),
          diCasa: true,
        },
      ];
  return [...diCasa, ...sue, ...rete];
}

/** Quelle spente, per poterle riaccendere. Fuori dalla tendina, ma non perdute. */
export function categorieSpente(s: StatoCategorie): VoceCategoria[] {
  const spente = new Set(s.nascoste);
  return [
    ...CATEGORIE.filter((c) => spente.has(c)).map((c) => ({
      nome: c as string,
      colore: coloreCategoria(c, s.categoriePersonali),
      diCasa: true,
    })),
    ...s.categoriePersonali
      .filter((c) => spente.has(c.nome))
      .map((c) => ({ nome: c.nome, colore: c.colore, diCasa: false })),
  ];
}

/**
 * Il nome si può usare?
 * Torna il motivo del no, o `null` se va bene. ⚠️ Il confronto è senza
 * maiuscole: «benzina» e «Benzina» sono la stessa casella, e due fette con lo
 * stesso nome nella torta si leggono come una sola.
 */
export function perchéNo(nome: string, esistenti: string[]): string | null {
  const pulito = nome.trim();
  if (!pulito) return "Il nome non può essere vuoto.";
  if (pulito.length > 24) return "Al massimo 24 lettere.";
  const gia = esistenti.some((n) => n.toLocaleLowerCase("it") === pulito.toLocaleLowerCase("it"));
  if (gia) return `«${pulito}» c'è già.`;
  return null;
}
