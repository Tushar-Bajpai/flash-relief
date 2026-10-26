'use client'

import { DisasterEventDossier } from '@/lib/events-data'
import { ShieldCheck, Clock, Share2, Download, ExternalLink, Radio, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'

import { formatNumber } from '@/lib/format'
interface EventHeroBannerProps {
  event: DisasterEventDossier
}

export function EventHeroBanner({ event }: EventHeroBannerProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(event, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `${event.eventCode}-audit-dossier.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  const deliveryPct = Math.round((event.totalProvenCrores / event.totalAllocatedCrores) * 100)

  return (
    <section className="event-hero-container">
      <div className="event-hero-top">
        <div className="event-title-wrap">
          <div className="stage-pill-row">
            <span className="stage-badge green">END-TO-END EVENT AUDIT DOSSIER</span>
            <span className="live-cadence-pill green">
              <Radio size={11} className="pulse-icon text-green" />
              <span>POLYGON POS BLOCK #{formatNumber(event.polygonBlockNumber)}</span>
            </span>
          </div>

          <h1 className="event-hero-title">
            {event.name} <br />
            <em>{event.state} · {event.district}</em>
          </h1>

          <p className="event-hero-desc">
            Complete lifecycle audit trail from early geophysical Doppler/gauge detection, through deterministic SDRF budget formulation and 3-of-3 officer consensus, to on-chain Polygon release and IPFS geotagged delivery proofs.
          </p>

          <div className="event-action-bar">
            <button
              type="button"
              onClick={handleShare}
              className="event-action-btn secondary"
            >
              <Share2 size={13} />
              <span>{copied ? 'Audit URL Copied!' : 'Share Audit Dossier'}</span>
            </button>

            <button
              type="button"
              onClick={handleExportJson}
              className="event-action-btn secondary"
            >
              <Download size={13} />
              <span>Export Ledger JSON</span>
            </button>

            <a
              href={`https://amoy.polygonscan.com/tx/${event.polygonTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="event-action-btn primary"
            >
              <span>Verify on Polygonscan</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </div>

        <div className="event-hero-metrics">
          <div className="hero-stat-card primary-deliver">
            <span className="stat-eyebrow">TOTAL SDRF ALLOCATION</span>
            <div className="stat-value-row">
              <span className="stat-huge-value text-green">₹{event.totalAllocatedCrores.toFixed(2)}</span>
              <span className="stat-unit">Crores</span>
            </div>
            <span className="stat-subtext">Approved by 3-of-3 statutory multi-sig quorum</span>
          </div>

          <div className="hero-stat-card">
            <span className="stat-eyebrow">DELIVERY PROVEN VALUE</span>
            <div className="stat-value-row">
              <span className="stat-huge-value text-cyan">₹{event.totalProvenCrores.toFixed(2)}</span>
              <span className="stat-unit">Crores ({deliveryPct}%)</span>
            </div>
            <span className="stat-subtext">{formatNumber(event.beneficiariesProven)} verified citizen beneficiaries</span>
          </div>

          <div className="hero-stat-card">
            <span className="stat-eyebrow">VERIFIED EARLY WARNING LEAD TIME</span>
            <div className="stat-value-row">
              <span className="stat-huge-value text-coral">+{event.leadTimeHours}h</span>
              <span className="stat-unit">ahead</span>
            </div>
            <span className="stat-subtext">Benchmarked against GDELT global media reports</span>
          </div>
        </div>
      </div>
    </section>
  )
}
