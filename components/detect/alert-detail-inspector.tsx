'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ShieldAlert,
  AlertTriangle,
  Eye,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  Satellite,
  Waves,
  CloudRain,
  Activity,
  Layers,
  History,
  FileSpreadsheet,
  AlertOctagon,
} from 'lucide-react'
import { SubBasinAlert } from '@/lib/detect-data'

import { formatNumber } from '@/lib/format'
interface AlertDetailInspectorProps {
  alert: SubBasinAlert
}

export function AlertDetailInspector({ alert }: AlertDetailInspectorProps) {
  const [activeTab, setActiveTab] = useState<'why-it-fired' | 'telemetry-charts' | 'hysteresis' | 'on-chain'>('why-it-fired')
  const [falseAlarmFlagged, setFalseAlarmFlagged] = useState(false)

  const isEligibleForBudget = alert.level === 'WARNING' || alert.level === 'CONFIRMED'
  const probPercent = Math.round(alert.probability * 100)

  return (
    <div className="alert-detail-card">
      {/* Alert Banner Lockup */}
      <div className={`detail-top-banner ${alert.level.toLowerCase()}`}>
        <div className="banner-badge-group">
          <div className="severity-badge-row">
            <span className={`status-pill ${alert.level.toLowerCase()}`}>
              {alert.level === 'CONFIRMED' && <ShieldAlert size={14} />}
              {alert.level === 'WARNING' && <AlertTriangle size={14} />}
              {alert.level === 'WATCH' && <Eye size={14} />}
              {alert.level === 'CLEAR' && <CheckCircle2 size={14} />}
              <span>{alert.level} ALERT ESCALATION</span>
            </span>

            <span className="lead-time-pill">
              <Clock size={12} className="text-cyan" />
              <span>EXPECTED CREST: {alert.expectedPeak}</span>
            </span>
          </div>

          <h2 className="detail-entity-name">{alert.blockName}</h2>
          <p className="detail-district-text">
            {alert.district} · Primary Gauge: <strong>{alert.primaryGaugeName}</strong> · Hydrodynamic Basin Grid #48
          </p>
        </div>

        <div className="banner-stats-quad">
          <div className="stat-tile">
            <span className="stat-label">FLOOD PROBABILITY</span>
            <div className="stat-number-row">
              <span className={`stat-number ${alert.level.toLowerCase()}`}>
                {alert.probability.toFixed(2)}
              </span>
              <span className="stat-percent-badge">{probPercent}%</span>
            </div>
            <span className="stat-hint">Logistic multi-feed fusion</span>
          </div>

          <div className="stat-tile">
            <span className="stat-label">INUNDATION EXTENT</span>
            <span className="stat-number text-cyan">{alert.inundationExtentSqKm}</span>
            <span className="stat-hint">sq km modeled surface</span>
          </div>

          <div className="stat-tile">
            <span className="stat-label">POPULATION AT RISK</span>
            <span className="stat-number text-ink">{formatNumber(alert.populationAtRisk)}</span>
            <span className="stat-hint">Census 2021 + WorldPop</span>
          </div>

          <div className="stat-tile">
            <span className="stat-label">SAR RADAR PROOF</span>
            <span className={`stat-number ${alert.satelliteConfirmed ? 'text-green' : 'text-yellow'}`}>
              {alert.satelliteConfirmed ? 'CONFIRMED' : 'PENDING'}
            </span>
            <span className="stat-hint">{alert.satellitePassTime.split(' ')[0]}</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="detail-tabs-bar">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'why-it-fired' ? 'active' : ''}`}
          onClick={() => setActiveTab('why-it-fired')}
        >
          <Activity size={14} />
          <span>Why It Fired (Decomposition)</span>
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'telemetry-charts' ? 'active' : ''}`}
          onClick={() => setActiveTab('telemetry-charts')}
        >
          <Waves size={14} />
          <span>Tri-Chart Telemetry</span>
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'hysteresis' ? 'active' : ''}`}
          onClick={() => setActiveTab('hysteresis')}
        >
          <History size={14} />
          <span>Hysteresis Timeline</span>
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'on-chain' ? 'active' : ''}`}
          onClick={() => setActiveTab('on-chain')}
        >
          <Layers size={14} />
          <span>Polygon Proof Stamp</span>
        </button>
      </div>

      {/* Tab 1: Why It Fired (Feature Attribution Bars) */}
      {activeTab === 'why-it-fired' && (
        <div className="tab-pane why-it-fired-pane">
          <div className="pane-intro">
            <h4 className="pane-title">Logistic Model Attribution Breakdown (w_i × x_i)</h4>
            <p className="pane-desc">
              To prevent unexplainable black-box alarms, FlashRelief breaks down the calculated probability into individual physical hydrological contributions. Each factor shows its mathematical weight times normalized input reading.
            </p>
          </div>

          <div className="contribution-bars-list">
            {alert.whyItFired.map((item, idx) => (
              <div key={idx} className="contrib-item">
                <div className="contrib-top-row">
                  <div className="factor-title-box">
                    <span className="factor-name">{item.factor}</span>
                    <span className="factor-source">({item.source})</span>
                  </div>
                  <div className="factor-values">
                    <span className="factor-reading">{item.rawReading}</span>
                    <span className={`contrib-chip ${item.status.toLowerCase()}`}>
                      +{item.contribution.toFixed(2)} ({item.percentage}%)
                    </span>
                  </div>
                </div>

                <div className="contrib-track">
                  <div
                    className={`contrib-fill ${item.status.toLowerCase()}`}
                    style={{ width: `${item.percentage * 2}%` }}
                  />
                </div>

                <p className="factor-explanation">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Tri-Chart Telemetry (Gauge vs Danger, 72h Rain, GloFAS) */}
      {activeTab === 'telemetry-charts' && (
        <div className="tab-pane telemetry-pane">
          <div className="charts-grid-triple">
            {/* Chart 1: Gauge vs Danger */}
            <div className="telemetry-chart-box">
              <div className="chart-header">
                <span className="chart-eyebrow">CWC HYDROGRAPH</span>
                <h5 className="chart-title">Water Level vs Danger Mark</h5>
              </div>

              <div className="gauge-svg-chart">
                <svg viewBox="0 0 400 160" className="chart-svg">
                  {/* Grid Lines */}
                  <line x1="40" y1="20" x2="380" y2="20" stroke="rgba(234,245,244,0.06)" />
                  <line x1="40" y1="60" x2="380" y2="60" stroke="rgba(234,245,244,0.06)" />
                  <line x1="40" y1="100" x2="380" y2="100" stroke="rgba(234,245,244,0.06)" />
                  <line x1="40" y1="140" x2="380" y2="140" stroke="rgba(234,245,244,0.12)" />

                  {/* Danger Line (Red dashed) */}
                  <line x1="40" y1="45" x2="380" y2="45" stroke="#ff785f" strokeDasharray="4 4" strokeWidth="1.5" />
                  <text x="45" y="40" fill="#ff785f" fontSize="10" fontWeight="600">
                    DANGER LEVEL: {alert.gaugeDangerLevelMeters}m
                  </text>

                  {/* Warning Line (Yellow dashed) */}
                  <line x1="40" y1="75" x2="380" y2="75" stroke="#f4c969" strokeDasharray="4 4" strokeWidth="1.5" />
                  <text x="45" y="70" fill="#f4c969" fontSize="10" fontWeight="600">
                    WARNING LEVEL: {alert.gaugeWarningLevelMeters}m
                  </text>

                  {/* Stage Hydrograph Trend Line */}
                  <path
                    d="M 40 125 Q 120 120 180 95 T 280 50 T 380 32"
                    fill="none"
                    stroke="#00e5ff"
                    strokeWidth="2.5"
                  />

                  {/* Gradient Area under curve */}
                  <path
                    d="M 40 125 Q 120 120 180 95 T 280 50 T 380 32 L 380 140 L 40 140 Z"
                    fill="rgba(0, 229, 255, 0.12)"
                  />

                  {/* Current Pin */}
                  <circle cx="380" cy="32" r="4.5" fill="#00e5ff" />
                  <circle cx="380" cy="32" r="9" fill="none" stroke="#00e5ff" strokeWidth="1" opacity="0.6" />
                </svg>
              </div>

              <div className="chart-caption-row">
                <span className="caption-left">Current Stage: <strong>{alert.gaugeStageMeters}m</strong></span>
                <span className="caption-right text-coral">+0.50m Above Danger</span>
              </div>
            </div>

            {/* Chart 2: 72h Rain Accumulation */}
            <div className="telemetry-chart-box">
              <div className="chart-header">
                <span className="chart-eyebrow">NASA GPM IMERG</span>
                <h5 className="chart-title">72h Catchment Rainfall Pulse</h5>
              </div>

              <div className="rain-svg-chart">
                <svg viewBox="0 0 400 160" className="chart-svg">
                  {/* Rain Bars */}
                  {[
                    { x: 50, h: 25, val: '12mm', t: 'T-72' },
                    { x: 95, h: 40, val: '22mm', t: 'T-60' },
                    { x: 140, h: 65, val: '38mm', t: 'T-48' },
                    { x: 185, h: 90, val: '54mm', t: 'T-36' },
                    { x: 230, h: 120, val: '72mm', t: 'T-24' },
                    { x: 275, h: 135, val: '86mm', t: 'T-12' },
                    { x: 320, h: 145, val: '98mm', t: 'Now' },
                  ].map((bar, i) => (
                    <g key={i}>
                      <rect
                        x={bar.x}
                        y={140 - bar.h}
                        width="24"
                        height={bar.h}
                        rx="3"
                        fill="url(#rainGradient)"
                      />
                      <text x={bar.x + 12} y={155} fill="rgba(234,245,244,0.6)" fontSize="9" textAnchor="middle">
                        {bar.t}
                      </text>
                    </g>
                  ))}

                  <defs>
                    <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#0077b6" stopOpacity="0.4" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <div className="chart-caption-row">
                <span className="caption-left">Accumulation: <strong>{alert.rain72hMm} mm</strong></span>
                <span className="caption-right text-cyan">95th Percentile Event</span>
              </div>
            </div>

            {/* Chart 3: GloFAS 30-Day Discharge */}
            <div className="telemetry-chart-box">
              <div className="chart-header">
                <span className="chart-eyebrow">OPEN-METEO GLOFAS V4</span>
                <h5 className="chart-title">Ensemble Discharge Projection</h5>
              </div>

              <div className="discharge-svg-chart">
                <svg viewBox="0 0 400 160" className="chart-svg">
                  {/* Return Period Line */}
                  <line x1="40" y1="40" x2="380" y2="40" stroke="#f4c969" strokeDasharray="3 3" strokeWidth="1" />
                  <text x="45" y="35" fill="#f4c969" fontSize="9">
                    10-YEAR RETURN FLOW (12,500 m³/s)
                  </text>

                  {/* Ensemble Spread (P10 to P90) */}
                  <path
                    d="M 40 120 Q 150 110 220 50 Q 280 30 380 90 L 380 130 Q 280 80 220 85 Q 150 130 40 135 Z"
                    fill="rgba(244, 201, 105, 0.15)"
                  />

                  {/* Median Line */}
                  <path
                    d="M 40 125 Q 150 120 220 65 Q 280 45 380 110"
                    fill="none"
                    stroke="#f4c969"
                    strokeWidth="2"
                  />

                  <circle cx="280" cy="45" r="4" fill="#ff785f" />
                  <text x="270" y="32" fill="#ff785f" fontSize="9" fontWeight="700">
                    CREST: 14,280 m³/s
                  </text>
                </svg>
              </div>

              <div className="chart-caption-row">
                <span className="caption-left">Peak Flow: <strong>{formatNumber(alert.glofasDischargeCumecs)} m³/s</strong></span>
                <span className="caption-right text-coral">Crest in 11.4 Hours</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Hysteresis Timeline */}
      {activeTab === 'hysteresis' && (
        <div className="tab-pane hysteresis-pane">
          <div className="pane-intro">
            <h4 className="pane-title">Anti-Flicker State Progression Timeline</h4>
            <p className="pane-desc">
              FlashRelief implements temporal hysteresis filters requiring 2 consecutive sensor windows to upgrade alert level, preventing nuisance alarms from transitory signal spikes.
            </p>
          </div>

          <div className="hysteresis-timeline-list">
            {alert.hysteresis.map((step, i) => (
              <div key={i} className="timeline-step">
                <div className="step-left-marker">
                  <span className={`step-dot ${step.level.toLowerCase()}`} />
                  {i < alert.hysteresis.length - 1 && <span className="step-line" />}
                </div>

                <div className="step-content">
                  <div className="step-header">
                    <span className={`step-badge ${step.level.toLowerCase()}`}>{step.level}</span>
                    <span className="step-time">{step.timestamp} ({step.hoursAgo})</span>
                  </div>
                  <p className="step-trigger">{step.trigger}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: On-Chain Proof Stamp (The Public Notebook) */}
      {activeTab === 'on-chain' && (
        <div className="tab-pane on-chain-pane">
          <div className="pane-intro">
            <h4 className="pane-title">Polygon PoS Public Notebook Record</h4>
            <p className="pane-desc">
              This detection event was cryptographically sealed on the Polygon blockchain before mainstream media coverage. Any citizen or auditor can verify that the alert timestamp was not backdated.
            </p>
          </div>

          <div className="proof-details-card">
            <div className="proof-row">
              <span className="proof-label">DETECTION STATE HASH</span>
              <code className="proof-code">{alert.detectionHash}</code>
            </div>
            <div className="proof-row">
              <span className="proof-label">POLYGON TRANSACTION HASH</span>
              <div className="proof-code-with-link">
                <code className="proof-code">{alert.polygonTxHash}</code>
                <a
                  href={`https://polygonscan.com/tx/${alert.polygonTxHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="tx-explorer-link"
                >
                  <span>PolygonScan</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
            <div className="proof-row-duo">
              <div className="sub-proof">
                <span className="proof-label">POLYGON BLOCK NUMBER</span>
                <span className="proof-value text-cyan">#{alert.blockNumber}</span>
              </div>
              <div className="sub-proof">
                <span className="proof-label">BLOCK TIMESTAMP</span>
                <span className="proof-value text-ink">{alert.timestamp}</span>
              </div>
              <div className="sub-proof">
                <span className="proof-label">SATELLITE SAR WATER MASK</span>
                <span className="proof-value text-green">{alert.waterMaskSqKm} km²</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Bridge Action Bar */}
      <div className="detail-action-footer">
        <div className="footer-left-status">
          {isEligibleForBudget ? (
            <div className="eligibility-notice active">
              <CheckCircle2 size={15} className="text-coral" />
              <span>
                <strong>Threshold Reached ({alert.level})</strong>: Authorized to trigger deterministic SDRF relief budget formulation.
              </span>
            </div>
          ) : (
            <div className="eligibility-notice pending">
              <AlertOctagon size={15} className="text-yellow" />
              <span>
                <strong>Monitoring Baseline ({alert.level})</strong>: Stage 02 Budget Formulation unlocks automatically upon reaching WARNING status.
              </span>
            </div>
          )}
        </div>

        <div className="footer-right-buttons">
          <button
            type="button"
            className={`secondary-btn ${falseAlarmFlagged ? 'flagged' : ''}`}
            onClick={() => setFalseAlarmFlagged(!falseAlarmFlagged)}
          >
            <span>{falseAlarmFlagged ? 'Flagged for Review' : 'Mark False Alarm'}</span>
          </button>

          {isEligibleForBudget ? (
            <Link
              href={`/estimate?basin=${alert.basinId}&depth=1.45&pop=${alert.populationAtRisk}&area=${alert.inundationExtentSqKm}`}
              className="primary-action-btn pulse-glow"
            >
              <span>Start SDRF Budget Draft</span>
              <ArrowRight size={16} />
            </Link>
          ) : (
            <button
              type="button"
              className="primary-action-btn disabled"
              disabled
              title="Budget drafting requires WARNING or CONFIRMED alert level"
            >
              <span>Budget Draft Locked</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
