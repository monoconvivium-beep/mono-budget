/**
 * LA SCHERMATA D'AVVIO — un secondo di marchio, poi si lavora.
 *
 * 🔑 È il mezzo secondo in cui un'app dice di chi è. Tutte quelle grandi ce
 * l'hanno, e non è vanità: quando apri qualcosa venti volte al giorno, quello
 * che vedi per primo è quello che ti resta addosso.
 *
 * ⚠️ Si vede **solo quando l'app è installata**, non nel browser. Nel browser
 * uno ha già la barra dell'indirizzo davanti e sa dov'è: una schermata in più
 * sarebbe solo un secondo rubato.
 * ⚠️ Dura **900 ms e non di più**: oltre non è un saluto, è un'attesa. E chi ha
 * chiesto meno movimento nelle impostazioni del telefono non la vede affatto.
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
    const t = setTimeout(() => setMostra(false), 900);
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
      style={{ backgroundColor: "var(--color-background)" }}
    >
      <img
        src={`${import.meta.env.BASE_URL}marchio/mono-orizzontale.svg`}
        alt="MONO — Bottega Gastronomica"
        className="entra w-[68%] max-w-[260px]"
      />
      <p
        className="entra text-sm tracking-[0.18em] uppercase"
        style={{ color: "var(--color-muted-foreground)", animationDelay: "120ms" }}
      >
        La tua voce conta
      </p>
    </div>
  );
}
