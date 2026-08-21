import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter } from "@tanstack/react-router";

import { Avvio } from "@/components/Avvio";
import { Benvenuto } from "@/components/Benvenuto";
import { Iscrizione } from "@/components/Iscrizione";
import { useStato } from "@/lib/store";

/**
 * ⚠️ Qui NON c'è più il guscio con <html>, <head> e <Scripts>: quello serviva
 * quando le pagine venivano composte da un server. Adesso l'intestazione sta
 * tutta in `index.html` e l'app parte nel browser — vedi `src/main.tsx`.
 */

function PaginaNonTrovata() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Questa pagina non c&apos;è</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          L&apos;indirizzo è sbagliato oppure la pagina è stata spostata.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Torna alla home
          </Link>
        </div>
      </div>
    </div>
  );
}

function PaginaRotta({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Questa pagina non si è aperta
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Qualcosa è andato storto. Riprova, oppure torna alla home.{" "}
          <strong>I tuoi movimenti sono al sicuro</strong>: stanno su questo telefono e non si
          perdono.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Riprova
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
          >
            Torna alla home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  notFoundComponent: PaginaNonTrovata,
  errorComponent: PaginaRotta,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const { benvenutoVisto, iscrittoCome } = useStato();

  return (
    <QueryClientProvider client={queryClient}>
      <Avvio>
        {/* La presentazione prende tutto lo schermo, una volta sola. Sta qui e non
          dentro la Home perché non deve avere la barra in basso: chi la vede la
          prima volta non ha ancora niente da guardare nelle altre schede. */}
        {/* Tre porte in fila, e l'ordine conta: prima si capisce cos'è e che è
          gratis, POI si lasciano i dati. Chiedere prima di aver dato qualcosa
          fa chiudere l'app, e i dati non li raccogli lo stesso. */}
        {!benvenutoVisto ? (
          <Benvenuto />
        ) : !iscrittoCome ? (
          <Iscrizione />
        ) : (
          // Obbligatorio: le pagine figlie compaiono qui. Togliendo <Outlet /> non si apre più niente.
          <Outlet />
        )}
      </Avvio>
    </QueryClientProvider>
  );
}
