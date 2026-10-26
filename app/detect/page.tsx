'use client'

import { useState } from 'react'
import { AppHeader } from '@/components/layout/app-header'
import { BasinSelector } from '@/components/detect/basin-selector'
import { BasinMapView } from '@/components/detect/basin-map-view'
import { GaugeTelemetryCard } from '@/components/detect/gauge-telemetry-card'
import { SignalFusionMatrix } from '@/components/detect/signal-fusion-matrix'
import { SatelliteRadarInspector } from '@/components/detect/satellite-radar-inspector'
import { RIVER_GAUGES } from '@/lib/detect-data'
import { ArrowRight, ShieldCheck, Activity, Radio, Satellite } from 'lucide-react'
import Link from 'next/link'

export default function DetectPage() {
  const [selectedBasinId, setSelectedBasinId] = useState('brahmaputra')
  const [selectedGaugeId, setSelectedGaugeId] = useState('dibrugarh')

  const activeGauge = RIVER_GAUGES.find((g) => g.id === selectedGaugeId) || RIVER_GAUGES[0]

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
              FlashRelief pairs upstream Central Water Commission ultrasonic gauges, IMD gridded Doppler rainfall nowcasts, and Copernicus GloFAS discharge forecasts with Sentinel-1 Synthetic Aperture Radar (SAR) to identify flood crests hours before waters breach embankments.
            </p>
          </div>

          <div className="detect-hero-stats">
            <div className="hero-stat-card primary">
              <span className="stat-eyebrow">ALERT STATUS</span>
              <div className="stat-value-row">
                <span className="stat-huge-value text-coral">WARNING</span>
                <span className="stat-pill-tag">ACTIVE</span>
              </div>
              <span className="stat-subtext">94.6% spatial confidence bounds</span>
            </div>

            <div className="hero-stat-card">
              <span className="stat-eyebrow">VERIFIED LEAD TIME</span>
              <div className="stat-value-row">
                <span className="stat-huge-value text-cyan">+11.4h</span>
                <span className="stat-unit">before news</span>
              </div>
              <span className="stat-subtext">Benchmarked against GDELT global media</span>
            </div>

            <div className="hero-stat-card">
              <span className="stat-eyebrow">CRITICAL GAUGES</span>
              <div className="stat-value-row">
                <span className="stat-huge-value text-yellow">3 of 4</span>
                <span className="stat-unit">stations</span>
              </div>
              <span className="stat-subtext">Surging above danger mark</span>
            </div>
          </div>
        </section>

        {/* Basin Catchment Selector */}
        <section className="detect-section">
          <BasinSelector
            selectedBasinId={selectedBasinId}
            onSelectBasin={setSelectedBasinId}
          />
        </section>

        {/* Split Section: Catchment Map & Gauge Telemetry */}
        <section className="detect-map-gauge-grid">
          <div className="grid-left-map">
            <BasinMapView
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
          <SignalFusionMatrix />
        </section>

        {/* Full-Width Section: Sentinel-1 SAR Radar & Cryptographic Timestamp Proof */}
        <section className="detect-section">
          <SatelliteRadarInspector />
        </section>

        {/* Next Stage Navigation Handoff Bar */}
        <section className="stage-handoff-banner">
          <div className="handoff-content">
            <div className="handoff-left">
              <span className="handoff-eyebrow">NEXT IN PIPELINE</span>
              <h2 className="handoff-title">Stage 02: AI Exposure Estimation & SDRF Budget Formulation</h2>
              <p className="handoff-desc">
                With early inundation confirmed across 34 sq km, the hydrodynamic damage model now calculates exposed population, damaged cropland, and generates a draft relief budget formulated against official SDRF norms.
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
