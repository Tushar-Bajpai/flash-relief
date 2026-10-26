'use client'

import { useState, useEffect } from 'react'
import { AppHeader } from '@/components/layout/app-header'
import { PipelineSummaryBar } from '@/components/report/pipeline-summary-bar'
import { GrievanceFeedCard } from '@/components/report/grievance-feed-card'
import { FileGrievanceModal } from '@/components/report/file-grievance-modal'
import { INITIAL_GRIEVANCES, GrievanceItem } from '@/lib/report-data'
import { ArrowLeft, ArrowRight, Home, ShieldAlert, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react'
import Link from 'next/link'

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

      <main className="product-page-main">
        {/* Page Hero Header */}
        <section className="report-hero-banner">
          <div className="report-hero-left">
            <div className="stage-pill-row">
              <span className="stage-badge coral">STAGE 06 · PUBLIC LEDGER & CITIZEN GRIEVANCE SYSTEM</span>
              <span className="live-cadence-pill coral">
                <AlertCircle size={11} className="mr-1 inline text-coral" />
                <span>48-HOUR AUTOMATED ESCALATION SLA ENGINE</span>
              </span>
            </div>

            <h1 className="report-hero-title">
              Public Ledger &<br />
              <em>Citizen Grievances</em>
            </h1>

            <p className="report-hero-desc">
              When disaster relief never arrives, citizens call it out on a public ledger. Reports attach directly to specific SDRF budget line items, starting an irrevocable 48-hour response countdown. A missed deadline automatically escalates from the block level to the District Magistrate and State Disaster Management Authority.
            </p>
          </div>

          <div className="report-hero-stats">
            <div className="hero-stat-card primary-report">
              <span className="stat-eyebrow">ACTIVE CITIZEN REPORTS</span>
              <div className="stat-value-row">
                <span className="stat-huge-value text-coral">{grievances.length}</span>
                <span className="stat-unit">dossiers</span>
              </div>
              <span className="stat-subtext">
                {escalatedCount} auto-escalated to District Magistrate level
              </span>
            </div>

            <div className="hero-stat-card">
              <span className="stat-eyebrow">OFFICER RESPONSE RATE</span>
              <div className="stat-value-row">
                <span className="stat-huge-value text-green">{Math.round((resolvedCount / grievances.length) * 100)}%</span>
                <span className="stat-unit">with evidence</span>
              </div>
              <span className="stat-subtext">Verified responses attached with IPFS proofs</span>
            </div>

            <div className="hero-stat-card">
              <span className="stat-eyebrow">CITIZEN ACCESS BARRIER</span>
              <div className="stat-value-row">
                <span className="stat-huge-value text-cyan">Zero Wallet</span>
              </div>
              <span className="stat-subtext">Phone OTP + Multilingual SMS/Web intake</span>
            </div>
          </div>
        </section>

        {/* Section 1: End-to-End 6-Stage Civic Lifecycle Stepper */}
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

        {/* Bottom Navigation Handoff Bar */}
        <section className="stage-handoff-banner">
          <div className="handoff-content">
            <div className="handoff-left">
              <span className="handoff-eyebrow">END-TO-END PIPELINE CLOSED</span>
              <h2 className="handoff-title">FlashRelief: Detect → Estimate → Review → Release → Deliver → Report</h2>
              <p className="handoff-desc">
                From satellite detection before the news to tamper-proof public grievance audits on-chain. Every rupee accounted for, verified by officers, and confirmed by citizens.
              </p>
            </div>

            <div className="handoff-actions-row">
              <Link href="/deliver" className="secondary-action">
                <ArrowLeft size={15} />
                <span>Back to Stage 05: Deliver</span>
              </Link>

              <Link href="/events/fl-2026-brahmaputra" className="primary-action">
                <span>View Full Event Audit Dossier</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
