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

    // Default smoothed scrolling — kept exactly as-is for pages 03 (workflow) & 04 (ledger)
    const smoothOptions = {
      lerp: 0.085,
      duration: 1.1,
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.05,
      touchMultiplier: 2,
    }

    // Pages 01 hero & 02 architecture scroll with zero modifications.
    // smoothWheel:false makes Lenis stop animating and release the wheel event,
    // so the BROWSER scrolls natively at exact 1:1 speed — no easing, no lag.
    const nativeOptions = {
      smoothWheel: false,
    }

    let workflowCard: HTMLElement | null = null
    let isNativeMode: boolean | null = null

    const getWorkflowCard = () => {
      if (workflowCard) return workflowCard
      workflowCard =
        containerRef.current?.querySelector<HTMLElement>('.deck-card-workflow') ?? null
      return workflowCard
    }

    // Pages 01 & 02 scroll natively; smoothing turns on the moment the workflow
    // card docks at the top of the viewport and takes over.
    const applyScrollMode = () => {
      const lenis = locomotiveScroll ? locomotiveScroll.lenisInstance : null
      if (!lenis) return
      const workflow = getWorkflowCard()
      if (!workflow) return

      const scrollY = window.scrollY || document.documentElement.scrollTop
      // Scroll offset at which the workflow card's top reaches the viewport top.
      const dockScroll = workflow.getBoundingClientRect().top + scrollY
      const shouldUseNative = scrollY < dockScroll
      if (shouldUseNative === isNativeMode) return
      isNativeMode = shouldUseNative

      Object.assign(lenis.options, shouldUseNative ? nativeOptions : smoothOptions)
      // Discard any pending eased catch-up so entering the native zone can't snap.
      if (shouldUseNative) lenis.reset()
    }

    const updateCardDepth = () => {
      if (!containerRef.current) return
      const cards = containerRef.current.querySelectorAll<HTMLElement>('.deck-card')
      const windowH = window.innerHeight

      cards.forEach((card, index) => {
        const surface = card.querySelector<HTMLElement>('.deck-card-surface') || card

        // Page 01 (hero) scrolls in normal flow and is never stacked under,
        // so it must never be scaled, dimmed or rounded.
        // Page 02 stays sticky so page 03 can slide over it (deck effect).
        if (card.classList.contains('deck-card-1')) {
          surface.style.transform = ''
          surface.style.filter = ''
          surface.style.opacity = ''
          surface.style.borderRadius = ''
          return
        }

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

            surface.style.transform = `scale(${scale})`
            surface.style.filter = `brightness(${brightness})`
            surface.style.opacity = `${opacity}`
            surface.style.borderRadius = `${radius}px`
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

                surface.style.transform = `scale(${deepScale})`
                surface.style.filter = `brightness(${deepBrightness})`
                surface.style.opacity = `${deepOpacity}`
                surface.style.borderRadius = '24px'
                return
              } else if (afterNextRect.top < 0) {
                surface.style.transform = 'scale(0.91)'
                surface.style.filter = 'brightness(0.60)'
                surface.style.opacity = '0.60'
                surface.style.borderRadius = '24px'
                return
              }
            }

            surface.style.transform = 'scale(0.95)'
            surface.style.filter = 'brightness(0.75)'
            surface.style.opacity = '0.75'
            surface.style.borderRadius = '24px'
          } else {
            // Next card has not entered view yet
            surface.style.transform = 'scale(1)'
            surface.style.filter = 'brightness(1)'
            surface.style.opacity = '1'
            surface.style.borderRadius = '0px'
          }
        }
      })
    }

    const onScrollTick = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          applyScrollMode()
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

        // Sync the scroll mode with the restored position (e.g. after reload).
        applyScrollMode()
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
