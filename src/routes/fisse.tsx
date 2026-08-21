import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { CalendarClock, Check, Plus, Power, Trash2, X } from "lucide-react";

import { Aiuto } from "@/components/Aiuto";
import { Guscio } from "@/components/Guscio";
import { categorieAttive } from "@/lib/categorie";
import { giornoBuono, pesoAnnuale } from "@/lib/fisse";
import { euro, leggiImporto, pillolaDi } from "@/lib/parse";
import { azioni, useStato } from "@/lib/store";

export const Route = createFileRoute("/fisse")({
  head: () => ({
    meta: [
      { title: "Le spese fisse — MonoConvivium" },
      {
        name: "description",
        content:
          "Affitto, luce e gas, abbonamenti: le spese che tornano uguali ogni mese le segna l'app, senza doverle ridire.",
      },
    ],
  }),
  component: Fisse,
});

/**
 * LE SPESE FISSE — «non bisogna ridirlo».
 *
 * 🔴 Chiesta da lui il 21/8/2026: «affitto, Netflix, luce e gas — la spesa è
 * sempre la stessa, si può impostare così ogni mese». Un'app a cui devi
 * ripetere ogni mese le stesse quattro cifre ti fa fare il lavoro che dovrebbe
 * fare lei.
 *
 * ⚠️ Quello che questa schermata NON fa, ed è voluto: non paga niente, non si
 * collega a nessuna banca, non tocca i tuoi soldi. **Scrive una riga nel
 * quaderno** al posto tuo, quando arriva il giorno. Il resto è affar tuo.
 */
