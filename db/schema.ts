import { boolean, date, integer, jsonb, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { pushCategories, type PushCategory } from '../lib/push-shared'

export const inquiryStatuses = ['neu', 'in_bearbeitung', 'offeriert', 'bestaetigt', 'erledigt', 'abgesagt'] as const
export type InquiryStatus = (typeof inquiryStatuses)[number]

export const inquiries = pgTable('inquiries', {
  id: serial('id').primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  kind: varchar('kind', { length: 20 }).default('anfrage').notNull(), // anfrage | kontakt
  status: varchar('status', { length: 20 }).$type<InquiryStatus>().default('neu').notNull(),
  eventType: text('event_type'),
  offerings: jsonb('offerings').$type<string[]>().default([]).notNull(),
  themes: jsonb('themes').$type<string[]>().default([]).notNull(),
  dietary: jsonb('dietary').$type<string[]>().default([]).notNull(),
  eventDate: date('event_date'),
  eventTime: text('event_time'),
  guests: integer('guests'),
  location: text('location'),
  service: text('service'),
  budget: text('budget'),
  name: text('name').notNull(),
  company: text('company'),
  email: text('email').notNull(),
  phone: text('phone'),
  message: text('message'),
  internalNotes: text('internal_notes'),
  offerAmount: text('offer_amount'),
  ipHash: varchar('ip_hash', { length: 64 }),
})

export const inquiryLog = pgTable('inquiry_log', {
  id: serial('id').primaryKey(),
  inquiryId: integer('inquiry_id')
    .references(() => inquiries.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  type: varchar('type', { length: 20 }).notNull(), // mail | status | note
  subject: text('subject'),
  body: text('body'),
})

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 60 }).unique().notNull(),
  title: text('title').notNull(),
  subtitle: text('subtitle'),
  description: text('description'),
  image: text('image'),
  sort: integer('sort').default(0).notNull(),
  visible: boolean('visible').default(true).notNull(),
})

export const menuItems = pgTable('menu_items', {
  id: serial('id').primaryKey(),
  categoryId: integer('category_id')
    .references(() => categories.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  description: text('description'),
  tags: jsonb('tags').$type<string[]>().default([]).notNull(),
  sort: integer('sort').default(0).notNull(),
  visible: boolean('visible').default(true).notNull(),
})

export const themes = pgTable('themes', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  image: text('image'),
  sort: integer('sort').default(0).notNull(),
  visible: boolean('visible').default(true).notNull(),
})

export const gallery = pgTable('gallery', {
  id: serial('id').primaryKey(),
  src: text('src').notNull(),
  alt: text('alt').default('').notNull(),
  sort: integer('sort').default(0).notNull(),
  visible: boolean('visible').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const settings = pgTable('settings', {
  key: varchar('key', { length: 60 }).primaryKey(),
  value: jsonb('value').notNull(),
})

export const blockedDates = pgTable('blocked_dates', {
  day: date('day').primaryKey(),
  note: text('note'),
})

// Push-Benachrichtigungen fürs Admin-Panel: ein Eintrag pro Gerät/Browser.
// Wird bei Bedarf automatisch angelegt (lib/push.ts), `npm run db:push` ist nicht nötig.
export const pushSubscriptions = pgTable('push_subscriptions', {
  id: serial('id').primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  endpoint: text('endpoint').unique().notNull(),
  p256dh: text('p256dh').notNull(),
  auth: text('auth').notNull(),
  device: text('device'),
  categories: jsonb('categories').$type<PushCategory[]>().default([...pushCategories]).notNull(),
})
