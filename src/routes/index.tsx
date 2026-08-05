import { createFileRoute } from "@tanstack/react-router";

import { AggiungiEntrata } from "@/components/AggiungiEntrata";
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
 * LA HOME — ordine dettato da lui il 5/8/2026, parola per parola:
 *   0. il marchio GRANDE al centro   → «più grosso possibile»
 *   1. le ultime spese, subito sotto → cos'ho segnato
 *   2. il recap con la torta         → dov'è finito il mese
 *   3. entrate · da parte · oggi     → come sto messo
 *
 * ⚠️ Prima l'ordine era il contrario (torta, numeri, dettatura, spese): è
 * stato cambiato su sua richiesta, non per gusto. Non rimetterlo com'era.
 * ⚠️ La barra «Dì una spesa» è finita in fondo perché nell'elenco non c'era:
 * il gesto ce l'ha comunque sempre sotto il pollice, è il cerchio grande in
 * mezzo alla barra di navigazione.
 *
 * 🔑 Il verde bosco sta su **un blocco solo** per schermata, e da oggi
 * l'accento vero è il **terracotta**: il verde è l'eccezione, non la regola.
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
        /* 0. IL MARCHIO, GRANDE E AL CENTRO. «Più grosso possibile», parole
           sue. Largo il 76% della colonna: oltre tocca i bordi e non respira
           più. Il mese gli sta sotto, piccolo: è un dato, non un titolo. */
        <div className="w-full text-center">
          <img
            src={marchio}
            alt="MONO — Bottega Gastronomica"
            className="mx-auto w-[76%] max-w-[280px]"
          />
          <p className="mt-2 text-[11px] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
            {MESI[ora.getMonth()]} {ora.getFullYear()}
          </p>
        </div>
      }
    >
      {/* 1. Cos'ho segnato — subito sotto il marchio */}
      <section>
        <div className="mb-2 flex items-center justify-between px-1">
          <h2 className="text-lg">Ultime spese</h2>
          <Aiuto testo="Le × mettono il movimento nel cestino: lo recuperi dal Diario." />
        </div>

        {movimenti.length === 0 ? (
          <p className="scheda p-6 text-center text-sm text-muted-foreground">
            Ancora nessun movimento. Tocca il cerchio in fondo e dì la prima.
          </p>
        ) : (
          <ul className="space-y-2">
            {movimenti.slice(0, 8).map((m, i) => (
              <RigaMovimento
                key={m.id}
                m={m}
                scheda
                /* A scaletta: entrano una dopo l'altra, non tutte insieme.
                   Si ferma alla quarta — oltre diventa un'attesa, non un
                   movimento, e chi apre l'app vuole leggere, non guardare. */
                ritardoMs={Math.min(i, 3) * 60}
              />
            ))}
          </ul>
        )}
      </section>

      {/* 2. Il recap con la torta */}
      <div className="mt-6">
        <DoveVannoISoldi movimenti={delMeseCorrente} compatta />
      </div>

      {/* 3. I tre numeri — l'unico blocco verde della schermata */}
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

      {/* Le entrate: senza stipendio «da parte» è un numero finto. */}
      <AggiungiEntrata />

      {/* La voce resta raggiungibile anche da qui, ma in coda: nell'ordine
          che ha dettato non c'era, e il cerchio della barra in fondo fa già
          la stessa cosa con un tocco. */}
      <div className="mt-6">
        <Dettatura forma="barra" />
      </div>

      {/* Sta qui perché è il momento in cui uno ha appena provato la voce:
          è allora che la vuole tenere. Sparisce da sola una volta installata. */}
      <InstallaApp />

      <p className="mt-5 px-2 text-center text-xs leading-relaxed text-muted-foreground">
        Importi, categorie e saldo restano su questo telefono: nessun account, nessun server,
        nessuna chiamata di rete. Un regalo di MONO, gastronomia a Torino.
      </p>
    </Guscio>
  );
}
