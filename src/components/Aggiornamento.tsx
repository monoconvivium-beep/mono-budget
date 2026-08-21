import { useEffect, useSyncExternalStore } from "react";

import { RefreshCw, ArrowDownToLine } from "lucide-react";

import {
  VERSIONE_QUI,
  guardaSeCèDiNuovo,
  prendiLaVersioneNuova,
  type Esito,
} from "@/lib/aggiornamento";

/**
 * «CE L'HO L'ULTIMA VERSIONE?» — la risposta, e il bottone per averla.
 *
 * 🔴 Chiesto da lui il 21/8/2026, aperta l'app su Android: le categorie libere
 * erano pubblicate da un giorno e sul suo telefono non c'erano. «Aggiungi la
 * possibilità di aggiornare all'ultima versione in un tap, così siamo sicuri
 * che da lì è l'ultima.»
 *
 * 🔑 Due pezzi, e ognuno fa un mestiere diverso:
 * · l'**avviso in cima** parla da solo quando c'è una versione nuova — perché
 *   una cosa che sta solo in fondo, per lui, non esiste;
 * · la **riga in fondo a ogni schermata** dice sempre che versione hai e si
 *   tocca quando vuoi controllare tu. Anche quando è tutto a posto: sapere che
 *   sei all'ultima è metà della risposta.
 */

type Fase =
  | { fase: "riposo" }
  | { fase: "controllo" }
  | { fase: "esito"; esito: Esito }
  | { fase: "aggiorno" };

let stato: Fase = { fase: "riposo" };
const ascoltatori = new Set<() => void>();

function imposta(nuovo: Fase) {
  stato = nuovo;
  for (const a of ascoltatori) a();
}

function usaVersione(): Fase {
  return useSyncExternalStore(
    (a) => {
      ascoltatori.add(a);
      return () => ascoltatori.delete(a);
    },
    () => stato,
    () => stato,
  );
}

async function controlla() {
  if (stato.fase === "controllo" || stato.fase === "aggiorno") return;
  imposta({ fase: "controllo" });
  imposta({ fase: "esito", esito: await guardaSeCèDiNuovo(import.meta.env.BASE_URL) });
}

async function aggiorna() {
  imposta({ fase: "aggiorno" });
  await prendiLaVersioneNuova();
}

/**
 * Il controllo automatico si fa UNA VOLTA per apertura dell'app, non a ogni
 * schermata: cambiare pagina dentro l'app non è riaprirla.
 */
let giaGuardato = false;

function useControlloAllApertura() {
  useEffect(() => {
    if (giaGuardato) return;
    giaGuardato = true;
    void controlla();

    /**
     * ⚠️ E QUANDO L'APP TORNA IN PRIMO PIANO.
     * Su Android l'app messa in Home non riparte da capo: riappare com'era,
     * congelata dal giorno prima. Senza questa riga, chi non chiude mai l'app
     * non passerebbe mai dal controllo — che è esattamente com'è nato il
     * problema.
     */
    const alRitorno = () => {
      if (document.visibilityState === "visible" && stato.fase !== "aggiorno") void controlla();
    };
    document.addEventListener("visibilitychange", alRitorno);
    return () => document.removeEventListener("visibilitychange", alRitorno);
  }, []);
}

/** L'avviso in cima: c'è solo quando c'è davvero qualcosa da prendere. */
export function AvvisoVersione() {
  const corrente = usaVersione();
  useControlloAllApertura();

  const nuova =
    corrente.fase === "esito" && corrente.esito.stato === "vecchia"
      ? corrente.esito.versione
      : null;
  if (!nuova && corrente.fase !== "aggiorno") return null;

  return (
    <div className="scheda mb-4 flex items-center gap-3 p-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">
          {corrente.fase === "aggiorno" ? "Prendo la versione nuova…" : "C'è una versione nuova"}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {corrente.fase === "aggiorno"
            ? "L'app si riapre da sola."
            : `Hai la ${VERSIONE_QUI}, c'è la ${nuova}. I tuoi conti restano dove sono.`}
        </p>
      </div>
      {corrente.fase !== "aggiorno" && (
        <button
          type="button"
          onClick={() => void aggiorna()}
          className="tocco shrink-0 gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground"
        >
          <ArrowDownToLine className="h-4 w-4" /> Aggiorna
        </button>
      )}
    </div>
  );
}

/**
 * La riga in fondo a ogni schermata: che versione hai, e il tocco per
 * controllare. ⚠️ Dice sempre il numero, anche quando è tutto a posto: è quel
 * numero che permette di dire «guarda che hai la 30, l'ultima è la 31» senza
 * dover indovinare.
 */
export function RigaVersione({ chiara = false }: { chiara?: boolean }) {
  const corrente = usaVersione();

  const messaggio = () => {
    if (corrente.fase === "controllo") return "guardo…";
    if (corrente.fase === "aggiorno") return "prendo la versione nuova…";
    if (corrente.fase !== "esito") return null;
    if (corrente.esito.stato === "aggiornata") return "è l'ultima";
    if (corrente.esito.stato === "vecchia") return `c'è la ${corrente.esito.versione}`;
    /* ⚠️ «Non ho potuto guardare» non è «va tutto bene»: si dice qual è delle due. */
    return "senza rete, non ho potuto guardare";
  };

  const detto = messaggio();

  return (
    <p
      className={`mt-2 flex flex-wrap items-center justify-center gap-x-2 text-[11px] ${
        chiara ? "text-[var(--secondario-su-pieno)]" : "text-muted-foreground"
      }`}
    >
      <span>
        MonoConvivium {VERSIONE_QUI}
        {detto ? ` · ${detto}` : ""}
      </span>
      <button
        type="button"
        onClick={() => void controlla()}
        disabled={corrente.fase === "controllo" || corrente.fase === "aggiorno"}
        /* Sottolineato: in fondo a una pagina, un testo che si tocca deve dire
           da solo che si tocca. L'area del dito è 44 px anche se la scritta ne
           è alta 11. */
        className="inline-flex min-h-11 items-center gap-1.5 px-2 underline underline-offset-4 disabled:opacity-60"
      >
        <RefreshCw
          aria-hidden
          className={`h-3 w-3 ${corrente.fase === "controllo" ? "animate-spin" : ""}`}
        />
        Cerca aggiornamenti
      </button>
    </p>
  );
}
