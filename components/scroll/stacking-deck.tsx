'use client'

import { useEffect, useRef } from 'react'

interface StackingDeckProps {
  children: React.ReactNode
}

// Ledger handoff palette — page 03's pinned slide washes from --paper to --ink
// so the sticky-deck handoff into the bright closing page has no colour break.
const PAPER_RGB = { r: 7, g: 23, b: 29 } // #07171d (--paper)
const INK_RGB = { r: 234, g: 245, b: 244 } // #eaf5f4 (--ink)

function mixToInk(t: number) {
  const clamped = Math.min(1, Math.max(0, t))
  const r = Math.round(PAPER_RGB.r + (INK_RGB.r - PAPER_RGB.r) * clamped)
  const g = Math.round(PAPER_RGB.g + (INK_RGB.g - PAPER_RGB.g) * clamped)
  const b = Math.round(PAPER_RGB.b + (INK_RGB.b - PAPER_RGB.b) * clamped)
  return `rgb(${r}, ${g}, ${b})`
}

// Marquee-card theme pair: each value morphs from the dark stage theme to the
// ledger's ink theme so the inner cards dissolve with the page background.
type ThemeColor = [number, number, number, number]

const THEME_PANEL_DARK: ThemeColor = [11, 34, 41, 0.85]
const THEME_PANEL_BRIGHT: ThemeColor = [234, 245, 244, 1]
const THEME_CHIP_DARK: ThemeColor = [7, 23, 29, 0.65]
const THEME_CHIP_BRIGHT: ThemeColor = [7, 23, 29, 0.1]
const THEME_GLASS_DARK: ThemeColor = [234, 245, 244, 0.08]
const THEME_GLASS_BRIGHT: ThemeColor = [7, 23, 29, 0.1]
const THEME_BORDER_DARK: ThemeColor = [234, 245, 244, 0.22]
const THEME_BORDER_BRIGHT: ThemeColor = [7, 23, 29, 0.22]
const THEME_STRONG_DARK: ThemeColor = [234, 245, 244, 1]
const THEME_STRONG_BRIGHT: ThemeColor = [7, 23, 29, 1]
const THEME_SOFT_DARK: ThemeColor = [234, 245, 244, 0.78]
const THEME_SOFT_BRIGHT: ThemeColor = [7, 23, 29, 0.78]
const THEME_FAINT_DARK: ThemeColor = [234, 245, 244, 0.55]
const THEME_FAINT_BRIGHT: ThemeColor = [7, 23, 29, 0.55]

