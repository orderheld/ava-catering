import { pageMeta } from '@/lib/seo'
import { PageHero } from '@/components/site/sections'
import { getSettings } from '@/lib/data'

export const metadata = pageMeta({ title: 'Datenschutz', description: 'Datenschutzerklärung von AVA Catering, Dilsah Sever, Pfaffnau.', path: '/datenschutz', noindex: true })
export const revalidate = 300

export default async function DatenschutzPage() {
  const s = await getSettings()
  return (
    <>
      <PageHero eyebrow="Rechtliches" title="Datenschutzerklärung" text="Stand: Oktober 2026. Diese Erklärung richtet sich nach dem Schweizer Datenschutzgesetz (DSG)." />
      <section className="container-x text-muted max-w-3xl space-y-8 pb-28 leading-relaxed [&_h2]:text-olive-deep [&_h2]:mb-2 [&_h2]:font-serif [&_h2]:text-2xl [&_ul]:list-disc [&_ul]:pl-5">
        <div>
          <h2>Verantwortliche Stelle</h2>
          <p>
            AVA Catering, Dilsah Sever, {s.street}, {s.zip} {s.city}, {s.email}
          </p>
        </div>
        <div>
          <h2>Welche Daten wir bearbeiten</h2>
          <p>
            Wenn Sie uns über das Anfrage- oder Kontaktformular schreiben, bearbeiten wir die von Ihnen angegebenen Daten (z.B. Name, E-Mail, Telefon,
            Angaben zum Anlass, Ernährungswünsche und Nachricht), um Ihre Anfrage zu beantworten und ein Angebot zu erstellen. Zum Schutz vor Missbrauch
            speichern wir zudem einen anonymisierten (gehashten) Wert Ihrer IP-Adresse.
          </p>
        </div>
        <div>
          <h2>Dienstleister</h2>
          <p>Für den Betrieb dieser Website setzen wir sorgfältig ausgewählte Dienstleister ein, die Daten in unserem Auftrag bearbeiten:</p>
          <ul className="mt-2 space-y-1">
            <li>Vercel Inc. (Hosting der Website)</li>
            <li>Neon Inc. (Datenbank für Anfragen)</li>
            <li>Resend Inc. (Versand von E-Mails)</li>
          </ul>
          <p className="mt-2">Dabei können Daten auch in die USA oder andere Länder übermittelt werden. Wir achten auf angemessene Garantien gemäss DSG.</p>
        </div>
        <div>
          <h2>Cookies & Tracking</h2>
          <p>Diese Website verwendet keine Tracking- oder Werbe-Cookies. Ein technisch notwendiges Cookie wird nur für die Anmeldung im Administrationsbereich gesetzt.</p>
        </div>
        <div>
          <h2>Aufbewahrung</h2>
          <p>Wir bewahren Anfragen so lange auf, wie es für die Bearbeitung und allfällige gesetzliche Pflichten nötig ist, und löschen sie danach.</p>
        </div>
        <div>
          <h2>Ihre Rechte</h2>
          <p>Sie können jederzeit Auskunft über Ihre Daten verlangen sowie deren Berichtigung oder Löschung beantragen. Schreiben Sie uns an {s.email}.</p>
        </div>
      </section>
    </>
  )
}
