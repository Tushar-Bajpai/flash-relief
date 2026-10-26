'use client'

import { OfficerReviewer } from '@/lib/review-data'
import { ShieldCheck, Clock, CheckCircle2, AlertCircle, Key, PenTool, UserCheck } from 'lucide-react'

interface OfficerQuorumCardsProps {
  officers: OfficerReviewer[]
  onSignAsOfficer?: (officerId: string) => void
}

export function OfficerQuorumCards({ officers, onSignAsOfficer }: OfficerQuorumCardsProps) {
  const approvedCount = officers.filter((o) => o.status === 'APPROVED').length
  const isQuorumMet = approvedCount === officers.length

  return (
    <div className="quorum-panel-card">
      <div className="quorum-header-row">
        <div className="flex-align-gap">
          <UserCheck size={16} className="text-cyan" />
          <h3 className="panel-title">COMMITTEE REVIEW QUORUM // MULTI-OFFICER AUTHORIZATION</h3>
        </div>

        <div className={`quorum-badge ${isQuorumMet ? 'complete' : 'pending'}`}>
          <ShieldCheck size={12} className={isQuorumMet ? 'text-green' : 'text-yellow'} />
          <span>
            {approvedCount} OF {officers.length} OFFICERS APPROVED {isQuorumMet ? '(QUORUM COMPLETE)' : '(AWAITING FINAL CLEARANCE)'}
          </span>
        </div>
      </div>

      <div className="officers-cards-grid">
        {officers.map((officer) => {
          const isApproved = officer.status === 'APPROVED'
          const isPending = officer.status === 'PENDING'
          const isChanges = officer.status === 'CHANGES_REQUESTED'

          return (
            <div key={officer.id} className={`officer-card ${officer.status.toLowerCase()}`}>
              {/* Card Header with Officer Role & Status */}
              <div className="officer-card-top">
                <div className="officer-avatar-group">
                  <div className={`officer-avatar-disc ${officer.status.toLowerCase()}`}>
                    <span>{officer.avatarInitial}</span>
                  </div>
                  <div className="officer-title-col">
                    <h4 className="officer-name">{officer.name}</h4>
                    <span className="officer-role-text">{officer.role}</span>
                  </div>
                </div>

                <span className={`status-pill ${officer.status.toLowerCase()}`}>
                  {isApproved && <CheckCircle2 size={10} className="mr-1 inline" />}
                  {isPending && <Clock size={10} className="mr-1 inline" />}
                  {isChanges && <AlertCircle size={10} className="mr-1 inline" />}
                  <span>{officer.status}</span>
                </span>
              </div>

              {/* Department & Jurisdiction */}
              <div className="officer-jurisdiction-row">
                <span className="jurisdiction-label">DEPARTMENT:</span>
                <span className="jurisdiction-val">{officer.department}</span>
              </div>

              {/* Official Review Comment */}
              <div className="officer-comment-box">
                <p className="comment-text">"{officer.comment || 'Awaiting formal review...'}"</p>
                <div className="comment-timestamp">
                  <Clock size={10} className="text-muted" />
                  <span>{officer.timestamp}</span>
                </div>
              </div>

              {/* Cryptographic Key & Sign Action */}
              <div className="officer-signing-footer">
                <div className="key-snippet-col">
                  <span className="key-label">AUTHORITY PUBLIC KEY</span>
                  <span className="key-hash-mono">{officer.publicKey.slice(0, 10)}...{officer.publicKey.slice(-6)}</span>
                </div>

                {isPending && onSignAsOfficer && (
                  <button
                    type="button"
                    onClick={() => onSignAsOfficer(officer.id)}
                    className="officer-sign-btn"
                  >
                    <PenTool size={11} />
                    <span>Approve as Finance</span>
                  </button>
                )}

                {isApproved && (
                  <div className="signature-verified-pill">
                    <ShieldCheck size={11} className="text-green" />
                    <span>Signed: {officer.signatureHash}</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
