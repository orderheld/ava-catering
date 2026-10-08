// Standardinhalte. Sie werden angezeigt, solange in der Datenbank (noch) nichts hinterlegt ist,
// und dienen `npm run db:seed` als Startdaten. Alles ist danach im Admin-Panel bearbeitbar.

export type SiteSettings = {
  phone: string
  email: string
  whatsapp: string
  street: string
  zip: string
  city: string
  serviceArea: string
  heroEyebrow: string
  heroTitle: string
  heroText: string
  aboutTitle: string
  aboutText: string
  announcement: string
  leadTime: string
  instagram: string
}

export const defaultSettings: SiteSettings = {
  phone: '+41 78 264 69 62',
  email: 'kontakt@avacatering.ch',
  whatsapp: '41782646962',
  street: 'Stegmatt 9a',
  zip: '6264',
  city: 'Pfaffnau',
  serviceArea: 'Pfaffnau und Umgebung – Luzerner Hinterland, Aargau & Solothurn auf Anfrage',
  heroEyebrow: 'Catering aus Pfaffnau',
  heroTitle: 'Hausgemacht. Für Ihre *Momente.*',
  heroText:
    'Apéro, Mezze, Lunch und Themenbuffets – frisch zubereitet von Dilsah Sever. Für Firmen, Teams und private Feiern, die nach mehr schmecken sollen.',
  aboutTitle: 'Kochen, wie man es für die *eigene Familie* tut.',
  aboutText:
    'Hinter AVA Catering steht Dilsah Sever. Was in ihrer Küche in Pfaffnau entsteht, ist ehrliches Handwerk: Teig, der von Hand geknetet wird, Weinblätter, die einzeln gerollt werden, und Rezepte, die mediterrane und türkische Tradition mit der Freude am Gastgeben verbinden.\n\nOb kleines Apéro im Büro oder grosses Familienfest – jedes Buffet wird für Ihren Anlass zusammengestellt, liebevoll angerichtet und mit derselben Sorgfalt zubereitet, als wären es die eigenen Gäste.',
  announcement: '',
  leadTime: 'Am besten fragen Sie mindestens 7 Tage vor Ihrem Anlass an – kurzfristige Anfragen prüfen wir gerne.',
  instagram: '',
}

export type Category = {
  id?: number
  slug: string
  title: string
  subtitle: string
  description: string
  image: string
  sort: number
  visible: boolean
  items: { id?: number; name: string; description?: string | null; tags: string[]; sort: number; visible: boolean }[]
}

const items = (names: string[]) => names.map((name, i) => ({ name, description: null, tags: [] as string[], sort: i, visible: true }))

export const defaultCategories: Category[] = [
  {
    slug: 'apero',
    title: 'Apéro-Buffet',
    subtitle: 'Fingerfood & Häppchen',
    description:
      'Hausgemachte Häppchen, Gebäck und kleine Spezialitäten für Empfänge, Geburtstage und Firmenanlässe – zum Anstossen, Plaudern und Zugreifen.',
    image: '/images/apero-gebaeck.webp',
    sort: 0,
    visible: true,
    items: items([
      'Börek und Teigtaschen',
      'Poğaça und herzhaftes Gebäck',
      'Wraps und Sandwiches',
      'Gefüllte Weinblätter',
      'Caprese-Spiesschen',
      'Dips und kleine Mezze',
      'Süsse und salzige Häppchen',
    ]),
  },
  {
    slug: 'mezze',
    title: 'Mezze-Buffet',
    subtitle: 'Mediterrane Vielfalt',
    description:
      'Warme und kalte Spezialitäten zum gemeinsamen Geniessen. Viele kleine Schalen, viel Farbe und genau die Art Essen, bei der man ins Gespräch kommt.',
    image: '/images/mezze-hummus.webp',
    sort: 1,
    visible: true,
    items: items([
      'Hummus und verschiedene Dips',
      'Sarma – gefüllte Weinblätter',
      'Kısır – würziger Bulgursalat',
      'İçli Köfte',
      'Grillgemüse',
      'Saisonale Salate',
      'Brot und Gebäck',
    ]),
  },
  {
    slug: 'lunch',
    title: 'Lunch-Buffet',
    subtitle: 'Für Team & Meeting',
    description:
      'Ausgewogenes Mittagessen für Firmen, Workshops und Seminare – als Buffet oder in praktischen Lunch-Boxen, pünktlich bereit, wenn die Pause beginnt.',
    image: '/images/lunch-set.webp',
    sort: 2,
    visible: true,
    items: items([
      'Lunch-Boxen mit Sarma, Börek & Gebäck',
      'Hummus, Dips und Gemüse',
      'Frische Salate',
      'Herzhaftes Gebäck',
      'Süsser Abschluss auf Wunsch',
    ]),
  },
  {
    slug: 'themen-party',
    title: 'Themen-Party-Service',
    subtitle: 'Buffets mit Motto',
    description:
      'Individuelle Buffets passend zum Anlass und zum gewünschten Thema – vom Kindergeburtstag mit Pizza bis zum mediterranen Sommerfest.',
    image: '/images/themen-burger.webp',
    sort: 3,
    visible: true,
    items: items([
      'Chicken-Burger-Buffet',
      'Pizza-Buffet',
      'Pasta-Buffet',
      'Mediterranes Buffet',
      'Familienbuffet',
      'Individuelles Wunschmenü',
    ]),
  },
  {
    slug: 'suesses',
    title: 'Süsses & Gebäck',
    subtitle: 'Der süsse Abschluss',
    description:
      'Süsse Ergänzungen für Feiern, Apéros und besondere Anlässe – vom Blech, aus der Form und mit viel Liebe zum Detail.',
    image: '/images/suess-baklava.webp',
    sort: 4,
    visible: true,
    items: items([
      'Kuchen und Muffins',
      'Kekse',
      'Baklava',
      'Dessertgläser',
      'Pralinen und Kokoskugeln',
      'Individuelles Dessertbuffet',
    ]),
  },
]

