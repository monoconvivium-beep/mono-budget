import { useState } from "react";
import { Plus, Check, X } from "lucide-react";
import { euro } from "@/lib/parse";
import { azioni } from "@/lib/store";
import { Aiuto } from "./Aiuto";

/**
 * LE ENTRATE — chiesto il 5/8/2026: «senza lo stipendio il bilancio non si
 * può fare».
 *
 * Era vero a metà: la voce le capiva già («stipendio millecinquecento» →
 * entrata), ma NIENTE nell'app diceva che si potesse fare. Una cosa che
 * esiste solo se indovini la parola giusta, per chi la usa non esiste.
 *
 * 🔑 Sta sotto i tre numeri, attaccata a «Entrate»: è lì che uno legge
 * «0,00 €» e si chiede come si mette.
 * ⚠️ L'importo non si trasforma di nascosto: mentre lo scrivi ti fa vedere
 * la cifra che salverà. Se hai battuto 1.450,50 vedi 1.450,50 € prima di
 * toccare Salva — la regola di tutta l'app.
 */
export function AggiungiEntrata() {
  const [aperto, setAperto] = useState(false);
  const [importo, setImporto] = useState("");
  const [etichetta, setEtichetta] = useState("");
  const [fatta, setFatta] = useState<number | null>(null);

  const valore = leggiImporto(importo);

  function salva() {
    if (valore === null || valore <= 0) return;

    /* La stessa vibrazione corta della spesa detta a voce: il gesto è andato
       a buon fine e non serve guardare lo schermo per saperlo. */
    navigator.vibrate?.(35);

    azioni.aggiungi({
      importo: valore,
      categoria: "Altro",
      etichetta: etichetta.trim() || "stipendio",
      tipo: "entrata",
      metodo: null,
      testo: `${importo} ${etichetta}`.trim(),
    });

    setFatta(valore);
    setImporto("");
    setEtichetta("");
    setAperto(false);
  }

  if (!aperto) {
    return (
      <section className="mt-4">
        <button
          type="button"
          onClick={() => {
            setAperto(true);
            setFatta(null);
          }}
          className="tocco w-full justify-center gap-2 rounded-2xl border border-dashed border-[color-mix(in_oklab,var(--color-primary)_45%,transparent)] px-4 font-semibold text-primary"
        >
          <Plus className="h-5 w-5" />
          Aggiungi un'entrata
        </button>
        <p className="mt-1.5 text-center text-xs text-muted-foreground">
          {fatta !== null ? (
            <span className="font-semibold text-primary">Segnata: +{euro(fatta)}</span>
          ) : (
            "Stipendio, rimborso, regalo — senza le entrate «da parte» è un numero finto."
          )}
        </p>
      </section>
    );
  }

  return (
    <section className="scheda mt-4 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg">Un'entrata</h2>
        <Aiuto testo="Puoi anche dirla a voce: «stipendio millequattrocentocinquanta». Le entrate non entrano nella torta delle spese: alzano «Entrate» e «Da parte»." />
      </div>

      <label className="block text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Quanto
      </label>
      <div className="mt-1 flex items-baseline gap-3">
        <input
          value={importo}
          onChange={(e) => setImporto(e.target.value)}
          inputMode="decimal"
          autoFocus
          placeholder="1450"
          aria-label="Importo dell'entrata"
          className="tocco w-full flex-1 rounded-2xl border border-input bg-card px-4 text-base"
        />
        {/* La cifra che verrà salvata, mentre la scrivi: si propone, non si corregge. */}
        <span className="numero shrink-0 text-lg text-muted-foreground">
          {valore === null ? "—" : euro(valore)}
        </span>
      </div>

      <label className="mt-3 block text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Cos'è
      </label>
      <input
        value={etichetta}
        onChange={(e) => setEtichetta(e.target.value)}
        placeholder="stipendio"
        aria-label="Nome dell'entrata"
        className="tocco mt-1 w-full rounded-2xl border border-input bg-card px-4 text-base"
      />

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={salva}
          disabled={valore === null || valore <= 0}
          className="tocco flex-1 gap-2 rounded-full bg-primary px-4 font-semibold text-primary-foreground disabled:opacity-50"
        >
          <Check className="h-5 w-5" /> Salva l'entrata
        </button>
        <button
          type="button"
          onClick={() => setAperto(false)}
          aria-label="Annulla"
          className="tocco rounded-full border border-border px-4"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}

/**
 * Legge un importo scritto all'italiana: «1.450,50» → 1450.5.
 * ⚠️ Il punto è il separatore delle migliaia, la virgola i centesimi. Chi
 * scrive «1.450» intende millequattrocentocinquanta, non uno e quarantacinque.
 */
function leggiImporto(testo: string): number | null {
  const pulito = testo.trim().replace(/[€\s]/g, "");
  if (!pulito) return null;
  const n = Number(pulito.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}
