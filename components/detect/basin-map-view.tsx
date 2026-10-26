'use client'

import { useState } from 'react'
import { Layers, Eye, ShieldAlert, Waves, MapPin, Maximize2 } from 'lucide-react'
import { RIVER_GAUGES, RiverGauge } from '@/lib/detect-data'

interface BasinMapViewProps {
  selectedGaugeId: string
  onSelectGauge: (gaugeId: string) => void
}

export function BasinMapView({ selectedGaugeId, onSelectGauge }: BasinMapViewProps) {
  const [showSarMask, setShowSarMask] = useState(true)
  const [showContours, setShowContours] = useState(true)

  return (
    <div className="basin-map-viewport">
      {/* Map Control Overlay Header */}
      <div className="basin-map-top-bar">
        <div className="map-title-wrap">
          <span className="live-dot" />
          <span className="mono-subhead">BRAHMAPUTRA CATCHMENT // SPATIAL SENSOR TWIN</span>
        </div>

        <div className="map-layer-toggles">
          <button
            type="button"
            onClick={() => setShowSarMask(!showSarMask)}
            className={`layer-btn ${showSarMask ? 'active' : ''}`}
            aria-pressed={showSarMask}
          >
            <Waves size={12} />
            <span>Sentinel-1 SAR Mask</span>
          </button>

          <button
            type="button"
            onClick={() => setShowContours(!showContours)}
            className={`layer-btn ${showContours ? 'active' : ''}`}
            aria-pressed={showContours}
          >
            <Layers size={12} />
            <span>Contour Grid</span>
          </button>
        </div>
      </div>

      {/* SVG Interactive Catchment Schematic Canvas */}
      <div className="basin-svg-container">
        <svg viewBox="0 0 900 520" className="basin-schematic-svg" preserveAspectRatio="xMidYMid meet">
          <defs>
            {/* Terrain Background Gradient */}
            <radialGradient id="catchmentGrad" cx="50%" cy="50%" r="65%">
              <stop offset="0%" stopColor="#0b2229" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#07171d" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#040e12" stopOpacity="1" />
            </radialGradient>

            {/* River Flow Water Gradient */}
            <linearGradient id="riverFlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.9" />
              <stop offset="40%" stopColor="#1992a7" stopOpacity="0.85" />
              <stop offset="75%" stopColor="#ff785f" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#00e5ff" stopOpacity="0.9" />
            </linearGradient>

            {/* Flood Inundation Mask Gradient */}
            <radialGradient id="floodMaskGrad" cx="45%" cy="42%" r="55%">
              <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.55" />
              <stop offset="45%" stopColor="#08384d" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#07171d" stopOpacity="0.0" />
            </radialGradient>

            {/* Pulsing Danger Ping Filter */}
            <filter id="glowEffect" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Catchment Base Surface */}
          <rect width="900" height="520" fill="url(#catchmentGrad)" rx="16" />

          {/* Terrain Elevation Contour Lines (Low-lying Basins) */}
          {showContours && (
            <g className="elevation-contours" opacity="0.35">
              <ellipse cx="460" cy="270" rx="420" ry="210" fill="none" stroke="#72d9e8" strokeWidth="0.8" strokeDasharray="3 6" />
              <ellipse cx="440" cy="265" rx="350" ry="170" fill="none" stroke="#72d9e8" strokeWidth="0.8" strokeDasharray="3 6" />
              <ellipse cx="410" cy="260" rx="270" ry="130" fill="none" stroke="#72d9e8" strokeWidth="1" strokeDasharray="4 4" />
              <ellipse cx="370" cy="255" rx="190" ry="90" fill="none" stroke="#ff785f" strokeWidth="1" strokeDasharray="2 3" opacity="0.7" />
            </g>
          )}

          {/* Sentinel-1 SAR Radar Inundated Water Extent Polygons */}
          {showSarMask && (
            <g className="sar-flood-extent" filter="url(#glowEffect)">
              {/* Valley Inundation Polygon 1 (Upper Reach / Dibrugarh Floodplain) */}
              <path
                d="M 120 180 Q 180 150 240 170 T 310 210 Q 280 250 220 240 T 130 210 Z"
                fill="url(#floodMaskGrad)"
                stroke="#00e5ff"
                strokeWidth="1.2"
                opacity="0.75"
              />
              {/* Valley Inundation Polygon 2 (Central Valley / Kaziranga - Tezpur) */}
              <path
                d="M 330 210 Q 420 190 510 230 T 560 280 Q 480 310 400 290 T 340 250 Z"
                fill="url(#floodMaskGrad)"
                stroke="#ff785f"
                strokeWidth="1.4"
                opacity="0.85"
              />
              {/* Water Mask Polygon 3 (Lower Reach / Guwahati Inundation) */}
              <path
                d="M 570 280 Q 640 290 710 330 T 770 380 Q 720 410 650 390 T 580 340 Z"
                fill="url(#floodMaskGrad)"
                stroke="#00e5ff"
                strokeWidth="1.2"
                opacity="0.65"
              />
            </g>
          )}

          {/* Brahmaputra River Course Path */}
          <path
            d="M 80 140 C 180 170, 260 190, 350 220 C 440 250, 520 270, 600 310 C 680 350, 760 380, 840 430"
            fill="none"
            stroke="url(#riverFlowGrad)"
            strokeWidth="18"
            strokeLinecap="round"
            opacity="0.9"
          />

          {/* River Stream Centerline Glow */}
          <path
            d="M 80 140 C 180 170, 260 190, 350 220 C 440 250, 520 270, 600 310 C 680 350, 760 380, 840 430"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeDasharray="8 12"
            opacity="0.6"
          />

          {/* Tributary Streams (Dihang, Subansiri, Kopili) */}
          <path d="M 220 60 Q 250 120 280 190" fill="none" stroke="#00e5ff" strokeWidth="3" opacity="0.6" strokeDasharray="3 3" />
          <path d="M 460 110 Q 470 170 480 250" fill="none" stroke="#00e5ff" strokeWidth="3" opacity="0.6" strokeDasharray="3 3" />
          <path d="M 640 460 Q 630 390 620 320" fill="none" stroke="#ff785f" strokeWidth="2.5" opacity="0.65" />

          {/* Interactive CWC Gauge Station Node Pins */}
          {RIVER_GAUGES.map((gauge, idx) => {
            // Screen coordinates along the river path
            const coords = [
              { x: 190, y: 175 }, // Dibrugarh
              { x: 420, y: 242 }, // Tezpur
              { x: 615, y: 318 }, // Guwahati
              { x: 775, y: 395 }, // Dhubri
            ][idx]

            const isSelected = selectedGaugeId === gauge.id
            const isDanger = gauge.status === 'SURGING' || gauge.status === 'OVER_DANGER'
            const pinColor = isDanger ? '#ff785f' : '#00e5ff'

            return (
              <g
                key={gauge.id}
                transform={`translate(${coords.x}, ${coords.y})`}
                onClick={() => onSelectGauge(gauge.id)}
                style={{ cursor: 'pointer' }}
                className="gauge-map-node"
              >
                {/* Outer Expanding Pulse Ring for Critical Gauges */}
                {isDanger && (
                  <circle
                    r="22"
                    fill="none"
                    stroke={pinColor}
                    strokeWidth="1.2"
                    className="pulse-ping-ring"
                    opacity="0.5"
                  />
                )}

                {/* Selection Halo */}
                {isSelected && (
                  <circle
                    r="16"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="2"
                    strokeDasharray="3 3"
                  />
                )}

                {/* Core Pin Disc */}
                <circle
                  r="9"
                  fill="#07171d"
                  stroke={pinColor}
                  strokeWidth="3"
                />

                <circle
                  r="4"
                  fill={pinColor}
                />

                {/* Station Monospace Label Tooltip Box */}
                <g transform="translate(14, -18)">
                  <rect
                    width="120"
                    height="32"
                    rx="6"
                    fill="rgba(7, 23, 29, 0.88)"
                    stroke={isSelected ? pinColor : 'rgba(234, 245, 244, 0.2)'}
                    strokeWidth={isSelected ? 1.5 : 1}
                  />
                  <text
                    x="8"
                    y="14"
                    fill="#eaf5f4"
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {gauge.name.split(' ')[0]}
                  </text>
                  <text
                    x="8"
                    y="26"
                    fill={isDanger ? '#ff785f' : '#00e5ff'}
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    {gauge.currentLevel}m ({isDanger ? `+${(gauge.currentLevel - gauge.dangerLevel).toFixed(1)}m` : 'safe'})
                  </text>
                </g>
              </g>
            )
          })}
        </svg>

        {/* Floating Basin Watermarks */}
        <div className="map-corner-hud">
          <span className="mono-tiny">COORDINATES: 26.14°N · 91.73°E</span>
          <span className="mono-tiny">ELEVATION: 105m $\rightarrow$ 28m VALLEY GRADIENT</span>
        </div>
      </div>
    </div>
  )
}
