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
  const percorso = useRouterState({ select: (s) => s.location.pathname });

  /**
   * TEMA UNICO — deciso il 4/8. Cashmere di fondo, verde bosco come accento.
   *
   * 🔑 L'interruttore chiaro/scuro è stato tolto di proposito: un marchio non
   * chiede a chi lo usa di scegliersi il vestito. Due temi volevano dire due
   * app da curare, e nessuna delle due curata fino in fondo.
   * ⚠️ Il campo `tema` resta nel salvataggio per non rompere i backup già fatti.
   */
  const tema = "chiaro" as const;

  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-md respiro-basso px-4 pt-6">
        <header className="mb-5 flex items-start justify-between gap-3">
          {intestazione ?? (
            <div className="flex min-w-0 items-center gap-3">
              {/* 🔑 Il sorriso c'è in OGNI schermata, non solo sulla Home.
                  Un marchio si ricorda perché torna, non perché è grande una
                  volta sola: qui è piccolo e sempre allo stesso posto. */}
              <img
                // Tema unico cashmere: il sorriso è quello scuro, l'originale.
                src={`${import.meta.env.BASE_URL}marchio/mono-sorriso.svg`}
                alt="MONO"
                className="h-9 w-auto shrink-0"
                width={36}
                height={36}
              />
              <div className="min-w-0">
                <h1 className="truncate text-3xl leading-none">{titolo}</h1>
                {sottotitolo && (
                  <p className="mt-1.5 truncate text-sm text-muted-foreground">{sottotitolo}</p>
                )}
              </div>
            </div>
          )}
          {azione}
        </header>
        {children}

        {/* La firma, in fondo a OGNI schermata. Discreta, ma sempre lì: è così
            che un marchio si posa addosso a chi usa una cosa tutti i giorni. */}
        <p className="mt-8 flex items-center justify-center gap-2 text-[11px] tracking-wide text-muted-foreground">
          <img
            src={`${import.meta.env.BASE_URL}marchio/mono-monogramma.svg`}
            alt=""
            aria-hidden="true"
            className="h-4 w-auto opacity-70"
          />
          MONO · Bottega Gastronomica · Torino
        </p>
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
