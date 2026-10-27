'use client'

import { useState, useEffect } from 'react'
import { AppHeader } from '@/components/layout/app-header'
import { ConsoleBar, ConsoleNextBar } from '@/components/layout/console-bar'
import { OfficerQuorumCards } from '@/components/review/officer-quorum-cards'
import { HumanInLoopFeedback } from '@/components/review/human-in-loop-feedback'
import { PackageInspectionDrawer } from '@/components/review/package-inspection-drawer'
import { INITIAL_OFFICERS, INITIAL_REVIEW_STATE, OfficerReviewer, ReviewState } from '@/lib/review-data'
import { ArrowRight } from 'lucide-react'
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
        {/* Compact page header */}
        <ConsoleBar
          stage="03"
          name="Review"
          accent="yellow"
          title={
            <>
              Officer committee &amp; <em>quorum sign-off</em>
            </>
          }
          description="The AI proposes; officers decide. The committee verifies the draft, requests changes or grants approval. Approval counts strictly by quorum — the AI never signs anything."
          stats={[
            {
              label: 'Quorum',
              value: `${approvedCount} of ${officers.length} signed`,
              tone: isQuorumMet ? 'green' : 'yellow',
            },
            { label: 'Dossier value', value: `₹${reviewState.adjustedBudgetCrores.toFixed(2)} Cr`, tone: 'yellow' },
          ]}
        />

        {/* Section 1: Package inspection drawer */}
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

        {/* Stage navigation */}
        <ConsoleNextBar
          backLabel="Stage 02 · Estimate"
          backHref="/estimate"
          nextLabel={`Stage 04 · Release${isQuorumMet ? '' : ' (waits for quorum)'}`}
        >
          <Link
            href="/release"
            className={`primary-action console-next-forward ${!isQuorumMet ? 'opacity-85' : ''}`}
            style={{ background: 'transparent', color: 'var(--ink)', border: '1px solid rgba(234,245,244,0.2)' }}
          >
            <span>{isQuorumMet ? 'Proceed to release' : 'Preview release'}</span>
            <ArrowRight size={14} />
          </Link>
        </ConsoleNextBar>
      </main>
    </div>
  )
}
