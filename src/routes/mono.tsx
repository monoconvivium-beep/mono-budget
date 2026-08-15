import { Link, createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Download, Upload, Trash2, FileSpreadsheet, Share2, BookOpen } from "lucide-react";
import { Guscio } from "@/components/Guscio";
import { Aiuto } from "@/components/Aiuto";
import { MarchioMono } from "@/components/MarchioMono";
import { PassalaAUnAmico } from "@/components/PassalaAUnAmico";
import { COLORI_CATEGORIA, CATEGORIE, euro, pillolaDi } from "@/lib/parse";
import { versoCsv } from "@/lib/statistiche";
import { attivi, azioni, useStato } from "@/lib/store";

export const Route = createFileRoute("/mono")({
  head: () => ({
    meta: [
      { title: "MONO — impostazioni e promessa di privacy" },
      {
        name: "description",
        content:
          "Tema, obiettivo di risparmio, backup di tutti gli anni, regole imparate e la promessa: i tuoi dati restano sul telefono.",
      },
      { property: "og:title", content: "MONO — impostazioni di MonoConvivium" },
      {
        property: "og:description",
        content:
          "I conti, la lista della spesa, le cose da fare e il ricettario. Regalati da MONO, gastronomia a Torino. Nessun account, nessun server.",
      },
    ],
  }),
  component: Mono,
});

