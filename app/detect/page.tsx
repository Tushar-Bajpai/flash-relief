'use client'

import { useState } from 'react'
import { AppHeader } from '@/components/layout/app-header'
import { ConsoleBar, ConsoleNextBar } from '@/components/layout/console-bar'
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
import { ArrowRight } from 'lucide-react'
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
        {/* Compact page header */}
        <ConsoleBar
          stage="01"
          name="Detect"
          accent="blue"
          title={
            <>
              Basin radar &amp; <em>lead-time proofs</em>
            </>
          }
          description={`${currentBasin.summary} Flood signals are scored continuously and every alert is timestamped on a public ledger before it reaches the news.`}
          stats={[
            {
              label: 'Alert status',
              value: currentBasin.alertStatus,
              tone: currentBasin.alertStatus === 'WARNING' ? 'coral' : currentBasin.alertStatus === 'WATCH' ? 'yellow' : 'green',
            },
            { label: 'Lead time before news', value: currentBasin.leadTime, tone: 'blue' },
            { label: 'Gauges over danger', value: currentBasin.dangerGaugesCount, tone: 'yellow' },
          ]}
        />

        {/* Officer command strip & replay control */}
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

        {/* Deep alert inspector: which signals fired and why */}
        {activeAlert && (
          <section className="detect-section">
            <AlertDetailInspector alert={activeAlert} />
          </section>
        )}

        {/* Multi-feed signal matrix & satellite confirmation */}
        <section className="detect-section">
          <div className="dual-matrix-grid">
            <SignalFusionMatrix selectedBasinId={selectedBasinId} />
            <SatelliteRadarInspector selectedBasinId={selectedBasinId} />
          </div>
        </section>

        <section className="detect-section">
          <PastEventsScorecard />
        </section>

        {/* Stage navigation */}
        <ConsoleNextBar
          backLabel="Overview"
          backHref="/"
          nextLabel="Stage 02 · Estimate & draft budget"
        >
          <Link
            href={`/estimate?basin=${selectedBasinId}&depth=1.45&pop=${activeAlert?.populationAtRisk || 48200}&area=${activeAlert?.inundationExtentSqKm || 142.8}`}
            className="primary-action"
          >
            <span>Open Stage 02</span>
            <ArrowRight size={16} />
          </Link>
        </ConsoleNextBar>
      </main>
    </div>
  )
}
