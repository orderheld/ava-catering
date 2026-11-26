# Tägliche Prüfung (07:15 Uhr, automatisch)

Jeden Morgen prüft Claude die Kunden-Website und das Admin und stellt Verbesserungen direkt live
(Merge auf `main` → Vercel veröffentlicht automatisch). Diese Datei ist die Checkliste dafür.

## Ablauf

1. `npm ci`, lokale Postgres-DB (`service postgresql start`, DB `ava`), `.env.local` mit `DATABASE_URL`, `ADMIN_PASSWORD`, `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL=https://avacatering.ch`.
   `npx tsx scripts/migrate.ts && npx tsx scripts/seed.ts`, dann `npx tsc --noEmit` und `npx next build`, `npx next start -p 3100`.
2. **Lighthouse** (Chromium `/opt/pw-browsers/chromium`) für `/`, `/firmen`, `/privat`, `/anfrage`, `/angebot/apero`, `/catering`, `/catering/reiden`:
   Ziel Leistung ≥ 95, Barrierefreiheit/Best Practices/SEO = 100. Hinweis: das lokale Bild-Resizing ist beim ersten Aufruf langsam, Werte einmal wiederholen.
3. **SEO-Check**: jede Seite hat eigenen `<title>` (≤ 65 Zeichen), Beschreibung (120–165 Zeichen), `og:image` (Datei existiert), canonical, genau ein `<h1>`; `sitemap.xml` enthält alle Seiten und Ortsseiten; JSON-LD ist gültiges JSON; keine kaputten internen Links (alle `href="/…"` liefern 200).
4. **Mobil & Bestellvorgang**: Screenshots 390 px (Startseite, Ortsseite, Anfrage Schritt 1–4, Admin Übersicht + Anfrage). Nichts überlappt, Tippflächen ≥ 44 px, Anfrage in 4 Schritten absendbar.
5. **Admin**: gut lesbar (Systemschrift, keine Mini-Schrift < 13 px, keine Rohwerte wie «lieferung»).
6. Verbesserungen umsetzen, nur kleine, sichere Schritte. Neue Ortsseiten: Eintrag in `lib/regions.ts` mit eigenem Text, dann `node scripts/og/og-bilder.cjs` für das Vorschaubild.

## Regeln (nicht verhandelbar)

- Wording: «Firmen & Feste», Küche «europäisch & mediterran», nie «türkisch», keine Hochzeiten/Grossanlässe (10–120 Gäste). Keine erfundenen Fakten (Preise, Bewertungen, Öffnungszeiten, Zahlungsarten).
- Footer behält «Webdesign by webnova.ch».
- Keine Löschungen in der Datenbank, keine Änderungen an Spam-Schutz, Login, Push, Offerten-Logik ohne Auftrag.
- Nur mergen, wenn `tsc` und `next build` grün sind und die Vercel-Vorschau erfolgreich gebaut wurde. Sonst PR offen lassen und Ferhat informieren.
- Gibt es nichts Sinnvolles zu verbessern: nichts ändern, nur kurz berichten.