export type Theme = { id?: number; title: string; description: string; image: string; sort: number; visible: boolean }

export const defaultThemes: Theme[] = [
  {
    title: 'Chicken Burger',
    description: 'Saftige Chicken-Burger mit Ofenkartoffeln – der Liebling an jeder Party.',
    image: '/images/themen-burger-2.webp',
    sort: 0,
    visible: true,
  },
  {
    title: 'Pizza',
    description: 'Hausgemachter Teig, frisch belegt – als grosse Pizza oder Mini-Pizzen zum Teilen.',
    image: '/images/themen-pizza.webp',
    sort: 1,
    visible: true,
  },
  {
    title: 'Pasta',
    description: 'Pasta-Buffet mit verschiedenen Saucen – unkompliziert, warm und für alle Generationen.',
    image: '',
    sort: 2,
    visible: true,
  },
  {
    title: 'Mediterrane Spezialitäten',
    description: 'Mezze, Börek, Sarma und Grillgemüse – das Beste aus der mediterranen Küche.',
    image: '/images/mezze-buffet.webp',
    sort: 3,
    visible: true,
  },
]

export type GalleryImage = { id?: number; src: string; alt: string; sort: number; visible: boolean }

export const defaultGallery: GalleryImage[] = [
  ['/images/tafel-gross.webp', 'Reich gedeckte Buffet-Tafel mit Gebäck und Süssem'],
  ['/images/mezze-sarma.webp', 'Sarma – gefüllte Weinblätter mit Zitrone'],
  ['/images/gebaeck-simit.webp', 'Frische Simit mit Sesam'],
  ['/images/mezze-grillgemuese.webp', 'Grillgemüse mit Peperoni und Aubergine'],
  ['/images/suess-kekse.webp', 'Hausgemachte Kekse in verschiedenen Sorten'],
  ['/images/themen-pide.webp', 'Pide mit Hackfleischfüllung'],
  ['/images/mezze-kisir.webp', 'Kısır in Portionenschalen'],
  ['/images/gebaeck-boerek.webp', 'Börek-Rollen aus dem Ofen'],
  ['/images/apero-minipizza.webp', 'Mini-Pizzen für den Apéro'],
  ['/images/suess-torte.webp', 'Torte mit Erdbeeren und Karamell'],
  ['/images/lunch-box.webp', 'Lunch-Boxen mit Sarma und Gebäck'],
  ['/images/gebaeck-zopf.webp', 'Geflochtenes Hefegebäck'],
  ['/images/mezze-icli-koefte.webp', 'İçli Köfte'],
  ['/images/suess-cupcakes.webp', 'Muffins mit Schneeflocken-Dekor'],
  ['/images/apero-pogaca.webp', 'Gefüllte Poğaça mit Käse und Kräutern'],
  ['/images/gebaeck-fladenbrot.webp', 'Ofenfrisches Fladenbrot'],
].map(([src, alt], i) => ({ src, alt, sort: i, visible: true }))

// Auswahl-Optionen für den Anfrage-Assistenten
export const eventTypes = [
  'Firmenapéro & Empfang',
  'Teamlunch & Meeting',
  'Firmenfeier & Jubiläum',
  'Geburtstag',
  'Familienfest',
  'Vereinsanlass',
  'Anderes',
]
export const dietaryOptions = ['Vegetarisch', 'Vegan', 'Halal', 'Glutenfrei', 'Laktosefrei']
export const serviceOptions = [
  { value: 'abholung', label: 'Abholung in Pfaffnau' },
  { value: 'lieferung', label: 'Lieferung' },
  { value: 'lieferung-aufbau', label: 'Lieferung & Aufbau' },
]
export const budgetOptions = ['bis CHF 20', 'CHF 20–35', 'CHF 35–50', 'über CHF 50', 'Noch offen']

