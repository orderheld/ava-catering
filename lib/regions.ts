// Orte im Liefergebiet mit eigener Seite (/catering/[ort]) für die lokale Google-Suche
// («Catering Reiden», «Partyservice Olten», «Firmenlunch Sursee» …).
//
// Jeder Ort hat einen eigenen Einleitungstext, damit Google die Seiten nicht als Kopien wertet.
// Distanzen sind gerundete Strassen-Kilometer ab der Küche in Pfaffnau (Richtwerte, keine Zusage).
// Neuer Ort: Eintrag ergänzen – Seite, Sitemap, Footer-Links und strukturierte Daten folgen automatisch.

export type Region = {
  slug: string
  name: string
  /** Kantonskürzel für Anzeige und schema.org */
  canton: 'LU' | 'AG' | 'SO' | 'BE'
  /** Region, wie sie Einheimische nennen */
  area: string
  plz: string
  km: number
  /** 1–2 Sätze, nur für diesen Ort */
  intro: string
  /** Wofür AVA hier besonders oft passt (Stichworte, erscheinen als Chips) */
  focus: string[]
  image: string
  imageAlt: string
  /** Slugs der Nachbarorte (interne Verlinkung) */
  near: string[]
  /** Wichtiger Ort: im Footer und auf der Startseite verlinkt */
  top?: boolean
}

export const cantonName: Record<Region['canton'], string> = {
  LU: 'Kanton Luzern',
  AG: 'Kanton Aargau',
  SO: 'Kanton Solothurn',
  BE: 'Kanton Bern',
}

