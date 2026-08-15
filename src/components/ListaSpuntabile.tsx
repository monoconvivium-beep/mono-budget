import { Trash2 } from "lucide-react";

export interface VoceLista {
  id: string;
  cosa: string;
  fatta: boolean;
}

/**
 * UNA LISTA CHE SI SPUNTA — la stessa per la spesa e per le cose da fare.
 *
 * 🔑 Perché una sola: sono lo stesso gesto (la dici, la vedi, la spunti) e
 * tenerne due copie voleva dire correggere ogni difetto due volte — e
 * dimenticarsene una. Cambiano solo le parole, che arrivano da fuori.
 *
 * ⚠️ Tutta la riga è il bersaglio della spunta: al banco o in cucina si tocca
 * con una mano sola e senza guardare bene. Il cestino resta staccato, se no
 * si cancella una cosa mentre si voleva solo spuntarla.
 */
export function ListaSpuntabile({
  voci,
  onSpunta,
  onTogli,
  vocePresa,
  voceDaFare,
}: {
  voci: VoceLista[];
  onSpunta: (id: string) => void;
  onTogli: (id: string) => void;
  /** Come si legge una riga già spuntata: «Rimetti X nella lista». */
  vocePresa: (cosa: string) => string;
  voceDaFare: (cosa: string) => string;
}) {
  const aperte = voci.filter((v) => !v.fatta);
  const chiuse = voci.filter((v) => v.fatta);

  return (
    <ul className="scheda mt-4 overflow-hidden">
      {[...aperte, ...chiuse].map((v) => (
        <li key={v.id} className="flex items-center gap-3 border-b border-border px-3 last:border-0">
          <button
            type="button"
            onClick={() => onSpunta(v.id)}
            className="flex min-h-[52px] flex-1 items-center gap-3 py-2 text-left"
            aria-label={v.fatta ? vocePresa(v.cosa) : voceDaFare(v.cosa)}
          >
            <span
              aria-hidden
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 text-sm ${
                v.fatta
                  ? "border-[var(--oliva)] bg-[var(--oliva)] text-[var(--cashmere)]"
                  : "border-[#C3B69A]"
              }`}
            >
              {v.fatta ? "✓" : ""}
            </span>
            <span
              className={`min-w-0 flex-1 text-[15px] ${
                v.fatta ? "text-muted-foreground line-through" : ""
              }`}
            >
              {v.cosa}
            </span>
          </button>
          <button
            type="button"
            onClick={() => onTogli(v.id)}
            className="tocco shrink-0 text-muted-foreground"
            aria-label={`Togli ${v.cosa} dalla lista`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </li>
      ))}
    </ul>
  );
}
