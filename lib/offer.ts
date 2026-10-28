// Offerten: Typen und Berechnungen – gemeinsam für Server und Browser (ohne Datenbank-Abhängigkeiten)

export const offerStatuses = ['entwurf', 'gesendet', 'angenommen', 'abgelehnt'] as const
export type OfferStatus = (typeof offerStatuses)[number]

export const offerStatusMeta: Record<OfferStatus, { label: string; cls: string }> = {
  entwurf: { label: 'Entwurf', cls: 'bg-stone-200 text-stone-700' },
  gesendet: { label: 'Gesendet', cls: 'bg-sky-100 text-sky-800' },
  angenommen: { label: 'Angenommen', cls: 'bg-olive text-white' },
  abgelehnt: { label: 'Abgelehnt', cls: 'bg-stone-200 text-stone-500' },
}

export const offerUnits = {
  person: 'pro Person',
  stueck: 'pro Stück',
  stunde: 'pro Stunde',
  pauschal: 'pauschal',
} as const
export type OfferUnit = keyof typeof offerUnits

export type OfferPosition = { text: string; detail?: string; qty: number; unit: OfferUnit; price: number }

/** Betrag einer Position in CHF (pauschal = Preis, sonst Menge × Preis). */
export const lineTotal = (p: OfferPosition) => (p.unit === 'pauschal' ? p.price : p.qty * p.price)

export const offerTotal = (positions: OfferPosition[]) => Math.round(positions.reduce((s, p) => s + lineTotal(p), 0) * 100) / 100

const chf = new Intl.NumberFormat('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
export const formatChf = (n: number) => `CHF ${chf.format(n)}`
export const formatAmount = (n: number) => chf.format(n)

/** Liest «12.50», «12,50» oder «1'250» als Zahl. */
export const parseAmount = (v: unknown) => {
  const n = Number(String(v ?? '').replace(/['’\s]/g, '').replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

/** Offertnummer, z.B. 2026-007 */
export const offerNumber = (o: { id: number; createdAt: Date | string }) => `${new Date(o.createdAt).getFullYear()}-${String(o.id).padStart(3, '0')}`

export const qtyLabel = (p: OfferPosition) =>
  p.unit === 'pauschal' ? 'pauschal' : `${p.qty} × ${formatAmount(p.price)} ${offerUnits[p.unit].replace('pro ', '/ ')}`
