'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react'

interface StageActionCalloutProps {
  stageNumber: number
  badgeText?: string
  instruction: string
  detail?: string
  primaryActionLabel?: string
  primaryActionHref?: string
  onPrimaryAction?: () => void
  isActionLoading?: boolean
  isActionComplete?: boolean
  accent?: 'cyan' | 'yellow' | 'green' | 'coral'
}

export function StageActionCallout({
  stageNumber,
  badgeText = 'OPERATIONAL ACTION REQUIRED',
  instruction,
  detail,
  primaryActionLabel,
  primaryActionHref,
  onPrimaryAction,
  isActionLoading = false,
  isActionComplete = false,
  accent = 'cyan',
}: StageActionCalloutProps) {
  const accentClass = `callout-accent-${accent}`

  return (
    <aside className={`stage-action-callout ${accentClass}`} aria-label="Action required on this page">
      <div className="callout-inner">
        <div className="callout-left">
          <div className="callout-badge-row">
            <span className="callout-ping-dot" />
            <span className="callout-badge-text">{badgeText}</span>
            <span className="callout-stage-tag">STAGE 0{stageNumber}</span>
          </div>
          <p className="callout-instruction">{instruction}</p>
          {detail && <p className="callout-detail">{detail}</p>}
        </div>

        {(primaryActionLabel || primaryActionHref) && (
          <div className="callout-right">
            {primaryActionHref ? (
              <Link href={primaryActionHref} className="callout-action-btn">
                <span>{primaryActionLabel}</span>
                <ArrowRight size={14} className="callout-btn-arrow" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={onPrimaryAction}
                disabled={isActionLoading || isActionComplete}
                className="callout-action-btn"
              >
                {isActionComplete ? (
                  <>
                    <CheckCircle2 size={14} className="text-green" />
                    <span>Completed</span>
                  </>
                ) : isActionLoading ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <span>{primaryActionLabel}</span>
                    <ArrowRight size={14} className="callout-btn-arrow" />
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  )
}
