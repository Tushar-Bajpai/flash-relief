'use client'

import { useState } from 'react'
import { ExposureMetrics, PercentileChoice } from '@/lib/estimate-data'
import { Droplets, Users, Home, Wheat, Tent, Sliders, TrendingUp, Info } from 'lucide-react'

import { formatNumber } from '@/lib/format'
interface DepthExposureSliderProps {
  exposure: ExposureMetrics
  waterDepth: number
  percentile: PercentileChoice
  onDepthChange: (depth: number) => void
  onPercentileChange: (p: PercentileChoice) => void
}

export function DepthExposureSlider({
  exposure,
  waterDepth,
  percentile,
  onDepthChange,
  onPercentileChange,
}: DepthExposureSliderProps) {
  // SVG Curve Dimensions
  const svgWidth = 520
  const svgHeight = 110
  const paddingX = 24
  const paddingY = 16

  // Generate SVG path for JRC Depth-Damage non-linear curve (0.5m to 3.5m)
  const curvePoints = [
    { d: 0.5, damage: 0.12 },
    { d: 1.0, damage: 0.28 },
    { d: 1.5, damage: 0.52 },
    { d: 1.8, damage: 0.68 },
    { d: 2.2, damage: 0.84 },
    { d: 2.8, damage: 0.94 },
    { d: 3.5, damage: 0.99 },
  ]

  const mappedPoints = curvePoints.map((pt) => {
    const x = paddingX + ((pt.d - 0.5) / (3.5 - 0.5)) * (svgWidth - paddingX * 2)
    const y = svgHeight - paddingY - pt.damage * (svgHeight - paddingY * 2)
    return { x, y, ...pt }
  })

  const pathD = mappedPoints.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '')

  // Current operating point on the curve
  const currentNormDepth = Math.max(0.5, Math.min(3.5, waterDepth))
  const currentDamageFraction = Math.min(1.0, Math.max(0.1, (currentNormDepth - 0.3) / 2.4))
  const currentX = paddingX + ((currentNormDepth - 0.5) / (3.5 - 0.5)) * (svgWidth - paddingX * 2)
  const currentY = svgHeight - paddingY - currentDamageFraction * (svgHeight - paddingY * 2)

  return (
    <div className="depth-slider-card">
      <div className="depth-card-header">
        <div className="flex-align-gap">
          <Sliders size={16} className="text-cyan" />
          <h3 className="panel-title">HYDRODYNAMIC DEPTH RASTER // EXPOSURE CONTROLLER</h3>
        </div>

        {/* Percentile Selector Tabs */}
        <div className="percentile-toggle-group">
          <span className="percentile-label">UNCERTAINTY BOUND:</span>
          {(['P10', 'P50', 'P90'] as PercentileChoice[]).map((p) => {
            const isSelected = percentile === p
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPercentileChange(p)}
                className={`percentile-tab-btn ${isSelected ? 'active' : ''}`}
                aria-pressed={isSelected}
              >
                <span>{p}</span>
                <span className="p-subtext">
                  {p === 'P10' ? 'Conservative' : p === 'P50' ? 'Expected' : 'Worst-Case'}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="depth-slider-body">
        {/* Left Side: Water Depth Control Slider */}
        <div className="slider-control-pane">
          <div className="slider-label-row">
            <span className="slider-caption">MEAN FLOODWATER INUNDATION DEPTH</span>
            <div className="depth-value-display">
              <span className="depth-num text-coral">{waterDepth.toFixed(1)}</span>
              <span className="depth-unit">meters</span>
            </div>
          </div>

          <div className="slider-range-wrapper">
            <input
              type="range"
              min="0.5"
              max="3.2"
              step="0.1"
              value={waterDepth}
              onChange={(e) => onDepthChange(parseFloat(e.target.value))}
              className="styled-depth-slider"
              aria-label="Flood inundation depth in meters"
            />
            <div className="slider-ticks">
              <span>0.5m (Waterlogging)</span>
              <span>1.8m (Current Crest)</span>
              <span>3.2m (Embankment Overtopping)</span>
            </div>
          </div>

          {/* SVG JRC Depth-Damage Function Preview */}
          <div className="depth-curve-preview">
            <div className="curve-header-row">
              <span className="curve-title">JRC VULNERABILITY DEPTH-DAMAGE CURVE</span>
              <span className="curve-legend">Fraction: {(currentDamageFraction * 100).toFixed(0)}% asset loss</span>
            </div>

            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="curve-svg" preserveAspectRatio="none">
              <defs>
                <linearGradient id="curveFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff785f" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#07171d" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Area Under Curve */}
              <path
                d={`${pathD} L ${mappedPoints[mappedPoints.length - 1].x} ${svgHeight - paddingY} L ${mappedPoints[0].x} ${svgHeight - paddingY} Z`}
                fill="url(#curveFill)"
              />

              {/* Base Curve Line */}
              <path
                d={pathD}
                fill="none"
                stroke="#00e5ff"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* Current Operating Point Indicator */}
              <circle
                cx={currentX}
                cy={currentY}
                r="6"
                fill="#ff785f"
                stroke="#ffffff"
                strokeWidth="2"
              />

              <line
                x1={currentX}
                y1={currentY}
                x2={currentX}
                y2={svgHeight - paddingY}
                stroke="#ff785f"
                strokeDasharray="3 3"
                strokeWidth="1.2"
                opacity="0.8"
              />
            </svg>
          </div>
        </div>

        {/* Right Side: 4 Real-time Geospatial Exposure Tiles */}
        <div className="exposure-tiles-grid">
          {/* Displaced Citizens */}
          <div className="exposure-tile primary">
            <div className="tile-top">
              <Users size={16} className="text-coral" />
              <span className="tile-eyebrow">DISPLACED POPULATION</span>
            </div>
            <div className="tile-val-row">
              <span className="tile-huge-val text-coral">{formatNumber(exposure.displacedPopulation)}</span>
              <span className="tile-unit">citizens</span>
            </div>
            <span className="tile-desc">
              Out of {formatNumber(exposure.exposedPopulation)} exposed (WorldPop grid)
            </span>
          </div>

          {/* Damaged Dwellings */}
          <div className="exposure-tile">
            <div className="tile-top">
              <Home size={16} className="text-yellow" />
              <span className="tile-eyebrow">DAMAGED HOUSING UNITS</span>
            </div>
            <div className="tile-val-row">
              <span className="tile-huge-val text-yellow">{formatNumber(exposure.damagedDwellingsTotal)}</span>
              <span className="tile-unit">units</span>
            </div>
            <span className="tile-desc">
              {formatNumber(exposure.dwellingsDestroyed)} destroyed · {formatNumber(exposure.dwellingsPartial)} partial
            </span>
          </div>

          {/* Submerged Cropland */}
          <div className="exposure-tile">
            <div className="tile-top">
              <Wheat size={16} className="text-green" />
              <span className="tile-eyebrow">INUNDATED CROPLAND</span>
            </div>
            <div className="tile-val-row">
              <span className="tile-huge-val text-green">{formatNumber(exposure.croplandInundatedHa)}</span>
              <span className="tile-unit">hectares</span>
            </div>
            <span className="tile-desc">
              Standing Sali paddy · {formatNumber(exposure.croplandSiltedHa)} ha sand silted
            </span>
          </div>

          {/* Camp Feeding Days */}
          <div className="exposure-tile">
            <div className="tile-top">
              <Tent size={16} className="text-cyan" />
              <span className="tile-eyebrow">CAMP DURATION</span>
            </div>
            <div className="tile-val-row">
              <span className="tile-huge-val text-cyan">{exposure.campDays}</span>
              <span className="tile-unit">feeding days</span>
            </div>
            <span className="tile-desc">
              Based on CWC recession rate & drainage capacity
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