/** Zusätzliche Bilder pro Kapitel (Übersicht & Detailseite). */
export const categoryImages: Record<string, string[]> = {
  apero: ['/images/apero-minipizza.webp', '/images/apero-pogaca.webp', '/images/apero-tafel.webp', '/images/gebaeck-boerek.webp'],
  mezze: ['/images/mezze-sarma.webp', '/images/mezze-grillgemuese.webp', '/images/mezze-hummus.webp', '/images/mezze-kisir.webp'],
  lunch: ['/images/lunch-box.webp', '/images/lunch-set-2.webp', '/images/lunch-box-2.webp', '/images/lunch-set.webp'],
  'themen-party': ['/images/themen-pizza.webp', '/images/themen-pide.webp', '/images/themen-burger.webp', '/images/themen-burger-2.webp'],
  suesses: ['/images/suess-kekse.webp', '/images/suess-torte.webp', '/images/suess-baklava.webp', '/images/suess-cupcakes.webp'],
}

/** Zusatztexte für die Detailseiten /angebot/[slug] (SEO & Beratung). */
export const categoryDetails: Record<string, { intro: string; idealFor: string[]; seo: string }> = {
  apero: {
    intro:
      'Ein Apéro lebt von Vielfalt in kleinen Bissen. Dilsah stellt Ihnen eine Auswahl aus warmem und kaltem Fingerfood zusammen – handlich, schön angerichtet und so geplant, dass es vom ersten Glas bis zum Schluss reicht.',
    idealFor: ['Firmenapéro & Kundenanlass', 'Eröffnung & Vernissage', 'Geburtstag & Jubiläum', 'Feierabend im Team'],
    seo: 'Apéro-Buffet & Fingerfood aus Pfaffnau: Börek, Poğaça, Wraps, gefüllte Weinblätter und Dips – hausgemacht für Firmen und Private.',
  },
  mezze: {
    intro:
      'Mezze sind das Herz der mediterranen Küche: viele kleine Schalen, die man teilt. Hummus, Sarma, Kısır und Grillgemüse – farbig, frisch und von Natur aus mit vielen vegetarischen Optionen.',
    idealFor: ['Firmenessen mit Abwechslung', 'Familienfest', 'Sommerfest & Grillabend', 'Vegetarische Gäste'],
    seo: 'Mezze-Buffet mit Hummus, Sarma, Kısır, İçli Köfte und Grillgemüse – mediterranes Catering von AVA Catering aus Pfaffnau.',
  },
  lunch: {
    intro:
      'Ein gutes Mittagessen hält Teams bei Laune. Ob Buffet im Sitzungszimmer oder einzeln verpackte Lunch-Boxen für Workshops – frisch, ausgewogen und pünktlich bereit.',
    idealFor: ['Meetings & Workshops', 'Seminare & Schulungen', 'Teamlunch', 'Messe & Events'],
    seo: 'Lunch-Catering & Lunch-Boxen für Firmen in der Region Luzern/Aargau – frisch zubereitet von AVA Catering in Pfaffnau.',
  },
  'themen-party': {
    intro:
      'Ein Thema macht jede Feier einfacher: Alle wissen, was sie erwartet, und jeder findet etwas. Chicken Burger, Pizza, Pasta oder mediterrane Spezialitäten – passend für Gross und Klein.',
    idealFor: ['Geburtstag & Kindergeburtstag', 'Teamevent', 'Vereinsanlass', 'Familienfest'],
    seo: 'Themen-Party-Service: Chicken-Burger-, Pizza-, Pasta- und mediterrane Buffets für Geburtstage, Teamevents und Vereine.',
  },
  suesses: {
    intro:
      'Der süsse Abschluss bleibt in Erinnerung. Kuchen, Kekse, Baklava und Dessertgläser – als Ergänzung zu jedem Buffet oder als eigenes Dessertbuffet.',
    idealFor: ['Kaffee & Kuchen im Büro', 'Geburtstag', 'Apéro-Ergänzung', 'Dessertbuffet'],
    seo: 'Süsses & Gebäck: Kuchen, Muffins, Kekse, Baklava und Dessertbuffets – hausgemacht von AVA Catering aus Pfaffnau.',
  },
}

export const occasions = [
  'Firmenapéro',
  'Teamlunch',
  'Geburtstag',
  'Firmenjubiläum',
  'Meeting & Workshop',
  'Familienfest',
  'Vereinsanlass',
  'Kindergeburtstag',
  'Taufe',
  'Weihnachtsapéro',
]
