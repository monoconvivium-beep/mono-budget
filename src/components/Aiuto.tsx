import { useState } from "react";

/** Il «?» che spiega uno strumento in una frase. */
export function Aiuto({ testo }: { testo: string }) {
  const [aperto, setAperto] = useState(false);
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label="Spiegazione"
        onClick={() => setAperto((v) => !v)}
        className="h-7 w-7 shrink-0 rounded-full border border-border text-xs font-semibold text-muted-foreground"
      >
        ?
      </button>
      {aperto && (
        <span
          role="note"
          onClick={() => setAperto(false)}
          className="absolute top-9 right-0 z-40 w-60 rounded-2xl border border-border bg-popover p-3 text-xs leading-relaxed text-popover-foreground shadow-morbida"
        >
          {testo}
        </span>
      )}
    </span>
  );
}
