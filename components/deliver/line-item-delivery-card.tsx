'use client'

import { useState } from 'react'
import { DeliveryProofItem } from '@/lib/deliver-data'
import { CheckCircle2, Clock, Truck, ShieldCheck, MapPin, Hash, ExternalLink, ChevronDown, ChevronUp, FileCheck2, Camera } from 'lucide-react'

import { formatNumber } from '@/lib/format'
interface LineItemDeliveryCardProps {
  items: DeliveryProofItem[]
  onOpenAttachModal?: () => void
}

export function LineItemDeliveryCard({ items, onOpenAttachModal }: LineItemDeliveryCardProps) {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PROVEN' | 'IN_TRANSIT' | 'PENDING'>('ALL')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filteredItems = items.filter((item) => {
    if (statusFilter === 'ALL') return true
    if (statusFilter === 'PROVEN') return item.status === 'PROVEN'
    if (statusFilter === 'IN_TRANSIT') return item.status === 'IN_TRANSIT'
    if (statusFilter === 'PENDING') return item.status === 'PENDING_ATTESTATION'
    return true
  })

  return (
    <div className="delivery-lines-card">
      <div className="lines-header">
        <div className="flex-align-gap">
          <FileCheck2 size={16} className="text-cyan" />
          <h3 className="panel-title">DEPARTMENTAL DISBURSAL EXECUTION // PROOF OF DELIVERY</h3>
        </div>

        {onOpenAttachModal && (
          <button
            type="button"
            onClick={onOpenAttachModal}
            className="attach-evidence-btn"
          >
            <Camera size={12} />
            <span>Attach Field Evidence</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="delivery-filter-tabs">
        <button
          type="button"
          onClick={() => setStatusFilter('ALL')}
          className={`dfilter-tab ${statusFilter === 'ALL' ? 'active' : ''}`}
        >
          All Line Items ({items.length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('PROVEN')}
          className={`dfilter-tab ${statusFilter === 'PROVEN' ? 'active' : ''}`}
        >
          Delivery Proven ({items.filter((i) => i.status === 'PROVEN').length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('PENDING')}
          className={`dfilter-tab ${statusFilter === 'PENDING' ? 'active' : ''}`}
        >
          Pending Attestation ({items.filter((i) => i.status === 'PENDING_ATTESTATION').length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('IN_TRANSIT')}
          className={`dfilter-tab ${statusFilter === 'IN_TRANSIT' ? 'active' : ''}`}
        >
          In Transit ({items.filter((i) => i.status === 'IN_TRANSIT').length})
        </button>
      </div>

      {/* Main Delivery Items List */}
      <div className="delivery-items-list">
        {filteredItems.map((item) => {
          const isExpanded = expandedId === item.id
          const isProven = item.status === 'PROVEN'
          const isPending = item.status === 'PENDING_ATTESTATION'
          const isTransit = item.status === 'IN_TRANSIT'
          const pct = Math.round((item.quantityDelivered / item.totalTargetQuantity) * 100)

          return (
            <div key={item.id} className={`delivery-item-box ${item.status.toLowerCase()}`}>
              <div className="item-main-row">
                <div className="item-desc-col">
                  <div className="item-tag-row">
                    <span className="norm-code-tag">{item.normCode}</span>
                    <span className="item-location-tag">
                      <MapPin size={10} className="mr-1 inline text-cyan" />
                      <span>{item.locationName}</span>
                    </span>
                  </div>
                  <h4 className="item-title">{item.description}</h4>
                  <span className="item-dept">{item.departmentName}</span>
                </div>

                <div className="item-quantities-col">
                  <div className="qty-row">
                    <span className="qty-fraction">
                      <strong>{formatNumber(item.quantityDelivered)}</strong> / {formatNumber(item.totalTargetQuantity)} {item.unitLabel}
                    </span>
                    <span className="qty-pct">{pct}%</span>
                  </div>
                  <div className="item-progress-track">
                    <div
                      className={`item-progress-bar ${item.status.toLowerCase()}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="item-status-col">
                  <span className={`status-pill ${item.status.toLowerCase()}`}>
                    {isProven && <CheckCircle2 size={10} className="mr-1 inline text-green" />}
                    {isPending && <Clock size={10} className="mr-1 inline text-yellow" />}
                    {isTransit && <Truck size={10} className="mr-1 inline text-cyan" />}
                    <span>{isProven ? 'DELIVERY PROVEN' : isPending ? 'PENDING AUDIT' : 'IN TRANSIT'}</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="inspect-proof-btn"
                  >
                    <span>{isExpanded ? 'Hide Proof' : 'Inspect Evidence'}</span>
                    {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                  </button>
                </div>
              </div>

              {/* Expandable Evidence Drawer */}
              {isExpanded && (
                <div className="proof-drawer-expanded">
                  <div className="proof-details-grid">
                    <div className="pfield">
                      <span className="plbl">EVIDENCE TYPE</span>
                      <span className="pval text-cyan">{item.evidenceType.replace('_', ' ')}</span>
                    </div>

                    <div className="pfield">
                      <span className="plbl">VERIFIED GPS LOCATION</span>
                      <span className="pval text-mono">
                        {item.gpsCoords.lat.toFixed(4)}°N, {item.gpsCoords.lng.toFixed(4)}°E
                      </span>
                    </div>

                    <div className="pfield">
                      <span className="plbl">FIELD OFFICER ATTESTATION</span>
                      <span className="pval">{item.attestedBy}</span>
                    </div>

                    <div className="pfield">
                      <span className="plbl">ATTESTATION TIMESTAMP</span>
                      <span className="pval text-muted">{item.attestationTimestamp}</span>
                    </div>
                  </div>

                  <div className="proof-hashes-strip">
                    <div className="hash-chip">
                      <span className="hash-chip-lbl">IPFS EVIDENCE CID:</span>
                      <span className="hash-chip-mono">{item.ipfsHash}</span>
                    </div>

                    {item.evidenceTxHash && (
                      <div className="hash-chip">
                        <span className="hash-chip-lbl">POLYGON PROOF TX:</span>
                        <span className="hash-chip-mono text-cyan">{item.evidenceTxHash}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
