/**
 * La schermata d'ingresso — quella che spiega cos'è e perché è gratis.
 *
 * 🔑 Non è decorazione: MonoConvivium è un **omaggio della bottega**, e chi lo
 * riceve deve capire in cinque secondi tre cose — cos'è, che non costa niente,
 * e che i suoi soldi non li vede nessuno. Senza questa schermata l'app si apre
 * su una lista vuota e sembra un'app qualunque scaricata per sbaglio.
 *
 * Si vede **una volta sola**. Si può rileggere dalla scheda MONO.
 */
import { Mic, PiggyBank, ShieldCheck } from "lucide-react";

import { azioni, useStato } from "@/lib/store";

import { InstallaApp } from "./InstallaApp";

const PUNTI = [
  {
    Icona: Mic,
    titolo: "Dillo, non scriverlo",
    testo: "«Quarantasei farmacia». Un tocco, una spesa: categoria e importo li mette lei.",
  },
  {
    Icona: PiggyBank,
    titolo: "I conti si fanno da soli",
    testo: "Mese per mese, anno per anno: quanto entra, quanto esce, e dove finisce.",
  },
  {
    Icona: ShieldCheck,
    titolo: "Restano tuoi",
    testo: "Gli importi non escono da questo telefono. Nessun account, nessun server.",
  },
];

export function Benvenuto() {
  const { tema } = useStato();

  return (
    <main
      className={`min-h-screen bg-background px-5 pt-10 pb-10 ${tema === "scuro" ? "dark" : ""}`}
    >
      <div className="mx-auto w-full max-w-md">
        <header className="text-center">
          {/* Il logo ufficiale della bottega, per primo: prima si vede da chi
              arriva il regalo, poi cos'è. */}
          {/* ⚠️ 9/8: UNA versione sola, l'originale, sulla sua targa cashmere.
              Prima qui si cambiava marchio col tema — scuro sul chiaro, chiaro
              sullo scuro — ma la versione svuotata «non è il marchio» (sua
              regola del 5/8). La targa risolve il problema una volta per
              tutte, su qualunque fondo. */}
          <span className="targa mx-auto block w-fit">
            <img
              src={`${import.meta.env.BASE_URL}marchio/mono-orizzontale.svg`}
              alt="MONO — Bottega Gastronomica"
              className="h-14 w-auto"
              width={224}
              height={56}
            />
          </span>
          <p className="mt-6 text-xs font-semibold tracking-[0.2em] text-oro uppercase">
            Un omaggio utile di
          </p>
          <p className="mt-1 text-sm font-semibold tracking-[0.12em] uppercase">
            MONO · Bottega Gastronomica
          </p>

          {/* Il marchio dell'app sotto quello della bottega: prima chi lo regala,
              poi cosa regala. */}
          {/* ⚠️ Il nome era spezzato in due righe («MONO» / «MONEY») e per
              questo era sopravvissuto al cambio di nome del 9/8: cercando
              «MONO MONEY» non lo trovava nessuno. Era il titolone della PRIMA
              schermata che si vede installando l'app. */}
          <h1 className="mt-6 text-4xl leading-none">
            <span className="block">Mono</span>
            <span className="block text-oro">Convivium</span>
          </h1>

          {/* Il payoff. È il claim della bottega: si scrive per intero, col punto. */}
          <p className="mt-4 text-xl">La tua voce conta.</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            I conti, la lista della spesa, le cose da fare e il quaderno di cucina. Tutto detto a
            voce, tutto sul tuo telefono.
          </p>
        </header>

        <ul className="mt-8 space-y-3">
          {PUNTI.map(({ Icona, titolo, testo }) => (
            <li key={titolo} className="scheda flex items-start gap-4 p-4">
              <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-oro text-oro-foreground">
                <Icona className="h-5 w-5" />
              </span>
              <span>
                <strong className="block text-base">{titolo}</strong>
                <span className="mt-0.5 block text-sm leading-relaxed text-muted-foreground">
                  {testo}
                </span>
              </span>
            </li>
          ))}
        </ul>

        <section className="scheda-bosco mt-4 p-5">
          <p className="text-xs font-semibold tracking-widest uppercase opacity-80">
            La promessa MonoConvivium
          </p>
          <p className="mt-2 text-sm leading-relaxed opacity-95">
            MONO <strong>non riceve niente</strong>: né le cifre, né le categorie, né il saldo, né
            il metodo di pagamento. Nemmeno il tuo nome. Non c'è un account da fare e l'app non
            manda niente da nessuna parte — l'unico modo per portare i tuoi conti altrove sei tu,
            col file di backup.
          </p>
        </section>

        <button
          type="button"
          onClick={() => azioni.chiudiBenvenuto()}
          className="mt-5 flex min-h-[56px] w-full items-center justify-center rounded-2xl bg-oro px-5 text-lg font-semibold text-oro-foreground"
        >
          Comincia
        </button>

        <InstallaApp />

        <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
          Gratis, per sempre. Un regalo di <strong>MONO</strong> — bottega di gastronomia, Torino.
        </p>
      </div>
    </main>
  );
}
