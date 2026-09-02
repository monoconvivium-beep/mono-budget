import { Link } from "@tanstack/react-router";

import { GIORNI_PER_VINCERE, giorno, pallini, strisciaOggi } from "@/lib/gratta";
import { useStato } from "@/lib/store";

const LETTERE = ["L", "M", "M", "G", "V", "S", "D"] as const;

/**
 * LA SETTIMANA DI MONO — sette pallini che si accendono.
 *
 * 🔑 Serve a una cosa sola: far vedere che manca poco. Un premio che arriva
 * senza preavviso è una sorpresa carina una volta; un premio che si vede
 * avvicinare è il motivo per cui uno riapre l'app domani.
 *
 * ⚠️ Sparisce quando il biglietto è stato emesso: il gratta e vinci è UNO
 * per persona (sua regola), quindi una striscia che continuasse a riempirsi
 * starebbe promettendo una cosa che non arriverà mai più.
 *
 * ⚠️ Le lettere non sono i giorni della settimana veri — sono i sette passi.
 * Chi comincia di mercoledì vede comunque L M M G V S D, e va bene così:
 * dicono «sette volte», non «da lunedì a domenica».
 */
export function SettimanaMono({
  /**
   * In Home la striscia deve anche dire DOVE si va a prendere il premio: il
   * gratta e vinci vive solo nel Convivium (sua regola), e senza questo
   * rimando chi compie i sette giorni vedrebbe la striscia sparire senza
   * capire dov'è finita.
   */
  rimandaAlConvivium = false,
}: {
  rimandaAlConvivium?: boolean;
} = {}) {
  const { striscia, biglietto } = useStato();

  // C'è un biglietto da grattare: in Home si dice dov'è, altrove niente.
  if (biglietto && !biglietto.grattato) {
    if (!rimandaAlConvivium) return null;
    return (
      <Link
        to="/convivium"
        className="mt-4 flex min-h-[64px] items-center gap-3 rounded-2xl border-2 border-[var(--oro)] bg-[linear-gradient(160deg,#3E5A43,#2E4230)] p-3.5 text-[var(--cashmere)] shadow-rialzata"
      >
        <span aria-hidden className="text-2xl">
          ☕
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-bold">Il tuo gratta e vinci è pronto</span>
          <span className="block truncate text-xs text-[var(--secondario-su-pieno)]">
            Sette giorni di fila. Vai a grattarlo nel Convivium
          </span>
        </span>
        <span aria-hidden className="text-[var(--secondario-su-pieno)]">
          ›
        </span>
      </Link>
    );
  }

  // Già grattato: la striscia ha finito il suo lavoro e si toglie di mezzo.
  if (biglietto) return null;

  /**
   * 🔴 LA FILA SI GUARDA CONTRO OGGI (23/8/2026, difetto trovato da lui).
   * Prima si disegnavano i pallini salvati: chi aveva usato l'app martedì,
   * mercoledì e giovedì vedeva **3 su 7 per sempre**, anche a settembre. Adesso
   * se l'ultimo uso non è di oggi o di ieri la fila è finita, e si vede.
   */
  const accesi = pallini(strisciaOggi(striscia, giorno(new Date())));

  const mancano = GIORNI_PER_VINCERE - accesi;

  return (
    <section className="scheda mt-4 p-4 text-center">
      <p className="text-[10px] font-bold tracking-[0.16em] text-muted-foreground uppercase">
        La settimana di MONO
      </p>
      <div className="mt-2.5 flex justify-center gap-1.5">
        {LETTERE.map((l, i) => {
          const fatto = i < accesi;
          return (
            <span
              key={i}
              aria-hidden
              className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-[11px] font-bold ${
                fatto
                  ? "border-[var(--oliva)] bg-[var(--oliva)] text-[var(--cashmere)]"
                  : "border-[#D8CBAE] text-[#B6A98C]"
              }`}
            >
              {l}
            </span>
          );
        })}
      </div>
      {/* «ti tocca il gratta e vinci» l'ha bocciata lui: suonava come un
          obbligo invece che come un premio. «Sblocchi» dice che te lo sei
          guadagnato, e «scopri il premio» dice perché vale la pena tornare. */}
      <p className="mt-2.5 text-[13px] leading-relaxed">
        {mancano === 1 ? (
          <>
            Ancora <strong>un giorno</strong> e sblocchi il gratta e vinci.
          </>
        ) : (
          <>
            Ancora <strong>{mancano} giorni</strong> e sblocchi il gratta e vinci.
          </>
        )}
        {/**
         * 🔑 LE REGOLE SI DICONO, se no il conto sembra rotto (23/8/2026).
         * Una sua amica apriva l'app tutti i giorni e vedeva i pallini fermi:
         * non era guasto, è che **aprire non è usare** — e questo, prima, non
         * c'era scritto da nessuna parte. Un premio con una regola nascosta non
         * è un premio, è un dispetto.
         */}
        <span className="mt-1 block text-muted-foreground">
          {accesi === 0
            ? "Segna una spesa, o spunta qualcosa nella lista: il giorno è tuo. Aprire e basta non conta, e se ne salti uno si riparte."
            : "Il giorno conta quando fai qualcosa: una spesa, la lista, una cosa da fare. Se ne salti uno, si riparte."}
        </span>
      </p>
      <p className="sr-only">
        {accesi} giorni su {GIORNI_PER_VINCERE}
      </p>
    </section>
  );
}
