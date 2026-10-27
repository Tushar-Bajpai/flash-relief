'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Layers,
  Waves,
  MapPin,
  ChevronDown,
  Globe,
  Radio,
  Eye,
  Crosshair,
  Compass,
  CloudRain,
  Check,
  Maximize2,
  Minimize2,
  Sparkles,
} from 'lucide-react'
import {
  getBasinById,
  getGaugesForBasin,
  MONITORED_BASINS,
  RiverGauge,
} from '@/lib/detect-data'

interface BasinMapViewProps {
  selectedBasinId: string
  selectedGaugeId: string
  onSelectGauge: (gaugeId: string) => void
  onSelectBasin?: (basinId: string) => void
  liveTelemetry?: any
}

interface ZoneDefinition {
  id: string
  name: string
  zoneCode: string
  shortLabel: string
  region: string
  basinId: string
  center: [number, number]
  zoom: number
  inundationPolygons: [number, number][][]
  riverPath: [number, number][]
  description: string
  alertLevel: 'CONFIRMED' | 'WARNING' | 'WATCH' | 'CLEAR'
  confidence: string
}

const ZONES: Record<string, ZoneDefinition> = {
  brahmaputra: {
    id: 'brahmaputra',
    name: 'Brahmaputra Upper Catchment',
    zoneCode: 'ZONE 01 · NORTHEAST CORRIDOR',
    shortLabel: 'Zone 01 · Brahmaputra',
    region: 'Assam & Arunachal Pradesh',
    basinId: 'brahmaputra',
    center: [26.85, 93.85],
    zoom: 8,
    inundationPolygons: [
      // Majuli island flood extent
      [
        [26.9, 94.0],
        [27.05, 94.22],
        [27.15, 94.42],
        [27.08, 94.52],
        [26.88, 94.32],
        [26.9, 94.0],
      ],
      // Kaziranga riverine floodplain
      [
        [26.56, 93.12],
        [26.72, 93.38],
        [26.68, 93.65],
        [26.52, 93.32],
        [26.56, 93.12],
      ],
    ],
    riverPath: [
      [27.4728, 94.912],
      [27.15, 94.4],
      [26.95, 93.7],
      [26.6528, 92.7926],
      [26.18, 91.75],
      [26.02, 89.97],
    ],
    description: 'Majuli riverine island & Kaziranga floodplain corridor with active CWC acoustic telemetry.',
    alertLevel: 'CONFIRMED',
    confidence: '94.6%',
  },
  mahanadi: {
    id: 'mahanadi',
    name: 'Mahanadi Basin & Hirakud Reach',
    zoneCode: 'ZONE 02 · EASTERN DELTA CORRIDOR',
    shortLabel: 'Zone 02 · Mahanadi',
    region: 'Odisha & Chhattisgarh',
    basinId: 'mahanadi',
    center: [20.95, 84.6],
    zoom: 8,
    inundationPolygons: [
      // Hirakud dam outflow buffer
      [
        [21.48, 83.82],
        [21.58, 83.92],
        [21.52, 84.05],
        [21.42, 83.9],
        [21.48, 83.82],
      ],
      // Naraj delta bifurcation
      [
        [20.45, 85.7],
        [20.55, 85.88],
        [20.42, 86.05],
        [20.35, 85.8],
        [20.45, 85.7],
      ],
    ],
    riverPath: [
      [21.52, 83.87],
      [20.81, 84.18],
      [20.59, 84.78],
      [20.47, 85.77],
      [20.28, 86.68],
    ],
    description: 'Hirakud 24-sluice outflow channel traversing Tikarpara gorge toward Cuttack delta.',
    alertLevel: 'WATCH',
    confidence: '62.1%',
  },
  godavari: {
    id: 'godavari',
    name: 'Godavari Delta Reach',
    zoneCode: 'ZONE 03 · SOUTHERN DRAINAGE VALLEY',
    shortLabel: 'Zone 03 · Godavari',
    region: 'Andhra Pradesh & Telangana',
    basinId: 'godavari',
    center: [17.6, 81.1],
    zoom: 8,
    inundationPolygons: [
      [
        [17.65, 80.82],
        [17.75, 80.95],
        [17.65, 81.05],
        [17.58, 80.88],
        [17.65, 80.82],
      ],
    ],
    riverPath: [
      [18.87, 79.46],
      [17.67, 80.89],
      [17.58, 81.26],
      [16.94, 81.77],
    ],
    description: 'Eastern Ghats valley to Sir Arthur Cotton Barrage with healthy soil infiltration.',
    alertLevel: 'CLEAR',
    confidence: '18.5%',
  },
  yamuna: {
    id: 'yamuna',
    name: 'Yamuna NCT & Floodplain',
    zoneCode: 'ZONE 04 · NORTHERN URBAN CORRIDOR',
    shortLabel: 'Zone 04 · Yamuna',
    region: 'Delhi & Haryana',
    basinId: 'yamuna',
    center: [28.62, 77.25],
    zoom: 11,
    inundationPolygons: [
      [
        [28.72, 77.21],
        [28.68, 77.25],
        [28.64, 77.27],
        [28.56, 77.32],
        [28.53, 77.31],
        [28.61, 77.24],
        [28.72, 77.21],
      ],
    ],
    riverPath: [
      [28.71, 77.22],
      [28.665, 77.245],
      [28.628, 77.251],
      [28.545, 77.31],
    ],
    description: 'Hathnikund barrage outflow to Delhi Old Railway Bridge and Okhla Barrage.',
    alertLevel: 'WATCH',
    confidence: '58.4%',
  },
  national: {
    id: 'national',
    name: 'National Multi-Basin Overview',
    zoneCode: 'PAN-INDIA · ALL 4 CORRIDORS',
    shortLabel: '🌐 National Overview',
    region: 'All 4 Priority River Corridors',
    basinId: 'brahmaputra',
    center: [22.5, 82.5],
    zoom: 5,
    inundationPolygons: [],
    riverPath: [],
    description: 'Comprehensive pan-India early flood warning radar linking all 4 river corridors.',
    alertLevel: 'WARNING',
    confidence: 'Multi-Feed',
  },
}

