import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { Check, Pencil, Plus, Power, RotateCcw, Trash2, X } from "lucide-react";

import { Aiuto } from "@/components/Aiuto";
import { Guscio } from "@/components/Guscio";
import {
  categorieAttive,
  categorieSpente,
  perchéNo,
  RETE_DI_SICUREZZA,
  type VoceCategoria,
} from "@/lib/categorie";
import { pillolaDi } from "@/lib/parse";
import { azioni, useStato } from "@/lib/store";

export const Route = createFileRoute("/categorie")({
  head: () => ({
    meta: [
      { title: "Le tue categorie — MonoConvivium" },
      {
        name: "description",
        content:
          "Aggiungi le tue categorie, rinomina quelle di casa e spegni quelle che non usi. Nessuna spesa si perde.",
      },
    ],
  }),
  component: Categorie,
});

/**
 * PERSONALIZZA LE TUE CATEGORIE — la schermata che mancava.
 *
 * 🔴 Da dove nasce (21/8/2026): le categorie erano libere dalla v29, ma si
 * cambiavano **solo dalla tendina dentro una riga di spesa**. Lui ha aperto
 * l'app e ha detto: «le categorie non sono personalizzabili — lì serve proprio
 * un bottone da scemo». Aveva ragione due volte: una cosa che vive dentro un
 * menù a tendina non la trova nessuno, e un'app che ti mostra undici caselle
 * decise da noi ti sta dicendo che le tue non contano.
 *
 * ⚠️ Qui NON si cancella niente per sbaglio: togliere una categoria tua rimanda
 * le spese in «Altro», spegnere una di casa non tocca nemmeno quelle. E prima
 * di ogni cosa che sposta delle spese c'è una riga che dice cosa sta per
 * succedere.
 */
