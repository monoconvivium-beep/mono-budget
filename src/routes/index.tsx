import { createFileRoute } from "@tanstack/react-router";

import { Aiuto } from "@/components/Aiuto";
import { Dettatura } from "@/components/Dettatura";
import { DoveVannoISoldi } from "@/components/DoveVannoISoldi";
import { Guscio } from "@/components/Guscio";
import { InstallaApp } from "@/components/InstallaApp";
import { RigaMovimento } from "@/components/RigaMovimento";
import { euro } from "@/lib/parse";
import { delMese } from "@/lib/statistiche";
import { attivi, MESI, somma, useStato } from "@/lib/store";

export const Route = createFileRoute("/")({ component: Home });

/**
 * LA HOME — impaginazione «B», scelta guardando i provini il 4/8/2026.
 *
 * L'ordine non è casuale, è la domanda che uno si fa aprendo l'app:
 *   1. dov'è finito il mese?      → la torta, in cima
 *   2. quanto entra e quanto resta? → la striscia verde coi tre numeri
 *   3. devo segnare una spesa      → la barra larga
 *   4. cos'ho segnato finora       → le ultime spese
 *
 * 🔑 Il verde bosco sta su **un blocco solo**: se lo mettessi su tutto,
 * non salterebbe all'occhio più niente.
 */
function Home() {
  const stato = useStato();
  const movimenti = attivi(stato.movimenti);
  const ora = new Date();
  const delMeseCorrente = delMese(movimenti, ora.getFullYear(), ora.getMonth());

  const uscite = somma(delMeseCorrente, "uscita");
  const entrate = somma(delMeseCorrente, "entrata");
  const daParte = Math.max(0, entrate - uscite);
  const oggi = movimenti
    .filter((m) => new Date(m.data).toDateString() === ora.toDateString() && m.tipo === "uscita")
    .reduce((t, m) => t + m.importo, 0);

  const marchio = `${import.meta.env.BASE_URL}marchio/mono-orizzontale${
    stato.tema === "scuro" ? "-chiaro" : ""
  }.svg`;

  return (
    <Guscio
      titolo="MONO MONEY"
      intestazione={
        <div className="flex w-full items-center justify-between">
          <img src={marchio} alt="MONO — Bottega Gastronomica" className="h-5 w-auto" />
          <span className="text-sm text-muted-foreground">
            {MESI[ora.getMonth()]} {ora.getFullYear()}
          </span>
        </div>
      }
    >
      {/* 1. Dov'è finito il mese */}
      <DoveVannoISoldi movimenti={delMeseCorrente} compatta />

      {/* 2. I tre numeri — l'unico blocco verde della schermata */}
      <section className="scheda-bosco mt-4 flex gap-2 p-4">
        {[
          { titolo: "Entrate", valore: entrate },
          { titolo: "Da parte", valore: daParte },
          { titolo: "Oggi", valore: oggi },
        ].map((r) => (
          <div key={r.titolo} className="flex-1 text-center">
            <p className="text-[10px] font-semibold tracking-widest uppercase opacity-65">
              {r.titolo}
            </p>
            <p className="numero mt-1 text-base leading-tight">{euro(r.valore)}</p>
          </div>
        ))}
      </section>

      {/* 3. Segnare una spesa */}
      <div className="mt-4">
        <Dettatura forma="barra" />
      </div>

      {/* Sta qui perché è il momento in cui uno ha appena provato la voce:
          è allora che la vuole tenere. Sparisce da sola una volta installata. */}
      <InstallaApp />

      {/* 4. Cos'ho segnato */}
      <section className="mt-6">
        <div className="mb-2 flex items-center justify-between px-1">
          <h2 className="text-lg">Ultime spese</h2>
          <Aiuto testo="Le × mettono il movimento nel cestino: lo recuperi dal Diario." />
        </div>

        {movimenti.length === 0 ? (
          <p className="scheda p-6 text-center text-sm text-muted-foreground">
            Ancora nessun movimento. Tocca «Dì una spesa» e dì la prima.
          </p>
        ) : (
          <ul className="space-y-2">
            {movimenti.slice(0, 8).map((m) => (
              <RigaMovimento key={m.id} m={m} scheda />
            ))}
          </ul>
        )}
      </section>

      <p className="mt-5 px-2 text-center text-xs leading-relaxed text-muted-foreground">
        Importi, categorie e saldo restano su questo telefono: nessun account, nessun server,
        nessuna chiamata di rete. Un regalo di MONO, gastronomia a Torino.
      </p>
    </Guscio>
  );
}
