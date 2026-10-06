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
    'Apéro, Mezze, Lunch und Themenbuffets – frisch zubereitet von Dilsah Sever. Für Geburtstage, Firmenanlässe und jedes Fest, das nach mehr schmecken soll.',
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
export const eventTypes = ['Geburtstag', 'Firmenanlass', 'Hochzeit & Verlobung', 'Familienfest', 'Vereinsanlass', 'Anderes']
export const dietaryOptions = ['Vegetarisch', 'Vegan', 'Halal', 'Glutenfrei', 'Laktosefrei']
export const serviceOptions = [
  { value: 'abholung', label: 'Abholung in Pfaffnau' },
  { value: 'lieferung', label: 'Lieferung' },
  { value: 'lieferung-aufbau', label: 'Lieferung & Aufbau' },
]
export const budgetOptions = ['bis CHF 20', 'CHF 20–35', 'CHF 35–50', 'über CHF 50', 'Noch offen']
