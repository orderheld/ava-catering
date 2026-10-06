'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

/** Beobachtet alle [data-reveal]- und .thread-Elemente und blendet sie beim Scrollen ein. */
export function RevealObserver() {
  const pathname = usePathname()
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in')
            io.unobserve(e.target)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    )
    const scan = () => {
      document.querySelectorAll<SVGPathElement>('.thread path').forEach((p) => {
        if (!p.style.getPropertyValue('--len')) p.style.setProperty('--len', String(Math.ceil(p.getTotalLength())))
      })
      document.querySelectorAll('[data-reveal]:not(.is-in), .thread:not(.is-in)').forEach((el) => io.observe(el))
    }
    scan()
    const mo = new MutationObserver(scan)
    mo.observe(document.body, { childList: true, subtree: true })
    return () => {
      io.disconnect()
      mo.disconnect()
    }
  }, [pathname])
  return null
}
