import { Link } from "@tanstack/react-router";

import { GIORNI_PER_VINCERE, pallini } from "@/lib/gratta";
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
          <span className="block truncate text-xs text-[rgba(244,236,221,0.8)]">
            Sette giorni di fila. Vai a grattarlo nel Convivium
          </span>
        </span>
        <span aria-hidden className="text-[rgba(244,236,221,0.7)]">
          ›
        </span>
      </Link>
    );
  }

  // Già grattato: la striscia ha finito il suo lavoro e si toglie di mezzo.
  if (biglietto) return null;

  const accesi = pallini(striscia);
  if (accesi === 0) return null;

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
        <span className="mt-1 block text-muted-foreground">Scopri il premio.</span>
      </p>
      <p className="sr-only">
        {accesi} giorni su {GIORNI_PER_VINCERE}
      </p>
    </section>
  );
}
