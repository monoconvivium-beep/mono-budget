import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Home, BookOpen, Mic, CalendarRange, Store } from "lucide-react";
import { useStato } from "@/lib/store";

const voci = [
  { to: "/", etichetta: "Home", Icona: Home },
  { to: "/diario", etichetta: "Diario", Icona: BookOpen },
  { to: "/ascolto", etichetta: "Ascolto", Icona: Mic, centro: true },
  { to: "/anno", etichetta: "Bilanci", Icona: CalendarRange },
  { to: "/mono", etichetta: "MONO", Icona: Store },
];

export function Guscio({
  titolo,
  sottotitolo,
  children,
  azione,
  /** Sostituisce il titolo grande: sulla Home ci va il marchio, non una scritta. */
  intestazione,
}: {
  titolo: string;
  sottotitolo?: string;
  children: ReactNode;
  azione?: ReactNode;
  intestazione?: ReactNode;
}) {
  const { tema } = useStato();
  const percorso = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const root = document.documentElement;
    if (tema === "scuro") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [tema]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-md respiro-basso px-4 pt-6">
        <header className="mb-5 flex items-start justify-between gap-3">
          {intestazione ?? (
            <div>
              <h1 className="text-3xl leading-none">{titolo}</h1>
              {sottotitolo && (
                <p className="mt-1.5 text-sm text-muted-foreground">{sottotitolo}</p>
              )}
            </div>
          )}
          {azione}
        </header>
        {children}
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <ul className="mx-auto flex max-w-md items-end justify-between px-3 py-1.5">
          {voci.map(({ to, etichetta, Icona, centro }) => {
            const attivo = percorso === to;
            if (centro) {
              return (
                <li key={to} className="-mt-7">
                  <Link
                    to={to}
                    aria-label="Ascolto"
                    // Verde bosco, non oro: sul fondo cashmere l'oro su chiaro
                    // non stacca abbastanza, e questo è il gesto principale.
                    className="flex h-16 w-16 flex-col items-center justify-center rounded-full bg-[var(--scuro-scheda)] text-[var(--scuro-testo)] shadow-rialzata"
                  >
                    <Icona className="h-6 w-6" />
                    <span className="mt-0.5 text-[10px] font-semibold tracking-wide">
                      {etichetta.toUpperCase()}
                    </span>
                  </Link>
                </li>
              );
            }
            return (
              <li key={to}>
                <Link
                  to={to}
                  className={`tocco flex-col gap-1 rounded-2xl px-2 text-[11px] ${
                    attivo ? "text-accent" : "text-muted-foreground"
                  }`}
                >
                  <Icona className="h-5 w-5" />
                  {etichetta}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
