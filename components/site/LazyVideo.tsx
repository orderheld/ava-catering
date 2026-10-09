'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Hintergrund-Video, das erst geladen wird, wenn es in die Nähe des sichtbaren Bereichs kommt.
 * Poster und Video werden erst kurz vor dem Sichtbarwerden geladen (spart ~1 MB beim ersten Laden).
 */
export function LazyVideo({ src, poster, label, className }: { src: string; poster: string; label: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setActive(true)
          io.disconnect()
        }
      },
      { rootMargin: '400px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!active || !el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    el.play().catch(() => {})
  }, [active])

  return (
    <video
      ref={ref}
      className={className}
      src={active ? src : undefined}
      poster={active ? poster : undefined}
      muted
      loop
      playsInline
      preload="none"
      aria-label={label}
    />
  )
}
