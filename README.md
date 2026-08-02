# MONO Budget

Costruisci **MONO MONEY**: un libretto delle spese da tasca, tutto in italiano, pensato per il telefono e installabile come app (PWA). È il regalo che una bottega di gastronomia — MONO, Torino — fa ai suoi clienti.

L'idea in una riga: **si dice a voce «quarantasei farmacia» e l'app scrive la spesa, la mette nella categoria giusta e tiene i conti del mese e dell'anno.**

Esiste già una versione precedente: funzionava bene tranne la dettatura. Qui la rifacciamo meglio, ma **l'aspetto e le cose che funzionavano si tengono identiche**. Sotto c'è tutto, compreso quello che abbiamo imparato sbattendoci contro.

---

## 1. La regola di privacy, che decide l'architettura

Importi, categorie e saldo **restano nel dispositivo** e non vengono mai mandati a nessun server. È una promessa scritta nella schermata d'ingresso, non un dettaglio tecnico.

Quindi in questa prima versione: **nessun database, nessun login, nessuna chiamata di rete**. Tutto in `localStorage`/IndexedDB, con **esportazione e importazione di un file di backup che contiene tutti gli anni** (non solo quello corrente: è un errore già fatto una volta, si perdevano gli anni vecchi al cambio telefono).

## 2. L'aspetto — è già deciso, riproducilo

**Caratteri**: titoli e numeri grandi in **Fraunces** (serif); testo e interfaccia in **Bricolage Grotesque**.

**Colori** — due temi, chiaro e scuro. Lo scuro è quello che si usa di più:

Chiaro: sfondo `#F4ECDD` (cashmere) · schede `#FFFFFF` · testo `#262321` · righe/bordi `#EFE3C8` · accento `#A83A28` · secondario `#B85C38` · oro `#CBA75A` · oliva `#6E6A3C` · salvia `#4E6B47`

Scuro: sfondo `#3F5741` (verde bosco) · schede `#48624A` · schede tenui `#425B44` · testo `#F4ECDD` · bordi `rgba(244,236,221,.16)` · accento `#F0A98C` · oro `#DDBB72`

**Forme**: angoli morbidi (14–24px), pillole a 999px, ombre larghe e tenui, aree toccabili di almeno 52px. Niente grigi freddi: il fondo neutro è **crema**, mai bianco spento.

## 3. Le schermate

Barra in basso con 5 voci: **Home · Diario · Ascolto · Anno · MONO**. «Ascolto» sta al centro, rialzato, dentro un cerchio oro: è il gesto principale.

- **Home** — in alto una scheda scura con l'**obiettivo di risparmio** e una barra di avanzamento; sotto tre riquadri affiancati: **USCITE**, **ENTRATE**, **OGGI**. Poi la scheda dell'inserimento con il microfono grande e la casella di testo. Sotto, le ultime spese: una riga per movimento con importo, categoria, ora e una **×** per toglierla.
- **Ascolto** — la dettatura a tutto schermo (vedi punto 4).
- **Diario** — tutti i movimenti, con **ricerca su tutto**, **cestino** (si recupera quello che si cancella per sbaglio) e **cambio categoria dalla riga stessa**.
- **Anno** — i bilanci **mese per mese**, entrate e uscite, e il riconoscimento del mese chiuso.
- **MONO** — impostazioni: tema, obiettivo di risparmio, backup/ripristino, le **regole imparate**, e le spiegazioni.

Ogni strumento che non si capisce da solo ha accanto un **«?»** che lo spiega in una frase.

## 4. La dettatura: **un tocco = una spesa**

Questa è la scelta più importante e va rispettata alla lettera.

Si tocca il microfono, si dice **una** spesa, il riconoscimento si chiude **da solo** (`continuous = false`, un solo risultato definitivo), l'app mostra **cosa ha capito** — importo, categoria, testo — e la persona **conferma** con un tocco. Poi può toccare di nuovo per la spesa dopo.

**Non fare l'ascolto continuo.** La versione precedente teneva il microfono aperto e provava a ricostruire il discorso mentre cresceva: è da lì che nascevano tutti i difetti.

**Due regole di prodotto che non si toccano**: non trasformare **mai** un importo di nascosto, e **non salvare senza conferma**.

## 5. Capire l'italiano parlato

Deve gestire: numeri detti a parole («quarantasei» → 46), decimali italiani («4,80» resta 4,80 e **non** diventa 480), «euro» e «centesimi», la parola «e» come separatore fra due spese, contanti e carta se detti, ed entrate oltre che uscite.

**Le 10 categorie**, con i loro colori:
Casa `#4E6B47` · Spesa alimentare `#CBA75A` · Bar `#B5723F` · Ristoranti `#B85C38` · Tabacchi `#6E6A3C` · Trasporti `#262321` · Salute `#A83A28` · Abbonamenti `#E27A60` · Shopping `#CBA75A` · Tempo libero `#7E9247`

Ognuna riconosce dei sinonimi: «farmacia» → Salute, «tabaccaio» → Tabacchi, «supermercato» → Spesa alimentare, «affitto» e «bollette» → Casa, «benzina» e «biglietto» → Trasporti, e così via. Se non riconosce nulla, la categoria è **Altro** e l'app lo dice invece di indovinare.

Se una spesa viene corretta a mano, l'app **impara la regola** («da adesso *X* è categoria *Y*») e la applica dalla volta dopo. Le regole imparate si vedono e si cancellano dalla scheda MONO.

## 6. Trappole già misurate sul campo — non riscoprirle

1. **Il riconoscimento italiano scrive «quattro e sessanta» come `460`.** L'importo arriva già sbagliato e nessun accorgimento lo recupera. Quindi: insegna la frase che funziona («quattro **euro** e sessanta») e, quando un numero sembra collassato, **proponi** la lettura in centesimi con un tocco — senza mai cambiarlo di nascosto.
2. **Su Android, con l'ascolto continuo, ogni risultato «definitivo» è il precedente allungato** e restano tutti nella stessa lista: chi li concatena scrive tre spese al posto di una. È esattamente il motivo per cui qui si usa **un tocco = una spesa**.
3. **Sul computer questi difetti non si vedono.** La dettatura va provata **dal telefono**, sempre.
4. Serve `permissions-policy: microphone=(self)` e il microfono funziona solo in HTTPS.

## 7. Come deve essere fatta dentro

Tieni **la comprensione del testo in un file puro e separato** (niente grafica, niente React): riceve una frase e restituisce i movimenti. E **scrivi le prove** per quel file: numeri a parole, decimali italiani, due spese in una frase, categorie e sinonimi, il caso «4,80 non è 480». È la parte che vale di più e deve poter essere verificata senza aprire l'app.

Parti da qui: struttura, tema, le 5 schermate, la dettatura a un tocco, la comprensione del testo con le prove, il salvataggio sul dispositivo e il backup. Interfaccia **tutta in italiano**, mobile-first.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b8fd4225-bedf-4919-b8da-eea72796c52f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
