/**
 * LE FRASI DELLA LISTA DELLA SPESA — il marketing di MONO, dette da MONO.
 *
 * 🔑 L'IDEA È SUA (9/8/2026), e il taglio pure: *«anziché farti la spesa,
 * cucinare, lavare i piatti, rimettere tutto a posto — ordina da MONO»*,
 * *«chiama MONO, goditi il relax, al resto ci pensiamo noi»*.
 * Non vendono il pane: vendono **il pomeriggio che ti resta**. È la cosa
 * giusta da vendere a uno che sta scrivendo la lista della spesa, perché in
 * quel momento non sta pensando al cibo — sta pensando alla fatica che c'è
 * dietro, e non l'ha ancora fatta.
 *
 * ⚠️ NON SONO LE FRASI DEL BUONGIORNO e non vanno confuse: quelle parlano di
 * CHI LEGGE e non nominano mai MONO né il cibo (sua regola dell'1/8). Queste
 * fanno il contrario apposta — nominano MONO e chiudono con un invito. Due
 * mestieri diversi, due file diversi.
 *
 * ⚠️ E NON SONO UN RICHIAMO A SORPRESA. I richiami dentro il Diario li ha
 * scartati lui, lo stesso giorno: questa frase vive in **un posto fisso**, in
 * fondo alla lista, dove uno la trova solo se sta già guardando lì. Si legge
 * o si ignora, non interrompe niente.
 *
 * La frase cambia a ogni apertura della lista: la stessa ripetuta ogni volta
 * dopo tre giorni diventa arredamento e non la legge più nessuno.
 */

export const FRASI_SPESA: readonly string[] = [
  "Fare la spesa, cucinare, apparecchiare, lavare i piatti, rimettere a posto. Oppure ordinare da MONO.",
  "Chiama MONO, goditi il relax: al resto ci pensiamo noi.",
  "Scritta la lista, comincia il lavoro. Da MONO è già finito.",
  "C'è chi passa la domenica ai fornelli. E c'è chi passa da MONO.",
  "Il pranzo di domani può già essere pronto. Basta dirlo a noi.",
  "Tutto questo, oppure una telefonata a MONO. Scegli tu.",
  "La spesa, la coda, i sacchetti, le scale. Oppure noi.",
  "Cucinare è bello quando lo scegli. Quando tocca, c'è MONO.",
  "Stasera ospiti? La lista può restare dov'è: pensiamo noi alla cena.",
  "Da MONO trovi già fatto quello che stai per comprare crudo.",
  "La lista più bella è quella che passa da noi.",
  "Metti giù la lista, prendi il telefono: ci pensiamo noi.",
];

/**
 * La frase di oggi. Cambia a ogni apertura, ma non a caso: gira in cerchio,
 * così due aperture di fila non dicono mai la stessa cosa — il caso vero, ogni
 * tanto, la ripete due volte e sembra un difetto.
 */
export function fraseSpesa(giro: number): string {
  const i = ((giro % FRASI_SPESA.length) + FRASI_SPESA.length) % FRASI_SPESA.length;
  return FRASI_SPESA[i] as string;
}