function Categorie() {
  const stato = useStato();
  const attive = categorieAttive(stato);
  const spente = categorieSpente(stato);
  const nomi = [...attive, ...spente].map((c) => c.nome);

  /** Cosa si sta facendo adesso: una cosa alla volta, mai due campi aperti. */
  const [nuova, setNuova] = useState<string | null>(null);
  const [rinomina, setRinomina] = useState<{ nome: string; testo: string } | null>(null);
  const [daTogliere, setDaTogliere] = useState<VoceCategoria | null>(null);

  const chiudiTutto = () => {
    setNuova(null);
    setRinomina(null);
    setDaTogliere(null);
  };

  const noNuova = nuova === null ? null : perchéNo(nuova, nomi);
  const noRinomina =
    rinomina === null
      ? null
      : perchéNo(
          rinomina.testo,
          nomi.filter((n) => n !== rinomina.nome),
        );

  const dentro = (nome: string) =>
    stato.movimenti.filter((m) => m.categoria === nome && !m.cestinato).length;

  return (
    <Guscio
      titolo="Le tue categorie"
      marchio="sorriso"
      sottotitolo={`${attive.length} in uso${
        spente.length === 0
          ? ""
          : spente.length === 1
            ? " · 1 spenta"
            : ` · ${spente.length} spente`
      }`}
      azione={
        <Aiuto testo="Le undici di partenza le abbiamo messe noi, ma non sono un recinto: rinominale come le chiami tu, spegni quelle che non usi e aggiungi le tue. Nessuna spesa si perde mai: quelle di una categoria tolta tornano in «Altro»." />
      }
    >
      {/* IL BOTTONE. Grande, terracotta, in cima: è la ragione per cui uno apre
          questa schermata, e non deve cercarlo. */}
      {nuova === null ? (
        <button
          type="button"
          onClick={() => {
            chiudiTutto();
            setNuova("");
          }}
          className="tocco w-full justify-center gap-2 rounded-2xl bg-[var(--azione-scheda)] px-4 text-[15px] font-bold text-[var(--azione-testo)] shadow-rialzata"
        >
          <Plus className="h-5 w-5" /> Aggiungi una categoria
        </button>
      ) : (
        <form
          className="scheda p-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (noNuova) return;
            azioni.creaCategoria(nuova);
            setNuova(null);
          }}
        >
          <label
            htmlFor="categoria-nuova"
            className="block text-xs font-semibold tracking-wide text-muted-foreground uppercase"
          >
            Come si chiama?
          </label>
          <div className="mt-1 flex items-center gap-2">
            <input
              id="categoria-nuova"
              value={nuova}
              onChange={(e) => setNuova(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setNuova(null);
              }}
              autoFocus
              maxLength={24}
              placeholder="Benzina"
              /* 16 px: sotto, Safari ingrandisce la pagina al tocco e ci resta. */
              className="tocco min-w-0 flex-1 rounded-2xl border border-input bg-card px-4 text-base"
            />
            <button
              type="submit"
              disabled={!!noNuova}
              aria-label="Salva la categoria"
              className="tocco shrink-0 rounded-full bg-primary px-4 text-primary-foreground disabled:opacity-50"
            >
              <Check className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setNuova(null)}
              aria-label="Annulla"
              className="tocco shrink-0 rounded-full border border-border px-4 text-muted-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {noNuova && nuova.trim()
              ? noNuova
              : "Il colore lo scegliamo noi, dalla tavolozza MONO."}
          </p>
        </form>
      )}

      <ul className="mt-4 space-y-2">
        {attive.map((c) => {
          const { fondo, inchiostro } = pillolaDi(c.nome, stato.categoriePersonali);
          const intoccabile = c.nome === RETE_DI_SICUREZZA;
          const inRinomina = rinomina?.nome === c.nome;
          const inRimozione = daTogliere?.nome === c.nome;

          return (
            <li key={c.nome} className="scheda p-3">
              {inRinomina ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (noRinomina) return;
                    azioni.rinominaCategoria(c.nome, rinomina.testo);
                    setRinomina(null);
                  }}
                >
                  <label
                    htmlFor={`rinomina-${c.nome}`}
                    className="block text-xs font-semibold tracking-wide text-muted-foreground uppercase"
                  >
                    Come la chiami tu?
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      id={`rinomina-${c.nome}`}
                      value={rinomina.testo}
                      onChange={(e) => setRinomina({ nome: c.nome, testo: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") setRinomina(null);
                      }}
                      autoFocus
                      maxLength={24}
                      className="tocco min-w-0 flex-1 rounded-2xl border border-input bg-card px-4 text-base"
                    />
                    <button
                      type="submit"
                      disabled={!!noRinomina}
                      aria-label={`Salva il nome di ${c.nome}`}
                      className="tocco shrink-0 rounded-full bg-primary px-4 text-primary-foreground disabled:opacity-50"
                    >
                      <Check className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setRinomina(null)}
                      aria-label="Annulla"
                      className="tocco shrink-0 rounded-full border border-border px-4 text-muted-foreground"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {noRinomina && rinomina.testo.trim()
                      ? noRinomina
                      : dentro(c.nome) === 0
                        ? "Non ci sono spese qui dentro."
                        : `Le ${dentro(c.nome)} spese qui dentro prendono il nome nuovo: la storia resta una sola.`}
                  </p>
                </form>
              ) : inRimozione ? (
                /**
                 * 🔑 Due momenti, non uno: prima si legge cosa succede, poi si
                 * decide. Una cosa che sposta delle spese non si fa con un dito
                 * appoggiato per sbaglio.
                 */
                <div>
                  <p className="text-sm">
                    {c.diCasa ? `Spengo «${c.nome}»?` : `Tolgo «${c.nome}»?`}{" "}
                    <span className="text-muted-foreground">
                      {c.diCasa
                        ? "Sparisce dalla tendina e la voce non la sceglie più. Le spese restano dove sono, e puoi riaccenderla quando vuoi."
                        : dentro(c.nome) === 0
                          ? "Non c'è nessuna spesa qui dentro."
                          : `Le ${dentro(c.nome)} spese qui dentro tornano in «Altro».`}
                    </span>
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (c.diCasa) azioni.spegniCategoria(c.nome);
                        else azioni.togliCategoria(c.nome);
                        setDaTogliere(null);
                      }}
                      className="tocco flex-1 rounded-full bg-primary px-4 font-semibold text-primary-foreground"
                    >
                      {c.diCasa ? "Sì, spegnila" : "Sì, toglila"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDaTogliere(null)}
                      className="tocco flex-1 rounded-full border border-border px-4"
                    >
                      Lasciala
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span
                    className="pillola min-h-11 min-w-0 flex-1 font-semibold"
                    style={{ backgroundColor: fondo, color: inchiostro }}
                  >
                    <span className="truncate">{c.nome}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      chiudiTutto();
                      setRinomina({ nome: c.nome, testo: c.nome });
                    }}
                    disabled={intoccabile}
                    aria-label={`Rinomina ${c.nome}`}
                    className="tocco shrink-0 rounded-full border border-border px-3 text-muted-foreground disabled:opacity-40"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      chiudiTutto();
                      setDaTogliere(c);
                    }}
                    disabled={intoccabile}
                    aria-label={c.diCasa ? `Spegni ${c.nome}` : `Togli ${c.nome}`}
                    className="tocco shrink-0 rounded-full border border-border px-3 text-muted-foreground disabled:opacity-40"
                  >
                    {c.diCasa ? <Power className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                  </button>
                </div>
              )}
              {intoccabile && !inRinomina && !inRimozione && (
                <p className="mt-2 text-xs text-muted-foreground">
                  «Altro» resta sempre: è dove finisce quello che l'app non ha capito.
                </p>
              )}
            </li>
          );
        })}
      </ul>

      {spente.length > 0 && (
        <section className="mt-6">
          <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Spente
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Non si vedono più e la voce non le sceglie. Le spese che ci stavano dentro sono ancora
            lì: riaccendile e tornano.
          </p>
          <ul className="mt-2 space-y-2">
            {spente.map((c) => (
              <li key={c.nome} className="scheda-tenue flex items-center gap-2 p-3">
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-muted-foreground">
                  {c.nome}
                </span>
                <button
                  type="button"
                  onClick={() => azioni.riaccendiCategoria(c.nome)}
                  className="tocco shrink-0 gap-2 rounded-full border border-border px-4 text-sm font-semibold"
                >
                  <RotateCcw className="h-4 w-4" /> Riaccendi
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </Guscio>
  );
}