function mixTheme(dark: ThemeColor, bright: ThemeColor, t: number) {
  const clamped = Math.min(1, Math.max(0, t))
  const r = Math.round(dark[0] + (bright[0] - dark[0]) * clamped)
  const g = Math.round(dark[1] + (bright[1] - dark[1]) * clamped)
  const b = Math.round(dark[2] + (bright[2] - dark[2]) * clamped)
  const a = dark[3] + (bright[3] - dark[3]) * clamped
  return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`
}

// Publishes the marquee-card theme variables (set on the page-03 window,
// inherited by every stage card, pill and label inside it).
function applyMarqueeTheme(surface: HTMLElement, wash: number) {
  surface.style.setProperty('--mp-wash', wash.toFixed(3))
  surface.style.setProperty('--mp-panel', mixTheme(THEME_PANEL_DARK, THEME_PANEL_BRIGHT, wash))
  surface.style.setProperty('--mp-chip', mixTheme(THEME_CHIP_DARK, THEME_CHIP_BRIGHT, wash))
  surface.style.setProperty('--mp-glass', mixTheme(THEME_GLASS_DARK, THEME_GLASS_BRIGHT, wash))
  surface.style.setProperty('--mp-border', mixTheme(THEME_BORDER_DARK, THEME_BORDER_BRIGHT, wash))
  surface.style.setProperty('--mp-strong', mixTheme(THEME_STRONG_DARK, THEME_STRONG_BRIGHT, wash))
  surface.style.setProperty('--mp-soft', mixTheme(THEME_SOFT_DARK, THEME_SOFT_BRIGHT, wash))
  surface.style.setProperty('--mp-faint', mixTheme(THEME_FAINT_DARK, THEME_FAINT_BRIGHT, wash))
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
          surface.style.backgroundColor = ''
          card.style.backgroundColor = ''
          return
        }

        // Cards that have a next card sliding over them
        if (index < cards.length - 1) {
          const nextCard = cards[index + 1]
          if (!nextCard) return
          const nextRect = nextCard.getBoundingClientRect()

          // True when the next page is the bright ledger: this pinned page then
          // dissolves from dark paper to the ledger's ink instead of dimming.
          const leadsToBrightLedger = nextCard.classList.contains('deck-card-4')

          // How far page 03 has travelled its pin-phase (cards sliding right)
          let slideProgress = 0
          if (leadsToBrightLedger && surface.parentElement) {
            const marqueeRect = surface.parentElement.getBoundingClientRect()
            const marqueeTravel = marqueeRect.height - windowH
            if (marqueeTravel > 0) {
              slideProgress = Math.min(1, Math.max(0, -marqueeRect.top / marqueeTravel))
            }
          }

          // Page 03's wash profile: dark through most of the right-slide, then
          // melting toward the ledger's ink during the final third of the slide.
          const slideWash = leadsToBrightLedger
            ? 0.35 * Math.min(1, Math.max(0, (slideProgress - 0.7) / 0.3))
            : 0

          // When nextCard's top is moving between windowH and 0 (sliding up over this card)
          if (nextRect.top <= windowH && nextRect.top >= 0) {
            const progress = 1 - nextRect.top / windowH // 0 (bottom) -> 1 (docked at top)
            const scale = 1 - progress * 0.05 // 1 -> 0.95
            const radius = progress * 24 // 0px -> 24px

            surface.style.transform = `scale(${scale})`
            surface.style.borderRadius = `${radius}px`

            if (leadsToBrightLedger) {
              // Dissolve from dark into the ledger's ink as page 04 slides up
              const wash = Math.max(slideWash, 0.35 + 0.65 * progress)
              surface.style.backgroundColor = mixToInk(wash)
              card.style.backgroundColor = mixToInk(wash)
              surface.style.filter = 'brightness(1)'
              surface.style.opacity = '1'
              applyMarqueeTheme(surface, wash)
            } else {
              const brightness = 1 - progress * 0.25 // 1 -> 0.75
              const opacity = 1 - progress * 0.25 // 1 -> 0.75
              surface.style.filter = `brightness(${brightness})`
              surface.style.opacity = `${opacity}`
              surface.style.backgroundColor = ''
              card.style.backgroundColor = ''
            }
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

            if (leadsToBrightLedger) {
              surface.style.transform = 'scale(0.95)'
              surface.style.backgroundColor = mixToInk(1)
              card.style.backgroundColor = mixToInk(1)
              surface.style.filter = 'brightness(1)'
              surface.style.opacity = '1'
              surface.style.borderRadius = '24px'
              applyMarqueeTheme(surface, 1)
            } else {
              surface.style.transform = 'scale(0.95)'
              surface.style.filter = 'brightness(0.75)'
              surface.style.opacity = '0.75'
              surface.style.borderRadius = '24px'
              surface.style.backgroundColor = ''
              card.style.backgroundColor = ''
            }
          } else {
            // Next card has not entered view yet
            surface.style.transform = 'scale(1)'
            surface.style.filter = 'brightness(1)'
            surface.style.opacity = '1'
            surface.style.borderRadius = '0px'

            if (leadsToBrightLedger) {
              // Keep the slide-phase wash while page 04 approaches from below
              const wash = mixToInk(slideWash)
              surface.style.backgroundColor = wash
              card.style.backgroundColor = wash
              applyMarqueeTheme(surface, slideWash)
            } else {
              surface.style.backgroundColor = ''
              card.style.backgroundColor = ''
            }
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
