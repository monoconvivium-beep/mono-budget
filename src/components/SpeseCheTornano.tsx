/**
 * «LE SPESE CHE TORNANO» — il conto che nessuno fa mai.
 *
 * 🔑 Perché sta in Home e non nei Bilanci: nei Bilanci ci va chi ha già deciso
 * di guardare i conti. Questo invece serve a chi **non lo sta cercando** — è
 * proprio il fatto di non pensarci che rende gli abbonamenti quello che sono.
 *
 * ⚠️ Compare solo quando c'è davvero qualcosa da dire (almeno una spesa che
 * torna in due mesi diversi). Un riquadro vuoto che spiega cosa comparirà un
 * giorno è ingombro: qui la Home è già lunga.
 * ⚠️ Non accusa e non avvisa: dice quello che vede. Vedi `lib/ricorrenti.ts`.
 */
import { useMemo, useState } from "react";
import { RotateCw } from "lucide-react";

import { euro } from "@/lib/parse";
import { speseCheTornano, totaleAlMese } from "@/lib/ricorrenti";
import { attivi, useStato } from "@/lib/store";

import { Aiuto } from "./Aiuto";

/** Quante mostrarne prima di chiedere «vedi tutte»: le altre stancano. */
const IN_VISTA = 4;

export function SpeseCheTornano() {
  const stato = useStato();
  const [tutte, setTutte] = useState(false);

  const ricorrenti = useMemo(() => speseCheTornano(attivi(stato.movimenti)), [stato.movimenti]);
  if (!ricorrenti.length) return null;

  const alMese = totaleAlMese(ricorrenti);
  const mostrate = tutte ? ricorrenti : ricorrenti.slice(0, IN_VISTA);

  return (
    <section className="scheda mt-4 p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg">
          <RotateCw aria-hidden className="h-5 w-5 text-[var(--oliva)]" />
          Le spese che tornano
        </h2>
        <Aiuto testo="Le cose che hai segnato in almeno due mesi diversi con un importo simile: abbonamenti, bollette, la palestra. Non è un avviso e non ti sto dicendo che hai dimenticato qualcosa — è solo la somma che di solito nessuno fa, perché queste spese arrivano una alla volta." />
      </div>

      {/**
       * IL NUMERO GRANDE È QUELLO ALL'ANNO, non quello al mese.
       * Nove euro al mese non spaventano nessuno: è il «108 € l'anno» a far
       * cambiare idea. Il mensile resta scritto, piccolo, perché è la cifra
       * che uno riconosce sull'estratto conto.
       */}
      <p className="mt-3 text-sm text-muted-foreground">
        Ti pesano <strong className="text-foreground">{euro(alMese)}</strong> al mese, cioè
      </p>
      <p className="numero mt-0.5 text-3xl">{euro(alMese * 12)} all&apos;anno</p>

      <ul className="mt-3 space-y-1.5">
        {mostrate.map((r) => (
          <li
            key={r.etichetta}
            className="flex items-baseline justify-between gap-3 border-b border-border pb-1.5 text-sm last:border-0"
          >
            <span className="min-w-0 flex-1 truncate">
              {r.etichetta}
              <span className="text-muted-foreground"> · {r.mesi} mesi</span>
            </span>
            <span className="numero shrink-0 font-semibold">{euro(r.tipico)}</span>
          </li>
        ))}
      </ul>

      {ricorrenti.length > IN_VISTA && (
        <button
          type="button"
          onClick={() => setTutte((v) => !v)}
          className="tocco mt-2 w-full rounded-2xl border border-border text-sm font-semibold text-muted-foreground"
        >
          {tutte ? "Mostra solo le prime" : `Vedi tutte e ${ricorrenti.length}`}
        </button>
      )}
    </section>
  );
}
