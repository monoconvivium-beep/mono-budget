import { COLORI_CATEGORIA, euro, CATEGORIE, type Categoria } from "@/lib/parse";
import { azioni, dataBreve, oraBreve, type Movimento } from "@/lib/store";
import { X, RotateCcw, Trash2 } from "lucide-react";

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
}: {
  m: Movimento;
  conData?: boolean;
  modificabile?: boolean;
  cestino?: boolean;
  scheda?: boolean;
}) {
  return (
    <li
      className={
        scheda
          ? "scheda flex items-center gap-3 border-l-4 py-2.5 pr-2 pl-3"
          : "flex items-center gap-3 border-b border-border py-3 last:border-0"
      }
      style={scheda ? { borderLeftColor: COLORI_CATEGORIA[m.categoria] } : undefined}
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
          <select
            value={m.categoria}
            onChange={(e) =>
              azioni.cambiaCategoria(m.id, e.target.value as Categoria, m.etichetta)
            }
            className="mt-1 rounded-full border border-border bg-card-soft px-2 py-1 text-xs text-muted-foreground"
          >
            {CATEGORIE.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
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
