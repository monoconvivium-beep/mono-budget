import { COLORI_CATEGORIA, euro, CATEGORIE, type Categoria } from "@/lib/parse";
import { azioni, dataBreve, oraBreve, type Movimento } from "@/lib/store";
import { X, RotateCcw, Trash2, ChevronDown } from "lucide-react";

export function RigaMovimento({
  m,
  conData = false,
  modificabile = false,
  cestino = false,
  /**
   * Ogni movimento in una sua scheda, col colore della categoria sul fianco.
   * È la forma della Home: sul fondo cashmere le righe separate da un filo
   * si perdono, una scheda staccata si legge da lontano.
   */
  scheda = false,
  /** Quanto aspetta prima di entrare, per farle arrivare a scaletta. */
  ritardoMs = 0,
}: {
  m: Movimento;
  conData?: boolean;
  modificabile?: boolean;
  cestino?: boolean;
  scheda?: boolean;
  ritardoMs?: number;
}) {
  return (
    <li
      className={
        scheda
          ? "scheda entra flex items-center gap-3 border-l-4 py-2.5 pr-2 pl-3"
          : "flex items-center gap-3 border-b border-border py-3 last:border-0"
      }
      style={
        scheda
          ? {
              borderLeftColor: COLORI_CATEGORIA[m.categoria],
              animationDelay: `${ritardoMs}ms`,
            }
          : undefined
      }
    >
      {!scheda && (
        <span
          aria-hidden
          className="h-9 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: COLORI_CATEGORIA[m.categoria] }}
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{m.etichetta || m.categoria}</p>
        {modificabile ? (
          /**
           * LA CATEGORIA È UNA PILLOLA COL SUO COLORE, non una tendina grigia.
           *
           * 🔑 Sua scelta del 5/8/2026, guardando il Diario: undici righe con
           * undici tendine grigie in colonna facevano sembrare l'elenco delle
           * spese un modulo da compilare. Adesso si legge come un elenco.
           *
           * ⚠️ Sotto resta la stessa `select` di prima — tolta la vernice, non
           * il funzionamento: un tocco solo e si apre la lista del telefono.
           * Farne un bottone che apre una tendina finta voleva dire due tocchi,
           * ed è esattamente il difetto appena tolto dal microfono.
           */
          <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            {/**
             * ⚠️ La `select` sta SOPRA la pillola, invisibile e larga quanto lei.
             * Una tendina vera si allarga sempre quanto l'opzione più lunga —
             * «Spesa alimentare» — così «Bar» veniva largo uguale e tutte le
             * righe finivano incolonnate come le caselle di un modulo. Qui la
             * pillola si stringe sulla parola che c'è scritta, e il tocco
             * arriva lo stesso alla tendina del telefono: un tocco solo.
             * Il campo invisibile è più alto della pillola (−inset-y-2): il
             * dito prende 40 px anche se la pillola ne è alta 24.
             */}
            <span
              className="relative inline-flex items-center gap-1.5 rounded-full py-1 pr-2 pl-2.5 font-semibold text-foreground"
              style={{
                backgroundColor: `color-mix(in oklab, ${COLORI_CATEGORIA[m.categoria]} 22%, transparent)`,
              }}
            >
              <span
                aria-hidden
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: COLORI_CATEGORIA[m.categoria] }}
              />
              {m.categoria}
              <ChevronDown aria-hidden className="h-3 w-3 opacity-60" />
              <select
                value={m.categoria}
                onChange={(e) =>
                  azioni.cambiaCategoria(m.id, e.target.value as Categoria, m.etichetta)
                }
                aria-label={`Categoria di ${m.etichetta || m.categoria}`}
                /* La tendina invisibile è la zona che si tocca per cambiare
                   categoria: con -inset-y-2 era alta 40 px veri, sotto il
                   minimo di 44. Tre pixel per lato in più e nessuno se ne
                   accorge — se non il dito, che adesso prende al primo colpo. */
                className="absolute inset-x-0 -inset-y-3 w-full opacity-0"
              >
                {CATEGORIE.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </span>
            <span>
              {conData ? `${dataBreve(m.data)} ` : ""}
              {oraBreve(m.data)}
              {m.metodo ? ` · ${m.metodo}` : ""}
            </span>
          </span>
        ) : (
          <p className="text-xs text-muted-foreground">
            {m.categoria} · {conData ? `${dataBreve(m.data)} ` : ""}
            {oraBreve(m.data)}
            {m.metodo ? ` · ${m.metodo}` : ""}
          </p>
        )}
      </div>
      <span className={`numero text-lg ${m.tipo === "entrata" ? "text-salvia" : ""}`}>
        {m.tipo === "entrata" ? "+" : "−"}
        {euro(m.importo)}
      </span>
      {cestino ? (
        <span className="flex gap-1">
          <button
            type="button"
            aria-label="Recupera"
            onClick={() => azioni.ripristina(m.id)}
            className="tocco rounded-full text-muted-foreground"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Elimina per sempre"
            onClick={() => azioni.eliminaPerSempre(m.id)}
            className="tocco rounded-full text-destructive"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </span>
      ) : (
        <button
          type="button"
          aria-label="Togli questa spesa"
          onClick={() => azioni.cestina(m.id)}
          className="tocco rounded-full text-muted-foreground"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </li>
  );
}
