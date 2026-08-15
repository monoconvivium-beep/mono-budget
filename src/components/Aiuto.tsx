import { useState } from "react";

/** Il «?» che spiega uno strumento in una frase.
 *  `suScuro` lo veste per i fondi pieni (il rosso del ricettario). */
export function Aiuto({ testo, suScuro = false }: { testo: string; suScuro?: boolean }) {
  const [aperto, setAperto] = useState(false);
  return (
    <span className="relative inline-flex">
      {/**
       * IL DISCHETTO RESTA PICCOLO, IL DITO HA IL DOPPIO DELLO SPAZIO.
       *
       * 🔴 Trovato misurando, il 15/8/2026: il «?» era 28×28 px veri. Apple
       * chiede almeno 44, Android 48 — e questa è un'app fatta anche per chi
       * ha le mani grosse o la vista corta. Ingrandire il cerchio però
       * sballava l'allineamento coi titoli in dodici schermate.
       * 🔑 La soluzione è staccare **quello che si vede** da **quello che si
       * tocca**: il bottone diventa 44×44 e trasparente, e il cerchio da 28
       * gli sta dentro disegnato. Nessun pixel cambia a schermo, e il tocco
       * prende al primo colpo.
       * ⚠️ `-m-2` riprende i 16 px in più, se no ogni «?» spinge via il
       * titolo che ha accanto.
       */}
      <button
        type="button"
        aria-label="Spiegazione"
        onClick={() => setAperto((v) => !v)}
        className="-m-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
      >
        <span
          aria-hidden
          className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold ${
            suScuro
              ? "border-[rgba(244,236,221,0.45)] text-[rgba(244,236,221,0.85)]"
              : "border-border text-muted-foreground"
          }`}
        >
          ?
        </span>
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