function Fisse() {
  const stato = useStato();
  const attive = categorieAttive(stato);
  const [aperto, setAperto] = useState(false);
  const [cosa, setCosa] = useState("");
  const [importo, setImporto] = useState("");
  const [categoria, setCategoria] = useState("Abbonamenti");
  const [giorno, setGiorno] = useState("1");
  const [daTogliere, setDaTogliere] = useState<string | null>(null);

  const valore = leggiImporto(importo);
  const puoSalvare = cosa.trim().length > 0 && valore !== null && valore > 0;

  const annoIntero = pesoAnnuale(stato.fisse);

  function salva() {
    if (!puoSalvare || valore === null) return;
    azioni.fissaAggiungi({
      cosa,
      importo: valore,
      categoria,
      giorno: giornoBuono(Number(giorno)),
    });
    /* Segna subito quella del mese in corso, se il giorno è già passato: se no
       uno la crea il 20 per il giorno 1 e non vede succedere niente. */
    azioni.segnaLeFisse();
    setCosa("");
    setImporto("");
    setGiorno("1");
    setAperto(false);
  }

  return (
    <Guscio
      titolo="Le spese fisse"
      marchio="sorriso"
      sottotitolo={
        stato.fisse.length === 0
          ? "Quelle che tornano uguali ogni mese"
          : `${stato.fisse.length} · ${euro(annoIntero)} all'anno`
      }
      azione={
        <Aiuto testo="Affitto, luce e gas, abbonamenti: le scrivi una volta e l'app le segna da sola ogni mese, il giorno che dici tu. Non paga niente e non si collega a nessuna banca: scrive la riga nel quaderno al posto tuo." />
      }
    >
      {aperto ? (
        <form
          className="scheda p-4"
          onSubmit={(e) => {
            e.preventDefault();
            salva();
          }}
        >
          <label
            htmlFor="fissa-cosa"
            className="block text-xs font-semibold tracking-wide text-muted-foreground uppercase"
          >
            Cos'è
          </label>
          <input
            id="fissa-cosa"
            value={cosa}
            onChange={(e) => setCosa(e.target.value)}
            autoFocus
            maxLength={32}
            placeholder="Affitto"
            className="tocco mt-1 w-full rounded-2xl border border-input bg-card px-4 text-base"
          />

          <label
            htmlFor="fissa-importo"
            className="mt-3 block text-xs font-semibold tracking-wide text-muted-foreground uppercase"
          >
            Quanto, ogni mese
          </label>
          <div className="mt-1 flex items-baseline gap-3">
            <input
              id="fissa-importo"
              value={importo}
              onChange={(e) => setImporto(e.target.value)}
              inputMode="decimal"
              placeholder="700"
              className="tocco w-full flex-1 rounded-2xl border border-input bg-card px-4 text-base"
            />
            {/* La cifra che verrà salvata, mentre la scrivi: si propone, non si corregge. */}
            <span className="numero shrink-0 text-lg text-muted-foreground">
              {valore === null ? "—" : euro(valore)}
            </span>
          </div>

          <div className="mt-3 flex gap-3">
            <div className="min-w-0 flex-1">
              <label
                htmlFor="fissa-categoria"
                className="block text-xs font-semibold tracking-wide text-muted-foreground uppercase"
              >
                Dove finisce
              </label>
              <select
                id="fissa-categoria"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="tocco mt-1 w-full rounded-2xl border border-input bg-card px-3 text-base"
              >
                {attive.map((c) => (
                  <option key={c.nome} value={c.nome}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-24 shrink-0">
              <label
                htmlFor="fissa-giorno"
                className="block text-xs font-semibold tracking-wide text-muted-foreground uppercase"
              >
                Il giorno
              </label>
              <input
                id="fissa-giorno"
                value={giorno}
                onChange={(e) => setGiorno(e.target.value)}
                inputMode="numeric"
                className="tocco mt-1 w-full rounded-2xl border border-input bg-card px-3 text-center text-base"
              />
            </div>
          </div>
          {/* ⚠️ Il 31 di febbraio non esiste: si dice qui, non si scopre a febbraio. */}
          <p className="mt-2 text-xs text-muted-foreground">
            Dal 1 al 28, così non salta nei mesi corti. Parte da questo mese: quello che hai già
            pagato prima non me lo invento.
          </p>

          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={!puoSalvare}
              className="tocco flex-1 gap-2 rounded-full bg-primary px-4 font-semibold text-primary-foreground disabled:opacity-50"
            >
              <Check className="h-5 w-5" /> Salva
            </button>
            <button
              type="button"
              onClick={() => setAperto(false)}
              aria-label="Annulla"
              className="tocco rounded-full border border-border px-4 text-muted-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setAperto(true)}
          className="tocco w-full justify-center gap-2 rounded-2xl bg-[var(--azione-scheda)] px-4 text-[15px] font-bold text-[var(--azione-testo)] shadow-rialzata"
        >
          <Plus className="h-5 w-5" /> Aggiungi una spesa fissa
        </button>
      )}

      {stato.fisse.length === 0 ? (
        <p className="scheda mt-4 p-6 text-center text-sm leading-relaxed text-muted-foreground">
          Qui ci stanno l'affitto, la luce e il gas, gli abbonamenti: le cose che paghi uguali ogni
          mese. Le scrivi una volta sola e poi non devi più ridirle.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {stato.fisse.map((f) => {
            const { fondo, inchiostro } = pillolaDi(f.categoria, stato.categoriePersonali);
            const quante = stato.movimenti.filter((m) => m.fissa === f.id && !m.cestinato).length;

            if (daTogliere === f.id) {
              return (
                <li key={f.id} className="scheda p-3">
                  <p className="text-sm">
                    Tolgo «{f.cosa}»?{" "}
                    <span className="text-muted-foreground">
                      {quante === 0
                        ? "Non è ancora stata segnata nessuna volta."
                        : `Le ${quante} già segnate restano nel quaderno: sono spese vere, uscite davvero. Smette solo di segnarne di nuove.`}
                    </span>
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        azioni.fissaTogli(f.id);
                        setDaTogliere(null);
                      }}
                      className="tocco flex-1 rounded-full bg-primary px-4 font-semibold text-primary-foreground"
                    >
                      Sì, toglila
                    </button>
                    <button
                      type="button"
                      onClick={() => setDaTogliere(null)}
                      className="tocco flex-1 rounded-full border border-border px-4"
                    >
                      Lasciala
                    </button>
                  </div>
                </li>
              );
            }

            return (
              <li key={f.id} className={`scheda p-3 ${f.attiva ? "" : "opacity-60"}`}>
                <div className="flex items-center gap-2">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{f.cosa}</span>
                    <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                      <span
                        className="pillola font-semibold"
                        style={{ backgroundColor: fondo, color: inchiostro }}
                      >
                        {f.categoria}
                      </span>
                      <span>
                        il {f.giorno} del mese{f.attiva ? "" : " · spenta"}
                      </span>
                    </span>
                  </span>
                  <span className="numero shrink-0 text-lg">{euro(f.importo)}</span>
                  <button
                    type="button"
                    onClick={() => azioni.fissaAccendiOSpegni(f.id)}
                    aria-label={f.attiva ? `Spegni ${f.cosa}` : `Riaccendi ${f.cosa}`}
                    className="tocco shrink-0 rounded-full border border-border px-3 text-muted-foreground"
                  >
                    <Power className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDaTogliere(f.id)}
                    aria-label={`Togli ${f.cosa}`}
                    className="tocco shrink-0 rounded-full border border-border px-3 text-muted-foreground"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {stato.fisse.length > 0 && (
        <p className="mt-4 flex items-start gap-2 px-1 text-xs leading-relaxed text-muted-foreground">
          <CalendarClock aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Le segno quando apri l'app, il giorno che hai detto. Se resti via un mese, alla
            riapertura le trovi tutte — e te lo dico, non le faccio comparire di nascosto.
          </span>
        </p>
      )}
    </Guscio>
  );
}
