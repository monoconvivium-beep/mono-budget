import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Download, Upload, Trash2, FileSpreadsheet } from "lucide-react";
import { Guscio } from "@/components/Guscio";
import { Aiuto } from "@/components/Aiuto";
import { COLORI_CATEGORIA, CATEGORIE, euro } from "@/lib/parse";
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
      { property: "og:title", content: "MONO — impostazioni di MONO MONEY" },
      {
        property: "og:description",
        content:
          "Il libretto delle spese regalato da MONO, gastronomia a Torino. Nessun account, nessun server.",
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
    <Guscio titolo="MONO" sottotitolo="Gastronomia — Torino">
      <section className="scheda-bosco p-5">
        <h2 className="text-xl">I tuoi conti restano tuoi</h2>
        <p className="mt-2 text-sm leading-relaxed opacity-90">
          Importi, categorie e saldo restano dentro questo telefono. Non c'è nessun account,
          nessun server, nessuna chiamata di rete: MONO non vede e non riceve niente. L'unico modo
          per portarli altrove sei tu, con il file di backup qui sotto.
        </p>
      </section>

      <section className="scheda mt-4 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg">Tema</h2>
          <Aiuto testo="Lo scuro (verde bosco) è pensato per la sera e consuma meno batteria." />
        </div>
        <div className="mt-3 flex gap-2">
          {(["scuro", "chiaro"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => azioni.impostaTema(t)}
              className={`pillola tocco flex-1 justify-center font-semibold ${
                stato.tema === t
                  ? "bg-accent text-accent-foreground"
                  : "border border-border text-muted-foreground"
              }`}
            >
              {t === "scuro" ? "Verde bosco" : "Cashmere"}
            </button>
          ))}
        </div>
      </section>

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
              style={{ backgroundColor: COLORI_CATEGORIA[c], color: "#F4ECDD" }}
            >
              {c}
            </li>
          ))}
        </ul>
      </section>

      <section className="scheda mt-4 p-4 text-sm leading-relaxed text-muted-foreground">
        <h2 className="mb-2 text-lg text-foreground">Come funziona</h2>
        <p>
          Tocchi il microfono, dici <strong>una</strong> spesa e l'ascolto si chiude da solo. MONO
          MONEY ti mostra importo, categoria e testo: salva solo dopo la tua conferma, e non
          cambia mai un importo di nascosto. Se un numero sembra letto tutto attaccato (460 invece
          di 4,60) te lo propone, decidi tu.
        </p>
        <p className="mt-2">
          Per installarla: dal telefono, menu del browser → «Aggiungi a schermata Home».
        </p>
        <p className="mt-2">Un regalo di MONO, bottega di gastronomia a Torino.</p>
      </section>
    </Guscio>
  );
}
