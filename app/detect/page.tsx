'use client'

import { useState } from 'react'
import { AppHeader } from '@/components/layout/app-header'
import { BasinSelector } from '@/components/detect/basin-selector'
import { BasinMapView } from '@/components/detect/basin-map-view'
import { GaugeTelemetryCard } from '@/components/detect/gauge-telemetry-card'
import { SignalFusionMatrix } from '@/components/detect/signal-fusion-matrix'
import { SatelliteRadarInspector } from '@/components/detect/satellite-radar-inspector'
import { getBasinById, getGaugesForBasin } from '@/lib/detect-data'
import { ArrowRight, ShieldCheck, Activity, Radio, Satellite, AlertTriangle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function DetectPage() {
  const [selectedBasinId, setSelectedBasinId] = useState('brahmaputra')
  const [selectedGaugeId, setSelectedGaugeId] = useState('dibrugarh')

  const currentBasin = getBasinById(selectedBasinId)
  const currentGauges = getGaugesForBasin(selectedBasinId)
  const activeGauge = currentGauges.find((g) => g.id === selectedGaugeId) || currentGauges[0]

  const handleSelectBasin = (basinId: string) => {
    setSelectedBasinId(basinId)
    const targetBasin = getBasinById(basinId)
    setSelectedGaugeId(targetBasin.primaryGaugeId)
  }

  const isWarning = currentBasin.alertStatus === 'WARNING'
  const isWatch = currentBasin.alertStatus === 'WATCH'

  return (
    <div className="product-page-shell">
      {/* Top Application Navigation */}
      <AppHeader />

      <main className="product-page-main">
        {/* Page Hero Header */}
        <section className="detect-hero-banner">
          <div className="detect-hero-left">
            <div className="stage-pill-row">
              <span className="stage-badge blue">STAGE 01 · EARLY DETECTION & HYDROLOGY SYNTHESIS</span>
              <span className="live-cadence-pill">
                <Radio size={11} className="pulse-icon text-coral" />
                <span>30-MIN SENSOR INGEST CADENCE</span>
              </span>
            </div>

            <h1 className="detect-hero-title">
              Basin Intelligence &<br />
              <em>Satellite Confirmation</em>
            </h1>

            <p className="detect-hero-desc">
              {currentBasin.summary}
            </p>
          </div>

          <div className="detect-hero-stats">
            <div className={`hero-stat-card primary ${currentBasin.alertStatus.toLowerCase()}`}>
              <span className="stat-eyebrow">ALERT STATUS</span>
              <div className="stat-value-row">
                <span className={`stat-huge-value ${isWarning ? 'text-coral' : isWatch ? 'text-yellow' : 'text-green'}`}>
                  {currentBasin.alertStatus}
                </span>
                <span className={`stat-pill-tag ${currentBasin.alertStatus.toLowerCase()}`}>
                  {isWarning ? 'ACTIVE SURGE' : isWatch ? 'ELEVATED INFLOW' : 'MONITORING'}
                </span>
              </div>
              <span className="stat-subtext">{currentBasin.confidence}% spatial confidence bounds</span>
            </div>

            <div className="hero-stat-card">
              <span className="stat-eyebrow">VERIFIED LEAD TIME</span>
              <div className="stat-value-row">
                <span className="stat-huge-value text-cyan">{currentBasin.leadTime.split(' ')[0]}</span>
                <span className="stat-unit">{currentBasin.leadTime.includes('before') ? 'before news' : 'nominal baseline'}</span>
              </div>
              <span className="stat-subtext">Benchmarked against GDELT global media</span>
            </div>

            <div className="hero-stat-card">
              <span className="stat-eyebrow">CRITICAL GAUGES</span>
              <div className="stat-value-row">
                <span className={`stat-huge-value ${isWarning ? 'text-yellow' : isWatch ? 'text-cyan' : 'text-muted'}`}>
                  {currentBasin.dangerGaugesCount}
                </span>
                <span className="stat-unit">stations</span>
              </div>
              <span className="stat-subtext">
                {isWarning ? 'Surging above danger mark' : isWatch ? 'Exceeding warning threshold' : 'Operating within safe limits'}
              </span>
            </div>
          </div>
        </section>

        {/* Basin Catchment Selector */}
        <section className="detect-section">
          <BasinSelector
            selectedBasinId={selectedBasinId}
            onSelectBasin={handleSelectBasin}
          />
        </section>

        {/* Split Section: Catchment Map & Gauge Telemetry */}
        <section className="detect-map-gauge-grid">
          <div className="grid-left-map">
            <BasinMapView
              selectedBasinId={selectedBasinId}
              selectedGaugeId={selectedGaugeId}
              onSelectGauge={setSelectedGaugeId}
            />
          </div>

          <div className="grid-right-gauge">
            <GaugeTelemetryCard gauge={activeGauge} />
          </div>
        </section>

        {/* Full-Width Section: Signal Fusion Algorithm Matrix */}
        <section className="detect-section">
          <SignalFusionMatrix selectedBasinId={selectedBasinId} />
        </section>

        {/* Full-Width Section: Sentinel-1 SAR Radar & Cryptographic Timestamp Proof */}
        <section className="detect-section">
          <SatelliteRadarInspector selectedBasinId={selectedBasinId} />
        </section>

        {/* Next Stage Navigation Handoff Bar */}
        <section className="stage-handoff-banner">
          <div className="handoff-content">
            <div className="handoff-left">
              <span className="handoff-eyebrow">NEXT IN PIPELINE</span>
              <h2 className="handoff-title">Stage 02: AI Exposure Estimation & SDRF Budget Formulation</h2>
              <p className="handoff-desc">
                With early inundation confirmed across {selectedBasinId === 'brahmaputra' ? '34.8 sq km' : selectedBasinId === 'mahanadi' ? '14.2 sq km' : 'monitored lowlands'}, the hydrodynamic damage model now calculates exposed population, damaged cropland, and generates a draft relief budget formulated against official SDRF norms.
              </p>
            </div>

            <Link href="/estimate" className="primary-action">
              <span>Open Stage 02: Estimate & Draft</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