export const regions: Region[] = [
  {
    slug: 'pfaffnau',
    name: 'Pfaffnau',
    canton: 'LU',
    area: 'Luzerner Hinterland',
    plz: '6264',
    km: 0,
    intro:
      'In Pfaffnau steht unsere Küche. Hier wird jedes Buffet von Hand zubereitet, und hier können Sie Ihre Bestellung auch selbst abholen, frisch und ohne Lieferkosten.',
    focus: ['Abholung an der Stegmatt', 'Geburtstag & Familienfest', 'Vereinsanlass', 'Firmenapéro im Dorf'],
    image: '/images/tafel-gross.webp',
    imageAlt: 'Reich gedeckte Buffet-Tafel von AVA Catering aus Pfaffnau',
    near: ['st-urban', 'reiden', 'brittnau', 'langenthal'],
    top: true,
  },
  {
    slug: 'reiden',
    name: 'Reiden',
    canton: 'LU',
    area: 'Wiggertal',
    plz: '6260',
    km: 7,
    intro:
      'Reiden liegt nur wenige Minuten von unserer Küche entfernt. Ob Teamlunch im Gewerbegebiet, Apéro nach der Generalversammlung oder Geburtstagsfest: Das Buffet ist schnell und frisch bei Ihnen.',
    focus: ['Teamlunch & Lunch-Boxen', 'Vereinsapéro', 'Geburtstag', 'Geschäftseröffnung'],
    image: '/images/lunch-set.webp',
    imageAlt: 'Lunch-Buffet für ein Team in Reiden',
    near: ['pfaffnau', 'wikon', 'dagmersellen', 'zofingen'],
    top: true,
  },
  {
    slug: 'wikon',
    name: 'Wikon',
    canton: 'LU',
    area: 'Wiggertal',
    plz: '4806',
    km: 9,
    intro:
      'Von Pfaffnau nach Wikon ist es ein Katzensprung. Für Familienfeste, Vereinsanlässe und kleine Firmenapéros bringen wir hausgemachtes Fingerfood und Buffets direkt zu Ihnen.',
    focus: ['Familienfest', 'Apéro für Vereine', 'Kleine Firmenanlässe', 'Süsses & Gebäck'],
    image: '/images/apero-minipizza.webp',
    imageAlt: 'Mini-Pizzen als Apéro-Häppchen',
    near: ['reiden', 'zofingen', 'brittnau', 'pfaffnau'],
  },
  {
    slug: 'st-urban',
    name: 'St. Urban',
    canton: 'LU',
    area: 'Luzerner Hinterland',
    plz: '4915',
    km: 4,
    intro:
      'St. Urban ist unser direkter Nachbar. Kurze Wege heissen bei uns: warm geliefert, schön angerichtet und auf Wunsch auch kurzfristig möglich.',
    focus: ['Apéro & Empfang', 'Familienfeier', 'Kaffeepause mit Gebäck', 'Mezze-Buffet'],
    image: '/images/apero-tafel.webp',
    imageAlt: 'Apéro-Tafel mit hausgemachtem Fingerfood',
    near: ['pfaffnau', 'langenthal', 'murgenthal', 'reiden'],
  },
  {
    slug: 'dagmersellen',
    name: 'Dagmersellen',
    canton: 'LU',
    area: 'Wiggertal',
    plz: '6252',
    km: 12,
    intro:
      'In Dagmersellen arbeiten viele Betriebe direkt an der Autobahn, da zählt ein unkomplizierter Lunch. Wir liefern Business-Lunch, Lunch-Boxen und Apéros pünktlich zur Pause.',
    focus: ['Business-Lunch', 'Lunch-Boxen für Schulungen', 'Firmenapéro', 'Jubiläum'],
    image: '/images/lunch-box.webp',
    imageAlt: 'Lunch-Boxen für Firmen in Dagmersellen',
    near: ['reiden', 'willisau', 'sursee', 'pfaffnau'],
  },
  {
    slug: 'willisau',
    name: 'Willisau',
    canton: 'LU',
    area: 'Luzerner Hinterland',
    plz: '6130',
    km: 17,
    intro:
      'Für Feste im Städtli und Firmenanlässe rund um Willisau stellen wir Apéro-, Mezze- und Themenbuffets zusammen, hausgemacht im Luzerner Hinterland und frisch geliefert.',
    focus: ['Geburtstag & Familienfest', 'Firmenfeier', 'Themenbuffet', 'Apéro riche'],
    image: '/images/mezze-buffet.webp',
    imageAlt: 'Mezze-Buffet mit vielen kleinen Schalen',
    near: ['dagmersellen', 'sursee', 'pfaffnau', 'reiden'],
  },
  {
    slug: 'sursee',
    name: 'Sursee',
    canton: 'LU',
    area: 'Region Sursee',
    plz: '6210',
    km: 27,
    intro:
      'Sursee ist ein wichtiger Wirtschaftsstandort im Kanton Luzern. Für Firmen und Geschäfte in und um Sursee liefern wir Firmenlunch, Apéro riche und Buffets für Kundenanlässe.',
    focus: ['Firmenlunch', 'Apéro riche', 'Kundenevent', 'Geschäftseröffnung'],
    image: '/images/apero-gebaeck.webp',
    imageAlt: 'Apéro-Buffet mit Gebäck für einen Firmenanlass in Sursee',
    near: ['dagmersellen', 'willisau', 'luzern', 'reiden'],
    top: true,
  },
  {
    slug: 'luzern',
    name: 'Luzern',
    canton: 'LU',
    area: 'Stadt Luzern',
    plz: '6000',
    km: 48,
    intro:
      'Auch für Firmen und Feiern in der Stadt Luzern kochen wir gerne: hausgemachtes Fingerfood, Mezze und Lunch-Buffets aus dem Luzerner Hinterland. Lieferung nach Luzern auf Anfrage.',
    focus: ['Firmenapéro', 'Kundenanlass', 'Workshop-Lunch', 'Private Feier'],
    image: '/images/mezze-sarma.webp',
    imageAlt: 'Sarma, gefüllte Weinblätter mit Zitrone',
    near: ['sursee', 'willisau', 'dagmersellen'],
    top: true,
  },
  {
    slug: 'zofingen',
    name: 'Zofingen',
    canton: 'AG',
    area: 'Region Zofingen',
    plz: '4800',
    km: 11,
    intro:
      'Zofingen ist von Pfaffnau aus schnell erreicht. Für Büros, Praxen und Geschäfte in der Altstadt und im Industriegebiet liefern wir Apéro, Lunch-Boxen und Buffets, ebenso für private Feste.',
    focus: ['Büro-Apéro', 'Lunch-Boxen', 'Geschäftsanlass', 'Geburtstag'],
    image: '/images/lunch-set-2.webp',
    imageAlt: 'Lunch-Set mit Salat und Gebäck für ein Büro in Zofingen',
    near: ['brittnau', 'rothrist', 'aarburg', 'reiden'],
    top: true,
  },
  {
    slug: 'brittnau',
    name: 'Brittnau',
    canton: 'AG',
    area: 'Region Zofingen',
    plz: '4805',
    km: 6,
    intro:
      'Brittnau liegt gleich hinter der Kantonsgrenze. Für Dorffeste, Vereinsanlässe und Geburtstage bringen wir hausgemachte Buffets schnell und frisch vorbei.',
    focus: ['Vereinsfest', 'Geburtstag', 'Apéro', 'Süsses & Gebäck'],
    image: '/images/suess-torte.webp',
    imageAlt: 'Torte mit Erdbeeren für eine Feier in Brittnau',
    near: ['pfaffnau', 'zofingen', 'wikon', 'murgenthal'],
  },
  {
    slug: 'rothrist',
    name: 'Rothrist',
    canton: 'AG',
    area: 'Region Zofingen',
    plz: '4852',
    km: 14,
    intro:
      'In Rothrist sind viele Logistik- und Gewerbebetriebe zuhause. Für Teams, Schulungen und Firmenfeiern liefern wir Lunch-Buffets, Lunch-Boxen und Apéros, die satt und zufrieden machen.',
    focus: ['Teamlunch', 'Schulung & Workshop', 'Firmenfeier', 'Weihnachtsapéro'],
    image: '/images/lunch-box-2.webp',
    imageAlt: 'Lunch-Box für einen Teamlunch in Rothrist',
    near: ['zofingen', 'aarburg', 'murgenthal', 'olten'],
    top: true,
  },
  {
    slug: 'aarburg',
    name: 'Aarburg',
    canton: 'AG',
    area: 'Region Zofingen',
    plz: '4663',
    km: 15,
    intro:
      'Für Anlässe in Aarburg und Oftringen stellen wir Apéro-, Mezze- und Lunch-Buffets zusammen, ideal für Firmenapéros, Vereinsfeste und Geburtstage.',
    focus: ['Firmenapéro', 'Vereinsfest', 'Geburtstag', 'Mezze-Buffet'],
    image: '/images/mezze-grillgemuese.webp',
    imageAlt: 'Grillgemüse mit Peperoni und Aubergine',
    near: ['rothrist', 'zofingen', 'olten'],
  },
  {
    slug: 'murgenthal',
    name: 'Murgenthal',
    canton: 'AG',
    area: 'Region Zofingen',
    plz: '4853',
    km: 9,
    intro:
      'Murgenthal liegt zwischen Pfaffnau, Langenthal und Rothrist. Für Familienfeste, Vereinsanlässe und Firmen bringen wir Fingerfood und Buffets frisch zu Ihnen.',
    focus: ['Familienfest', 'Vereinsanlass', 'Firmenapéro', 'Themenbuffet'],
    image: '/images/themen-pizza.webp',
    imageAlt: 'Pizza-Buffet für eine Feier in Murgenthal',
    near: ['langenthal', 'rothrist', 'st-urban', 'brittnau'],
  },
  {
    slug: 'langenthal',
    name: 'Langenthal',
    canton: 'BE',
    area: 'Oberaargau',
    plz: '4900',
    km: 11,
    intro:
      'Langenthal ist das Zentrum des Oberaargaus und von Pfaffnau über St. Urban rasch erreicht. Wir liefern Firmenlunch, Apéros und Buffets für Unternehmen, Geschäfte und private Feste.',
    focus: ['Firmenlunch', 'Kundenapéro', 'Geschäftseröffnung', 'Geburtstag'],
    image: '/images/apero-pogaca.webp',
    imageAlt: 'Gefüllte Poğaça als Apéro-Gebäck für Langenthal',
    near: ['st-urban', 'murgenthal', 'pfaffnau', 'rothrist'],
    top: true,
  },
  {
    slug: 'olten',
    name: 'Olten',
    canton: 'SO',
    area: 'Region Olten',
    plz: '4600',
    km: 22,
    intro:
      'Olten ist Bahn- und Bürostandort mit vielen Firmen. Für Meetings, Workshops und Kundenanlässe in Olten liefern wir Business-Lunch, Lunch-Boxen und Apéro riche.',
    focus: ['Business-Lunch', 'Meeting & Workshop', 'Apéro riche', 'Firmenjubiläum'],
    image: '/images/gebaeck-simit-schale.webp',
    imageAlt: 'Simit und Gebäck für eine Kaffeepause in Olten',
    near: ['aarburg', 'rothrist', 'zofingen'],
    top: true,
  },
]

export const regionBySlug = (slug: string) => regions.find((r) => r.slug === slug)

/** Lesbare Distanz für die Anzeige */
export function distanceText(r: Region) {
  if (r.km === 0) return 'Unsere Küche ist hier'
  const min = Math.max(5, Math.round((r.km * 1.25) / 5) * 5)
  return `rund ${r.km} km, etwa ${min} Minuten ab Pfaffnau`
}

/** Öffnet die Anfrage mit vorausgefülltem Ort */
export const inquiryHrefFor = (r: Region, extra = '') => `/anfrage?ort=${encodeURIComponent(`${r.plz} ${r.name}`)}${extra}`

/** Open-Graph-Bild pro Ort (erzeugt mit scripts/og-bilder.mjs) */
export const regionOgImage = (r: Region) => `/og/catering-${r.slug}.jpg`
