'use client'

import React, { useState } from 'react'
import {
  ShieldAlert,
  UserCheck,
  Scale,
  LockKeyhole,
  FastForward,
  ChevronDown,
  ChevronUp,
  Info,
  HelpCircle,
  X,
  CheckCircle2,
  ExternalLink
} from 'lucide-react'

export interface StageBriefingData {
  stageNumber: number
  stageName: string
  plainLanguageSummary: string
  problemStatement: string
  solutionStatement: string
  designatedActor: {
    role: string
    title: string
    cadre: string
    description: string
  }
  statutoryMandate: {
    code: string
    law: string
    citation: string
  }
  coreSafeguard: {
    title: string
    description: string
    verificationMechanism: string
  }
  nextMilestone: {
    targetStage: string
    targetName: string
    actionText: string
  }
  quickGuideSteps: Array<{
    stepNumber: number
    title: string
    description: string
  }>
}

interface StageBriefingCardProps {
  data: StageBriefingData
  defaultExpanded?: boolean
}

export function StageBriefingCard({
  data,
  defaultExpanded = false,
}: StageBriefingCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const [showGuideModal, setShowGuideModal] = useState(false)

  return (
    <section className="stage-briefing-card" aria-label={`Stage 0${data.stageNumber} Mission Briefing`}>
      {/* Top Banner / Summary Header */}
      <div className="briefing-header">
        <div className="briefing-header-left">
          <div className="briefing-stage-badge">
            <span className="badge-glow" />
            <span className="badge-text">STAGE 0{data.stageNumber} MISSION BRIEFING</span>
          </div>
          <h2 className="briefing-title">
            &ldquo;{data.plainLanguageSummary}&rdquo;
          </h2>
          <p className="briefing-sub">
            <span className="text-white font-medium">Civic Context:</span> {data.solutionStatement}
          </p>
        </div>

        <div className="briefing-header-actions">
          <button
            type="button"
            onClick={() => setShowGuideModal(true)}
            className="briefing-guide-btn"
            title="How this stage works in 30 seconds"
          >
            <HelpCircle size={14} className="text-cyan" />
            <span>30-Second Guide</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="briefing-toggle-btn"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Collapse mission briefing' : 'Expand mission briefing'}
          >
            <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* 4-Quadrant Expandable Matrix */}
      {isExpanded && (
        <div className="briefing-grid">
          {/* Quadrant 1: Designated Actor */}
          <div className="briefing-quadrant actor-quadrant">
            <div className="quadrant-head">
              <div className="quadrant-icon-box text-cyan">
                <UserCheck size={16} />
              </div>
              <div className="quadrant-meta">
                <span className="quadrant-tag">Designated Authority</span>
                <h3 className="quadrant-title">{data.designatedActor.title}</h3>
              </div>
            </div>
            <p className="quadrant-desc">{data.designatedActor.description}</p>
            <div className="quadrant-footer">
              <span className="quadrant-label">Cadre / Mandate</span>
              <span className="quadrant-badge text-cyan">{data.designatedActor.cadre}</span>
            </div>
          </div>

          {/* Quadrant 2: Statutory Mandate */}
          <div className="briefing-quadrant mandate-quadrant">
            <div className="quadrant-head">
              <div className="quadrant-icon-box text-yellow">
                <Scale size={16} />
              </div>
              <div className="quadrant-meta">
                <span className="quadrant-tag">Statutory Schedule</span>
                <h3 className="quadrant-title">{data.statutoryMandate.code}</h3>
              </div>
            </div>
            <p className="quadrant-desc">{data.statutoryMandate.law}</p>
            <div className="quadrant-footer">
              <span className="quadrant-label">Legal Citation</span>
              <span className="quadrant-badge text-yellow">{data.statutoryMandate.citation}</span>
            </div>
          </div>

          {/* Quadrant 3: Core Safeguard */}
          <div className="briefing-quadrant safeguard-quadrant">
            <div className="quadrant-head">
              <div className="quadrant-icon-box text-green">
                <LockKeyhole size={16} />
              </div>
              <div className="quadrant-meta">
                <span className="quadrant-tag">Anticorruption Safeguard</span>
                <h3 className="quadrant-title">{data.coreSafeguard.title}</h3>
              </div>
            </div>
            <p className="quadrant-desc">{data.coreSafeguard.description}</p>
            <div className="quadrant-footer">
              <span className="quadrant-label">Integrity Enforced By</span>
              <span className="quadrant-badge text-green">{data.coreSafeguard.verificationMechanism}</span>
            </div>
          </div>

          {/* Quadrant 4: Next Pipeline Milestone */}
          <div className="briefing-quadrant milestone-quadrant">
            <div className="quadrant-head">
              <div className="quadrant-icon-box text-coral">
                <FastForward size={16} />
              </div>
              <div className="quadrant-meta">
                <span className="quadrant-tag">Pipeline Advance</span>
                <h3 className="quadrant-title">{data.nextMilestone.targetStage}: {data.nextMilestone.targetName}</h3>
              </div>
            </div>
            <p className="quadrant-desc">{data.nextMilestone.actionText}</p>
            <div className="quadrant-footer">
              <span className="quadrant-label">Next Destination</span>
              <span className="quadrant-badge text-coral">{data.nextMilestone.targetName}</span>
            </div>
          </div>
        </div>
      )}

      {/* 30-Second Quick Guide Modal */}
      {showGuideModal && (
        <div className="briefing-modal-overlay" role="dialog" aria-modal="true">
          <div className="briefing-modal-box">
            <div className="modal-top">
              <div className="modal-title-wrap">
                <span className="modal-tag">STAGE 0{data.stageNumber} PROTOCOL EXPLAINER</span>
                <h3 className="modal-heading">How This Stage Works in 30 Seconds</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="modal-close-btn"
                aria-label="Close guide modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-problem-box">
                <span className="problem-label">Conventional Vulnerability:</span>
                <p className="problem-text">{data.problemStatement}</p>
              </div>

              <div className="modal-steps-container">
                <span className="steps-label">Standard Operating Procedure:</span>
                <div className="modal-steps-list">
                  {data.quickGuideSteps.map((step) => (
                    <div key={step.stepNumber} className="modal-step-card">
                      <div className="step-num-bubble">0{step.stepNumber}</div>
                      <div className="step-content">
                        <h4 className="step-heading">{step.title}</h4>
                        <p className="step-body">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-bottom">
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="modal-dismiss-btn"
              >
                Got it, Return to Console
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
