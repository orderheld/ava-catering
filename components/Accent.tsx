import { accentParts } from '@/lib/utils'

/** Rendert Text mit *Akzent* als kursives, oranges <em>. */
export function Accent({ text }: { text: string }) {
  return (
    <>
      {accentParts(text).map((p, i) => (p.accent ? <em key={i}>{p.text}</em> : <span key={i}>{p.text}</span>))}
    </>
  )
}
