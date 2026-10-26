'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, ArrowUpRight, Cpu, KeyRound, MessageSquareWarning, Activity, Radio } from 'lucide-react'
import { WORKFLOW_STEPS, type WorkflowStep } from '@/lib/data'
import { StageCanvas } from '@/components/3d/stage-canvas'

export function WorkflowDeck() {
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [activeStep, setActiveStep] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)

  const updateMarquee = useCallback(() => {
    if (!containerRef.current || !trackRef.current) return
    const containerRect = containerRef.current.getBoundingClientRect()
    const windowW = window.innerWidth
    const windowH = window.innerHeight
    const totalDist = containerRect.height - windowH

    if (totalDist <= 0) return

    // Scroll progress from 0.0 to 1.0 through the 360vh container
    const currentScroll = -containerRect.top
    const progress = Math.max(0, Math.min(1, currentScroll / totalDist))
    setScrollProgress(progress)

    const cards = trackRef.current.querySelectorAll<HTMLElement>('.marquee-card')
    if (cards.length === 0) return

    const firstCard = cards[0]
    const lastCard = cards[cards.length - 1]

    // Measure un-transformed centers of first and last cards relative to track
    const center0 = firstCard.offsetLeft + firstCard.offsetWidth / 2
    const centerLast = lastCard.offsetLeft + lastCard.offsetWidth / 2
    const viewportCenter = windowW / 2

    // Translations required to center Card 0 and Card (N-1) exactly in viewport
    const translateX0 = center0 - viewportCenter
    const translateXLast = centerLast - viewportCenter
    const totalTravel = translateXLast - translateX0

    const currentTranslateX = translateX0 + progress * totalTravel
    trackRef.current.style.transform = `translate3d(-${currentTranslateX}px, 0, 0)`

    // Active step for navigation tabs and indicators (0, 1, 2, or 3)
    const currentStep = Math.min(cards.length - 1, Math.max(0, Math.round(progress * (cards.length - 1))))
    setActiveStep(currentStep)

    // Stride distance between adjacent card centers
    const stride = cards.length > 1 ? (centerLast - center0) / (cards.length - 1) : windowW * 0.7
    const minScale = windowW < 768 ? 0.85 : 0.76
    const minOpacity = 0.36

    cards.forEach((card) => {
      const cardCenterInTrack = card.offsetLeft + card.offsetWidth / 2
      const cardCenterInViewport = cardCenterInTrack - currentTranslateX
      const distFromCenter = Math.abs(viewportCenter - cardCenterInViewport)
      const normDist = Math.min(1, distFromCenter / stride)

      // Smooth cosine falloff curve: 1.0 when dead center, 0.0 when 1 stride away
      const focus = 0.5 * (1 + Math.cos(normDist * Math.PI))

      const scale = minScale + (1.0 - minScale) * focus
      const opacity = minOpacity + (1.0 - minOpacity) * focus
      const brightness = 0.65 + 0.35 * focus
      const blur = (1 - focus) * 2.5

      card.style.transform = `scale(${scale.toFixed(4)})`
      card.style.opacity = `${opacity.toFixed(3)}`
      card.style.filter = blur > 0.15 ? `brightness(${brightness.toFixed(3)}) blur(${blur.toFixed(1)}px)` : `brightness(${brightness.toFixed(3)})`
      card.style.zIndex = focus > 0.5 ? '10' : '1'
      card.style.pointerEvents = focus > 0.5 ? 'auto' : 'none'

      if (focus > 0.65) {
        card.classList.add('in-focus')
      } else {
        card.classList.remove('in-focus')
      }
    })
  }, [])

  useEffect(() => {
    let ticking = false

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateMarquee()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    updateMarquee()

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [updateMarquee])

  const scrollToStep = (targetIndex: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const scrollTop = window.scrollY || document.documentElement.scrollTop
    const containerTop = scrollTop + rect.top
    const totalDist = containerRef.current.offsetHeight - window.innerHeight
    const targetProgress = targetIndex / 3
    const targetY = containerTop + targetProgress * totalDist + 5
    window.scrollTo({ top: targetY, behavior: 'smooth' })
  }

  const getActorIcon = (actorType: WorkflowStep['actorType']) => {
    switch (actorType) {
      case 'ai':
        return <Cpu size={14} />
      case 'officers':
        return <KeyRound size={14} />
      case 'citizens':
        return <MessageSquareWarning size={14} />
      default:
        return <Activity size={14} />
    }
  }

  return (
    <div ref={containerRef} className="workflow-marquee-container" id="workflow">
      <div className="workflow-sticky-window deck-card-surface">
        {/* Dynamic Glowing Progress Hairline */}
        <div
          className="workflow-progress-line"
          style={{ width: `${Math.max(2, scrollProgress * 100)}%` }}
        />

        {/* Card Top Handle Bar */}
        <header className="workflow-top-bar">
          {/* Interactive Step Tabs */}
          <nav className="workflow-step-tabs" aria-label="Workflow stages">
            {WORKFLOW_STEPS.map((step, idx) => {
              const isActive = activeStep === idx
              return (
                <button
                  key={step.number}
                  type="button"
                  onClick={() => scrollToStep(idx)}
                  className={`workflow-tab-btn ${isActive ? 'active' : ''} ${step.accent}`}
                  aria-current={isActive ? 'step' : undefined}
                >
                  <span className="tab-num">{step.number}</span>
                  <span className="tab-name">{step.title}</span>
                  {isActive && <span className="tab-active-glow" />}
                </button>
              )
            })}
          </nav>

          <div className="workflow-bar-right">
            <span className="actor-badge">
              {getActorIcon(WORKFLOW_STEPS[activeStep].actorType)}
              <span>{WORKFLOW_STEPS[activeStep].actor}</span>
            </span>
          </div>
        </header>

        {/* Kinetic Marquee Ticker Strip (Scroll-driven Parallax) */}
        <div className="marquee-ticker-rail" aria-hidden="true">
          <div
            className="marquee-ticker-inner"
            style={{
              transform: `translate3d(-${(scrollProgress * 240) % 500}px, 0, 0)`,
            }}
          >
            <span>
              01 DETECT · MOUNTAIN FLOOD SURGE & UPWARD LIGHT TOWER BEAM · 02 ESTIMATE & DRAFT · HYDRODYNAMIC CONTOUR SCANNING & SDRF BUDGETS · 03 RELEASE · MULTI-SIG OFFICER ARCS & ON-CHAIN CONSENSUS · 04 REPORT · CITIZEN GROUND PULSES & PUBLIC AUDIT · FORECAST-FIRST · SATELLITE-CONFIRMED ·
            </span>
            <span>
              01 DETECT · MOUNTAIN FLOOD SURGE & UPWARD LIGHT TOWER BEAM · 02 ESTIMATE & DRAFT · HYDRODYNAMIC CONTOUR SCANNING & SDRF BUDGETS · 03 RELEASE · MULTI-SIG OFFICER ARCS & ON-CHAIN CONSENSUS · 04 REPORT · CITIZEN GROUND PULSES & PUBLIC AUDIT · FORECAST-FIRST · SATELLITE-CONFIRMED ·
            </span>
          </div>
        </div>

        {/* Scroll-Driven Horizontal Marquee Track with Live 3D Twin Viewports */}
        <div className="marquee-track-viewport">
          <div ref={trackRef} className="workflow-marquee-track">
            {WORKFLOW_STEPS.map((step, index) => {
              const isActive = activeStep === index
              return (
                <article
                  key={step.number}
                  className={`marquee-card card-step-${index} ${step.accent} ${isActive ? 'is-active' : ''}`}
                >
                  <div className="marquee-card-content">
                    {/* Left Column: Narrative, Civic Data Pills & Action */}
                    <div className="marquee-card-copy">
                      <div className="stage-pill-row">
                        <span className={`stage-badge ${step.accent}`}>
                          STAGE {step.number} · {step.badge}
                        </span>
                      </div>

                      <div className="actor-pill-row">
                        <span className="actor-tag">
                          {getActorIcon(step.actorType)}
                          <span>{step.actor}</span>
                        </span>
                      </div>

                      <h2 className="stage-title">
                        {step.title}
                      </h2>

                      <p className="stage-description">
                        {step.description}
                      </p>

                      {/* Streamlined Civic Data Pills */}
                      <div className="stage-metric-pills">
                        <div className={`metric-pill primary ${step.accent}`}>
                          <span className="pill-metric-val">{step.telemetry.primaryMetric.value}</span>
                          <span className="pill-metric-lbl">{step.telemetry.primaryMetric.label}</span>
                        </div>
                        <div className="metric-pill secondary">
                          <span className="pill-metric-detail">
                            {step.telemetry.items[0]?.label}: <strong>{step.telemetry.items[0]?.status}</strong>
                          </span>
                        </div>
                        <div className="metric-pill secondary">
                          <span className="pill-metric-detail">
                            {step.telemetry.items[3]?.label}: <strong>{step.telemetry.items[3]?.status}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="stage-action-row">
                        {index < WORKFLOW_STEPS.length - 1 ? (
                          <button
                            type="button"
                            onClick={() => scrollToStep(index + 1)}
                            className="stage-next-action"
                          >
                            <span>Next: {WORKFLOW_STEPS[index + 1].title}</span>
                            <ArrowRight size={15} />
                          </button>
                        ) : (
                          <a href="#section-trust" className="stage-next-action dark">
                            <span>Proceed to Public Ledger</span>
                            <ArrowRight size={15} />
                          </a>
                        )}

                        <Link
                          href={index === 0 ? '/detect' : index === 1 ? '/estimate' : index === 2 ? '/release' : '/report'}
                          className="stage-direct-console-link"
                        >
                          <span>Open Live Stage</span>
                          <ArrowUpRight size={13} />
                        </Link>

                        <span className="scroll-cue-note">
                          <Radio size={12} className="pulse-icon" />
                          <span>Scroll to advance marquee</span>
                        </span>
                      </div>
                    </div>

                    {/* Right Column: Interactive 3D Digital Twin Viewport (No Boxy Card) */}
                    <div className="marquee-scene-viewport">
                      <StageCanvas
                        stageIndex={index}
                        label={step.title}
                        accent={step.accent}
                      />
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>

        {/* Floating Marquee Pager */}
        <div className="workflow-pager">
          <button
            type="button"
            onClick={() => scrollToStep(Math.max(0, activeStep - 1))}
            disabled={activeStep === 0}
            className="pager-btn"
            aria-label="Previous card"
          >
            <ArrowLeft size={14} />
          </button>
          <span className="pager-text">
            {activeStep + 1} <span>/ 4</span>
          </span>
          <button
            type="button"
            onClick={() => scrollToStep(Math.min(3, activeStep + 1))}
            disabled={activeStep === 3}
            className="pager-btn"
            aria-label="Next card"
          >
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
