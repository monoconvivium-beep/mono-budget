/**
 * LE SPESE CHE TORNANO — quelle che ci sono ogni mese e non te ne accorgi.
 *
 * 🔑 Il problema che risolve (chiesto da lui il 17/8/2026): una spesa da 9 €
 * non spaventa nessuno. Dodici spese da 9 € sono 108 € l'anno, e nessuno le
 * somma mai perché arrivano una alla volta, a un mese di distanza. Abbonamenti,
 * bollette, la palestra: **il danno non è la cifra, è la ripetizione**.
 *
 * 🔑 COME LE RICONOSCE, e perché non serve nessuna intelligenza artificiale:
 * una spesa «torna» se **la stessa etichetta compare in almeno due mesi
 * diversi** con un importo che si somiglia. Due mesi, non due volte: due caffè
 * nello stesso pomeriggio non sono un abbonamento, sono due caffè. È la
 * distanza nel tempo a fare la ricorrenza, non il numero di righe.
 *
 * ⚠️ NON indovina e NON avvisa. Non dice «ti sei dimenticato di pagare»: non
 * può saperlo, e un'app che accusa qualcuno di una dimenticanza che non c'è
 * perde la fiducia in un colpo solo. Dice solo quello che vede: questa cosa
 * torna, ti costa tanto al mese, e in un anno fa questa cifra.
 *
 * ⚠️ Solo le USCITE. Lo stipendio torna tutti i mesi, ma nessuno vuole essere
 * avvisato che gli entrano dei soldi.
 */
import type { Movimento } from "./store";

export interface SpesaRicorrente {
  /** Come l'ha chiamata chi l'ha detta: «netflix», «palestra», «bolletta». */
  etichetta: string;
  /** Quanto costa di solito, in centesimi: la MEDIANA, non la media. */
  tipico: number;
  /** In quanti mesi diversi è comparsa. */
  mesi: number;
  /** L'ultima volta che è stata segnata. */
  ultima: string;
  /** Quanto pesa in un anno, se continua così. */
  allAnno: number;
}

/** Il minimo per parlare di abitudine: sotto, è un caso. */
const MESI_MINIMI = 2;

/**
 * ⚠️ La soglia di somiglianza degli importi. Una bolletta non è mai identica
 * al centesimo: se si pretendesse l'importo esatto non si riconoscerebbe
 * niente di quello che conta davvero. Il 35% lascia respirare la luce e il gas
 * senza mettere insieme cose diverse che si chiamano uguale.
 */
const TOLLERANZA = 0.35;

/** Il mese di un movimento, come «2026-08». */
function mese(data: string): string {
  return data.slice(0, 7);
}

/** Etichette diverse solo per maiuscole o spazi sono la stessa cosa. */
function chiave(etichetta: string): string {
  return etichetta.trim().toLowerCase().replace(/\s+/g, " ");
}

function mediana(numeri: number[]): number {
  const ordinati = [...numeri].sort((a, b) => a - b);
  const mezzo = Math.floor(ordinati.length / 2);
  if (!ordinati.length) return 0;
  return ordinati.length % 2
    ? (ordinati[mezzo] ?? 0)
    : Math.round(((ordinati[mezzo - 1] ?? 0) + (ordinati[mezzo] ?? 0)) / 2);
}

/**
 * Le spese che tornano, dalla più pesante nell'anno alla più leggera.
 * Pura: si prova senza browser e senza dati veri.
 */
export function speseCheTornano(movimenti: Movimento[]): SpesaRicorrente[] {
  const perEtichetta = new Map<string, Movimento[]>();

  for (const m of movimenti) {
    if (m.cestinato) continue;
    if (m.tipo !== "uscita") continue;
    const k = chiave(m.etichetta);
    if (!k) continue;
    const gruppo = perEtichetta.get(k);
    if (gruppo) gruppo.push(m);
    else perEtichetta.set(k, [m]);
  }

  const fuori: SpesaRicorrente[] = [];

  for (const gruppo of perEtichetta.values()) {
    const tipico = mediana(gruppo.map((m) => m.importo));
    if (tipico <= 0) continue;

    /* Tengono solo le righe che costano più o meno come le altre: se sotto
       la stessa parola ci sono una spesa da 5 € e una da 200, non è la stessa
       cosa che torna — è la stessa parola usata per due cose diverse. */
    const simili = gruppo.filter((m) => Math.abs(m.importo - tipico) <= tipico * TOLLERANZA);
    const mesi = new Set(simili.map((m) => mese(m.data)));
    if (mesi.size < MESI_MINIMI) continue;

    const ultima = simili.reduce((a, m) => (m.data > a ? m.data : a), simili[0]?.data ?? "");
    fuori.push({
      etichetta: (simili[0] ?? gruppo[0])!.etichetta,
      tipico: mediana(simili.map((m) => m.importo)),
      mesi: mesi.size,
      ultima,
      allAnno: mediana(simili.map((m) => m.importo)) * 12,
    });
  }

  return fuori.sort(
    (a, b) => b.allAnno - a.allAnno || a.etichetta.localeCompare(b.etichetta, "it"),
  );
}

/** Quanto pesano in tutto, al mese. Il numero che nessuno somma mai. */
export function totaleAlMese(ricorrenti: SpesaRicorrente[]): number {
  return ricorrenti.reduce((s, r) => s + r.tipico, 0);
}
