'use client'

import { useState } from 'react'
import { Satellite, Radio, ShieldCheck, ExternalLink, ArrowRight, Layers, FileCheck, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { getSarMetricsForBasin, getCryptoProofForBasin, getBasinById } from '@/lib/detect-data'

import { formatNumber } from '@/lib/format'
interface SatelliteRadarInspectorProps {
  selectedBasinId?: string
}

export function SatelliteRadarInspector({ selectedBasinId = 'brahmaputra' }: SatelliteRadarInspectorProps) {
  const [activeLayer, setActiveLayer] = useState<'sar' | 'baseline' | 'mask'>('mask')

  const sarMetrics = getSarMetricsForBasin(selectedBasinId)
  const cryptoProof = getCryptoProofForBasin(selectedBasinId)
  const basin = getBasinById(selectedBasinId)

  const isWarning = basin.alertStatus === 'WARNING'
  const isWatch = basin.alertStatus === 'WATCH'

  return (
    <div className="sar-inspector-panel">
      {/* Header Bar */}
      <div className="sar-header-bar">
        <div className="flex-align-gap">
          <Satellite size={16} className="text-cyan" />
          <h3 className="panel-title">SENTINEL-1 SAR RADAR PIPELINE // ON-CHAIN PROOF</h3>
        </div>
        <span className="sar-orbit-tag">
          PASS: {sarMetrics.satellite} · ORBIT #{sarMetrics.orbitNumber} ({sarMetrics.passType})
        </span>
      </div>

      {/* Main Grid: Left is Radar Swath Visualizer, Right is Cryptographic Timestamp */}
      <div className="sar-inspector-grid">
        {/* Radar Swath Interactive Panel */}
        <div className="sar-swath-card">
          <div className="swath-layer-selector">
            <button
              type="button"
              onClick={() => setActiveLayer('mask')}
              className={`swath-tab-btn ${activeLayer === 'mask' ? 'active' : ''}`}
            >
              <span>Fused Water Mask</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveLayer('sar')}
              className={`swath-tab-btn ${activeLayer === 'sar' ? 'active' : ''}`}
            >
              <span>SAR Raw (VV+VH)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveLayer('baseline')}
              className={`swath-tab-btn ${activeLayer === 'baseline' ? 'active' : ''}`}
            >
              <span>Dry Baseline</span>
            </button>
          </div>

          {/* Visual Swath Canvas Simulation */}
          <div className="swath-canvas-frame">
            <div className={`swath-imagery layer-${activeLayer} basin-${selectedBasinId}`}>
              <div className="swath-grid-crosshairs" />
              <div
                className={`swath-inundation-highlight ${isWarning ? 'warning' : isWatch ? 'watch' : 'nominal'}`}
                style={{
                  opacity: activeLayer === 'mask' ? 0.85 : activeLayer === 'sar' ? 0.5 : 0.15,
                }}
              />

              <div className="swath-overlay-stats">
                <span className="swath-stat-item">BACKSCATTER: {sarMetrics.currentBackscatterDb} dB</span>
                <span className={`swath-stat-item ${sarMetrics.deltaDb < -3 ? 'text-coral' : sarMetrics.deltaDb < -1 ? 'text-yellow' : 'text-cyan'}`}>
                  DELTA: {sarMetrics.deltaDb} dB {sarMetrics.deltaDb < 0 ? 'DROP' : 'NOMINAL'}
                </span>
                <span className="swath-stat-item">OTSU: {sarMetrics.otsuThreshold} dB</span>
              </div>
            </div>

            <div className="swath-caption">
              <p>
                <strong>Microwave C-Band Radar ({sarMetrics.satellite}):</strong> Unlike optical cameras, radar pulses penetrate monsoonal cloud cover 24/7. Water appears dark as radar reflects specularly away. {isWarning ? `Significant ${Math.abs(sarMetrics.deltaDb)} dB backscatter drop confirms widespread inundation across ${sarMetrics.detectedWaterAreaSqKm} sq km.` : isWatch ? `Localized ${Math.abs(sarMetrics.deltaDb)} dB drop indicates initial ponding in riverbank depressions.` : 'Backscatter values match historical dry seasonal norms with zero detected water expansion.'}
              </p>
            </div>
          </div>

          <div className="sar-quick-stats">
            <div className="quick-stat-box">
              <span className="qstat-lbl">DETECTED WATER EXTENT</span>
              <span className={`qstat-val ${isWarning ? 'text-coral' : isWatch ? 'text-yellow' : 'text-cyan'}`}>
                {sarMetrics.detectedWaterAreaSqKm} sq km
              </span>
            </div>
            <div className="quick-stat-box">
              <span className="qstat-lbl">POLARISATION</span>
              <span className="qstat-val">{sarMetrics.polarisation}</span>
            </div>
            <div className="quick-stat-box">
              <span className="qstat-lbl">CONFIRMATION LEVEL</span>
              <span className={`qstat-val ${isWarning ? 'text-green' : isWatch ? 'text-yellow' : 'text-muted'}`}>
                {sarMetrics.confidenceLevel}%
              </span>
            </div>
          </div>
        </div>

        {/* Cryptographic Proof & GDELT Lead Time Card */}
        <div className="crypto-proof-card">
          <div className="proof-header">
            <ShieldCheck size={16} className={isWarning ? 'text-green' : isWatch ? 'text-yellow' : 'text-cyan'} />
            <span className="proof-title-mono">PROVABLE LEAD TIME // ON-CHAIN ANCHOR</span>
          </div>

          {/* Verified Lead Time Highlight Banner */}
          <div className="lead-time-banner">
            <span className="lead-time-eyebrow">VERIFIED EARLY DETECTION LEAD TIME</span>
            <div className="lead-time-huge-row">
              {cryptoProof.verifiedLeadTimeHours > 0 ? (
                <>
                  <span className="lead-time-number text-coral">+{cryptoProof.verifiedLeadTimeHours}</span>
                  <span className="lead-time-unit">hours ahead of news</span>
                </>
              ) : (
                <>
                  <span className="lead-time-number text-cyan">NOMINAL</span>
                  <span className="lead-time-unit">monitoring baseline</span>
                </>
              )}
            </div>
            <p className="lead-time-explain">
              {cryptoProof.verifiedLeadTimeHours > 0 ? (
                <>
                  Alert fingerprint anchored to public chain at <strong>{cryptoProof.detectionTimestamp.split(' ')[1]} UTC</strong>. First GDELT global news media report emerged at <strong>{cryptoProof.gdeltFirstNewsTimestamp.split(' ')[1]} UTC</strong>.
                </>
              ) : (
                <>
                  Periodic state telemetry fingerprint anchored to public chain at <strong>{cryptoProof.detectionTimestamp}</strong>. Zero news alert required.
                </>
              )}
            </p>
          </div>

          {/* Cryptographic Ledger Breakdown */}
          <div className="proof-hashes-list">
            <div className="hash-item">
              <span className="hash-lbl">ALERT IDENTIFIER</span>
              <span className="hash-mono text-cyan">{cryptoProof.alertId}</span>
            </div>

            <div className="hash-item">
              <span className="hash-lbl">POLYGON BLOCK NUMBER</span>
              <span className="hash-mono">#{formatNumber(cryptoProof.detectionBlockNumber)}</span>
            </div>

            <div className="hash-item">
              <span className="hash-lbl">STATE MERKLE ROOT</span>
              <span className="hash-mono text-break">{cryptoProof.stateMerkleRoot}</span>
            </div>

            <div className="hash-item">
              <span className="hash-lbl">DETECTION TX HASH</span>
              <span className="hash-mono text-break text-cyan">{cryptoProof.detectionTxHash}</span>
            </div>
          </div>

          {/* Action to proceed to Stage 2 */}
          <div className="proof-action-footer">
            <Link href="/estimate" className="stage-next-action">
              <span>Proceed to Stage 02: Estimate & Draft Budget</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
