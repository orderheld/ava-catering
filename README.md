# AVA Catering – Website & Admin

Website für **AVA Catering**, Dilsah Sever, Stegmatt 9a, 6264 Pfaffnau.
Next.js 16 · Tailwind CSS 4 · Neon (Postgres, Drizzle ORM) · Resend · Vercel (Hosting & Blob für Bild-Uploads)

## Konzept: «Hausgemacht. Für Ihre Momente.»

- **Der rote Faden** ist wörtlich genommen: Eine feine orange Linie (aus dem Logo-Schwung) zieht sich durch alle Seiten und zeichnet sich beim Scrollen.
- **Fünf Kapitel** (01 Apéro · 02 Mezze · 03 Lunch · 04 Themen-Party · 05 Süsses) – auf der Startseite als interaktive Buffet-Tafel, im Angebot als durchnummerierte Kapitel.
- **Jeder Weg führt zur Anfrage**: Jedes Buffet und jedes Thema hat einen Button, der den Anfrage-Assistenten vorausgefüllt öffnet.
- **Farben aus dem Logo**: Orange `#E8650A`, Oliv `#4A5822`, Creme `#FBF7F0`. Schriften: Cormorant Garamond (Titel) + Jost (Text, wie «CATERING» im Logo).
- **Zielgruppen**: Firmen (Apéro, Teamlunch, Meetings) und Private (Geburtstag, Familienfest), Anlässe von rund 10 bis 120 Gästen. Sehr grosse Anlässe wie Hochzeiten sind bewusst nicht im Fokus.
- **Mobil zuerst**: Feste Leiste mit «Anrufen», «WhatsApp» und «Unverbindlich anfragen».
- **SEO & Teilen**: Eigene Titel/Beschreibung pro Seite, Open-Graph-Bilder für WhatsApp/Facebook/LinkedIn (`public/og*.jpg`), strukturierte Daten (LocalBusiness, Service, FAQ, Breadcrumbs), Sitemap, Web-App-Manifest, Favicon & App-Icons.

## Seiten

| Website | Admin (`/admin`) |
| --- | --- |
| `/` Startseite | Übersicht mit Kennzahlen & nächsten Anlässen |
| `/angebot` Übersicht, `/angebot/[kapitel]` Detailseiten | Anfragen: Filter, Suche, Status, Notizen, Offertbetrag |
| `/firmen` Firmencatering, `/privat` private Feiern | Antworten per E-Mail mit Vorlagen (Angebot, Rückfrage, Bestätigung) |
| `/anfrage` Assistent in 4 Schritten | Kalender: Anlässe + blockierte Tage («ausgebucht» im Formular) |
| `/ueber-uns`, `/galerie` (Lightbox), `/faq` | Angebot, Themen, Galerie (Upload), Texte & Kontaktdaten |
| `/kontakt`, `/impressum`, `/datenschutz` | |

Logos liegen in `public/brand/` (SVG): `ava-logo.svg` (Hauptlogo), `ava-logo-claim.svg`, `ava-logo-horizontal.svg`, `ava-logo-emblem.svg` (rund, z.B. Stempel/Social Media), `ava-logo-hell.svg` (für dunkle Hintergründe), `ava-icon.svg` (App-Icon/Favicon).

## Lokal starten (PowerShell)

```powershell
npm install
Copy-Item .env.example .env.local
notepad .env.local            # Werte eintragen (siehe unten)
npm run db:push               # Tabellen in Neon anlegen
npm run db:seed               # Startinhalte importieren (optional – geht auch im Admin)
npm run dev                   # http://localhost:3000  ·  Admin: http://localhost:3000/admin
```

Ohne `DATABASE_URL` läuft die Website trotzdem und zeigt die Standardinhalte aus `lib/content.ts`.

Zufälligen `AUTH_SECRET` erzeugen:

```powershell
-join ((48..57) + (97..122) | Get-Random -Count 48 | ForEach-Object { [char]$_ })
```

## Umgebungsvariablen

| Variable | Wofür |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://avacatering.ch` |
| `DATABASE_URL` | Neon-Verbindung (Vercel → Storage → Neon setzt sie automatisch) |
| `RESEND_API_KEY` | E-Mail-Versand |
| `MAIL_FROM` | `AVA Catering <kontakt@avacatering.ch>` |
| `MAIL_NOTIFY_TO` | Empfänger neuer Anfragen, z.B. `kontakt@avacatering.ch` |
| `ADMIN_PASSWORD` | Passwort für `/admin` |
| `AUTH_SECRET` | Zufallswert, mind. 32 Zeichen |
| `BLOB_READ_WRITE_TOKEN` | Bild-Uploads im Admin (Vercel → Storage → Blob) |

## Live schalten

1. **GitHub**: `git init`, committen, auf GitHub pushen.
2. **Vercel**: Projekt importieren, unter *Storage* eine **Neon**-Datenbank und einen **Blob**-Store verbinden, restliche Variablen eintragen, deployen. Danach lokal mit der Neon-URL einmal `npm run db:push` (und optional `npm run db:seed`).
3. **Domain**: In Vercel `avacatering.ch` und `www.avacatering.ch` hinzufügen und die angezeigten DNS-Einträge bei **cyon** setzen (in der Regel A-Record `@` → `76.76.21.21`, CNAME `www` → `cname.vercel-dns.com`). **MX-Einträge nicht ändern** – das Postfach kontakt@ bleibt bei cyon.
4. **Resend**: Domain `avacatering.ch` hinzufügen und die DKIM-/SPF-Einträge (TXT/MX auf der Subdomain `send`) bei cyon eintragen. Das kollidiert nicht mit dem cyon-Postfach. Nach der Verifizierung gehen die E-Mails von `kontakt@avacatering.ch` raus.

## Wie Anfragen ablaufen

1. Kundin füllt den Assistenten aus → Speicherung in Neon (Status *Neu*).
2. Resend schickt eine Benachrichtigung an `MAIL_NOTIFY_TO` (Antworten gehen direkt an die Kundin) und eine Bestätigung an die Kundin.
3. Im Admin: Status setzen, Notizen & Offertbetrag erfassen, mit Vorlage antworten. Der Verlauf wird protokolliert.

Spam-Schutz: Honeypot-Feld, Mindest-Ausfüllzeit, max. 5 Anfragen pro Stunde und IP (gehasht gespeichert).

## Projektstruktur

```
app/(site)/        öffentliche Seiten
app/admin/         Login, Admin-Panel und Server-Actions
components/        UI (site/ & admin/)
db/schema.ts       Datenbank-Schema (Drizzle)
lib/               Daten, Auth, E-Mail, Standardinhalte
proxy.ts           schützt /admin (Next.js 16 «proxy», früher middleware)
public/images      optimierte Fotos (WebP)  ·  public/brand  Logos
```

> Texte (Über uns, FAQ, Impressum, Datenschutz) sind Entwürfe – bitte mit Dilsah prüfen. Über uns, Kontaktdaten, Hinweis-Banner und Startseiten-Texte sind im Admin unter *Einstellungen* änderbar.
