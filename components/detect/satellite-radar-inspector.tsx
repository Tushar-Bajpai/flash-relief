'use client'

import { useState } from 'react'
import { Satellite, Radio, ShieldCheck, ExternalLink, ArrowRight, Layers, FileCheck } from 'lucide-react'
import Link from 'next/link'
import { SAR_PASS_METRICS, CRYPTOGRAPHIC_PROOF } from '@/lib/detect-data'

export function SatelliteRadarInspector() {
  const [activeLayer, setActiveLayer] = useState<'sar' | 'baseline' | 'mask'>('mask')

  return (
    <div className="sar-inspector-panel">
      {/* Header Bar */}
      <div className="sar-header-bar">
        <div className="flex-align-gap">
          <Satellite size={16} className="text-cyan" />
          <h3 className="panel-title">SENTINEL-1 SAR RADAR PIPELINE // ON-CHAIN PROOF</h3>
        </div>
        <span className="sar-orbit-tag">PASS: {SAR_PASS_METRICS.satellite} · ORBIT #{SAR_PASS_METRICS.orbitNumber}</span>
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
            <div className={`swath-imagery layer-${activeLayer}`}>
              <div className="swath-grid-crosshairs" />
              <div className="swath-inundation-highlight" />

              <div className="swath-overlay-stats">
                <span className="swath-stat-item">BACKSCATTER: {SAR_PASS_METRICS.currentBackscatterDb} dB</span>
                <span className="swath-stat-item text-coral">DELTA: {SAR_PASS_METRICS.deltaDb} dB DROP</span>
                <span className="swath-stat-item">OTSU: {SAR_PASS_METRICS.otsuThreshold} dB</span>
              </div>
            </div>

            <div className="swath-caption">
              <p>
                <strong>Microwave C-Band Radar:</strong> Unlike optical cameras, radar pulses penetrate monsoonal cloud cover 24/7. Water appears dark as radar reflects away, confirming standing water with a 4.2 dB drop vs historical dry baseline.
              </p>
            </div>
          </div>

          <div className="sar-quick-stats">
            <div className="quick-stat-box">
              <span className="qstat-lbl">DETECTED WATER EXTENT</span>
              <span className="qstat-val text-cyan">{SAR_PASS_METRICS.detectedWaterAreaSqKm} sq km</span>
            </div>
            <div className="quick-stat-box">
              <span className="qstat-lbl">POLARISATION</span>
              <span className="qstat-val">{SAR_PASS_METRICS.polarisation}</span>
            </div>
            <div className="quick-stat-box">
              <span className="qstat-lbl">CONFIRMATION LEVEL</span>
              <span className="qstat-val text-green">{SAR_PASS_METRICS.confidenceLevel}%</span>
            </div>
          </div>
        </div>

        {/* Cryptographic Proof & GDELT Lead Time Card */}
        <div className="crypto-proof-card">
          <div className="proof-header">
            <ShieldCheck size={16} className="text-green" />
            <span className="proof-title-mono">PROVABLE LEAD TIME // ON-CHAIN ANCHOR</span>
          </div>

          {/* Verified Lead Time Highlight Banner */}
          <div className="lead-time-banner">
            <span className="lead-time-eyebrow">VERIFIED EARLY DETECTION LEAD TIME</span>
            <div className="lead-time-huge-row">
              <span className="lead-time-number text-coral">+{CRYPTOGRAPHIC_PROOF.verifiedLeadTimeHours}</span>
              <span className="lead-time-unit">hours ahead of news</span>
            </div>
            <p className="lead-time-explain">
              Alert fingerprint anchored to public chain at <strong>04:18 UTC</strong>. First GDELT global news media report emerged at <strong>15:45 UTC</strong>.
            </p>
          </div>

          {/* Cryptographic Ledger Breakdown */}
          <div className="proof-hashes-list">
            <div className="hash-item">
              <span className="hash-lbl">ALERT IDENTIFIER</span>
              <span className="hash-mono text-cyan">{CRYPTOGRAPHIC_PROOF.alertId}</span>
            </div>

            <div className="hash-item">
              <span className="hash-lbl">POLYGON BLOCK NUMBER</span>
              <span className="hash-mono">#{CRYPTOGRAPHIC_PROOF.detectionBlockNumber.toLocaleString()}</span>
            </div>

            <div className="hash-item">
              <span className="hash-lbl">STATE MERKLE ROOT</span>
              <span className="hash-mono text-break">{CRYPTOGRAPHIC_PROOF.stateMerkleRoot}</span>
            </div>

            <div className="hash-item">
              <span className="hash-lbl">DETECTION TX HASH</span>
              <span className="hash-mono text-break text-cyan">{CRYPTOGRAPHIC_PROOF.detectionTxHash}</span>
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
