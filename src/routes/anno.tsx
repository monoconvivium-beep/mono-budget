import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { Aiuto } from "@/components/Aiuto";
import { DoveVannoISoldi } from "@/components/DoveVannoISoldi";
import { Guscio } from "@/components/Guscio";
import { RigaMovimento } from "@/components/RigaMovimento";
import { euro } from "@/lib/parse";
import { dellAnno, delMese, riepilogo } from "@/lib/statistiche";
import { attivi, MESI, useStato } from "@/lib/store";

export const Route = createFileRoute("/anno")({
  component: Bilanci,
});

type Vista = "mese" | "anno";

function Bilanci() {
  const { movimenti } = useStato();
  const attivo = attivi(movimenti);
  const adesso = new Date();

  const [vista, setVista] = useState<Vista>("mese");
  const [anno, setAnno] = useState(adesso.getFullYear());
  const [mese, setMese] = useState(adesso.getMonth());

  const anni = useMemo(() => {
    const set = new Set(attivo.map((m) => new Date(m.data).getFullYear()));
    set.add(adesso.getFullYear());
    return [...set].sort((a, b) => b - a);
  }, [attivo, adesso]);

  /* ------------------------------------------------------------ il mese */

  const delPeriodo = vista === "mese" ? delMese(attivo, anno, mese) : dellAnno(attivo, anno);
  const conti = riepilogo(delPeriodo);
  // ⚠️ Il futuro non si guarda: un mese che non è ancora arrivato non ha conti,
  // e lasciare la freccia attiva fa credere che l'app abbia perso dei dati.
  const nelFuturo = anno > adesso.getFullYear() || (anno === adesso.getFullYear() && mese >= adesso.getMonth());

  function spostaMese(passi: number) {
    const d = new Date(anno, mese + passi, 1);
    setAnno(d.getFullYear());
    setMese(d.getMonth());
  }

  /* ------------------------------------------------------------ l'anno */

  const mesi = MESI.map((nome, i) => {
    const lista = delMese(attivo, anno, i);
    const uscite = lista.filter((m) => m.tipo === "uscita").reduce((t, m) => t + m.importo, 0);
    const entrate = lista.filter((m) => m.tipo === "entrata").reduce((t, m) => t + m.importo, 0);
    const chiuso =
      anno < adesso.getFullYear() || (anno === adesso.getFullYear() && i < adesso.getMonth());
    return { nome, i, uscite, entrate, chiuso, vuoto: lista.length === 0 };
  });

  const conMovimenti = mesi.filter((m) => !m.vuoto);
  const massimo = Math.max(1, ...mesi.map((m) => Math.max(m.uscite, m.entrate)));
  /**
   * La linea guida: la media delle uscite sui mesi che hanno movimenti.
   * 🔑 Serve a rispondere alla domanda vera — «questo mese ho speso tanto?» —
   * che senza un metro di paragone non ha risposta. Si calcola solo sui mesi
   * usati: contare anche i mesi vuoti abbasserebbe la media e farebbe sembrare
   * esagerato ogni mese normale.
   */
  const mediaUscite = conMovimenti.length
    ? conMovimenti.reduce((t, m) => t + m.uscite, 0) / conMovimenti.length
    : 0;
  const posizioneMedia = Math.min(100, (mediaUscite / massimo) * 100);

  const titoloPeriodo =
    vista === "mese" ? `${MESI[mese]} ${anno}` : `${anno}`;

  return (
    <Guscio
      titolo="Bilanci"
      /* La M col sorriso: è la schermata dove i conti ti dicono come stai
         messo, ed è giusto che a dirtelo sia la faccia. Scelta sua del 9/8. */
      marchio="sorriso"
      sottotitolo={`${euro(conti.entrate)} entrate · ${euro(conti.uscite)} uscite`}
      azione={
        <Aiuto testo="Il mese ti dice com'è andata adesso, l'anno ti fa vedere la storia. La linea chiara sui mesi è la tua media: sotto hai speso meno del solito, sopra di più." />
      }
    >
      <div className="flex gap-2">
        {(
          [
            ["mese", "Mese"],
            ["anno", "Anno"],
          ] as const
        ).map(([valore, etichetta]) => (
          <button
            key={valore}
            type="button"
            onClick={() => setVista(valore)}
            className={`pillola tocco flex-1 justify-center font-semibold ${
              vista === valore
                ? "bg-accent text-accent-foreground"
                : "border border-border text-muted-foreground"
            }`}
          >
            {etichetta}
          </button>
        ))}
      </div>

      {vista === "mese" ? (
        <div className="mt-3 flex items-center justify-between gap-2">
          <button
            type="button"
            aria-label="Mese precedente"
            onClick={() => spostaMese(-1)}
            className="tocco rounded-2xl border border-border px-3"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <p className="flex-1 text-center text-lg capitalize">{titoloPeriodo}</p>
          <button
            type="button"
            aria-label="Mese successivo"
            onClick={() => spostaMese(1)}
            disabled={nelFuturo}
            className="tocco rounded-2xl border border-border px-3 disabled:opacity-30"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      ) : (
        anni.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {anni.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAnno(a)}
                className={`pillola tocco px-4 font-semibold ${
                  a === anno
                    ? "bg-accent text-accent-foreground"
                    : "border border-border text-muted-foreground"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        )
      )}

      {/* Il riepilogo: le tre cifre che si guardano per prime. */}
      <section className="scheda-bosco mt-4 p-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] font-semibold tracking-widest uppercase opacity-70">
              Entrate
            </p>
            <p className="numero text-2xl leading-tight">{euro(conti.entrate)}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-widest uppercase opacity-70">
              Uscite
            </p>
            <p className="numero text-2xl leading-tight">{euro(conti.uscite)}</p>
          </div>
        </div>
        <div className="mt-4 border-t border-white/15 pt-3">
          <p className="text-[10px] font-semibold tracking-widest uppercase opacity-70">
            {conti.differenza >= 0 ? "Messo da parte" : "Speso più di quanto è entrato"}
          </p>
          <p className="numero text-3xl leading-tight">
            {conti.differenza >= 0 ? "+" : "−"}
            {euro(Math.abs(conti.differenza))}
          </p>
          {conti.quantiMovimenti > 0 && (
            <p className="mt-1 text-sm opacity-75">
              {conti.quantiMovimenti} movimenti · in media {euro(conti.spesaMedia)} a spesa
            </p>
          )}
        </div>
      </section>

      <DoveVannoISoldi movimenti={delPeriodo} />

      {vista === "mese" ? (
        <section className="scheda mt-4 p-4">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-lg capitalize">Tutto {titoloPeriodo}</h2>
            <Aiuto testo="Ogni movimento del mese, dal più recente. Le × lo mettono nel cestino." />
          </div>
          {delPeriodo.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nessun movimento in questo mese.
            </p>
          ) : (
            <ul>
              {[...delPeriodo]
                .sort((a, b) => b.data.localeCompare(a.data))
                .map((m) => (
                  <RigaMovimento key={m.id} m={m} />
                ))}
            </ul>
          )}
        </section>
      ) : (
        <>
          <h2 className="mt-6 mb-1 px-1 text-lg">Mese per mese</h2>
          {mediaUscite > 0 && (
            <p className="mb-3 px-1 text-xs text-muted-foreground">
              La linea chiara è la tua media: <span className="numero">{euro(mediaUscite)}</span> di
              uscite al mese.
            </p>
          )}

          <div className="space-y-3">
            {mesi.map((m) => (
              <section key={m.i} className={m.vuoto ? "scheda-tenue p-4" : "scheda p-4"}>
                <div className="flex items-baseline justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setMese(m.i);
                      setVista("mese");
                    }}
                    className="text-lg capitalize underline-offset-4 hover:underline"
                  >
                    {m.nome}
                  </button>
                  <span className="text-xs text-muted-foreground">
                    {m.vuoto ? "nessun movimento" : m.chiuso ? "mese chiuso" : "in corso"}
                  </span>
                </div>

                {!m.vuoto && (
                  <>
                    <div className="relative mt-2 space-y-1.5">
                      {/* La linea guida attraversa tutte e due le barre: è il
                          paragone, non un terzo dato. */}
                      {mediaUscite > 0 && (
                        <span
                          aria-hidden="true"
                          className="absolute inset-y-0 z-10 w-px bg-foreground/35"
                          style={{ left: `${posizioneMedia}%` }}
                        />
                      )}
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-salvia"
                          style={{ width: `${(m.entrate / massimo) * 100}%` }}
                        />
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-accent"
                          style={{ width: `${(m.uscite / massimo) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="mt-2 flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Entrate <span className="numero">{euro(m.entrate)}</span>
                      </span>
                      <span className="text-muted-foreground">
                        Uscite <span className="numero">{euro(m.uscite)}</span>
                      </span>
                    </div>
                    <p className="numero mt-1 text-right text-lg">
                      {m.entrate - m.uscite >= 0 ? "+" : "−"}
                      {euro(Math.abs(m.entrate - m.uscite))}
                    </p>
                  </>
                )}
              </section>
            ))}
          </div>
        </>
      )}
    </Guscio>
  );
}
