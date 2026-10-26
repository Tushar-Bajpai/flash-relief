'use client'

import { DraftBudgetSummary } from '@/lib/estimate-data'
import { ShieldCheck, CheckCircle2, Cpu, ArrowRight, AlertCircle, FileCheck2 } from 'lucide-react'
import Link from 'next/link'

interface BudgetValidationCardProps {
  validationChecks: DraftBudgetSummary['validationChecks']
  aiExplanation: string
  totalCrores: number
  selectedPercentile: string
}

export function BudgetValidationCard({
  validationChecks,
  aiExplanation,
  totalCrores,
  selectedPercentile,
}: BudgetValidationCardProps) {
  return (
    <div className="validation-panel-card">
      <div className="validation-header">
        <div className="flex-align-gap">
          <ShieldCheck size={16} className="text-green" />
          <h3 className="panel-title">DETERMINISTIC VALIDATOR // SAFETY GUARDRAILS</h3>
        </div>
        <span className="validation-pass-badge">
          <CheckCircle2 size={12} className="mr-1 inline text-green" />
          <span>ALL 4 CHECKS VERIFIED · DETERMINISTIC INTEGRITY</span>
        </span>
      </div>

      {/* Grid of 4 Validation Rules */}
      <div className="validation-rules-grid">
        {validationChecks.map((check) => (
          <div key={check.id} className="rule-check-item">
            <div className="rule-top">
              <span className="rule-id">{check.id}</span>
              <span className="rule-status-pill passed">
                <CheckCircle2 size={10} className="mr-1 inline" />
                <span>{check.status}</span>
              </span>
            </div>
            <h4 className="rule-name">{check.name}</h4>
            <p className="rule-desc">{check.description}</p>
          </div>
        ))}
      </div>

      {/* AI Agent Rationale Box */}
      <div className="ai-rationale-box">
        <div className="rationale-top">
          <div className="flex-align-gap">
            <Cpu size={14} className="text-cyan" />
            <span className="mono-subhead">LANGGRAPH AGENT EXPLANATION // FORMULATION LOG</span>
          </div>
          <span className="rule-engine-tag">DETERMINISTIC CALCULATOR TOOL</span>
        </div>

        <p className="rationale-text">{aiExplanation}</p>

        <div className="guardrail-quote">
          <span>
            <strong>Architectural Principle:</strong> The AI proposes, explains, and reconciles feedback. Deterministic code performs all multiplication against versioned MHA schedule rates. The AI never holds a private key that can release treasury funds.
          </span>
        </div>
      </div>

      {/* Stage 03 Committee Review Handoff Action */}
      <div className="review-handoff-bar">
        <div className="handoff-meta">
          <span className="handoff-eyebrow">READY FOR AUTHORIZED SIGN-OFF</span>
          <span className="handoff-amount">
            Draft Package: <strong>₹{totalCrores.toFixed(2)} Cr</strong> ({selectedPercentile} Bound)
          </span>
        </div>

        <Link href="/review" className="proceed-to-review-btn">
          <span>Submit to Officer Review Committee (Stage 03)</span>
          <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  )
}
