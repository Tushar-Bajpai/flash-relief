'use client'

import { useState, useEffect } from 'react'
import { AppHeader } from '@/components/layout/app-header'
import { OfficerQuorumCards } from '@/components/review/officer-quorum-cards'
import { HumanInLoopFeedback } from '@/components/review/human-in-loop-feedback'
import { PackageInspectionDrawer } from '@/components/review/package-inspection-drawer'
import { INITIAL_OFFICERS, INITIAL_REVIEW_STATE, OfficerReviewer, ReviewState } from '@/lib/review-data'
import { ArrowRight, ArrowLeft, ShieldCheck, CheckCircle2, UserCheck, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function ReviewPage() {
  const [officers, setOfficers] = useState<OfficerReviewer[]>(INITIAL_OFFICERS)
  const [reviewState, setReviewState] = useState<ReviewState>(INITIAL_REVIEW_STATE)

  useEffect(() => {
    async function syncEventState() {
      try {
        const res = await fetch('/api/events/fl-2026-brahmaputra')
        if (res.ok) {
          const data = await res.json()
          if (data?.event?.budgets && data.event.budgets.length > 0) {
            const latestBudget = data.event.budgets[0]
            const rupees = Number(latestBudget.totalRupees) || 73500000
            const crores = Number((rupees / 10000000).toFixed(2))
            setReviewState((prev) => ({
              ...prev,
              baseBudgetCrores: crores,
              adjustedBudgetCrores: crores,
              adjustedBudgetRupees: rupees,
            }))
          }
        }
      } catch (err) {
        console.warn('Failed to fetch live event state for review:', err)
      }
    }
    syncEventState()
  }, [])

  const approvedCount = officers.filter((o) => o.status === 'APPROVED').length
  const isQuorumMet = approvedCount === officers.length

  const handleSignAsOfficer = async (officerId: string) => {
    try {
      const sigHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`

      // Call live backend review API
      fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: 'fl-2026-brahmaputra',
          officerId,
          officerName: 'Smt. Mridula Baruah',
          role: 'Joint Secretary (Finance)',
          cadre: 'IDAS',
          action: 'APPROVED',
          signatureHash: sigHash,
        }),
      }).catch((e) => console.warn('Review API async warning:', e))

      setOfficers((prev) =>
        prev.map((o) => {
          if (o.id === officerId) {
            return {
              ...o,
              status: 'APPROVED' as const,
              comment: 'Verified against annual SDRF ceiling limits. Recommended for immediate on-chain release and treasury sub-vault allotment.',
              timestamp: 'Just now',
              signatureHash: `${sigHash.slice(0, 10)}...${sigHash.slice(-4)}`,
            }
          }
          return o
        })
      )
    } catch (err) {
      console.warn('Error signing as officer:', err)
    }
  }

  const handleApplyFeedback = (instruction: string, deltaRupees: number, deltaExplanation: string) => {
    const newAdjustedRupees = reviewState.adjustedBudgetRupees + deltaRupees
    const newAdjustedCrores = Number((newAdjustedRupees / 10000000).toFixed(2))

    setReviewState((prev) => ({
      ...prev,
      adjustedBudgetRupees: newAdjustedRupees,
      adjustedBudgetCrores: newAdjustedCrores,
      revisionLog: [
        {
          timestamp: 'Just now',
          officerName: 'Smt. Mridula Baruah (Finance / Committee)',
          instruction,
          deltaRupees,
          deltaExplanation,
        },
        ...prev.revisionLog,
      ],
    }))
  }

  return (
    <div className="product-page-shell">
      {/* Top Application Navigation */}
      <AppHeader />

      <main className="product-page-main">
        {/* Page Hero Header */}
        <section className="review-hero-banner">
          <div className="review-hero-left">
            <div className="stage-pill-row">
              <span className="stage-badge yellow">STAGE 03 · OFFICER REVIEW & COMMITTEE QUORUM</span>
              <span className={`live-cadence-pill ${isQuorumMet ? 'green' : 'yellow'}`}>
                <ShieldCheck size={11} className={`mr-1 inline ${isQuorumMet ? 'text-green' : 'text-yellow'}`} />
                <span>{approvedCount} OF {officers.length} OFFICERS SIGNED · {isQuorumMet ? 'QUORUM REACHED' : 'PENDING 1 SIGNATURE'}</span>
              </span>
            </div>

            <h1 className="review-hero-title">
              Executive Committee &<br />
              <em>Multi-Officer Review</em>
            </h1>

            <p className="review-hero-desc">
              The AI proposes. Humans decide. The AI never holds a private key that can disburse public money. A statutory review committee of authorized officers (District Magistrate, State Disaster Management Authority, and Finance) verifies satellite grounds, adjusts relief parameters, and grants consensus authorization.
            </p>
          </div>

          <div className="review-hero-stats">
            <div className={`hero-stat-card primary-review ${isQuorumMet ? 'complete' : ''}`}>
              <span className="stat-eyebrow">QUORUM CONSENSUS STATUS</span>
              <div className="stat-value-row">
                <span className={`stat-huge-value ${isQuorumMet ? 'text-green' : 'text-yellow'}`}>
                  {isQuorumMet ? 'AUTHORIZED' : '2 of 3 SIGNED'}
                </span>
                <span className={`stat-pill-tag ${isQuorumMet ? 'normal' : 'watch'}`}>
                  {isQuorumMet ? 'READY TO RELEASE' : 'PENDING FINANCE'}
                </span>
              </div>
              <span className="stat-subtext">
                {isQuorumMet
                  ? 'All 3 constitutional signatories confirmed'
                  : 'Awaiting digital endorsement from Finance Department'}
              </span>
            </div>

            <div className="hero-stat-card">
              <span className="stat-eyebrow">ACTIVE DOSSIER VALUE</span>
              <div className="stat-value-row">
                <span className="stat-huge-value text-yellow">₹{reviewState.adjustedBudgetCrores.toFixed(2)}</span>
                <span className="stat-unit">Crores</span>
              </div>
              <span className="stat-subtext">
                {reviewState.adjustedBudgetCrores > reviewState.baseBudgetCrores
                  ? `Includes +₹${(reviewState.adjustedBudgetCrores - reviewState.baseBudgetCrores).toFixed(2)} Cr in committee revisions`
                  : 'Baseline from Stage 02 hydrodynamic raster'}
              </span>
            </div>
          </div>
        </section>

        {/* Section 1: Package Inspection Drawer */}
        <section className="review-section">
          <PackageInspectionDrawer
            baseBudgetCrores={reviewState.baseBudgetCrores}
            adjustedBudgetCrores={reviewState.adjustedBudgetCrores}
            threadId={reviewState.threadId}
            checkpointId={reviewState.checkpointId}
            checkpointTimestamp={reviewState.checkpointTimestamp}
          />
        </section>

        {/* Section 2: Officer Quorum Cards */}
        <section className="review-section">
          <OfficerQuorumCards
            officers={officers}
            onSignAsOfficer={handleSignAsOfficer}
          />
        </section>

        {/* Section 3: Human-in-the-Loop Feedback Console */}
        <section className="review-section">
          <HumanInLoopFeedback
            revisionLog={reviewState.revisionLog}
            onApplyFeedback={handleApplyFeedback}
          />
        </section>

        {/* Bottom Navigation Handoff Bar */}
        <section className="stage-handoff-banner">
          <div className="handoff-content">
            <div className="handoff-left">
              <span className="handoff-eyebrow">STAGE TRANSITION</span>
              <h2 className="handoff-title">
                {isQuorumMet
                  ? 'Committee Consensus Complete — Proceed to Stage 04: Release'
                  : 'Stage 04: Multi-Sig Cryptographic Release on Public Ledger'}
              </h2>
              <p className="handoff-desc">
                {isQuorumMet
                  ? 'All 3 officers have provided digital signatures. The budget package is unlocked for smart contract recording on the Polygon blockchain.'
                  : 'Once Finance provides digital endorsement, the approved budget and per-department tokenized allocations are posted on-chain.'}
              </p>
            </div>

            <div className="handoff-actions-row">
              <Link href="/estimate" className="secondary-action">
                <ArrowLeft size={15} />
                <span>Back to Stage 02: Estimate</span>
              </Link>

              <Link
                href="/release"
                className={`primary-action ${!isQuorumMet ? 'opacity-85' : ''}`}
              >
                <span>{isQuorumMet ? 'Proceed to Stage 04: Release' : 'Preview Stage 04: Release'}</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