export function BasinMapView({
  selectedBasinId,
  selectedGaugeId,
  onSelectGauge,
  onSelectBasin,
  liveTelemetry,
}: BasinMapViewProps) {
  const [mapMode, setMapMode] = useState<'GIS' | 'SCHEMATIC'>('GIS')
  const [basemapStyle, setBasemapStyle] = useState<'satellite' | 'dark'>('satellite')
  const [zoneDropdownOpen, setZoneDropdownOpen] = useState(false)
  const [activeZoneKey, setActiveZoneKey] = useState<string>(selectedBasinId)
  const [showSarMask, setShowSarMask] = useState(true)
  const [showRiverPath, setShowRiverPath] = useState(true)
  const [showGauges, setShowGauges] = useState(true)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const leafletMapRef = useRef<any>(null)
  const tileLayerGroupRef = useRef<any>(null)
  const layersGroupRef = useRef<any>(null)

  const basin = getBasinById(selectedBasinId)
  const gauges = getGaugesForBasin(selectedBasinId)

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setZoneDropdownOpen(false)
      }
    }
    if (zoneDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [zoneDropdownOpen])

  // Keep active zone synced with selected basin
  useEffect(() => {
    if (activeZoneKey !== 'national' && activeZoneKey !== selectedBasinId) {
      setActiveZoneKey(selectedBasinId)
    }
  }, [selectedBasinId, activeZoneKey])

  // Initialize and update Leaflet Real GIS Map
  useEffect(() => {
    if (mapMode !== 'GIS' || !mapContainerRef.current) return
    let isMounted = true

    // Dynamically import Leaflet on client-side
    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return

      const currentZone = ZONES[activeZoneKey] || ZONES.brahmaputra

      // Initialize map instance if not created
      if (!leafletMapRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: currentZone.center,
          zoom: currentZone.zoom,
          zoomControl: false,
          attributionControl: false,
        })

        // Add subtle zoom control at bottom-right
        L.control.zoom({ position: 'bottomright' }).addTo(map)

        leafletMapRef.current = map
        tileLayerGroupRef.current = L.layerGroup().addTo(map)
        layersGroupRef.current = L.layerGroup().addTo(map)
      } else {
        leafletMapRef.current.setView(currentZone.center, currentZone.zoom, {
          animate: true,
          duration: 0.8,
        })
      }

      const map = leafletMapRef.current
      const tileLayerGroup = tileLayerGroupRef.current
      const layerGroup = layersGroupRef.current
      if (!map || !layerGroup || !tileLayerGroup) return

      // ─── 0. Update Basemap Tiles (Zero Watermark / No API Key Required) ───
      tileLayerGroup.clearLayers()
      if (basemapStyle === 'satellite') {
        // High-resolution Esri World Imagery (Live satellite terrain) - 100% Free, NO Watermark
        const satLayer = L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          {
            maxZoom: 19,
            attribution: 'Esri World Imagery',
          }
        )
        satLayer.addTo(tileLayerGroup)
      } else {
        // Crisp Dark Tactical Slate Gray Canvas - 100% Free, NO Watermark
        const darkBase = L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
          {
            maxZoom: 16,
            attribution: 'Esri Dark Canvas',
          }
        )
        const darkRef = L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
          {
            maxZoom: 16,
          }
        )
        darkBase.addTo(tileLayerGroup)
        darkRef.addTo(tileLayerGroup)
      }

      layerGroup.clearLayers()

      // ─── 1. Draw Inundation Zone Polygons (Sentinel-1 SAR Extent) ───
      if (showSarMask) {
        if (activeZoneKey === 'national') {
          // In national overview, draw all zones
          Object.values(ZONES).forEach((z) => {
            if (z.inundationPolygons.length > 0) {
              z.inundationPolygons.forEach((poly) => {
                const color = z.alertLevel === 'CONFIRMED' ? '#ff785f' : z.alertLevel === 'WARNING' ? '#f4c969' : '#00e5ff'
                L.polygon(poly, {
                  color,
                  weight: 2,
                  fillColor: color,
                  fillOpacity: 0.35,
                  dashArray: '4 4',
                })
                  .bindTooltip(`<strong>${z.name}</strong><br/>Sentinel-1 SAR Radar Inundation`, {
                    className: 'gis-custom-tooltip',
                  })
                  .addTo(layerGroup)
              })
            }
          })
        } else if (currentZone.inundationPolygons.length > 0) {
          const alertColor =
            currentZone.alertLevel === 'CONFIRMED'
              ? '#ff785f'
              : currentZone.alertLevel === 'WARNING'
              ? '#f4c969'
              : '#00e5ff'

          currentZone.inundationPolygons.forEach((poly, idx) => {
            L.polygon(poly, {
              color: alertColor,
              weight: 2.4,
              fillColor: alertColor,
              fillOpacity: 0.42,
              dashArray: '3 4',
            })
              .bindTooltip(`<strong>${currentZone.name}</strong><br/>SAR Inundation Extent #${idx + 1} (Conf: ${currentZone.confidence})`, {
                className: 'gis-custom-tooltip',
              })
              .addTo(layerGroup)
          })
        }
      }

      // ─── 2. Draw River Channel Vectors ───
      if (showRiverPath) {
        if (activeZoneKey === 'national') {
          Object.values(ZONES).forEach((z) => {
            if (z.riverPath.length > 0) {
              L.polyline(z.riverPath, {
                color: '#00e5ff',
                weight: 3.5,
                opacity: 0.85,
                lineCap: 'round',
              }).addTo(layerGroup)
            }
          })
        } else if (currentZone.riverPath.length > 0) {
          // River glow underlay
          L.polyline(currentZone.riverPath, {
            color: '#00e5ff',
            weight: 8,
            opacity: 0.35,
            lineCap: 'round',
          }).addTo(layerGroup)

          // Main river channel
          L.polyline(currentZone.riverPath, {
            color: '#00e5ff',
            weight: 3.5,
            opacity: 0.95,
            dashArray: '6 8',
          }).addTo(layerGroup)
        }
      }

      // ─── 3. Draw CWC Telemetry Station Markers ───
      if (showGauges) {
        const displayGauges =
          activeZoneKey === 'national'
            ? Object.values(ZONES)
                .filter((z) => z.id !== 'national')
                .flatMap((z) => getGaugesForBasin(z.id))
            : gauges

        displayGauges.forEach((g) => {
          const isSelected = g.id === selectedGaugeId
          const isDanger = g.currentLevel >= g.dangerLevel
          const isWatch = g.currentLevel >= g.warningLevel
          const statusColor = isDanger ? '#ff785f' : isWatch ? '#f4c969' : '#00e5ff'

          // Custom HTML marker for high-contrast visibility
          const customHtml = `
            <div class="gis-gauge-marker ${isSelected ? 'selected' : ''}" style="--marker-color: ${statusColor};">
              <span class="marker-dot ${isDanger ? 'pulse' : ''}"></span>
              <div class="marker-tag">
                <span class="m-code">${g.stationCode}</span>
                <span class="m-stage" style="color: ${statusColor}; font-weight: 700;">${g.currentLevel}m</span>
              </div>
            </div>
          `

          const icon = L.divIcon({
            html: customHtml,
            className: 'gis-marker-container',
            iconSize: [92, 36],
            iconAnchor: [46, 18],
          })

          const marker = L.marker([g.coordinates.lat, g.coordinates.lng], { icon })

          marker.on('click', () => {
            onSelectGauge(g.id)
            if (onSelectBasin && g.basinId !== selectedBasinId) {
              onSelectBasin(g.basinId)
            }
          })

          marker
            .bindTooltip(
              `
              <div style="font-family: monospace; font-size: 11px;">
                <strong style="color: ${statusColor}; font-size: 12px;">${g.name}</strong><br/>
                River: ${g.river} · Reach: ${g.reach}<br/>
                Current Stage: <strong>${g.currentLevel}m</strong><br/>
                Warning: ${g.warningLevel}m · Danger: ${g.dangerLevel}m<br/>
                Surge Rate: <span style="color: ${statusColor};">+${g.rateOfRise} cm/hr</span><br/>
                Discharge: <strong>${g.dischargeCumecs.toLocaleString()} cumec</strong>
              </div>
            `,
              { className: 'gis-custom-tooltip' }
            )
            .addTo(layerGroup)
        })
      }
    })

    return () => {
      isMounted = false
    }
  }, [
    mapMode,
    basemapStyle,
    activeZoneKey,
    selectedGaugeId,
    showSarMask,
    showRiverPath,
    showGauges,
    gauges,
    selectedBasinId,
    onSelectGauge,
    onSelectBasin,
  ])

  // Clean up Leaflet on unmount
  useEffect(() => {
    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove()
        leafletMapRef.current = null
      }
    }
  }, [])

  const handleSelectZone = (zoneKey: string) => {
    setActiveZoneKey(zoneKey)
    setZoneDropdownOpen(false)
    const target = ZONES[zoneKey]
    if (target && target.id !== 'national' && onSelectBasin && target.basinId !== selectedBasinId) {
      onSelectBasin(target.basinId)
    }
  }

  const currentZone = ZONES[activeZoneKey] || ZONES.brahmaputra

  return (
    <div className="basin-map-viewport">
      {/* ─── Top Map Controls Bar ─── */}
      <div className="basin-map-top-bar flex-wrap gap-2 items-center justify-between pb-2 border-b border-white/5">
        {/* Left: Zone & Basin Dropdown Selector */}
        <div className="relative z-50" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setZoneDropdownOpen(!zoneDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#07171d] border border-cyan/40 text-cyan text-xs font-mono tracking-wider hover:bg-[#0b2229] hover:border-cyan transition-all cursor-pointer shadow-lg"
            aria-expanded={zoneDropdownOpen}
          >
            <Globe size={13} className="text-cyan animate-pulse" />
            <span className="font-bold text-white">{currentZone.zoneCode}</span>
            <ChevronDown size={14} className={`text-cyan transition-transform duration-200 ${zoneDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Expanded Floating Dropdown Popover */}
          {zoneDropdownOpen && (
            <div className="absolute left-0 top-full mt-2 w-[420px] max-w-[95vw] rounded-xl bg-[#07171d] border border-cyan/50 p-2.5 shadow-2xl z-[9999] backdrop-blur-xl">
              <div className="flex items-center justify-between px-2 py-1.5 border-b border-white/10 mb-1.5">
                <span className="text-[11px] font-mono text-cyan tracking-wider font-semibold uppercase">
                  Select Inundation Zone & Corridor
                </span>
                <span className="text-[10px] font-mono text-muted">5 Active Regions</span>
              </div>

              <div className="flex flex-col gap-1.5 max-h-[380px] overflow-y-auto pr-1">
                {Object.values(ZONES).map((z) => {
                  const isCurrent = z.id === activeZoneKey
                  const alertBg =
                    z.alertLevel === 'CONFIRMED'
                      ? 'bg-coral/20 text-coral border-coral/40'
                      : z.alertLevel === 'WARNING'
                      ? 'bg-yellow/20 text-yellow border-yellow/40'
                      : z.alertLevel === 'WATCH'
                      ? 'bg-yellow/15 text-yellow border-yellow/30'
                      : 'bg-green/20 text-green border-green/30'

                  return (
                    <button
                      key={z.id}
                      type="button"
                      onClick={() => handleSelectZone(z.id)}
                      className={`w-full text-left p-2.5 rounded-lg transition-all flex items-start justify-between gap-3 cursor-pointer border ${
                        isCurrent
                          ? 'bg-cyan/15 border-cyan text-white shadow-[0_0_12px_rgba(0,229,255,0.2)]'
                          : 'bg-[#0b2229]/60 border-white/5 hover:bg-[#0f2c35] hover:border-cyan/30 text-white'
                      }`}
                    >
                      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white tracking-wide truncate">
                            {z.name}
                          </span>
                          {isCurrent && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-mono text-cyan">
                              <Check size={11} />
                              Active
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-cyan/80 font-mono font-medium">
                          {z.zoneCode}
                        </span>
                        <span className="text-[10px] text-muted truncate">
                          {z.region} · {z.description}
                        </span>
                      </div>

                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold border ${alertBg}`}>
                          {z.alertLevel}
                        </span>
                        <span className="text-[9px] font-mono text-muted">
                          Conf: {z.confidence}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Center: Layer Toggles (SAR Mask, River Vectors, Gauges) */}
        <div className="map-layer-toggles flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowSarMask(!showSarMask)}
            className={`layer-btn ${showSarMask ? 'active' : ''}`}
            title="Toggle Sentinel-1 SAR Radar Flood Inundation Polygons"
          >
            <Waves size={12} />
            <span>SAR Radar Mask</span>
          </button>

          <button
            type="button"
            onClick={() => setShowRiverPath(!showRiverPath)}
            className={`layer-btn ${showRiverPath ? 'active' : ''}`}
            title="Toggle River Channel Corridor Lines"
          >
            <span>River Channels</span>
          </button>

          <button
            type="button"
            onClick={() => setShowGauges(!showGauges)}
            className={`layer-btn ${showGauges ? 'active' : ''}`}
            title="Toggle CWC Acoustic Telemetry Stations"
          >
            <MapPin size={12} />
            <span>Gauges</span>
          </button>
        </div>

        {/* Right: Basemap Tile Switcher (Satellite vs Dark Tactical) & GIS/Schematic Mode */}
        <div className="flex items-center gap-1.5 ml-auto">
          {/* Basemap Style Switcher */}
          {mapMode === 'GIS' && (
            <div className="flex items-center bg-[#07171d] rounded-lg p-0.5 border border-white/10">
              <button
                type="button"
                onClick={() => setBasemapStyle('satellite')}
                className={`px-2 py-1 text-[11px] font-mono rounded transition-all cursor-pointer ${
                  basemapStyle === 'satellite'
                    ? 'bg-cyan/25 text-cyan font-bold border border-cyan/40 shadow-sm'
                    : 'text-muted hover:text-white'
                }`}
                title="Esri World Imagery Live High-Resolution Satellite View (Zero Watermark)"
              >
                🛰️ Live Satellite
              </button>
              <button
                type="button"
                onClick={() => setBasemapStyle('dark')}
                className={`px-2 py-1 text-[11px] font-mono rounded transition-all cursor-pointer ${
                  basemapStyle === 'dark'
                    ? 'bg-cyan/25 text-cyan font-bold border border-cyan/40 shadow-sm'
                    : 'text-muted hover:text-white'
                }`}
                title="Esri World Dark Gray Canvas (Zero Watermark, Obsidian Theme)"
              >
                🌑 Dark Tactical
              </button>
            </div>
          )}

          {/* Mode Switcher */}
          <div className="flex items-center bg-[#07171d] rounded-lg p-0.5 border border-white/10">
            <button
              type="button"
              onClick={() => setMapMode('GIS')}
              className={`px-2 py-1 text-[11px] font-mono rounded transition-all cursor-pointer ${
                mapMode === 'GIS'
                  ? 'bg-cyan/25 text-cyan font-bold'
                  : 'text-muted hover:text-white'
              }`}
              title="Real Leaflet GIS Map with Live Satellite / Dark Basemap"
            >
              GIS Map
            </button>
            <button
              type="button"
              onClick={() => setMapMode('SCHEMATIC')}
              className={`px-2 py-1 text-[11px] font-mono rounded transition-all cursor-pointer ${
                mapMode === 'SCHEMATIC'
                  ? 'bg-cyan/25 text-cyan font-bold'
                  : 'text-muted hover:text-white'
              }`}
              title="Schematic Digital Twin Vector View"
            >
              Twin
            </button>
          </div>
        </div>
      </div>

      {/* ─── Quick Zone Switch Pills Bar (Always Visible for Instant 1-Click Access) ─── */}
      <div className="flex items-center gap-1.5 py-2 overflow-x-auto no-scrollbar">
        <span className="text-[10px] font-mono text-cyan/70 uppercase tracking-wider flex-shrink-0 mr-1">
          Quick Zones:
        </span>
        {Object.values(ZONES).map((z) => {
          const isCurrent = z.id === activeZoneKey
          return (
            <button
              key={z.id}
              type="button"
              onClick={() => handleSelectZone(z.id)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-mono whitespace-nowrap transition-all cursor-pointer border flex items-center gap-1.5 ${
                isCurrent
                  ? 'bg-cyan/20 border-cyan text-cyan font-bold shadow-[0_0_8px_rgba(0,229,255,0.25)]'
                  : 'bg-[#07171d]/80 border-white/10 text-muted hover:text-white hover:border-cyan/30'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  z.alertLevel === 'CONFIRMED'
                    ? 'bg-coral shadow-[0_0_4px_#ff785f]'
                    : z.alertLevel === 'WARNING'
                    ? 'bg-yellow'
                    : z.alertLevel === 'WATCH'
                    ? 'bg-yellow/80'
                    : 'bg-green'
                }`}
              />
              <span>{z.shortLabel}</span>
            </button>
          )
        })}
      </div>

      {/* ─── Map Canvas Area ─── */}
      <div className="relative w-full h-[500px] rounded-2xl overflow-hidden bg-[#040e12] border border-cyan/20 shadow-inner">
        {/* Real GIS Leaflet Map Container */}
        <div
          ref={mapContainerRef}
          className={`w-full h-full ${mapMode === 'GIS' ? 'block' : 'hidden'}`}
          style={{ minHeight: '500px' }}
        />

        {/* Fallback / Schematic Vector Twin View */}
        {mapMode === 'SCHEMATIC' && (
          <div className="basin-svg-container w-full h-full">
            <svg viewBox="0 0 900 520" className="basin-schematic-svg w-full h-full" preserveAspectRatio="xMidYMid meet">
              <defs>
                <radialGradient id="catchmentGrad" cx="50%" cy="50%" r="65%">
                  <stop offset="0%" stopColor="#0b2229" stopOpacity="0.85" />
                  <stop offset="60%" stopColor="#07171d" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#040e12" stopOpacity="1" />
                </radialGradient>
                <linearGradient id="riverFlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.95" />
                  <stop
                    offset="75%"
                    stopColor={basin.alertStatus === 'WARNING' ? '#ff785f' : '#00e5ff'}
                    stopOpacity="0.9"
                  />
                  <stop offset="100%" stopColor="#00e5ff" stopOpacity="0.95" />
                </linearGradient>
              </defs>

              <rect width="900" height="520" fill="url(#catchmentGrad)" rx="16" />

              {/* Schematic River Course */}
              <path
                d="M 70 135 C 160 165, 240 185, 330 215 C 430 245, 510 265, 600 305 C 680 345, 750 375, 840 420"
                fill="none"
                stroke="url(#riverFlowGrad)"
                strokeWidth="16"
                strokeLinecap="round"
                opacity="0.9"
              />

              {/* Station Dots */}
              {gauges.map((g) => {
                const isSelected = g.id === selectedGaugeId
                const isDanger = g.currentLevel >= g.dangerLevel
                return (
                  <g
                    key={g.id}
                    transform={`translate(${g.svgCoords.x}, ${g.svgCoords.y})`}
                    onClick={() => onSelectGauge(g.id)}
                    className="cursor-pointer"
                  >
                    <circle r={isSelected ? 10 : 6} fill={isDanger ? '#ff785f' : '#00e5ff'} />
                    <text x="14" y="4" fill="#eaf5f4" fontSize="11" fontFamily="monospace">
                      {g.name} ({g.currentLevel}m)
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
        )}

        {/* Corner HUD Telemetry Overlay */}
        <div className="absolute bottom-3 left-3 bg-[#07171d]/95 backdrop-blur-md border border-cyan/40 px-3.5 py-2.5 rounded-xl text-xs font-mono text-cyan flex flex-col gap-1 pointer-events-none z-20 shadow-xl">
          <div className="flex items-center gap-1.5 text-white font-bold">
            <Radio size={12} className="text-cyan animate-pulse" />
            <span>{currentZone.name}</span>
          </div>
          <span className="text-[10px] text-muted">
            CENTER: {currentZone.center[0].toFixed(2)}°N · {currentZone.center[1].toFixed(2)}°E · ZOOM {currentZone.zoom}
          </span>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="text-cyan/90">
              LAYER: {basemapStyle === 'satellite' ? '🛰️ Esri Satellite (Clean)' : '🌑 Dark Slate Canvas'}
            </span>
            <span className="text-muted">·</span>
            <span className="text-emerald-400 font-semibold">0% Watermark</span>
          </div>
        </div>
      </div>
    </div>
  )
}
