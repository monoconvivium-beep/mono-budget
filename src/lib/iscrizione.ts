/**
 * L'ISCRIZIONE — l'unica cosa che esce da questa app.
 *
 * 🔑 Manda a MONO **nome, cognome, email, telefono e il consenso**, e nient'altro.
 * Non manda mai importi, categorie, saldo o metodo di pagamento: quelli restano
 * nel telefono, e questa è la promessa scritta nella schermata d'ingresso.
 *
 * 🔒 La chiave qui sotto è **pubblica per definizione** — sta già dentro il
 * programma di ogni pagina del gestionale, non è una password. A proteggere i
 * dati sono le regole del database, verificate provandole: da fuori si può
 * **solo inserire** un'iscrizione, e la rubrica dei clienti **non si legge**
 * (misurato: 0 righe viste su 17 esistenti).
 * ⚠️ La chiave di servizio non deve mai entrare qui: quella scavalca ogni
 * regola, e questo codice è pubblico.
 */

const INDIRIZZO = import.meta.env["VITE_SUPABASE_URL"] ?? "";
const CHIAVE = import.meta.env["VITE_SUPABASE_ANON_KEY"] ?? "";

export interface Iscritto {
  nome: string;
  cognome: string;
  email: string;
  telefono: string;
  consensoMarketing: boolean;
}

export type Campo = keyof Omit<Iscritto, "consensoMarketing">;

/**
 * Cosa manca o è scritto male. Restituisce un messaggio per campo, vuoto se va
 * tutto bene: così l'errore si può mostrare **accanto al campo giusto** invece
 * che come una riga rossa in fondo che non dice quale.
 */
export function controlla(d: Iscritto): Partial<Record<Campo, string>> {
  const problemi: Partial<Record<Campo, string>> = {};

  if (d.nome.trim().length < 2) problemi.nome = "Scrivi il tuo nome.";
  if (d.cognome.trim().length < 2) problemi.cognome = "Scrivi il tuo cognome.";

  // Volutamente larga: non tocca a un modulo decidere quali email esistono.
  // Serve solo a fermare le distrazioni, tipo la chiocciola dimenticata.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email.trim())) {
    problemi.email = "Controlla l'email: manca qualcosa.";
  }

  // ⚠️ Le cifre si contano dopo aver tolto spazi, punti, barre e trattini: la
  // gente il numero lo scrive come le pare, e rifiutarlo per un punto sarebbe
  // solo un modo per perdere un cliente.
  const cifre = d.telefono.replace(/[^\d]/g, "");
  if (cifre.length < 8) problemi.telefono = "Controlla il numero: sembra corto.";

  return problemi;
}

/** Il numero pulito, come lo si vuole in rubrica: solo cifre e il + davanti. */
export function ripulisciTelefono(grezzo: string): string {
  const soloCifre = grezzo.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "");
  if (soloCifre.startsWith("+")) return soloCifre;
  // Un numero italiano scritto senza prefisso resta valido, ma in rubrica ci va
  // completo: senza il prefisso non lo puoi usare da nessun servizio.
  if (soloCifre.startsWith("00")) return `+${soloCifre.slice(2)}`;
  return soloCifre ? `+39${soloCifre}` : "";
}

export type Esito = { ok: true } | { ok: false; messaggio: string };

/**
 * Scrive l'iscrizione nella rubrica di MONO.
 *
 * `nota` è la targa del passaparola (`lib/origine.ts`): da quale banco o da
 * quale amico arriva l'iscrizione. Finisce nella colonna `notes` — è un dato
 * sull'ISCRIZIONE, come consent_source: dei soldi continua a non passare niente.
 */
export async function iscrivi(d: Iscritto, nota?: string | null): Promise<Esito> {
  if (!INDIRIZZO || !CHIAVE) {
    return { ok: false, messaggio: "Manca la configurazione: avvisa MONO." };
  }

  const email = d.email.trim().toLowerCase();
  const corpo = {
    ...(nota ? { notes: nota } : {}),
    first_name: d.nome.trim(),
    last_name: d.cognome.trim(),
    email_original: d.email.trim(),
    email_normalized: email,
    phone_original: d.telefono.trim(),
    phone_e164: ripulisciTelefono(d.telefono),
    consent_marketing: d.consensoMarketing,
    // 🔑 Le tre righe che rendono il consenso **dimostrabile**: da dove arriva,
    // quale testo è stato accettato, e quando. Senza, è una casella e basta.
    consent_source: "mono-money",
    consent_version: "2026-08",
    consent_at: new Date().toISOString(),
    preferred_channel: "email",
  };

  try {
    const risposta = await fetch(`${INDIRIZZO}/rest/v1/crm_contacts`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        apikey: CHIAVE,
        authorization: `Bearer ${CHIAVE}`,
        // Non farsi restituire la riga: non serve, e meno cose tornano indietro
        // meno c'è da sbagliare.
        prefer: "return=minimal",
      },
      body: JSON.stringify(corpo),
    });

    if (risposta.ok) return { ok: true };

    // 23505 = c'è già. Non è un errore per chi si iscrive: è già dentro.
    const testo = await risposta.text();
    if (risposta.status === 409 || testo.includes("23505")) return { ok: true };

    return {
      ok: false,
      messaggio: "Non sono riuscito a registrarti. Riprova fra un momento.",
    };
  } catch {
    // ⚠️ Qui ci si finisce quasi sempre per mancanza di rete, non per un guasto:
    // il messaggio deve dirlo, se no uno pensa che l'app sia rotta.
    return {
      ok: false,
      messaggio: "Sembra che tu non abbia rete. Riprova quando torna il campo.",
    };
  }
}
