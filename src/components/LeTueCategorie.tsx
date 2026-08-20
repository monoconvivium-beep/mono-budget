import { useState } from "react";

import { X } from "lucide-react";

import { Aiuto } from "@/components/Aiuto";
import { pillolaDi } from "@/lib/parse";
import { azioni, useStato } from "@/lib/store";

/**
 * LE CATEGORIE INVENTATE, TUTTE INSIEME, E IL MODO DI TOGLIERLE.
 *
 * 🔑 Senza questo si poteva solo aggiungerne: una scritta storta — «Benzna» —
 * restava nella tendina per sempre, e la tendina è il posto dove si sceglie in
 * fretta. Una casella sbagliata che non si può togliere è peggio di quella
 * decisa da noi, perché almeno quella era scritta giusta.
 *
 * ⚠️ Sta nel Diario e non in una schermata di impostazioni: il Diario è dove si
 * guardano le spese passate, cioè dove ci si accorge che una categoria non
 * serviva. Una schermata di impostazioni non la apre nessuno.
 */
export function LeTueCategorie() {
  const { categoriePersonali: personali, movimenti } = useStato();
  /** Il nome che si sta per togliere: finché è `null`, si vedono solo le pillole. */
  const [daTogliere, setDaTogliere] = useState<string | null>(null);

  if (personali.length === 0) return null;

  const dentro = movimenti.filter((m) => m.categoria === daTogliere && !m.cestinato).length;

  return (
    <section className="scheda mt-4 p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Le tue categorie
        </h2>
        <Aiuto testo="Queste le hai inventate tu, dalla riga di una spesa. Toccane una per toglierla: le spese che ci stanno dentro non si cancellano, tornano in «Altro»." />
      </div>

      {daTogliere === null ? (
        <ul className="flex flex-wrap gap-2">
          {personali.map((c) => {
            /* Il colore lo sceglie l'app, ma l'inchiostro lo sceglie il
               contrasto: una categoria inventata che non si legge sarebbe
               peggio della casella sbagliata di partenza. */
            const { fondo, inchiostro } = pillolaDi(c.nome, personali);
            return (
              <li key={c.nome}>
                {/* La pillola INTERA è il bottone: 44 px di altezza veri, non
                    una crocetta da 16 px dentro una pillola da 26. */}
                <button
                  type="button"
                  onClick={() => setDaTogliere(c.nome)}
                  aria-label={`Togli la categoria ${c.nome}`}
                  className="pillola min-h-11 gap-2 px-4 font-semibold"
                  style={{ backgroundColor: fondo, color: inchiostro }}
                >
                  {c.nome}
                  <X aria-hidden className="h-4 w-4 opacity-70" />
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        /**
         * 🔑 Due momenti, non uno: si tocca la pillola e si legge cosa succede,
         * poi si decide. Togliere una categoria sposta delle spese, e una cosa
         * che sposta le spese non si fa per sbaglio con un dito appoggiato.
         */
        <div>
          <p className="text-sm">
            Tolgo «{daTogliere}»?{" "}
            <span className="text-muted-foreground">
              {dentro === 0
                ? "Non c'è nessuna spesa qui dentro."
                : dentro === 1
                  ? "La spesa che ci sta dentro torna in «Altro»."
                  : `Le ${dentro} spese che ci stanno dentro tornano in «Altro».`}
            </span>
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => {
                azioni.togliCategoria(daTogliere);
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
        </div>
      )}
    </section>
  );
}
