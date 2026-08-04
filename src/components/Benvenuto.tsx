/**
 * La schermata d'ingresso — quella che spiega cos'è e perché è gratis.
 *
 * 🔑 Non è decorazione: MONO MONEY è un **omaggio della bottega**, e chi lo
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
          {/* ⚠️ Due versioni, non una: il logo ufficiale è scuro e sul verde
              bosco sparisce; quello chiaro sul cashmere sparisce uguale.
              Qui il fondo cambia col tema, quindi cambia anche il logo.
              (Nel blocco MONO invece il fondo è sempre verde: là è fisso.) */}
          <img
            src={`${import.meta.env.BASE_URL}marchio/mono-orizzontale${
              tema === "scuro" ? "-chiaro" : ""
            }.svg`}
            alt="MONO — Bottega Gastronomica"
            className="mx-auto h-12 w-auto"
            width={190}
            height={48}
          />
          <p className="mt-5 text-xs font-semibold tracking-[0.2em] text-oro uppercase">
            Un omaggio utile di MONO
          </p>

          <h1 className="mt-3 text-4xl leading-none">
            <span className="block">MONO</span>
            <span className="block text-oro">MONEY</span>
          </h1>

          {/* Il payoff. È il claim della bottega: si scrive per intero, col punto. */}
          <p className="mt-4 text-xl">La tua voce conta.</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Il tuo borsellino, senza password. La tua voce diventa un bilancio chiaro: spese,
            entrate, categorie e risparmio, in un solo gesto.
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
            La promessa MONO MONEY
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
