'use client'

import { TrendingUp, AlertOctagon, Droplets, Clock, Radio } from 'lucide-react'
import { RiverGauge } from '@/lib/detect-data'

import { formatNumber } from '@/lib/format'
interface GaugeTelemetryCardProps {
  gauge: RiverGauge
  onSelectGauge?: (gaugeId: string) => void
}

export function GaugeTelemetryCard({ gauge }: GaugeTelemetryCardProps) {
  const deltaFromDanger = gauge.currentLevel - gauge.dangerLevel
  const isOverDanger = deltaFromDanger >= 0
  const isSurging = gauge.status === 'SURGING'

  // Min and max for SVG hydrograph plotting
  const levels = gauge.history24h.map((h) => h.level)
  const minL = Math.min(...levels, gauge.warningLevel) - 0.4
  const maxL = Math.max(...levels, gauge.dangerLevel) + 0.4
  const range = maxL - minL

  // Generate SVG path for 24h curve
  const width = 380
  const height = 120
  const paddingX = 24
  const paddingY = 16

  const points = gauge.history24h.map((pt, idx) => {
    const x = paddingX + (idx / (gauge.history24h.length - 1)) * (width - paddingX * 2)
    const y = height - paddingY - ((pt.level - minL) / range) * (height - paddingY * 2)
    return { x, y, ...pt }
  })

  const pathD = points.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '')

  // Danger line Y
  const dangerY = height - paddingY - ((gauge.dangerLevel - minL) / range) * (height - paddingY * 2)
  // Warning line Y
  const warningY = height - paddingY - ((gauge.warningLevel - minL) / range) * (height - paddingY * 2)

  return (
    <div className={`gauge-card-box ${isSurging ? 'surging' : ''}`}>
      {/* Header Bar */}
      <div className="gauge-card-header">
        <div className="gauge-title-group">
          <div className="flex-align-gap">
            <span className={`gauge-status-dot ${gauge.status.toLowerCase()}`} />
            <h3 className="gauge-station-name">{gauge.name}</h3>
          </div>
          <span className="gauge-station-code">{gauge.stationCode} · {gauge.reach}</span>
        </div>

        <div className="gauge-status-badge-wrap">
          <span className={`status-badge ${gauge.status.toLowerCase()}`}>
            {isOverDanger && <AlertOctagon size={11} className="mr-1 inline" />}
            {isSurging ? 'SURGING RAPIDLY' : isOverDanger ? 'OVER DANGER' : 'NOMINAL'}
          </span>
        </div>
      </div>

      {/* Primary Level Indicator & Delta */}
      <div className="gauge-metrics-row">
        <div className="gauge-metric-main">
          <span className="metric-eyebrow">STAGE WATER LEVEL</span>
          <div className="metric-primary-val-row">
            <span className="metric-huge-val">{gauge.currentLevel.toFixed(2)}</span>
            <span className="metric-unit">meters</span>
          </div>

          <div className={`gauge-delta-pill ${isOverDanger ? 'danger' : 'safe'}`}>
            <TrendingUp size={13} />
            <span>
              {isOverDanger
                ? `+${deltaFromDanger.toFixed(2)}m ABOVE DANGER MARK`
                : `${Math.abs(deltaFromDanger).toFixed(2)}m below danger`}
            </span>
          </div>
        </div>

        <div className="gauge-submetrics-col">
          <div className="submetric-item">
            <span className="submetric-label">SURGE VELOCITY</span>
            <span className="submetric-val text-coral">+{gauge.rateOfRise} cm/hr</span>
          </div>

          <div className="submetric-item">
            <span className="submetric-label">RIVER DISCHARGE</span>
            <span className="submetric-val text-cyan">{formatNumber(gauge.dischargeCumecs)} cumec</span>
          </div>

          <div className="submetric-item">
            <span className="submetric-label">HIGHEST HISTORICAL (HFL)</span>
            <span className="submetric-val text-muted">{gauge.highestFloodLevel} m</span>
          </div>
        </div>
      </div>

      {/* 24-Hour Hydrograph SVG */}
      <div className="gauge-hydrograph-container">
        <div className="hydrograph-title-row">
          <div className="flex-align-gap">
            <Radio size={11} className="text-cyan pulse-icon" />
            <span className="hydro-title">24-HOUR STAGE HYDROGRAPH (HOURLY TELEMETRY)</span>
          </div>
          <div className="hydro-legend">
            <span className="legend-item danger-leg">Danger: {gauge.dangerLevel}m</span>
            <span className="legend-item warn-leg">Warning: {gauge.warningLevel}m</span>
          </div>
        </div>

        <div className="hydrograph-svg-wrapper">
          <svg viewBox={`0 0 ${width} ${height}`} className="hydro-svg" preserveAspectRatio="none">
            {/* Danger Mark Reference Line */}
            <line
              x1={paddingX}
              y1={dangerY}
              x2={width - paddingX}
              y2={dangerY}
              stroke="#ff785f"
              strokeDasharray="4 4"
              strokeWidth="1.2"
              opacity="0.65"
            />

            {/* Warning Mark Reference Line */}
            <line
              x1={paddingX}
              y1={warningY}
              x2={width - paddingX}
              y2={warningY}
              stroke="#f4c969"
              strokeDasharray="3 3"
              strokeWidth="1"
              opacity="0.45"
            />

            {/* Trend Curve Area Fill */}
            <path
              d={`${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`}
              fill="url(#hydroFillGradient)"
              opacity="0.25"
            />

            {/* Main Stage Line */}
            <path
              d={pathD}
              fill="none"
              stroke={isOverDanger ? '#ff785f' : '#00e5ff'}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Plot Points */}
            {points.map((pt, i) => (
              <circle
                key={i}
                cx={pt.x}
                cy={pt.y}
                r={i === points.length - 1 ? 4.5 : 2.5}
                fill={i === points.length - 1 ? (isOverDanger ? '#ff785f' : '#00e5ff') : '#eaf5f4'}
                stroke="#07171d"
                strokeWidth={1.5}
              />
            ))}

            <defs>
              <linearGradient id="hydroFillGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isOverDanger ? '#ff785f' : '#00e5ff'} stopOpacity="0.8" />
                <stop offset="100%" stopColor="#07171d" stopOpacity="0.0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* X-Axis Hour Labels */}
        <div className="hydro-axis-labels">
          {gauge.history24h.map((h, i) => (
            <span key={i} className={`axis-label ${i === gauge.history24h.length - 1 ? 'active' : ''}`}>
              {h.hour}
            </span>
          ))}
        </div>
      </div>

      {/* Footer Timestamp */}
      <div className="gauge-footer-meta">
        <Clock size={11} className="text-muted" />
        <span>Automated ultrasonic telemetry verified · {gauge.lastUpdated}</span>
      </div>
    </div>
  )
}
