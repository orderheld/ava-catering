'use client'

import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, Close } from '@/components/Icons'

export function Lightbox({ images }: { images: { src: string; alt: string }[] }) {
  const [idx, setIdx] = useState<number | null>(null)
  const close = useCallback(() => setIdx(null), [])
  const go = useCallback((d: number) => setIdx((i) => (i === null ? i : (i + d + images.length) % images.length)), [images.length])

  useEffect(() => {
    if (idx === null) return
    const on = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', on)
    document.documentElement.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', on)
      document.documentElement.style.overflow = ''
    }
  }, [idx, close, go])

  return (
    <>
      <div className="columns-2 gap-4 md:columns-3 lg:columns-4 [&>*]:mb-4">
        {images.map((g, i) => (
          <button
            key={g.src + i}
            type="button"
            onClick={() => setIdx(i)}
            data-reveal
            style={{ '--d': `${(i % 4) * 70}ms` } as React.CSSProperties}
            className="group relative block w-full break-inside-avoid overflow-hidden rounded-[1.25rem]"
            aria-label={`Bild vergrössern: ${g.alt}`}
          >
            <Image
              src={g.src}
              alt={g.alt}
              width={600}
              height={i % 3 === 0 ? 800 : 600}
              sizes="(min-width:1024px) 25vw, (min-width:768px) 33vw, 50vw"
              className={`w-full object-cover transition duration-[1.2s] ease-(--ease-soft) group-hover:scale-105 ${i % 3 === 0 ? 'aspect-[3/4]' : 'aspect-square'}`}
            />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-left text-sm text-white opacity-0 transition group-hover:opacity-100">
              {g.alt}
            </span>
          </button>
        ))}
      </div>

      {idx !== null && (
        <div role="dialog" aria-modal="true" aria-label={images[idx].alt} className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4" onClick={close}>
          <div className="relative h-[82vh] w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <Image src={images[idx].src} alt={images[idx].alt} fill sizes="100vw" className="object-contain" />
          </div>
          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-sm text-white/80">{images[idx].alt}</p>
          <button type="button" onClick={close} className="absolute top-5 right-5 grid size-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Schliessen">
            <Close className="size-6" />
          </button>
          <button type="button" onClick={(e) => (e.stopPropagation(), go(-1))} className="absolute left-4 grid size-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Vorheriges Bild">
            <ArrowLeft className="size-5" />
          </button>
          <button type="button" onClick={(e) => (e.stopPropagation(), go(1))} className="absolute right-4 grid size-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Nächstes Bild">
            <ArrowRight className="size-5" />
          </button>
        </div>
      )}
    </>
  )
}
