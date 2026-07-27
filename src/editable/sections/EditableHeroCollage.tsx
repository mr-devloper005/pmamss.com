'use client'

import { useEffect, useState } from 'react'

/*
  Rotating cover strip for the masthead.

  Tiles the latest posts' artwork into a small row and crossfades each cell
  through the pool on a shared timer, so the hero shows live content without
  pulling attention off the headline. The server render is deterministic
  (tick = 0) → no hydration mismatch, and rotation is disabled for
  prefers-reduced-motion users.
*/
export function EditableHeroCollage({ images }: { images: string[] }) {
  const pool = images.length ? images : ['/placeholder.svg?height=900&width=1400']
  const cellCount = pool.length >= 4 ? 4 : pool.length >= 2 ? 2 : 1
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (pool.length <= 1) return
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => setTick((value) => value + 1), 4200)
    return () => clearInterval(id)
  }, [pool.length])

  return (
    <div
      className={`grid gap-3 ${cellCount >= 4 ? 'grid-cols-2 sm:grid-cols-4' : cellCount === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}
      aria-hidden="true"
    >
      {Array.from({ length: cellCount }).map((_, cell) => {
        const activeIndex = (cell + tick) % pool.length
        return (
          <div
            key={cell}
            className={`relative aspect-[4/3] overflow-hidden rounded-[1rem] border border-white/15 bg-white/[0.06] ${cell > 1 ? 'hidden sm:block' : ''}`}
          >
            {pool.map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1400ms] ease-in-out ${i === activeIndex ? 'opacity-100' : 'opacity-0'}`}
                loading={cell === 0 && i === 0 ? 'eager' : 'lazy'}
                {...(cell === 0 && i === 0 ? { fetchPriority: 'high' as const } : {})}
              />
            ))}
            <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(8,11,32,0.55))]" />
          </div>
        )
      })}
    </div>
  )
}
