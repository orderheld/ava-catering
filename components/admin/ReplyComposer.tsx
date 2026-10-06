'use client'

import { useState } from 'react'
import { replyToInquiry } from '@/app/admin/actions'
import { ActionForm, SubmitButton } from './forms'

type Props = { id: number; firstName: string; eventLabel: string; status: string }

export function ReplyComposer({ id, firstName, eventLabel, status }: Props) {
  const sign = '\n\nHerzliche Grüsse\nDilsah Sever\nAVA Catering · 078 264 69 62'
  const templates = {
    Angebot: {
      subject: `Ihr Angebot von AVA Catering – ${eventLabel}`,
      body: `Liebe/r ${firstName}\n\nHerzlichen Dank für Ihre Anfrage. Sehr gerne mache ich Ihnen folgendes Angebot:\n\n– \n– \n– \n\nPreis: CHF … pro Person / total CHF …\n\nGerne passe ich das Angebot an Ihre Wünsche an. Ich freue mich auf Ihre Rückmeldung.${sign}`,
      setStatus: 'offeriert',
    },
    Rückfrage: {
      subject: `Kurze Rückfrage zu Ihrer Anfrage – ${eventLabel}`,
      body: `Liebe/r ${firstName}\n\nVielen Dank für Ihre Anfrage. Damit ich Ihnen ein passendes Angebot machen kann, habe ich noch eine kurze Frage:\n\n…${sign}`,
      setStatus: 'in_bearbeitung',
    },
    Bestätigung: {
      subject: `Bestätigung – ${eventLabel}`,
      body: `Liebe/r ${firstName}\n\nHiermit bestätige ich Ihnen gerne die Bestellung für Ihren Anlass. Ich freue mich darauf, für Sie und Ihre Gäste zu kochen!\n\nZusammenfassung:\n– \n\nBei Fragen bin ich jederzeit für Sie da.${sign}`,
      setStatus: 'bestaetigt',
    },
  } as const
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [setStatus, setSetStatus] = useState('')

  return (
    <ActionForm action={replyToInquiry} className="space-y-4">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="setStatus" value={setStatus} />
      <div className="flex flex-wrap gap-2">
        <span className="text-muted self-center text-sm">Vorlage:</span>
        {(Object.keys(templates) as (keyof typeof templates)[]).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => {
              setSubject(templates[k].subject)
              setBody(templates[k].body)
              setSetStatus(templates[k].setStatus)
            }}
            className="border-line hover:border-orange hover:text-orange rounded-full border px-3 py-1.5 text-sm"
          >
            {k}
          </button>
        ))}
      </div>
      <div>
        <label className="label" htmlFor="subject">Betreff</label>
        <input id="subject" name="subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="field" />
      </div>
      <div>
        <label className="label" htmlFor="body">Nachricht</label>
        <textarea id="body" name="body" rows={10} value={body} onChange={(e) => setBody(e.target.value)} className="field resize-y font-[inherit] leading-relaxed" />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {setStatus && setStatus !== status ? (
          <label className="text-muted flex items-center gap-2 text-sm">
            <input type="checkbox" checked onChange={() => setSetStatus('')} className="accent-orange" />
            Status danach auf «{setStatus === 'offeriert' ? 'Offeriert' : setStatus === 'bestaetigt' ? 'Bestätigt' : 'In Bearbeitung'}» setzen
          </label>
        ) : (
          <span />
        )}
        <SubmitButton pendingText="Wird gesendet …">E-Mail senden</SubmitButton>
      </div>
    </ActionForm>
  )
}
