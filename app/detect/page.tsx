'use client'

import { useState, useEffect, useCallback } from 'react'
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
  RiverGauge,
  SubBasinAlert,
} from '@/lib/detect-data'
import { ArrowRight, Radio, RefreshCw, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

export default function DetectPage() {
  const [selectedBasinId, setSelectedBasinId] = useState('brahmaputra')
  const [selectedGaugeId, setSelectedGaugeId] = useState('dibrugarh')
  const [replayMode, setReplayMode] = useState(false)
  const [activeReplayEvent, setActiveReplayEvent] = useState<ReplayArchiveEvent>(REPLAY_ARCHIVE_EVENTS[0])

  // Real-time telemetry state from Open-Meteo & GDELT
  const [liveTelemetry, setLiveTelemetry] = useState<any>(null)
  const [isLoadingTelemetry, setIsLoadingTelemetry] = useState(false)
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>('Live Connected')

  const currentBasin = getBasinById(selectedBasinId)
  const currentGauges = getGaugesForBasin(selectedBasinId)
  const activeGauge = currentGauges.find((g) => g.id === selectedGaugeId) || currentGauges[0]

  const basinAlerts = getAlertsForBasin(selectedBasinId)
  const [selectedAlertId, setSelectedAlertId] = useState<string>(basinAlerts[0]?.id || 'alt-majuli-01')
  const activeAlert = basinAlerts.find((a) => a.id === selectedAlertId) || basinAlerts[0]

  const fetchLiveTelemetry = useCallback(async (basinId: string, replay: boolean) => {
    setIsLoadingTelemetry(true)
    try {
      const res = await fetch(`/api/detect/telemetry?subBasinId=${basinId}&replay=${replay}`)
      if (res.ok) {
        const data = await res.json()
        setLiveTelemetry(data)
        setLastUpdatedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
      }
    } catch (err) {
      console.warn('[DetectPage] Failed to fetch live telemetry:', err)
    } finally {
      setIsLoadingTelemetry(false)
    }
  }, [])

  useEffect(() => {
    fetchLiveTelemetry(selectedBasinId, replayMode)
  }, [selectedBasinId, replayMode, fetchLiveTelemetry])

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

  // Augment active gauge with real-time Open-Meteo telemetry readings when available
  const displayGauge: RiverGauge = liveTelemetry?.liveTelemetry
    ? {
        ...activeGauge,
        currentLevel: liveTelemetry.liveTelemetry.currentStageM || activeGauge.currentLevel,
        dischargeCumecs: liveTelemetry.liveTelemetry.maxDischargeCms || activeGauge.dischargeCumecs,
        lastUpdated: `Live (${liveTelemetry.freshness?.fetchLatencyMs || 210}ms Open-Meteo)`,
        history24h:
          liveTelemetry.telemetrySeries && liveTelemetry.telemetrySeries.length > 0
            ? liveTelemetry.telemetrySeries.map((t: any) => ({
                hour: t.date,
                level: t.stageM,
              }))
            : activeGauge.history24h,
      }
    : activeGauge

  // Augment active alert with real-time explainable feature contributions
  const displayAlert: SubBasinAlert = liveTelemetry
    ? {
        ...activeAlert,
        level: liveTelemetry.alertLevel || activeAlert.level,
        probability: liveTelemetry.probability || activeAlert.probability,
        rain72hMm: liveTelemetry.liveTelemetry?.past72hRainMm || activeAlert.rain72hMm,
        glofasDischargeCumecs: liveTelemetry.liveTelemetry?.maxDischargeCms || activeAlert.glofasDischargeCumecs,
        inundationExtentSqKm: liveTelemetry.inundationExtentKm2 || activeAlert.inundationExtentSqKm,
        whyItFired:
          liveTelemetry.featureContributions && liveTelemetry.featureContributions.length > 0
            ? liveTelemetry.featureContributions.map((fc: any) => ({
                factor: fc.feature,
                source: fc.feature.includes('Rain')
                  ? 'Open-Meteo & NASA GPM'
                  : fc.feature.includes('GloFAS')
                  ? 'Open-Meteo GloFAS v4'
                  : fc.feature.includes('Topsoil')
                  ? 'Open-Meteo Soil VWC'
                  : 'CWC India-WRIS Acoustic',
                rawReading: fc.rawMetric,
                weight: parseFloat(fc.weight) || 0.25,
                contribution: parseFloat(fc.weight) || 0.25,
                percentage: fc.contributionPct,
                status: fc.contributionPct >= 28 ? 'CRITICAL' : fc.contributionPct >= 12 ? 'ELEVATED' : 'NOMINAL',
                description: fc.description,
              }))
            : activeAlert.whyItFired,
      }
    : activeAlert

  const currentStatus = liveTelemetry?.alertLevel || currentBasin.alertStatus
  const currentConfidence = liveTelemetry?.confidenceScore
    ? Math.round(liveTelemetry.confidenceScore * 100)
    : currentBasin.confidence
  const currentLeadTime = liveTelemetry?.leadTimeHours ? `+${liveTelemetry.leadTimeHours}h` : currentBasin.leadTime.split(' ')[0]

  return (
    <div className="product-page-shell">
      {/* Top Application Header */}
      <AppHeader />

      <main className="product-page-main">
        {/* Officer command strip & replay control */}
        <section className="detect-command-section">
          <DetectCommandHeader
            selectedBasinId={selectedBasinId}
            onSelectBasin={handleSelectBasin}
            replayMode={replayMode}
            onToggleReplay={setReplayMode}
            activeReplayEvent={activeReplayEvent}
            onSelectReplayEvent={handleSelectReplayEvent}
            liveTelemetry={liveTelemetry}
            isLoadingTelemetry={isLoadingTelemetry}
            onRefreshTelemetry={() => fetchLiveTelemetry(selectedBasinId, replayMode)}
            lastUpdatedTime={lastUpdatedTime}
          />
        </section>

        {/* Page Hero Identity Banner */}
        <section className="detect-hero-banner">
          <div className="detect-hero-left">
            <div className="stage-pill-row flex-wrap items-center gap-2">
              <span className="stage-badge blue">STAGE 01 · MULTI-FEED HYDROLOGY & SATELLITE DETECTION</span>
              <span className="live-cadence-pill">
                <Radio size={11} className={`pulse-icon ${liveTelemetry?.sources?.weather?.live ? 'text-cyan' : 'text-coral'}`} />
                <span>{liveTelemetry?.sources?.weather?.live ? 'OPEN-METEO GLOFAS & WEATHER LIVE' : 'NASA GPM · CWC · GLOFAS'}</span>
              </span>
              <button
                type="button"
                onClick={() => fetchLiveTelemetry(selectedBasinId, replayMode)}
                disabled={isLoadingTelemetry}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-mono tracking-wider text-cyan bg-cyan/10 border border-cyan/30 rounded-full hover:bg-cyan/20 transition-all disabled:opacity-50 cursor-pointer"
                title="Refresh real-time Open-Meteo & GDELT feeds"
              >
                <RefreshCw size={10} className={isLoadingTelemetry ? 'animate-spin' : ''} />
                <span>{isLoadingTelemetry ? 'SYNCING...' : `SYNC LIVE (${lastUpdatedTime})`}</span>
              </button>
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
            <div className={`hero-stat-card primary ${currentStatus.toLowerCase()}`}>
              <span className="stat-eyebrow">MONITORED STATUS</span>
              <div className="stat-value-row">
                <span
                  className={`stat-huge-value ${
                    currentStatus === 'CONFIRMED' || currentStatus === 'WARNING'
                      ? 'text-coral'
                      : currentStatus === 'WATCH'
                      ? 'text-yellow'
                      : 'text-green'
                  }`}
                >
                  {currentStatus}
                </span>
                <span className={`stat-pill-tag ${currentStatus.toLowerCase()}`}>
                  {currentStatus === 'CONFIRMED'
                    ? 'CONFIRMED INUNDATION'
                    : currentStatus === 'WARNING'
                    ? 'CRITICAL ESCALATION'
                    : currentStatus === 'WATCH'
                    ? 'ELEVATED INFLOW'
                    : 'NOMINAL'}
                </span>
              </div>
              <span className="stat-subtext">{currentConfidence}% spatial fusion confidence</span>
            </div>

            <div className="hero-stat-card">
              <span className="stat-eyebrow">VERIFIED EARLY LEAD TIME</span>
              <div className="stat-value-row">
                <span className="stat-huge-value text-cyan">{currentLeadTime}</span>
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
              <span className="stat-subtext">Over Danger Level ({displayGauge.dangerLevel}m)</span>
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
              onSelectBasin={handleSelectBasin}
              liveTelemetry={liveTelemetry}
            />

            <div className="map-gauge-inline-wrapper">
              <GaugeTelemetryCard gauge={displayGauge} />
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
        {displayAlert && (
          <section className="detect-section">
            <div className="section-eyebrow-row">
              <span className="subhead-eyebrow text-cyan">DEEP EXPLAINABILITY & TELEMETRY</span>
              <span className="badge-chip text-muted">LOGISTIC DECOMPOSITION (W_I × X_I)</span>
            </div>
            <AlertDetailInspector alert={displayAlert} />
          </section>
        )}

        {/* Multi-feed signal matrix & satellite confirmation */}
        <section className="detect-section">
          <div className="dual-matrix-grid">
            <SignalFusionMatrix selectedBasinId={selectedBasinId} liveTelemetry={liveTelemetry} />
            <SatelliteRadarInspector selectedBasinId={selectedBasinId} liveTelemetry={liveTelemetry} />
          </div>
        </section>

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
                With early inundation confirmed across {displayAlert?.inundationExtentSqKm || 142.8} sq km in {displayAlert?.blockName || currentBasin.name}, the hydrodynamic depth-damage model calculates exposed population, submerged crop hectares, and formulates an auditable SDRF relief draft.
              </p>
            </div>

            <Link
              href={`/estimate?basin=${selectedBasinId}&depth=${displayAlert?.level === 'CONFIRMED' ? 1.85 : 1.45}&pop=${displayAlert?.populationAtRisk || 48200}&area=${displayAlert?.inundationExtentSqKm || 142.8}`}
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

