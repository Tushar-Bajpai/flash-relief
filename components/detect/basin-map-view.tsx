'use client'

import { useState } from 'react'
import { Layers, Eye, ShieldAlert, Waves, MapPin, Maximize2, Compass } from 'lucide-react'
import { getBasinById, getGaugesForBasin, RiverGauge } from '@/lib/detect-data'

interface BasinMapViewProps {
  selectedBasinId: string
  selectedGaugeId: string
  onSelectGauge: (gaugeId: string) => void
}

export function BasinMapView({ selectedBasinId, selectedGaugeId, onSelectGauge }: BasinMapViewProps) {
  const [showSarMask, setShowSarMask] = useState(true)
  const [showContours, setShowContours] = useState(true)
  const [showRainHeatmap, setShowRainHeatmap] = useState(true)

  const basin = getBasinById(selectedBasinId)
  const gauges = getGaugesForBasin(selectedBasinId)

  return (
    <div className="basin-map-viewport">
      {/* Map Control Overlay Header */}
      <div className="basin-map-top-bar">
        <div className="map-title-wrap">
          <span className={`live-dot ${basin.alertStatus.toLowerCase()}`} />
          <span className="mono-subhead">
            {basin.name.toUpperCase()} // SPATIAL SENSOR TWIN
          </span>
        </div>

        <div className="map-layer-toggles">
          <button
            type="button"
            onClick={() => setShowRainHeatmap(!showRainHeatmap)}
            className={`layer-btn ${showRainHeatmap ? 'active' : ''}`}
            aria-pressed={showRainHeatmap}
            title="NASA GPM IMERG Early Run Precipitation Grid"
          >
            <span>GPM Rain Heatmap</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSarMask(!showSarMask)}
            className={`layer-btn ${showSarMask ? 'active' : ''}`}
            aria-pressed={showSarMask}
            title="Sentinel-1 SAR Satellite Ground Inundation Mask"
          >
            <Waves size={12} />
            <span>Sentinel-1 SAR Mask</span>
          </button>

          <button
            type="button"
            onClick={() => setShowContours(!showContours)}
            className={`layer-btn ${showContours ? 'active' : ''}`}
            aria-pressed={showContours}
            title="Elevation Topography Contour Grid"
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
              <stop offset="0%" stopColor="#0b2229" stopOpacity="0.85" />
              <stop offset="60%" stopColor="#07171d" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#040e12" stopOpacity="1" />
            </radialGradient>

            {/* River Flow Water Gradient */}
            <linearGradient id="riverFlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.95" />
              <stop offset="45%" stopColor="#1992a7" stopOpacity="0.85" />
              <stop offset="75%" stopColor={basin.alertStatus === 'WARNING' ? '#ff785f' : basin.alertStatus === 'WATCH' ? '#f4c969' : '#00e5ff'} stopOpacity="0.9" />
              <stop offset="100%" stopColor="#00e5ff" stopOpacity="0.95" />
            </linearGradient>

            {/* Reservoir / Lake Gradient for Mahanadi */}
            <radialGradient id="reservoirGrad" cx="45%" cy="45%" r="60%">
              <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.7" />
              <stop offset="70%" stopColor="#094255" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#07171d" stopOpacity="0.95" />
            </radialGradient>

            {/* Flood Inundation Mask Gradient */}
            <radialGradient id="floodMaskGrad" cx="45%" cy="42%" r="55%">
              <stop offset="0%" stopColor={basin.alertStatus === 'WARNING' ? '#ff785f' : '#00e5ff'} stopOpacity="0.55" />
              <stop offset="45%" stopColor="#08384d" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#07171d" stopOpacity="0.0" />
            </radialGradient>

            {/* Pulsing Danger Ping Filter */}
            <filter id="glowEffect" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Catchment Base Surface */}
          <rect width="900" height="520" fill="url(#catchmentGrad)" rx="16" />

          {/* ─── BRAHMAPUTRA BASIN GEOMETRY ─── */}
          {selectedBasinId === 'brahmaputra' && (
            <>
              {/* Terrain Elevation Contour Lines (Assam Valley) */}
              {showContours && (
                <g className="elevation-contours" opacity="0.35">
                  <ellipse cx="460" cy="270" rx="420" ry="210" fill="none" stroke="#72d9e8" strokeWidth="0.8" strokeDasharray="3 6" />
                  <ellipse cx="440" cy="265" rx="350" ry="170" fill="none" stroke="#72d9e8" strokeWidth="0.8" strokeDasharray="3 6" />
                  <ellipse cx="410" cy="260" rx="270" ry="130" fill="none" stroke="#72d9e8" strokeWidth="1" strokeDasharray="4 4" />
                  <ellipse cx="370" cy="255" rx="190" ry="90" fill="none" stroke="#ff785f" strokeWidth="1.2" strokeDasharray="2 3" opacity="0.75" />
                </g>
              )}

              {/* Sentinel-1 SAR Radar Inundated Water Extent Polygons */}
              {showSarMask && (
                <g className="sar-flood-extent" filter="url(#glowEffect)">
                  {/* Upper Valley Inundation Polygon (Dibrugarh Floodplain) */}
                  <path
                    d="M 140 160 Q 200 130 260 150 T 320 190 Q 290 230 230 220 T 140 180 Z"
                    fill="url(#floodMaskGrad)"
                    stroke="#00e5ff"
                    strokeWidth="1.2"
                    opacity="0.75"
                  />
                  {/* Central Valley Inundation Polygon (Kaziranga - Tezpur) */}
                  <path
                    d="M 330 200 Q 420 180 500 220 T 550 270 Q 480 300 400 280 T 340 240 Z"
                    fill="url(#floodMaskGrad)"
                    stroke="#ff785f"
                    strokeWidth="1.5"
                    opacity="0.85"
                  />
                  {/* Lower Valley Inundation (Guwahati - Goalpara) */}
                  <path
                    d="M 570 270 Q 640 280 710 320 T 770 370 Q 720 400 650 380 T 580 330 Z"
                    fill="url(#floodMaskGrad)"
                    stroke="#00e5ff"
                    strokeWidth="1.2"
                    opacity="0.65"
                  />
                </g>
              )}

              {/* Brahmaputra River Course Path */}
              <path
                d="M 70 135 C 160 165, 240 185, 330 215 C 430 245, 510 265, 600 305 C 680 345, 750 375, 840 420"
                fill="none"
                stroke="url(#riverFlowGrad)"
                strokeWidth="18"
                strokeLinecap="round"
                opacity="0.9"
              />

              {/* River Stream Centerline Glow */}
              <path
                d="M 70 135 C 160 165, 240 185, 330 215 C 430 245, 510 265, 600 305 C 680 345, 750 375, 840 420"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeDasharray="8 12"
                opacity="0.65"
              />

              {/* Tributary Streams (Dihang, Subansiri, Kopili) */}
              <path d="M 210 50 Q 230 110 250 170" fill="none" stroke="#00e5ff" strokeWidth="3" opacity="0.6" strokeDasharray="3 3" />
              <path d="M 450 90 Q 460 150 470 230" fill="none" stroke="#00e5ff" strokeWidth="3" opacity="0.6" strokeDasharray="3 3" />
              <path d="M 640 460 Q 630 390 620 320" fill="none" stroke="#ff785f" strokeWidth="2.5" opacity="0.65" />
            </>
          )}

          {/* ─── MAHANADI BASIN GEOMETRY ─── */}
          {selectedBasinId === 'mahanadi' && (
            <>
              {/* Mountainous Contours around Tikarpara Gorge & Delta */}
              {showContours && (
                <g className="elevation-contours" opacity="0.35">
                  <path d="M 520 180 Q 580 230 520 280" fill="none" stroke="#f4c969" strokeWidth="1.2" strokeDasharray="3 4" />
                  <path d="M 640 220 Q 580 270 640 340" fill="none" stroke="#f4c969" strokeWidth="1.2" strokeDasharray="3 4" />
                  <ellipse cx="210" cy="220" rx="140" ry="80" fill="none" stroke="#72d9e8" strokeWidth="0.8" strokeDasharray="4 4" />
                  <ellipse cx="780" cy="270" rx="110" ry="130" fill="none" stroke="#72d9e8" strokeWidth="0.8" strokeDasharray="3 5" />
                </g>
              )}

              {/* Hirakud Reservoir Lake Polygon */}
              <path
                d="M 70 170 C 110 130, 160 140, 210 220 C 180 280, 120 280, 70 230 Z"
                fill="url(#reservoirGrad)"
                stroke="#00e5ff"
                strokeWidth="2.5"
                opacity="0.9"
              />
              <text x="100" y="225" fill="#72d9e8" fontSize="10" fontFamily="monospace" opacity="0.8">HIRAKUD RESERVOIR</text>

              {/* Sentinel-1 SAR Radar Inundated Water Extent Polygons (Mahanadi) */}
              {showSarMask && (
                <g className="sar-flood-extent" filter="url(#glowEffect)">
                  {/* Hirakud Outflow Spill Inundation */}
                  <path
                    d="M 230 220 Q 300 200 370 230 T 430 280 Q 360 300 280 270 Z"
                    fill="url(#floodMaskGrad)"
                    stroke="#f4c969"
                    strokeWidth="1.2"
                    opacity="0.75"
                  />
                  {/* Delta Lowland Waterlogging (Naraj / Mundali) */}
                  <path
                    d="M 720 230 Q 790 200 860 220 T 880 290 Q 820 320 740 290 Z"
                    fill="url(#floodMaskGrad)"
                    stroke="#00e5ff"
                    strokeWidth="1.2"
                    opacity="0.65"
                  />
                </g>
              )}

              {/* Mahanadi Main River Course */}
              <path
                d="M 210 220 C 290 235, 360 255, 440 280 C 510 300, 560 310, 630 300 C 700 290, 740 270, 780 260"
                fill="none"
                stroke="url(#riverFlowGrad)"
                strokeWidth="16"
                strokeLinecap="round"
                opacity="0.9"
              />

              {/* Centerline Pulse */}
              <path
                d="M 210 220 C 290 235, 360 255, 440 280 C 510 300, 560 310, 630 300 C 700 290, 740 270, 780 260"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2"
                strokeDasharray="6 10"
                opacity="0.6"
              />

              {/* Coastal Delta Bifurcations at Naraj */}
              {/* Kathajodi River Branch */}
              <path
                d="M 780 260 C 815 285, 845 320, 885 345"
                fill="none"
                stroke="url(#riverFlowGrad)"
                strokeWidth="11"
                strokeLinecap="round"
                opacity="0.85"
              />
              {/* Birupa / Main Mahanadi Branch */}
              <path
                d="M 780 260 C 815 245, 845 225, 885 205"
                fill="none"
                stroke="url(#riverFlowGrad)"
                strokeWidth="11"
                strokeLinecap="round"
                opacity="0.85"
              />

              {/* Inflow Tributaries (Ib and Tel rivers) */}
              <path d="M 150 60 Q 180 130 210 200" fill="none" stroke="#00e5ff" strokeWidth="2.5" opacity="0.6" strokeDasharray="3 3" />
              <path d="M 340 440 Q 360 350 390 280" fill="none" stroke="#00e5ff" strokeWidth="2.5" opacity="0.6" strokeDasharray="3 3" />
            </>
          )}

          {/* ─── GODAVARI BASIN GEOMETRY ─── */}
          {selectedBasinId === 'godavari' && (
            <>
              {/* Eastern Ghats Foothill Contours */}
              {showContours && (
                <g className="elevation-contours" opacity="0.3">
                  <ellipse cx="440" cy="260" rx="380" ry="180" fill="none" stroke="#72d9e8" strokeWidth="0.8" strokeDasharray="4 6" />
                  <ellipse cx="600" cy="290" rx="240" ry="120" fill="none" stroke="#72d9e8" strokeWidth="0.8" strokeDasharray="3 5" />
                  <ellipse cx="780" cy="350" rx="120" ry="140" fill="none" stroke="#72d9e8" strokeWidth="0.8" strokeDasharray="2 4" />
                </g>
              )}

              {/* Sentinel-1 SAR Nominal Scan Box (No Inundation) */}
              {showSarMask && (
                <g className="sar-flood-extent">
                  <path
                    d="M 370 230 Q 420 220 460 250 T 490 270 Q 440 280 390 270 Z"
                    fill="rgba(0, 229, 255, 0.12)"
                    stroke="#00e5ff"
                    strokeWidth="1"
                    strokeDasharray="2 3"
                    opacity="0.5"
                  />
                </g>
              )}

              {/* Godavari Main River Course */}
              <path
                d="M 80 130 C 150 160, 230 185, 320 215 C 410 245, 510 275, 610 295 C 700 315, 740 335, 780 350"
                fill="none"
                stroke="url(#riverFlowGrad)"
                strokeWidth="16"
                strokeLinecap="round"
                opacity="0.9"
              />

              {/* Centerline Dash */}
              <path
                d="M 80 130 C 150 160, 230 185, 320 215 C 410 245, 510 275, 610 295 C 700 315, 740 335, 780 350"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2"
                strokeDasharray="6 10"
                opacity="0.5"
              />

              {/* Dowleswaram Barrage Delta Estuary Branches */}
              {/* Gautami Godavari Branch */}
              <path
                d="M 780 350 C 810 345, 845 340, 885 330"
                fill="none"
                stroke="url(#riverFlowGrad)"
                strokeWidth="11"
                strokeLinecap="round"
                opacity="0.85"
              />
              {/* Vasishta Godavari Branch */}
              <path
                d="M 780 350 C 815 375, 845 405, 885 430"
                fill="none"
                stroke="url(#riverFlowGrad)"
                strokeWidth="11"
                strokeLinecap="round"
                opacity="0.85"
              />

              {/* Tributaries: Pranhita, Indravati, Sabari */}
              <path d="M 230 50 Q 210 120 190 190" fill="none" stroke="#00e5ff" strokeWidth="2.5" opacity="0.6" strokeDasharray="3 3" />
              <path d="M 460 70 Q 440 160 410 240" fill="none" stroke="#00e5ff" strokeWidth="2.5" opacity="0.6" strokeDasharray="3 3" />
              <path d="M 650 100 Q 630 190 600 285" fill="none" stroke="#00e5ff" strokeWidth="2.5" opacity="0.6" strokeDasharray="3 3" />
            </>
          )}

          {/* ─── DYNAMIC CWC GAUGE STATION PINS (PER BASIN) ─── */}
          {gauges.map((gauge) => {
            const coords = gauge.svgCoords
            const isSelected = selectedGaugeId === gauge.id
            const isDanger = gauge.status === 'SURGING' || gauge.status === 'OVER_DANGER'
            const isWatch = gauge.status === 'APPROACHING'
            const pinColor = isDanger ? '#ff785f' : isWatch ? '#f4c969' : '#00e5ff'

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
                    strokeWidth="1.4"
                    className="pulse-ping-ring"
                    opacity="0.65"
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
                    width="128"
                    height="32"
                    rx="6"
                    fill="rgba(7, 23, 29, 0.9)"
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
                    fill={pinColor}
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    {gauge.currentLevel}m ({isDanger ? `+${(gauge.currentLevel - gauge.dangerLevel).toFixed(2)}m` : isWatch ? 'approaching' : 'nominal'})
                  </text>
                </g>
              </g>
            )
          })}
        </svg>

        {/* Floating Basin Watermarks */}
        <div className="map-corner-hud">
          {selectedBasinId === 'brahmaputra' && (
            <>
              <span className="mono-tiny">COORDINATES: 26.14°N · 91.73°E</span>
              <span className="mono-tiny">ELEVATION: 105m → 28m VALLEY GRADIENT</span>
            </>
          )}
          {selectedBasinId === 'mahanadi' && (
            <>
              <span className="mono-tiny">COORDINATES: 20.47°N · 85.77°E</span>
              <span className="mono-tiny">ELEVATION: 192m → 25m RESERVOIR TO DELTA</span>
            </>
          )}
          {selectedBasinId === 'godavari' && (
            <>
              <span className="mono-tiny">COORDINATES: 16.94°N · 81.77°E</span>
              <span className="mono-tiny">ELEVATION: 131m → 11m GORGE TO ESTUARY</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
