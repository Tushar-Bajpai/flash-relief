'use client'

import { useState } from 'react'
import { GrievanceItem, GrievanceStatus } from '@/lib/report-data'
import { AlertCircle, Clock, CheckCircle2, ShieldAlert, ArrowUpRight, MessageSquare, Plus, FileText, Send } from 'lucide-react'

interface GrievanceFeedCardProps {
  grievances: GrievanceItem[]
  onOpenReportModal: () => void
}

export function GrievanceFeedCard({ grievances, onOpenReportModal }: GrievanceFeedCardProps) {
  const [filter, setFilter] = useState<'ALL' | 'ESCALATED' | 'INVESTIGATING' | 'CORROBORATED'>('ALL')

  const filtered = grievances.filter((g) => {
    if (filter === 'ALL') return true
    if (filter === 'ESCALATED') return g.isEscalated
    if (filter === 'INVESTIGATING') return g.status === 'INVESTIGATING'
    if (filter === 'CORROBORATED') return g.status === 'CORROBORATED'
    return true
  })

  return (
    <div className="grievance-panel-card">
      <div className="grievance-header">
        <div className="flex-align-gap">
          <AlertCircle size={16} className="text-coral" />
          <h3 className="panel-title">PUBLIC GRIEVANCE FEED // LINE-ITEM ACCOUNTABILITY</h3>
        </div>

        <button
          type="button"
          onClick={onOpenReportModal}
          className="file-report-btn"
        >
          <Plus size={13} />
          <span>Report Undelivered Relief</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="grievance-filter-tabs">
        <button
          type="button"
          onClick={() => setFilter('ALL')}
          className={`gfilter-btn ${filter === 'ALL' ? 'active' : ''}`}
        >
          All Reports ({grievances.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('ESCALATED')}
          className={`gfilter-btn ${filter === 'ESCALATED' ? 'active' : ''}`}
        >
          Auto-Escalated ({grievances.filter((g) => g.isEscalated).length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('INVESTIGATING')}
          className={`gfilter-btn ${filter === 'INVESTIGATING' ? 'active' : ''}`}
        >
          Active SLA Clocks ({grievances.filter((g) => g.status === 'INVESTIGATING').length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('CORROBORATED')}
          className={`gfilter-btn ${filter === 'CORROBORATED' ? 'active' : ''}`}
        >
          Corroborated ({grievances.filter((g) => g.status === 'CORROBORATED').length})
        </button>
      </div>

      {/* Grievance Cards Feed */}
      <div className="grievance-items-feed">
        {filtered.map((item) => {
          const isEscalated = item.isEscalated
          const isInvestigating = item.status === 'INVESTIGATING'
          const isCorroborated = item.status === 'CORROBORATED'

          return (
            <div key={item.id} className={`grievance-card ${isEscalated ? 'escalated' : ''}`}>
              <div className="gcard-top-row">
                <div className="gcard-line-meta">
                  <span className="line-pill">{item.lineItemDescription.split('—')[0].trim()}</span>
                  <span className="dept-txt">{item.departmentName}</span>
                </div>

                <div className="gcard-status-badges">
                  {isEscalated ? (
                    <span className="sla-badge escalated">
                      <ShieldAlert size={10} className="mr-1 inline text-coral" />
                      <span>AUTO-ESCALATED: {item.escalationLevel}</span>
                    </span>
                  ) : (
                    <span className="sla-badge normal">
                      <Clock size={10} className="mr-1 inline text-yellow" />
                      <span>{item.hoursRemainingSla}h SLA REMAINING</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Location & Reporter Tag */}
              <div className="gcard-submeta-row">
                <span className="location-name">{item.locationName}</span>
                <span className="reporter-masked">Reported by: {item.reporterPhoneMasked}</span>
                <span className="report-time">{item.submissionTimestamp}</span>
              </div>

              {/* Multilingual Text Box */}
              <div className="gcard-complaint-box">
                {item.originalLanguage !== 'English' && (
                  <div className="original-lang-block">
                    <span className="lang-chip">{item.originalLanguage} Original:</span>
                    <p className="original-txt">"{item.originalText}"</p>
                  </div>
                )}

                <div className="translated-block">
                  <span className="lang-chip text-cyan">AI Triage Translation (English):</span>
                  <p className="translated-txt">"{item.translatedEnglishText}"</p>
                </div>
              </div>

              {/* Official Response Box (if present) */}
              {item.officerResponse && (
                <div className="official-response-box">
                  <div className="response-header">
                    <CheckCircle2 size={12} className="text-green mr-1 inline" />
                    <span className="officer-responder-title">{item.officerResponse.officerName}</span>
                    <span className="response-time">· {item.officerResponse.respondedAt}</span>
                  </div>
                  <p className="response-body">"{item.officerResponse.responseText}"</p>
                  {item.officerResponse.evidenceCid && (
                    <span className="evidence-cid-mono">EVIDENCE: {item.officerResponse.evidenceCid}</span>
                  )}
                </div>
              )}

              {/* On-Chain Anchor Footer */}
              <div className="gcard-footer-anchor">
                <div className="hash-wrap">
                  <span className="hash-lbl">POLYGON GRIEVANCE HASH:</span>
                  <span className="hash-val-mono">{item.grievanceTxHash}</span>
                </div>
                <span className="category-pill">{item.category.replace(/_/g, ' ')}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
