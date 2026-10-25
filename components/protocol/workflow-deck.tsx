'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ArrowLeft, ArrowRight, ShieldCheck, Cpu, KeyRound, MessageSquareWarning, Activity } from 'lucide-react'
import { WORKFLOW_STEPS, type WorkflowStep } from '@/lib/data'

export function WorkflowDeck() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeStep, setActiveStep] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)

  // Card element refs for direct 60fps transform manipulation
  const cardRefs = useRef<(HTMLElement | null)[]>([])

  const updateCardPositions = useCallback(() => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const windowH = window.innerHeight
    const totalDist = rect.height - windowH

    if (totalDist <= 0) return

    // Scroll progress from 0.0 to 1.0 through the 4-page section
    const currentScroll = -rect.top
    const progress = Math.max(0, Math.min(1, currentScroll / totalDist))
    setScrollProgress(progress)

    // Active step for indicators (0, 1, 2, or 3)
    const currentStep = Math.min(3, Math.floor(progress * 3.99))
    setActiveStep(currentStep)

    // 3 transitions across 4 pages: span = 1/3
    const span = 1 / 3
    const p01 = Math.max(0, Math.min(1, progress / span))
    const p12 = Math.max(0, Math.min(1, (progress - span) / span))
    const p23 = Math.max(0, Math.min(1, (progress - 2 * span) / span))

    // Card 0: Detect
    const c0 = cardRefs.current[0]
    if (c0) {
      const transX = -p01 * 12
      const scale = 1 - p01 * 0.05
      const brightness = 1 - p01 * 0.25
      const opacity = 1 - p01 * 0.25
      c0.style.transform = `translate3d(${transX}%, 0, 0) scale(${scale})`
      c0.style.filter = `brightness(${brightness})`
      c0.style.opacity = `${opacity}`
    }

    // Card 1: Estimate and draft
    const c1 = cardRefs.current[1]
    if (c1) {
      if (progress < span) {
        const transX = (1 - p01) * 100
        c1.style.transform = `translate3d(${transX}%, 0, 0) scale(1)`
        c1.style.filter = 'brightness(1)'
        c1.style.opacity = '1'
      } else {
        const transX = -p12 * 12
        const scale = 1 - p12 * 0.05
        const brightness = 1 - p12 * 0.25
        const opacity = 1 - p12 * 0.25
        c1.style.transform = `translate3d(${transX}%, 0, 0) scale(${scale})`
        c1.style.filter = `brightness(${brightness})`
        c1.style.opacity = `${opacity}`
      }
    }

    // Card 2: Release
    const c2 = cardRefs.current[2]
    if (c2) {
      if (progress < span * 2) {
        const transX = (1 - p12) * 100
        c2.style.transform = `translate3d(${transX}%, 0, 0) scale(1)`
        c2.style.filter = 'brightness(1)'
        c2.style.opacity = '1'
      } else {
        const transX = -p23 * 12
        const scale = 1 - p23 * 0.05
        const brightness = 1 - p23 * 0.25
        const opacity = 1 - p23 * 0.25
        c2.style.transform = `translate3d(${transX}%, 0, 0) scale(${scale})`
        c2.style.filter = `brightness(${brightness})`
        c2.style.opacity = `${opacity}`
      }
    }

    // Card 3: Report
    const c3 = cardRefs.current[3]
    if (c3) {
      const transX = (1 - p23) * 100
      c3.style.transform = `translate3d(${transX}%, 0, 0) scale(1)`
      c3.style.filter = 'brightness(1)'
      c3.style.opacity = '1'
    }
  }, [])

  useEffect(() => {
    let ticking = false

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateCardPositions()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    updateCardPositions()

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [updateCardPositions])

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
    <div ref={containerRef} className="workflow-deck-container" id="workflow">
      <div className="workflow-sticky-window deck-card-surface">
        {/* Dynamic Glowing Progress Hairline */}
        <div
          className="workflow-progress-line"
          style={{ width: `${Math.max(2, scrollProgress * 100)}%` }}
        />

        {/* Tactile Card Top Handle with Interactive Step Tabs */}
        <header className="workflow-top-bar">
          <div className="workflow-bar-left">
            <span className="card-tab-dot cyan-dot" />
            <span className="workflow-index-mono">03 / 04</span>
            <span className="workflow-bar-divider" />
            <span className="workflow-bar-title">OPERATING ARCHITECTURE DEEP DIVE</span>
          </div>

          {/* 4 Interactive Step Tabs */}
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

        {/* 4 Stacking Cards Stage (Slide in from Right) */}
        <div className="workflow-cards-stage">
          {WORKFLOW_STEPS.map((step, index) => {
            return (
              <article
                key={step.number}
                ref={(el) => {
                  cardRefs.current[index] = el
                }}
                className={`workflow-slide-card card-index-${index} ${step.accent}`}
                style={{
                  zIndex: 10 + index * 10,
                  transform: index === 0 ? 'translate3d(0, 0, 0)' : 'translate3d(100%, 0, 0)',
                }}
              >
                <div className="workflow-card-inner">
                  {/* Left Column: Stage Narrative & Action Context */}
                  <div className="workflow-copy-col">
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

                    {/* Step Navigation Pill */}
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
                    </div>
                  </div>

                  {/* Right Column: High-Density Civic Telemetry Console */}
                  <div className="workflow-telemetry-col">
                    <div className="telemetry-console">
                      {/* Console Header */}
                      <div className="console-header">
                        <div className="console-title">
                          <span className={`pulse-indicator ${step.accent}`} />
                          <span>{step.telemetry.systemTitle}</span>
                        </div>
                        <span className={`console-badge ${step.accent}`}>
                          {step.telemetry.statusBadge}
                        </span>
                      </div>

                      {/* Primary Readout Box */}
                      <div className="console-metric-row">
                        <div className="metric-box">
                          <span className="metric-label">{step.telemetry.primaryMetric.label}</span>
                          <span className={`metric-value ${step.accent}`}>
                            {step.telemetry.primaryMetric.value}
                          </span>
                        </div>
                        <div className="metric-sub-note">
                          <span>Verified against real-time basin sensors and cryptographic logs</span>
                        </div>
                      </div>

                      {/* Live Items Feed */}
                      <div className="console-feed-grid">
                        {step.telemetry.items.map((item, itemIdx) => (
                          <div className="feed-item" key={itemIdx}>
                            <div className="feed-item-header">
                              <span className="feed-item-label">{item.label}</span>
                              <span className={`feed-item-status ${step.accent}`}>{item.status}</span>
                            </div>
                            <p className="feed-item-detail">{item.detail}</p>
                          </div>
                        ))}
                      </div>

                      {/* Console Footer Verification */}
                      <div className="console-footer">
                        <ShieldCheck size={14} />
                        <span>{step.telemetry.footerNote}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        {/* Floating Quick Step Pager */}
        <div className="workflow-pager">
          <button
            type="button"
            onClick={() => scrollToStep(Math.max(0, activeStep - 1))}
            disabled={activeStep === 0}
            className="pager-btn"
            aria-label="Previous step"
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
            aria-label="Next step"
          >
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
