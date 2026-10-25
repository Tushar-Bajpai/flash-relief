'use client'

import { useEffect, useRef } from 'react'

interface StackingDeckProps {
  children: React.ReactNode
}

export function StackingDeck({ children }: StackingDeckProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let locomotiveScroll: any
    let ticking = false

    const updateCardDepth = () => {
      if (!containerRef.current) return
      const cards = containerRef.current.querySelectorAll<HTMLElement>('.deck-card')
      const windowH = window.innerHeight

      cards.forEach((card, index) => {
        // Cards that have a next card sliding over them
        if (index < cards.length - 1) {
          const nextCard = cards[index + 1]
          if (!nextCard) return
          const nextRect = nextCard.getBoundingClientRect()

          // When nextCard's top is moving between windowH and 0 (sliding up over this card)
          if (nextRect.top <= windowH && nextRect.top >= 0) {
            const progress = 1 - nextRect.top / windowH // 0 (bottom) -> 1 (docked at top)
            const scale = 1 - progress * 0.05 // 1 -> 0.95
            const brightness = 1 - progress * 0.25 // 1 -> 0.75
            const opacity = 1 - progress * 0.25 // 1 -> 0.75
            const radius = progress * 24 // 0px -> 24px

            card.style.transform = `scale(${scale})`
            card.style.filter = `brightness(${brightness})`
            card.style.opacity = `${opacity}`
            card.style.borderRadius = `${radius}px`
          } else if (nextRect.top < 0) {
            // Next card has completely covered this card
            // Check if there's a card after next (index + 2) that pushes this card even deeper
            const cardAfterNext = cards[index + 2]
            if (cardAfterNext) {
              const afterNextRect = cardAfterNext.getBoundingClientRect()
              if (afterNextRect.top <= windowH && afterNextRect.top >= 0) {
                const subProgress = 1 - afterNextRect.top / windowH
                const deepScale = 0.95 - subProgress * 0.04 // 0.95 -> 0.91
                const deepBrightness = 0.75 - subProgress * 0.15 // 0.75 -> 0.60
                const deepOpacity = 0.75 - subProgress * 0.15 // 0.75 -> 0.60

                card.style.transform = `scale(${deepScale})`
                card.style.filter = `brightness(${deepBrightness})`
                card.style.opacity = `${deepOpacity}`
                card.style.borderRadius = '24px'
                return
              } else if (afterNextRect.top < 0) {
                card.style.transform = 'scale(0.91)'
                card.style.filter = 'brightness(0.60)'
                card.style.opacity = '0.60'
                card.style.borderRadius = '24px'
                return
              }
            }

            card.style.transform = 'scale(0.95)'
            card.style.filter = 'brightness(0.75)'
            card.style.opacity = '0.75'
            card.style.borderRadius = '24px'
          } else {
            // Next card has not entered view yet
            card.style.transform = 'scale(1)'
            card.style.filter = 'brightness(1)'
            card.style.opacity = '1'
            card.style.borderRadius = '0px'
          }
        }
      })
    }

    const onScrollTick = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateCardDepth()
          ticking = false
        })
        ticking = true
      }
    }

    const initLocomotive = async () => {
      try {
        const LocomotiveScrollModule = await import('locomotive-scroll')
        const LocomotiveScroll = LocomotiveScrollModule.default
        locomotiveScroll = new LocomotiveScroll({
          lenisOptions: {
            wrapper: window,
            content: document.documentElement,
            lerp: 0.085,
            duration: 1.1,
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1.05,
            touchMultiplier: 2,
          },
          scrollCallback: () => {
            onScrollTick()
          },
        })
      } catch (err) {
        console.error('LocomotiveScroll initialization error:', err)
      }
    }

    initLocomotive()

    window.addEventListener('scroll', onScrollTick, { passive: true })
    window.addEventListener('resize', onScrollTick, { passive: true })
    updateCardDepth()

    return () => {
      window.removeEventListener('scroll', onScrollTick)
      window.removeEventListener('resize', onScrollTick)
      if (locomotiveScroll) {
        locomotiveScroll.destroy()
      }
    }
  }, [])

  return (
    <div ref={containerRef} className="deck-container" data-scroll-container>
      {children}
    </div>
  )
}
