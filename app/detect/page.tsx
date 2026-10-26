'use client'

import { useState } from 'react'
import { AppHeader } from '@/components/layout/app-header'
import { DetectCommandHeader } from '@/components/detect/detect-command-header'
import { AlertsQueue } from '@/components/detect/alerts-queue'
import { AlertDetailInspector } from '@/components/detect/alert-detail-inspector'
import { BasinMapView } from '@/components/detect/basin-map-view'
import { GaugeTelemetryCard } from '@/components/detect/gauge-telemetry-card'
import { SignalFusionMatrix } from '@/components/detect/signal-fusion-matrix'
import { SatelliteRadarInspector } from '@/components/detect/satellite-radar-inspector'
import { PastEventsScorecard } from '@/components/detect/past-events-scorecard'
import {
  getBasinById,
  getGaugesForBasin,
  getAlertsForBasin,
  REPLAY_ARCHIVE_EVENTS,
  ReplayArchiveEvent,
} from '@/lib/detect-data'
import { ArrowRight, Radio, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

export default function DetectPage() {
  const [selectedBasinId, setSelectedBasinId] = useState('brahmaputra')
  const [selectedGaugeId, setSelectedGaugeId] = useState('dibrugarh')
  const [replayMode, setReplayMode] = useState(false)
  const [activeReplayEvent, setActiveReplayEvent] = useState<ReplayArchiveEvent>(REPLAY_ARCHIVE_EVENTS[0])

  const currentBasin = getBasinById(selectedBasinId)
  const currentGauges = getGaugesForBasin(selectedBasinId)
  const activeGauge = currentGauges.find((g) => g.id === selectedGaugeId) || currentGauges[0]

  const basinAlerts = getAlertsForBasin(selectedBasinId)
  const [selectedAlertId, setSelectedAlertId] = useState<string>(basinAlerts[0]?.id || 'alt-majuli-01')

  const activeAlert = basinAlerts.find((a) => a.id === selectedAlertId) || basinAlerts[0]

  const handleSelectBasin = (basinId: string) => {
    setSelectedBasinId(basinId)
    const targetBasin = getBasinById(basinId)
    setSelectedGaugeId(targetBasin.primaryGaugeId)
    const newAlerts = getAlertsForBasin(basinId)
    if (newAlerts.length > 0) {
      setSelectedAlertId(newAlerts[0].id)
    }
  }

  const handleSelectReplayEvent = (event: ReplayArchiveEvent) => {
    setActiveReplayEvent(event)
    if (event.id.includes('assam')) {
      handleSelectBasin('brahmaputra')
    } else if (event.id.includes('odisha')) {
      handleSelectBasin('mahanadi')
    }
  }

  return (
    <div className="product-page-shell">
      {/* Top Application Header */}
      <AppHeader />

      <main className="product-page-main">
        {/* Officer Command & Freshness Control Strip */}
        <section className="detect-command-section">
          <DetectCommandHeader
            selectedBasinId={selectedBasinId}
            onSelectBasin={handleSelectBasin}
            replayMode={replayMode}
            onToggleReplay={setReplayMode}
            activeReplayEvent={activeReplayEvent}
            onSelectReplayEvent={handleSelectReplayEvent}
          />
        </section>

        {/* Page Hero Identity Banner */}
        <section className="detect-hero-banner">
          <div className="detect-hero-left">
            <div className="stage-pill-row">
              <span className="stage-badge blue">STAGE 01 · MULTI-FEED HYDROLOGY & SATELLITE DETECTION</span>
              <span className="live-cadence-pill">
                <Radio size={11} className="pulse-icon text-coral" />
                <span>NASA GPM · CWC INDIA-WRIS · GLOFAS · SENTINEL-1</span>
              </span>
            </div>

            <h1 className="detect-hero-title">
              Basin Radar &<br />
              <em>Lead-Time Notary</em>
            </h1>

            <p className="detect-hero-desc">
              {currentBasin.summary} Every sensor anomaly is timestamped on Polygon PoS before mainstream news reporting.
            </p>
          </div>

          <div className="detect-hero-stats">
            <div className={`hero-stat-card primary ${currentBasin.alertStatus.toLowerCase()}`}>
              <span className="stat-eyebrow">MONITORED STATUS</span>
              <div className="stat-value-row">
                <span className={`stat-huge-value ${currentBasin.alertStatus === 'WARNING' ? 'text-coral' : currentBasin.alertStatus === 'WATCH' ? 'text-yellow' : 'text-green'}`}>
                  {currentBasin.alertStatus}
                </span>
                <span className={`stat-pill-tag ${currentBasin.alertStatus.toLowerCase()}`}>
                  {currentBasin.alertStatus === 'WARNING' ? 'CRITICAL ESCALATION' : currentBasin.alertStatus === 'WATCH' ? 'ELEVATED INFLOW' : 'NOMINAL'}
                </span>
              </div>
              <span className="stat-subtext">{currentBasin.confidence}% spatial fusion confidence</span>
            </div>

            <div className="hero-stat-card">
              <span className="stat-eyebrow">VERIFIED EARLY LEAD TIME</span>
              <div className="stat-value-row">
                <span className="stat-huge-value text-cyan">{currentBasin.leadTime.split(' ')[0]}</span>
                <span className="stat-unit">before news</span>
              </div>
              <span className="stat-subtext">Benchmarked against GDELT global news media</span>
            </div>

            <div className="hero-stat-card">
              <span className="stat-eyebrow">SURGING CWC GAUGES</span>
              <div className="stat-value-row">
                <span className="stat-huge-value text-yellow">
                  {currentBasin.dangerGaugesCount}
                </span>
                <span className="stat-unit">stations</span>
              </div>
              <span className="stat-subtext">Over Danger Level (86.90m)</span>
            </div>
          </div>
        </section>

        {/* Primary Command Grid: Map & Gauges (Left) vs Sub-basin Alert Queue (Right) */}
        <section className="detect-primary-command-grid">
          <div className="command-grid-left">
            <BasinMapView
              selectedBasinId={selectedBasinId}
              selectedGaugeId={selectedGaugeId}
              onSelectGauge={setSelectedGaugeId}
            />

            <div className="map-gauge-inline-wrapper">
              <GaugeTelemetryCard gauge={activeGauge} />
            </div>
          </div>

          <div className="command-grid-right">
            <AlertsQueue
              alerts={basinAlerts}
              selectedAlertId={selectedAlertId}
              onSelectAlert={setSelectedAlertId}
            />
          </div>
        </section>

        {/* Deep Alert Inspector Section: "Why It Fired", Tri-Chart, Hysteresis, Polygon Proof */}
        {activeAlert && (
          <section className="detect-section">
            <div className="section-eyebrow-row">
              <span className="subhead-eyebrow text-cyan">DEEP EXPLAINABILITY & TELEMETRY</span>
              <span className="badge-chip text-muted">LOGISTIC DECOMPOSITION (W_I × X_I)</span>
            </div>
            <AlertDetailInspector alert={activeAlert} />
          </section>
        )}

        {/* Multi-Feed Signal Matrix & Sentinel-1 SAR Radar Section */}
        <section className="detect-section">
          <div className="section-eyebrow-row">
            <span className="subhead-eyebrow text-yellow">SENSOR WEIGHTING & RADAR CONFIRMATION</span>
          </div>
          <div className="dual-matrix-grid">
            <SignalFusionMatrix selectedBasinId={selectedBasinId} />
            <SatelliteRadarInspector selectedBasinId={selectedBasinId} />
          </div>
        </section>

        {/* Public Audit & Past Events Scorecard (The Public Notebook proof) */}
        <section className="detect-section">
          <PastEventsScorecard />
        </section>

        {/* Next Stage Pipeline Handoff Banner */}
        <section className="stage-handoff-banner">
          <div className="handoff-content">
            <div className="handoff-left">
              <span className="handoff-eyebrow">STAGE 01 → STAGE 02 PIPELINE BRIDGE</span>
              <h2 className="handoff-title">Stage 02: AI Exposure Estimation & SDRF Budget Formulation</h2>
              <p className="handoff-desc">
                With early inundation confirmed across {activeAlert?.inundationExtentSqKm || 142.8} sq km in {activeAlert?.blockName || 'monitored basin'}, the hydrodynamic depth-damage model calculates exposed population, submerged crop hectares, and formulates an auditable SDRF relief draft.
              </p>
            </div>

            <Link
              href={`/estimate?basin=${selectedBasinId}&depth=1.45&pop=${activeAlert?.populationAtRisk || 48200}&area=${activeAlert?.inundationExtentSqKm || 142.8}`}
              className="primary-action pulse-glow"
            >
              <span>Open Stage 02: Estimate & Draft</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
