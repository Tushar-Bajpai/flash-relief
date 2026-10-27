'use client'

import { useState, useEffect } from 'react'
import { AppHeader } from '@/components/layout/app-header'
import { ConsoleBar, ConsoleNextBar } from '@/components/layout/console-bar'
import { PipelineSummaryBar } from '@/components/report/pipeline-summary-bar'
import { GrievanceFeedCard } from '@/components/report/grievance-feed-card'
import { FileGrievanceModal } from '@/components/report/file-grievance-modal'
import { INITIAL_GRIEVANCES, GrievanceItem } from '@/lib/report-data'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { ProtocolStepper } from '@/components/layout/protocol-stepper'
import { StageBriefingCard } from '@/components/layout/stage-briefing-card'
import { StageActionCallout } from '@/components/layout/stage-action-callout'
import { STAGE_BRIEFINGS } from '@/lib/protocol-briefings'

export default function ReportPage() {
  const [grievances, setGrievances] = useState<GrievanceItem[]>(INITIAL_GRIEVANCES)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    async function loadDbGrievances() {
      try {
        const res = await fetch('/api/grievances')
        if (res.ok) {
          const data = await res.json()
          if (data?.grievances && data.grievances.length > 0) {
            const mappedDbGrievances: GrievanceItem[] = data.grievances.map((g: any) => ({
              id: g.trackingId || g.id,
              lineItemId: 'line-01',
              lineItemDescription: 'SDRF-01.A — Gratuitous Relief Camp Feeding & Water',
              departmentName: 'Food & Civil Supplies',
              category: g.category || 'RELIEF_NOT_DELIVERED',
              locationName: `${g.village}, ${g.district}`,
              reporterPhoneMasked: g.citizenHash ? `${g.citizenHash.slice(0, 6)}***` : '+91 94350 *** **123',
              originalText: g.description,
              originalLanguage: 'Assamese',
              translatedEnglishText: g.description,
              status: g.status === 'RESOLVED' ? 'CORROBORATED' : 'INVESTIGATING',
              submissionTimestamp: g.createdAt ? new Date(g.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Earlier today',
              responseDeadline: 'In 48 hours',
              hoursRemainingSla: 48,
              isEscalated: Boolean(g.isBreached),
              escalationLevel: g.isBreached ? 'DISTRICT_MAGISTRATE' : 'BLOCK',
              grievanceTxHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
            }))

            setGrievances((prev) => {
              const existingIds = new Set(prev.map((item) => item.id))
              const newItems = mappedDbGrievances.filter((item) => !existingIds.has(item.id))
              return [...newItems, ...prev]
            })
          }
        }
      } catch (err) {
        console.warn('Failed to load DB grievances:', err)
      }
    }
    loadDbGrievances()
  }, [])

  const handleGrievanceSuccess = (newGrievance: GrievanceItem) => {
    setGrievances((prev) => [newGrievance, ...prev])
  }

  const escalatedCount = grievances.filter((g) => g.isEscalated).length
  const resolvedCount = grievances.filter((g) => g.officerResponse !== undefined).length

  return (
    <div className="product-page-shell">
      {/* Top Application Navigation */}
      <AppHeader />

      {/* 6-Stage Civic Protocol Stepper */}
      <ProtocolStepper
        currentStage={6}
        fundStatus="Citizen Audit & 48h Statutory SLA Active"
      />

      <main className="product-page-main">
        {/* Stage 06 Mission Briefing & Action Guidance */}
        <StageBriefingCard data={STAGE_BRIEFINGS[6]} defaultExpanded={true} />

        <StageActionCallout
          stageNumber={6}
          instruction="Inspect live citizen reports from flood-affected villages, file a test report to start a 48-hour SLA countdown, or audit unresolved escalations."
          primaryActionLabel="File Citizen Report (Modal)"
          onPrimaryAction={() => setIsModalOpen(true)}
          accent="coral"
        />

        {/* Compact page header */}
        <ConsoleBar
          stage="06"
          name="Report"
          accent="coral"
          title={
            <>
              Public ledger &amp; <em>citizen grievances</em>
            </>
          }
          description="When relief never arrives, citizens call it out here. Reports attach to the exact line item and start a 48-hour response clock; a missed deadline escalates from block to district to state."
          stats={[
            { label: 'Citizen reports', value: grievances.length, tone: 'coral' },
            { label: 'Escalated', value: escalatedCount, tone: 'yellow' },
            { label: 'Response rate', value: `${grievances.length ? Math.round((resolvedCount / grievances.length) * 100) : 0}%`, tone: 'green' },
          ]}
        />

        {/* Section 1: Lifecycle stepper */}
        <section className="report-section">
          <PipelineSummaryBar />
        </section>

        {/* Section 2: Public Grievance Feed */}
        <section className="report-section">
          <GrievanceFeedCard
            grievances={grievances}
            onOpenReportModal={() => setIsModalOpen(true)}
          />
        </section>

        {/* Modal: File Citizen Grievance */}
        <FileGrievanceModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleGrievanceSuccess}
        />

        {/* Stage navigation */}
        <ConsoleNextBar
          backLabel="Stage 05 · Deliver"
          backHref="/deliver"
          nextLabel="Full event audit dossier"
        >
          <Link href="/events/fl-2026-brahmaputra" className="primary-action console-next-forward">
            <span>View event dossier</span>
            <ArrowRight size={14} />
          </Link>
        </ConsoleNextBar>
      </main>
    </div>
  )
}
