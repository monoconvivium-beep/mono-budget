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
  /**
   * Il marchio grande come sulla Home invece della fascia alta 56 px.
   * Chiesto per l'Ascolto il 5/8: è la schermata dove uno arriva per parlare,
   * e il marchio deve pesare quanto il gesto.
   */
  marchioGrande = false,
  /**
   * «rosso» = il vestito del RICETTARIO, e solo suo (scelto da lui l'8/8:
   * «il rosso in palette con l'app, coi bottoni dorati»). Terracotta pieno
   * come fondo di pagina — la mossa delle pagine food dell'app grande —
   * schede chiare sopra, e il marchio originale sulla sua targa cashmere,
   * perché sul rosso sparirebbe e la versione svuotata non si usa.
   */
  fondo = "cashmere",
}: {
  titolo: string;
  sottotitolo?: string;
  children: ReactNode;
  azione?: ReactNode;
  intestazione?: ReactNode;
  marchioGrande?: boolean;
  fondo?: "cashmere" | "rosso";
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

  const rosso = fondo === "rosso";

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: rosso ? "var(--azione-scheda)" : "var(--color-background)" }}
    >
      <div className="mx-auto w-full max-w-md respiro-basso px-4 pt-6">
        <header className="mb-5">
          {intestazione ? (
            <div className="flex items-start justify-between gap-3">
              {intestazione}
              {azione}
            </div>
          ) : (
            <>
              {/**
               * IL MARCHIO INTERO, BEN IN VISTA — chiesto il 5/8/2026.
               *
               * Prima qui c'era solo la M col sorriso alta 36 px accanto al
               * titolo: il marchio c'era ma le parole «Bottega Gastronomica»
               * no, e a quella misura non si sarebbero lette comunque.
               * 🔑 Alto 56 px la scritta si legge davvero: sotto questa misura
               * il marchio non è discreto, è illeggibile — e un marchio che
               * non si legge non sta dicendo niente a nessuno.
               * Il sorriso non si ripete qui sotto: è già dentro questo.
               */}
              <div
                className={`mb-4 flex justify-center ${
                  rosso ? "border-b border-[rgba(244,236,221,0.28)]" : "border-b border-border"
                } ${marchioGrande ? "pb-5" : "pb-4"}`}
              >
                {rosso ? (
                  /* Il marchio è SEMPRE l'originale: sul rosso siede sulla sua
                     targa cashmere — lo stesso dischetto della barra della voce. */
                  <span className="rounded-2xl bg-[var(--color-background)] px-4 py-2">
                    <img
                      src={`${import.meta.env.BASE_URL}marchio/mono-orizzontale.svg`}
                      alt="MONO — Bottega Gastronomica"
                      className="h-14 w-auto"
                    />
                  </span>
                ) : (
                  <img
                    // Tema unico cashmere: il marchio è quello scuro, l'originale.
                    src={`${import.meta.env.BASE_URL}marchio/mono-orizzontale.svg`}
                    alt="MONO — Bottega Gastronomica"
                    // 8/8: allargato su sua richiesta («allargare di più tutti
                    // i loghi»). 56 px era la misura minima per leggere
                    // «Bottega Gastronomica»; 68 la si legge senza cercarla.
                    className={marchioGrande ? "w-[82%] max-w-[300px]" : "h-[68px] w-auto"}
                  />
                )}
              </div>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h1
                    className={`truncate text-3xl leading-none ${rosso ? "text-[var(--azione-testo)]" : ""}`}
                  >
                    {titolo}
                  </h1>
                  {sottotitolo && (
                    <p
                      className={`mt-1.5 truncate text-sm ${
                        rosso ? "text-[rgba(244,236,221,0.78)]" : "text-muted-foreground"
                      }`}
                    >
                      {sottotitolo}
                    </p>
                  )}
                </div>
                {azione}
              </div>
            </>
          )}
        </header>
        {children}

        {/* La firma, in fondo a OGNI schermata. Discreta, ma sempre lì: è così
            che un marchio si posa addosso a chi usa una cosa tutti i giorni.
            Sul rosso il monogramma scuro non si vede: resta la sola scritta.
            ⚠️ 8/8: era alto 16 px e al 70% di opacità — cioè un marchio
            sbiadito grande come una virgola, che è come non metterlo. Ora è
            alto 26 px e pieno: si riconosce senza avvicinare il telefono. */}
        <p
          className={`mt-8 flex items-center justify-center gap-2 text-[11px] tracking-wide ${
            rosso ? "text-[rgba(244,236,221,0.7)]" : "text-muted-foreground"
          }`}
        >
          {!rosso && (
            <img
              src={`${import.meta.env.BASE_URL}marchio/mono-monogramma.svg`}
              alt=""
              aria-hidden="true"
              className="h-[26px] w-auto"
            />
          )}
          MONO · Bottega Gastronomica · Torino
        </p>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <ul className="mx-auto flex max-w-md items-end justify-between px-3 py-1.5">
          {voci.map(({ to, etichetta, Icona, centro }) => {
            // Il ricettario vive dentro la scheda MONO: quando sei lì,
            // la linguetta accesa è quella.
            const attivo = percorso === to || (to === "/mono" && percorso.startsWith("/ricette"));
            if (centro) {
              return (
                <li key={to} className="-mt-7">
                  <Link
                    to={to}
                    aria-label="Ascolto"
                    // Terracotta: è il gesto principale dell'app, e da oggi il
                    // colore delle azioni è il terracotta. Il verde resta al
                    // blocco dei numeri, uno per schermata.
                    className="flex h-16 w-16 flex-col items-center justify-center rounded-full bg-[var(--azione-scheda)] text-[var(--azione-testo)] shadow-rialzata"
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