function Mono() {
  const stato = useStato();
  const [messaggio, setMessaggio] = useState("");
  const [obiettivo, setObiettivo] = useState(String(stato.obiettivo));
  const fileRef = useRef<HTMLInputElement>(null);

  const oggi = () => new Date().toISOString().slice(0, 10);

  /** Un file scaricato, senza passare da nessun server. */
  function salvaFile(contenuto: string, nome: string, tipo: string) {
    const url = URL.createObjectURL(new Blob([contenuto], { type: tipo }));
    const a = document.createElement("a");
    a.href = url;
    a.download = nome;
    a.click();
    URL.revokeObjectURL(url);
  }

  function scarica() {
    salvaFile(azioni.esporta(), `mono-money-backup-${oggi()}.json`, "application/json");
    setMessaggio("Backup salvato: contiene tutti gli anni.");
  }

  /**
   * «Regalala a qualcuno» — la condivisione che spiega.
   * ⚠️ Non si manda solo il collegamento: da solo non dice cos'è né che è
   * gratis, e un collegamento nudo in una chat non lo apre nessuno.
   */
  async function condividi() {
    const testo =
      "MonoConvivium — i conti, la spesa e le cose da fare, dette a voce. Dici «quarantasei farmacia» e la spesa è scritta. Gratis, e i tuoi conti restano sul tuo telefono. Un omaggio di MONO, gastronomia a Torino.";
    const url = window.location.origin + import.meta.env.BASE_URL;

    if (navigator.share) {
      try {
        await navigator.share({ title: "MonoConvivium — La tua voce conta.", text: testo, url });
        return;
      } catch {
        // Ha chiuso il foglio di condivisione: non è un errore, non si dice niente.
        return;
      }
    }
    await navigator.clipboard.writeText(`${testo}\n${url}`);
    setMessaggio("Copiato: ora puoi incollarlo dove vuoi.");
  }

  function esportaFoglio() {
    // Il cestino resta fuori: quello che hai buttato non deve tornare in un conto.
    const righe = attivi(stato.movimenti);
    salvaFile(versoCsv(righe), `mono-money-movimenti-${oggi()}.csv`, "text/csv;charset=utf-8");
    setMessaggio(
      `Esportati ${righe.length} movimenti. Il file si apre con Excel, Numbers o Fogli Google.`,
    );
  }

  async function ripristina(file: File) {
    const esito = azioni.importa(await file.text());
    setMessaggio(esito.messaggio);
  }

  return (
    <Guscio titolo="MONO" sottotitolo="Gastronomia — Torino" senzaIntestazione>
      {/**
       * ⚠️ 9/8: QUI SOPRA NON CI VA NIENT'ALTRO — tolti su sua richiesta la
       * fascia col marchio e «MONO · Gastronomia — Torino», e il riquadro
       * dorato «MonoConvivium · La tua voce conta».
       * 🔑 Motivo: erano tre presentazioni una sull'altra prima di arrivare
       * alla carta che presenta davvero. Chi apre questa scheda vuole le
       * porte verso la bottega, non sentirsi dire tre volte dov'è capitato.
       * Si parte dritti da `MarchioMono`, che il marchio grande ce l'ha già.
       *
       * L'ordine è il funnel: prima le porte verso MONO (l'app vera si
       * scarica da lì), poi il ricettario, poi il passaparola.
       */}
      <MarchioMono />

      {/* La lista della spesa, con lo stesso oro della carta in Home. */}
      <Link
        to="/spesa"
        className="mt-4 flex min-h-[64px] items-center gap-3 rounded-2xl bg-oro p-3.5 text-oro-foreground shadow-morbida"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F4E7C8]">
          <img
            src={`${import.meta.env.BASE_URL}marchio/mono-monogramma.svg`}
            alt=""
            aria-hidden="true"
            className="h-8 w-8"
          />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-bold">Lista della spesa</span>
          <span className="block truncate text-xs opacity-75">
            Dilla a voce, poi spunta al banco
          </span>
        </span>
        <span aria-hidden className="opacity-60">
          ›
        </span>
      </Link>

      {/* Il ricettario: il regalo dentro il regalo. Rosso, come la sua pagina. */}
      <Link
        to="/ricette"
        className="mt-4 flex min-h-[64px] items-center gap-3 rounded-2xl border border-[#8C3F22] bg-[var(--azione-scheda)] p-3.5 text-[var(--azione-testo)] shadow-morbida"
      >
        {/* Il piatto, come sulla porta in Home: la cucina di MONO ha una faccia
            sola, e non è il cappello da chef di una libreria. */}
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F4E7C8]">
          <img
            src={`${import.meta.env.BASE_URL}marchio/mono-monogramma.svg`}
            alt=""
            aria-hidden="true"
            className="h-8 w-8"
          />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-bold">Ricette</span>
          <span className="block truncate text-xs text-[rgba(244,236,221,0.78)]">
            Le basi di pasticceria dello chef, e le tue dette a voce
          </span>
        </span>
        <span aria-hidden className="text-[rgba(244,236,221,0.7)]">
          ›
        </span>
      </Link>

      <PassalaAUnAmico />

      <section className="scheda mt-4 p-4">
        <h2 className="text-lg">I tuoi conti restano tuoi</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Importi, categorie e saldo restano dentro questo telefono. Non c'è nessun account, nessun
          server, nessuna chiamata di rete: <strong>MONO non riceve niente</strong>, nemmeno il tuo
          nome. L'unico modo per portarli altrove sei tu, col file di backup qui sotto.
        </p>
        <button
          type="button"
          onClick={condividi}
          className="tocco mt-4 w-full gap-2 rounded-2xl border border-border px-4 font-semibold"
        >
          <Share2 className="h-5 w-5" /> Regalala a qualcuno
        </button>
      </section>

      {/* ⚠️ Qui c'era l'interruttore chiaro/scuro. Tolto di proposito il 4/8:
          tema unico, cashmere col verde come accento. Un marchio non chiede a
          chi lo usa di scegliersi il vestito, e due temi volevano dire due app
          da curare — con nessuna delle due curata fino in fondo. */}

      <section className="scheda mt-4 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg">Obiettivo di risparmio</h2>
          <Aiuto testo="Quanto vuoi mettere da parte in un mese. Serve solo alla barra in Home." />
        </div>
        <div className="mt-3 flex gap-2">
          <input
            inputMode="decimal"
            value={obiettivo}
            onChange={(e) => setObiettivo(e.target.value)}
            className="tocco w-full flex-1 rounded-2xl border border-input bg-card px-4 text-base"
          />
          <button
            type="button"
            onClick={() => {
              const n = Number(obiettivo.replace(",", "."));
              if (!Number.isNaN(n) && n >= 0) {
                azioni.impostaObiettivo(n);
                setMessaggio(`Obiettivo impostato a ${euro(n)}.`);
              }
            }}
            className="tocco rounded-2xl bg-oro px-4 font-semibold text-oro-foreground"
          >
            Salva
          </button>
        </div>
      </section>

      <section className="scheda mt-4 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg">Backup e ripristino</h2>
          <Aiuto testo="Il backup contiene TUTTI gli anni e serve a rimettere tutto su un telefono nuovo. Il CSV invece si apre con Excel o Fogli Google, per farci i tuoi conti." />
        </div>
        <div className="mt-3 flex flex-col gap-2">
          <button
            type="button"
            onClick={scarica}
            className="tocco gap-2 rounded-2xl bg-accent px-4 font-semibold text-accent-foreground"
          >
            <Download className="h-5 w-5" /> Scarica il backup
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="tocco gap-2 rounded-2xl border border-border px-4 font-semibold"
          >
            <Upload className="h-5 w-5" /> Ripristina da file
          </button>
          <button
            type="button"
            onClick={esportaFoglio}
            className="tocco gap-2 rounded-2xl border border-border px-4 font-semibold"
          >
            <FileSpreadsheet className="h-5 w-5" /> Esporta per Excel (CSV)
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void ripristina(f);
              e.target.value = "";
            }}
          />
        </div>
        {messaggio && <p className="mt-3 text-sm text-muted-foreground">{messaggio}</p>}
      </section>

      <section className="scheda mt-4 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg">Regole imparate</h2>
          <Aiuto testo="Quando correggi una categoria a mano, da lì in poi quella parola va nella categoria che hai scelto." />
        </div>
        {stato.regole.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Nessuna regola per ora. Correggi la categoria di un movimento nel Diario e la imparo.
          </p>
        ) : (
          <ul className="mt-2">
            {stato.regole.map((r) => (
              <li
                key={r.chiave}
                className="flex items-center gap-3 border-b border-border py-3 last:border-0"
              >
                <span className="min-w-0 flex-1 truncate text-sm">
                  «{r.chiave}» è categoria <strong>{r.categoria}</strong>
                </span>
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: COLORI_CATEGORIA[r.categoria] }}
                />
                <button
                  type="button"
                  aria-label="Togli la regola"
                  onClick={() => azioni.togliRegola(r.chiave)}
                  className="tocco text-muted-foreground"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="scheda mt-4 p-4">
        <h2 className="text-lg">Le categorie</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {CATEGORIE.map((c) => (
            <li
              key={c}
              className="pillola text-xs font-semibold"
              /* Fondo e inchiostro decisi dal contrasto, non a occhio:
                 vedi `pillolaDi` in lib/parse.ts. */
              style={{ backgroundColor: pillolaDi(c).fondo, color: pillolaDi(c).inchiostro }}
            >
              {c}
            </li>
          ))}
        </ul>
      </section>

      <section className="scheda mt-4 p-4 text-sm leading-relaxed text-muted-foreground">
        <h2 className="mb-2 text-lg text-foreground">Come funziona</h2>
        <p>
          Tocchi il microfono, dici <strong>una</strong> spesa e l'ascolto si chiude da solo.
          MonoConvivium ti mostra importo, categoria e testo: salva solo dopo la tua conferma, e non
          cambia mai un importo di nascosto. Se un numero sembra letto tutto attaccato (460 invece
          di 4,60) te lo propone, decidi tu.
        </p>
        <p className="mt-2">
          I conti si leggono nella scheda <strong>Bilanci</strong>: il mese ti dice com'è andata
          adesso, l'anno ti fa vedere la storia, e la torta dove sono finiti i soldi.
        </p>
        <button
          type="button"
          onClick={() => azioni.riapriBenvenuto()}
          className="tocco mt-4 w-full gap-2 rounded-2xl border border-border px-4 font-semibold text-foreground"
        >
          <BookOpen className="h-5 w-5" /> Rileggi la presentazione
        </button>
      </section>
    </Guscio>
  );
}
