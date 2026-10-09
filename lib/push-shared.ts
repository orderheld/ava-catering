// Gemeinsam für Server und Browser (ohne Datenbank-Abhängigkeiten)
export const pushCategories = ['anfragen', 'nachrichten', 'erinnerungen'] as const
export type PushCategory = (typeof pushCategories)[number]

export const pushCategoryLabels: Record<PushCategory, { label: string; hint: string }> = {
  anfragen: { label: 'Neue Anfragen', hint: 'Sobald jemand den Anfrage-Assistenten absendet.' },
  nachrichten: { label: 'Nachrichten', hint: 'Kontaktformular auf der Website.' },
  erinnerungen: { label: 'Tägliche Erinnerung', hint: 'Jeden Morgen: Anlässe heute und morgen, unbeantwortete Anfragen und Offerten ohne Rückmeldung.' },
}
