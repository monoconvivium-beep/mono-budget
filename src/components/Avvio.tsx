/**
 * LA SCHERMATA D'AVVIO — due secondi e mezzo di marchio, poi si lavora.
 *
 * 🔑 È il mezzo secondo in cui un'app dice di chi è. Tutte quelle grandi ce
 * l'hanno, e non è vanità: quando apri qualcosa venti volte al giorno, quello
 * che vedi per primo è quello che ti resta addosso.
 *
 * ⚠️ Si vede **solo quando l'app è installata**, non nel browser. Nel browser
 * uno ha già la barra dell'indirizzo davanti e sa dov'è: una schermata in più
 * sarebbe solo un secondo rubato.
 * ⏱️ **Durava 900 ms, dal 15/8/2026 dura 2400** — sua richiesta: «deve cadere
 * l'occhio, si devono poter vedere tutti i loghi». A 900 ms i quattro marchi
 * facevano appena in tempo a entrare che la schermata era già sparita: c'erano,
 * ma nessuno li vedeva. Non è un'attesa più lunga per vanità — è il tempo
 * perché quattro cose si leggano invece di lampeggiare.
 * ⚠️ Chi ha chiesto meno movimento nelle impostazioni del telefono non la vede
 * affatto: quella resta una preferenza di accessibilità, non un capriccio.
 */
import { useEffect, useState } from "react";

function installata(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  return (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
}

function menoMovimento(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function Avvio({ children }: { children: React.ReactNode }) {
  const [mostra, setMostra] = useState(() => installata() && !menoMovimento());

  useEffect(() => {
    if (!mostra) return;
    const t = setTimeout(() => setMostra(false), 2400);
    return () => clearTimeout(t);
  }, [mostra]);

  if (!mostra) return <>{children}</>;

  return (
    <div
      /**
       * CASHMERE, non più verde bosco (5/8/2026). Due ragioni, tutte e due
       * sue: il marchio va mostrato **originale**, e l'originale è scuro —
       * sul verde spariva e toccava usare la versione svuotata. E l'icona
       * dell'app adesso è su cashmere: così la schermata d'avvio è la
       * continuazione dell'icona, non un lampo verde in mezzo.
       */
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6"
      /* ⚠️ CASHMERE ESPLICITO, non «il colore del fondo». Dal 9/8 il fondo
         dell'app è verde bosco, ma questa schermata non è l'app: è il seguito
         dell'ICONA, che è su cashmere e resta lì. Legata al fondo sarebbe
         diventata verde da sola, riportando il marchio svuotato che lui ha
         già bocciato una volta. */
      style={{ backgroundColor: "var(--cashmere)" }}
    >
      {/**
       * TUTTI E QUATTRO I MARCHI, in fila — sua richiesta del 9/8: «che sia
       * presente tutta la parte di branding grafica».
       *
       * 🔑 L'ORDINE È SUO e racconta una discesa: prima la faccia (la M che
       * sorride), poi il mestiere (il piatto), poi CHI SIAMO grande in mezzo
       * — è il marchio della bottega e resta il più importante — e sotto il
       * nome di quest'app, che è il progetto sociale.
       * ⚠️ Le misure NON sono tutte uguali apposta: il marchio della bottega
       * pesa il doppio degli altri. Quattro marchi della stessa misura non
       * sono un'identità, sono un elenco.
       * ⚠️ Entrano a scaletta di **140 ms** (erano 90): l'ultimo arriva a 560 ms
       * e da lì restano insieme sotto gli occhi quasi due secondi. Con la
       * scaletta stretta di prima si accavallavano e sembravano una cosa sola.
       */}
      <img
        src={`${import.meta.env.BASE_URL}marchio/mono-sorriso.svg`}
        alt=""
        aria-hidden="true"
        className="entra h-11 w-auto"
      />
      <img
        src={`${import.meta.env.BASE_URL}marchio/mono-monogramma.svg`}
        alt=""
        aria-hidden="true"
        className="entra h-12 w-auto"
        style={{ animationDelay: "140ms" }}
      />
      <img
        src={`${import.meta.env.BASE_URL}marchio/mono-orizzontale.svg`}
        alt="MONO — Bottega Gastronomica"
        className="entra w-[70%] max-w-[270px]"
        style={{ animationDelay: "280ms" }}
      />
      <img
        src={`${import.meta.env.BASE_URL}marchio/mono-convivium-intero.svg`}
        alt="MonoConvivium"
        className="entra h-[76px] w-auto"
        style={{ animationDelay: "420ms" }}
      />
      <p
        className="entra text-sm tracking-[0.18em] uppercase"
        /* Il secondario di fuori adesso è chiaro (vive sul verde): qui il
           fondo è cashmere, quindi il colore scuro si scrive per esteso. */
        style={{ color: "oklch(0.517 0.066 104.1)", animationDelay: "560ms" }}
      >
        La tua voce conta
      </p>
    </div>
  );
}
