export interface RiverGauge {
  id: string
  basinId: string
  name: string
  river: string
  reach: string
  stationCode: string
  coordinates: { lat: number; lng: number }
  svgCoords: { x: number; y: number }
  currentLevel: number
  warningLevel: number
  dangerLevel: number
  highestFloodLevel: number
  rateOfRise: number // cm/hr
  dischargeCumecs: number
  status: 'SURGING' | 'OVER_DANGER' | 'APPROACHING' | 'NORMAL'
  trend: 'RISING' | 'STEADY' | 'RECEDING'
  lastUpdated: string
  history24h: { hour: string; level: number }[]
}

export interface FusionSignal {
  id: string
  name: string
  source: string
  reading: string
  percentile: string
  weight: number
  score: number // 0 to 1
  status: 'ALERT' | 'CONFIRMED' | 'ACTIVE' | 'NORMAL'
  description: string
  latency: string
}

export interface SarPassData {
  satellite: string
  orbitNumber: number
  passType: 'DESCENDING' | 'ASCENDING'
  polarisation: 'VV + VH'
  acquisitionTime: string
  baselineDb: number
  currentBackscatterDb: number
  deltaDb: number
  detectedWaterAreaSqKm: number
  confidenceLevel: number
  otsuThreshold: number
}

export interface CryptographicProof {
  alertId: string
  basinName: string
  alertLevel: 'WATCH' | 'WARNING' | 'CONFIRMED' | 'NOMINAL'
  detectionTimestamp: string
  detectionBlockNumber: number
  detectionTxHash: string
  stateMerkleRoot: string
  dataFingerprint: string
  gdeltFirstNewsTimestamp: string
  verifiedLeadTimeHours: number
}

export interface MonitoredBasin {
  id: string
  name: string
  river: string
  state: string
  alertStatus: 'WARNING' | 'WATCH' | 'NORMAL'
  confidence: number
  leadTime: string
  dangerGaugesCount: string
  primaryGaugeId: string
  subtitle: string
  summary: string
}

export const MONITORED_BASINS: MonitoredBasin[] = [
  {
    id: 'brahmaputra',
    name: 'Brahmaputra Upper Catchment',
    river: 'Brahmaputra',
    state: 'Assam & Arunachal Pradesh',
    alertStatus: 'WARNING',
    confidence: 94.6,
    leadTime: '+11.4h before news',
    dangerGaugesCount: '3 of 4',
    primaryGaugeId: 'dibrugarh',
    subtitle: 'Himalayan snowmelt & monsoon cloudburst corridor',
    summary: 'Central Water Commission acoustic telemetry indicates catastrophic surge rates exceeding +12cm/hr across Dibrugarh and Tezpur reaches. Sentinel-1 SAR radar confirms 34.8 sq km inundation across Kaziranga and Majuli agricultural floodplains.',
  },
  {
    id: 'mahanadi',
    name: 'Mahanadi Basin & Hirakud Reach',
    river: 'Mahanadi',
    state: 'Odisha & Chhattisgarh',
    alertStatus: 'WATCH',
    confidence: 62.1,
    leadTime: '+18.2h before news',
    dangerGaugesCount: '1 of 4',
    primaryGaugeId: 'hirakud',
    subtitle: 'Hirakud reservoir outflow & coastal delta bifurcation',
    summary: 'Upper Chhattisgarh catchment depression has triggered 24 sluice gates opening at Hirakud Dam, discharging 4.2 lakh cusecs. Khairmal and Tikarpara gorges approach critical warning levels. Pre-emptive watch declared for Cuttack delta.',
  },
  {
    id: 'godavari',
    name: 'Godavari Delta Reach',
    river: 'Godavari',
    state: 'Andhra Pradesh & Telangana',
    alertStatus: 'NORMAL',
    confidence: 18.5,
    leadTime: 'Nominal',
    dangerGaugesCount: '0 of 4',
    primaryGaugeId: 'bhadrachalam',
    subtitle: 'Eastern Ghats valley & Sir Arthur Cotton Barrage',
    summary: 'Discharge levels remain well within seasonal carrying capacity across Bhadrachalam and Dowleswaram barrages. Soil infiltration index indicates healthy moisture absorption capacity with zero embankment breach warnings.',
  },
]

export const BASIN_GAUGES: Record<string, RiverGauge[]> = {
  brahmaputra: [
    {
      id: 'dibrugarh',
      basinId: 'brahmaputra',
      name: 'Dibrugarh Station',
      river: 'Brahmaputra',
      reach: 'Upper Catchment (km 120)',
      stationCode: 'CWC-DBR-01',
      coordinates: { lat: 27.4728, lng: 94.912 },
      svgCoords: { x: 230, y: 175 },
      currentLevel: 105.82,
      warningLevel: 103.5,
      dangerLevel: 104.24,
      highestFloodLevel: 106.48,
      rateOfRise: 12.4,
      dischargeCumecs: 38450,
      status: 'SURGING',
      trend: 'RISING',
      lastUpdated: '10 mins ago',
      history24h: [
        { hour: '-24h', level: 103.1 },
        { hour: '-20h', level: 103.45 },
        { hour: '-16h', level: 103.9 },
        { hour: '-12h', level: 104.28 },
        { hour: '-8h', level: 104.85 },
        { hour: '-4h', level: 105.35 },
        { hour: 'NOW', level: 105.82 },
      ],
    },
    {
      id: 'tezpur',
      basinId: 'brahmaputra',
      name: 'Tezpur Reach',
      river: 'Brahmaputra',
      reach: 'Central Valley (km 280)',
      stationCode: 'CWC-TZP-04',
      coordinates: { lat: 26.6528, lng: 92.7926 },
      svgCoords: { x: 420, y: 220 },
      currentLevel: 65.48,
      warningLevel: 64.5,
      dangerLevel: 65.23,
      highestFloodLevel: 66.12,
      rateOfRise: 8.2,
      dischargeCumecs: 44200,
      status: 'OVER_DANGER',
      trend: 'RISING',
      lastUpdated: '14 mins ago',
      history24h: [
        { hour: '-24h', level: 63.8 },
        { hour: '-20h', level: 64.1 },
        { hour: '-16h', level: 64.45 },
        { hour: '-12h', level: 64.8 },
        { hour: '-8h', level: 65.1 },
        { hour: '-4h', level: 65.32 },
        { hour: 'NOW', level: 65.48 },
      ],
    },
    {
      id: 'guwahati',
      basinId: 'brahmaputra',
      name: 'Guwahati Pandu Port',
      river: 'Brahmaputra',
      reach: 'Lower Valley (km 410)',
      stationCode: 'CWC-GWH-09',
      coordinates: { lat: 26.1856, lng: 91.6916 },
      svgCoords: { x: 600, y: 290 },
      currentLevel: 49.92,
      warningLevel: 48.8,
      dangerLevel: 49.6,
      highestFloodLevel: 51.46,
      rateOfRise: 5.6,
      dischargeCumecs: 51100,
      status: 'APPROACHING',
      trend: 'RISING',
      lastUpdated: '8 mins ago',
      history24h: [
        { hour: '-24h', level: 48.6 },
        { hour: '-20h', level: 48.9 },
        { hour: '-16h', level: 49.15 },
        { hour: '-12h', level: 49.4 },
        { hour: '-8h', level: 49.62 },
        { hour: '-4h', level: 49.78 },
        { hour: 'NOW', level: 49.92 },
      ],
    },
    {
      id: 'dhubri',
      basinId: 'brahmaputra',
      name: 'Dhubri Terminal',
      river: 'Brahmaputra',
      reach: 'Border Reach (km 590)',
      stationCode: 'CWC-DHB-12',
      coordinates: { lat: 26.02, lng: 89.97 },
      svgCoords: { x: 770, y: 380 },
      currentLevel: 28.1,
      warningLevel: 27.8,
      dangerLevel: 28.6,
      highestFloodLevel: 30.36,
      rateOfRise: 3.8,
      dischargeCumecs: 54800,
      status: 'NORMAL',
      trend: 'RISING',
      lastUpdated: '18 mins ago',
      history24h: [
        { hour: '-24h', level: 27.1 },
        { hour: '-20h', level: 27.3 },
        { hour: '-16h', level: 27.5 },
        { hour: '-12h', level: 27.7 },
        { hour: '-8h', level: 27.85 },
        { hour: '-4h', level: 27.98 },
        { hour: 'NOW', level: 28.1 },
      ],
    },
  ],
  mahanadi: [
    {
      id: 'hirakud',
      basinId: 'mahanadi',
      name: 'Hirakud Reservoir Dam',
      river: 'Mahanadi',
      reach: 'Upper Catchment (km 90)',
      stationCode: 'CWC-HKD-01',
      coordinates: { lat: 21.52, lng: 83.87 },
      svgCoords: { x: 210, y: 220 },
      currentLevel: 192.15,
      warningLevel: 191.0,
      dangerLevel: 192.02,
      highestFloodLevel: 192.65,
      rateOfRise: 6.4,
      dischargeCumecs: 11890, // ~4.2 lakh cusecs
      status: 'OVER_DANGER',
      trend: 'RISING',
      lastUpdated: '12 mins ago',
      history24h: [
        { hour: '-24h', level: 190.5 },
        { hour: '-20h', level: 190.85 },
        { hour: '-16h', level: 191.2 },
        { hour: '-12h', level: 191.55 },
        { hour: '-8h', level: 191.8 },
        { hour: '-4h', level: 192.0 },
        { hour: 'NOW', level: 192.15 },
      ],
    },
    {
      id: 'khairmal',
      basinId: 'mahanadi',
      name: 'Khairmal Station',
      river: 'Mahanadi',
      reach: 'Mid-Reach Valley (km 210)',
      stationCode: 'CWC-KHM-03',
      coordinates: { lat: 20.81, lng: 84.18 },
      svgCoords: { x: 390, y: 270 },
      currentLevel: 107.85,
      warningLevel: 106.5,
      dangerLevel: 108.0,
      highestFloodLevel: 109.2,
      rateOfRise: 4.8,
      dischargeCumecs: 16400,
      status: 'APPROACHING',
      trend: 'RISING',
      lastUpdated: '15 mins ago',
      history24h: [
        { hour: '-24h', level: 105.8 },
        { hour: '-20h', level: 106.1 },
        { hour: '-16h', level: 106.5 },
        { hour: '-12h', level: 106.95 },
        { hour: '-8h', level: 107.35 },
        { hour: '-4h', level: 107.65 },
        { hour: 'NOW', level: 107.85 },
      ],
    },
    {
      id: 'tikarpara',
      basinId: 'mahanadi',
      name: 'Tikarpara Gorge',
      river: 'Mahanadi',
      reach: 'Gorge Reach (km 320)',
      stationCode: 'CWC-TKP-05',
      coordinates: { lat: 20.59, lng: 84.78 },
      svgCoords: { x: 580, y: 310 },
      currentLevel: 70.4,
      warningLevel: 69.5,
      dangerLevel: 72.5,
      highestFloodLevel: 74.8,
      rateOfRise: 7.1,
      dischargeCumecs: 21500,
      status: 'APPROACHING',
      trend: 'RISING',
      lastUpdated: '10 mins ago',
      history24h: [
        { hour: '-24h', level: 67.2 },
        { hour: '-20h', level: 67.8 },
        { hour: '-16h', level: 68.4 },
        { hour: '-12h', level: 69.1 },
        { hour: '-8h', level: 69.7 },
        { hour: '-4h', level: 70.1 },
        { hour: 'NOW', level: 70.4 },
      ],
    },
    {
      id: 'naraj',
      basinId: 'mahanadi',
      name: 'Naraj Barrage (Cuttack)',
      river: 'Mahanadi / Kathajodi',
      reach: 'Coastal Delta Apex (km 430)',
      stationCode: 'CWC-NRJ-08',
      coordinates: { lat: 20.47, lng: 85.77 },
      svgCoords: { x: 780, y: 260 },
      currentLevel: 25.85,
      warningLevel: 25.4,
      dangerLevel: 26.41,
      highestFloodLevel: 27.65,
      rateOfRise: 3.2,
      dischargeCumecs: 24200,
      status: 'APPROACHING',
      trend: 'RISING',
      lastUpdated: '22 mins ago',
      history24h: [
        { hour: '-24h', level: 24.8 },
        { hour: '-20h', level: 25.0 },
        { hour: '-16h', level: 25.2 },
        { hour: '-12h', level: 25.4 },
        { hour: '-8h', level: 25.55 },
        { hour: '-4h', level: 25.7 },
        { hour: 'NOW', level: 25.85 },
      ],
    },
  ],
  godavari: [
    {
      id: 'mancherial',
      basinId: 'godavari',
      name: 'Mancherial Station',
      river: 'Godavari',
      reach: 'Northern Reach (km 150)',
      stationCode: 'CWC-MNC-02',
      coordinates: { lat: 18.87, lng: 79.46 },
      svgCoords: { x: 190, y: 190 },
      currentLevel: 131.2,
      warningLevel: 134.0,
      dangerLevel: 136.5,
      highestFloodLevel: 138.8,
      rateOfRise: -0.4,
      dischargeCumecs: 4800,
      status: 'NORMAL',
      trend: 'RECEDING',
      lastUpdated: '25 mins ago',
      history24h: [
        { hour: '-24h', level: 131.9 },
        { hour: '-20h', level: 131.8 },
        { hour: '-16h', level: 131.6 },
        { hour: '-12h', level: 131.5 },
        { hour: '-8h', level: 131.4 },
        { hour: '-4h', level: 131.3 },
        { hour: 'NOW', level: 131.2 },
      ],
    },
    {
      id: 'bhadrachalam',
      basinId: 'godavari',
      name: 'Bhadrachalam Temple Reach',
      river: 'Godavari',
      reach: 'Middle Gorge (km 310)',
      stationCode: 'CWC-BDC-06',
      coordinates: { lat: 17.67, lng: 80.89 },
      svgCoords: { x: 410, y: 250 },
      currentLevel: 42.1,
      warningLevel: 48.0,
      dangerLevel: 53.0,
      highestFloodLevel: 55.6,
      rateOfRise: 0.8,
      dischargeCumecs: 9200,
      status: 'NORMAL',
      trend: 'STEADY',
      lastUpdated: '16 mins ago',
      history24h: [
        { hour: '-24h', level: 41.5 },
        { hour: '-20h', level: 41.6 },
        { hour: '-16h', level: 41.8 },
        { hour: '-12h', level: 41.9 },
        { hour: '-8h', level: 42.0 },
        { hour: '-4h', level: 42.05 },
        { hour: 'NOW', level: 42.1 },
      ],
    },
    {
      id: 'kunavaram',
      basinId: 'godavari',
      name: 'Kunavaram Sabari Confluence',
      river: 'Godavari / Sabari',
      reach: 'Confluence Reach (km 380)',
      stationCode: 'CWC-KNV-07',
      coordinates: { lat: 17.58, lng: 81.26 },
      svgCoords: { x: 600, y: 290 },
      currentLevel: 36.4,
      warningLevel: 39.5,
      dangerLevel: 41.5,
      highestFloodLevel: 43.8,
      rateOfRise: 0.2,
      dischargeCumecs: 11400,
      status: 'NORMAL',
      trend: 'STEADY',
      lastUpdated: '19 mins ago',
      history24h: [
        { hour: '-24h', level: 36.2 },
        { hour: '-20h', level: 36.2 },
        { hour: '-16h', level: 36.3 },
        { hour: '-12h', level: 36.3 },
        { hour: '-8h', level: 36.35 },
        { hour: '-4h', level: 36.38 },
        { hour: 'NOW', level: 36.4 },
      ],
    },
    {
      id: 'dowleswaram',
      basinId: 'godavari',
      name: 'Dowleswaram Barrage',
      river: 'Godavari',
      reach: 'Delta Apex / Rajahmundry (km 470)',
      stationCode: 'CWC-DOW-10',
      coordinates: { lat: 16.94, lng: 81.77 },
      svgCoords: { x: 780, y: 350 },
      currentLevel: 11.2,
      warningLevel: 13.0,
      dangerLevel: 14.0,
      highestFloodLevel: 16.2,
      rateOfRise: 0.0,
      dischargeCumecs: 14200,
      status: 'NORMAL',
      trend: 'STEADY',
      lastUpdated: '11 mins ago',
      history24h: [
        { hour: '-24h', level: 11.1 },
        { hour: '-20h', level: 11.15 },
        { hour: '-16h', level: 11.15 },
        { hour: '-12h', level: 11.2 },
        { hour: '-8h', level: 11.2 },
        { hour: '-4h', level: 11.2 },
        { hour: 'NOW', level: 11.2 },
      ],
    },
  ],
}

// Default export fallback for backward compatibility
export const RIVER_GAUGES: RiverGauge[] = BASIN_GAUGES.brahmaputra

export const BASIN_FUSION_SIGNALS: Record<string, FusionSignal[]> = {
  brahmaputra: [
    {
      id: 'radar-rain',
      name: 'Rainfall Doppler (IMD Early Run)',
      source: 'NASA GPM IMERG + IMD Radar Grids',
      reading: '+92mm/hr localized cloudburst upper catchment',
      percentile: '98.4th percentile 72h accumulation',
      weight: 0.28,
      score: 0.95,
      status: 'ALERT',
      description: 'Extreme orographic precipitation cluster detected over Dihang and Lohit sub-basins.',
      latency: '30m telemetry cadence',
    },
    {
      id: 'river-gauges',
      name: 'River Gauges (CWC Telemetry)',
      source: 'Central Water Commission India-WRIS',
      reading: 'Brahmaputra gauge delta +1.58m over danger mark',
      percentile: 'Top 1% historical discharge rate',
      weight: 0.32,
      score: 0.98,
      status: 'ALERT',
      description: 'Dibrugarh and Tezpur stations continuously exceeding danger level with +12cm/hr surge rate.',
      latency: 'Hourly automated acoustic telemetry',
    },
    {
      id: 'hydrology-runoff',
      name: 'Hydrology Runoff (GloFAS / C-FLOOD)',
      source: 'Copernicus GloFAS + CWC Inundation Model',
      reading: 'GLOFAS 5-year discharge exceedance: 88.4%',
      percentile: 'Peak discharge expected in 14 hours',
      weight: 0.22,
      score: 0.88,
      status: 'ALERT',
      description: 'Hydrodynamic flow model projects inundation across 34 sq km low-lying agricultural plains.',
      latency: 'Daily ensemble forecast cycle',
    },
    {
      id: 'sentinel-sar',
      name: 'Sentinel-1 SAR Radar Swath',
      source: 'ESA Copernicus Sentinel-1 GRD Radar',
      reading: 'VV/VH backscatter anomaly: -4.2 dB drop',
      percentile: 'Water mask confirmed through monsoonal cloud',
      weight: 0.12,
      score: 0.96,
      status: 'CONFIRMED',
      description: 'Radar penetration through dense overcast confirms standing surface water in valley depression.',
      latency: 'Multi-day orbit repeat cross-validation',
    },
    {
      id: 'soil-saturation',
      name: 'Soil Moisture Saturation',
      source: 'NASA SMAP / ERA5-Land Hydro',
      reading: '94.2% antecedent soil moisture index',
      percentile: 'Zero infiltration capacity remaining',
      weight: 0.06,
      score: 0.92,
      status: 'ACTIVE',
      description: 'Pre-existing monsoon saturation converts 90%+ of incoming cloudburst rain directly to runoff.',
      latency: 'Daily passive microwave assimilation',
    },
  ],
  mahanadi: [
    {
      id: 'radar-rain-mh',
      name: 'Rainfall Estimates (IMD Gridded Data)',
      source: 'IMD AWS + GPM IMERG Grids',
      reading: '+74.2mm/24h continuous rain in Chhattisgarh plains',
      percentile: '82.6th percentile monsoon accumulation',
      weight: 0.28,
      score: 0.74,
      status: 'ACTIVE',
      description: 'Depression over northwest Bay of Bengal feeding heavy inflow into upstream Mahanadi basin.',
      latency: '30m telemetry cadence',
    },
    {
      id: 'river-gauges-mh',
      name: 'River Gauges & Dam Inflow (CWC)',
      source: 'Central Water Commission & Odisha WRD',
      reading: 'Hirakud Dam 192.15m (Danger: 192.02m) · 24 Gates Open',
      percentile: 'Outflow 4.2 lakh cusecs into downstream reaches',
      weight: 0.32,
      score: 0.81,
      status: 'ALERT',
      description: 'Hirakud reservoir storage at 99.1% capacity; high volume discharge forcing surge at Khairmal.',
      latency: 'Hourly dam & telemetry station feeds',
    },
    {
      id: 'hydrology-runoff-mh',
      name: 'Hydrological Forecast (C-FLOOD Mahanadi)',
      source: 'CWC C-FLOOD Hydrodynamic Simulation',
      reading: 'C-FLOOD 2-day inundation forecast: 58.2% probability',
      percentile: 'Peak stage expected at Tikarpara in 22 hours',
      weight: 0.22,
      score: 0.62,
      status: 'ACTIVE',
      description: 'Simulations project moderate bank overflow near Mundali and Naraj bifurcation if rain persists.',
      latency: 'Daily hydrodynamic model run',
    },
    {
      id: 'sentinel-sar-mh',
      name: 'Sentinel-1 SAR Radar Swath',
      source: 'ESA Copernicus Sentinel-1 GRD Radar',
      reading: 'Backscatter anomaly: -2.1 dB localized drop',
      percentile: 'Early water expansion in low-lying paddy flats',
      weight: 0.12,
      score: 0.48,
      status: 'NORMAL',
      description: 'Radar passes detect localized waterlogging across 14.2 sq km; main embankments remain unbreached.',
      latency: 'Orbit pass verified 6h ago',
    },
    {
      id: 'soil-saturation-mh',
      name: 'Soil Moisture Saturation',
      source: 'NASA SMAP / ERA5-Land Hydro',
      reading: '76.5% antecedent soil moisture index',
      percentile: 'Limited ground infiltration capacity',
      weight: 0.06,
      score: 0.70,
      status: 'ACTIVE',
      description: 'Moderate soil saturation across Mahanadi lower basin accelerates surface runoff towards delta.',
      latency: 'Daily passive microwave assimilation',
    },
  ],
  godavari: [
    {
      id: 'radar-rain-gd',
      name: 'Rainfall Doppler (IMD Early Run)',
      source: 'NASA GPM IMERG + IMD Radar Grids',
      reading: '12.4mm/24h scattered light precipitation',
      percentile: '38.2th percentile (within seasonal normal)',
      weight: 0.28,
      score: 0.22,
      status: 'NORMAL',
      description: 'No significant monsoon depression or localized cloudburst activity across basin catchment.',
      latency: '30m telemetry cadence',
    },
    {
      id: 'river-gauges-gd',
      name: 'River Gauges (CWC Telemetry)',
      source: 'Central Water Commission India-WRIS',
      reading: 'Bhadrachalam stage 42.10m (Warning: 48.0m, Danger: 53.0m)',
      percentile: 'All 4 stations operating 5m+ below danger',
      weight: 0.32,
      score: 0.15,
      status: 'NORMAL',
      description: 'Water levels steady across Godavari main stem; Dowleswaram barrage discharging nominal flow.',
      latency: 'Hourly automated acoustic telemetry',
    },
    {
      id: 'hydrology-runoff-gd',
      name: 'Hydrology Runoff (GloFAS / C-FLOOD)',
      source: 'Copernicus GloFAS + C-FLOOD Godavari',
      reading: 'GloFAS 2-year flow exceedance probability: 14.1%',
      percentile: 'Zero flood crest predicted in next 72 hours',
      weight: 0.22,
      score: 0.18,
      status: 'NORMAL',
      description: 'Streamflow projections remain well inside standard river channel cross-section.',
      latency: 'Daily ensemble forecast cycle',
    },
    {
      id: 'sentinel-sar-gd',
      name: 'Sentinel-1 SAR Radar Swath',
      source: 'ESA Copernicus Sentinel-1 GRD Radar',
      reading: 'Backscatter delta: -0.2 dB (nominal baseline)',
      percentile: 'Permanent river course only (no flood expansion)',
      weight: 0.12,
      score: 0.05,
      status: 'NORMAL',
      description: 'Radar backscatter matches dry seasonal baseline with zero detected off-channel waterlogging.',
      latency: 'Multi-day orbit repeat cross-validation',
    },
    {
      id: 'soil-saturation-gd',
      name: 'Soil Moisture Saturation',
      source: 'NASA SMAP / ERA5-Land Hydro',
      reading: '42.0% soil moisture index',
      percentile: 'Optimal infiltration buffer available',
      weight: 0.06,
      score: 0.35,
      status: 'NORMAL',
      description: 'Ground absorption capacity capable of buffering up to 65mm additional rainfall before runoff.',
      latency: 'Daily passive microwave assimilation',
    },
  ],
}

// Backward compatibility
export const FUSION_SIGNALS: FusionSignal[] = BASIN_FUSION_SIGNALS.brahmaputra

export const BASIN_SAR_METRICS: Record<string, SarPassData> = {
  brahmaputra: {
    satellite: 'Sentinel-1A (C-Band Radar)',
    orbitNumber: 42918,
    passType: 'DESCENDING',
    polarisation: 'VV + VH',
    acquisitionTime: '2026-10-26T04:18:22Z',
    baselineDb: -14.6,
    currentBackscatterDb: -18.8,
    deltaDb: -4.2,
    detectedWaterAreaSqKm: 34.8,
    confidenceLevel: 94.6,
    otsuThreshold: -17.4,
  },
  mahanadi: {
    satellite: 'Sentinel-1B (C-Band Radar)',
    orbitNumber: 42892,
    passType: 'ASCENDING',
    polarisation: 'VV + VH',
    acquisitionTime: '2026-10-26T02:44:10Z',
    baselineDb: -14.2,
    currentBackscatterDb: -16.3,
    deltaDb: -2.1,
    detectedWaterAreaSqKm: 14.2,
    confidenceLevel: 62.1,
    otsuThreshold: -16.8,
  },
  godavari: {
    satellite: 'Sentinel-1A (C-Band Radar)',
    orbitNumber: 42854,
    passType: 'DESCENDING',
    polarisation: 'VV + VH',
    acquisitionTime: '2026-10-25T22:15:40Z',
    baselineDb: -14.0,
    currentBackscatterDb: -14.2,
    deltaDb: -0.2,
    detectedWaterAreaSqKm: 2.1,
    confidenceLevel: 18.5,
    otsuThreshold: -15.9,
  },
}

export const SAR_PASS_METRICS: SarPassData = BASIN_SAR_METRICS.brahmaputra

export const BASIN_CRYPTOGRAPHIC_PROOFS: Record<string, CryptographicProof> = {
  brahmaputra: {
    alertId: 'ALERT-BRAHMAPUTRA-2026-08',
    basinName: 'Brahmaputra Catchment Grid #48-East',
    alertLevel: 'CONFIRMED',
    detectionTimestamp: '2026-10-26 04:18:22 UTC',
    detectionBlockNumber: 19482091,
    detectionTxHash: '0x9e3f71c48209bb74a10df5419b48f657a2209148b301cd23b890ef14892cfa71',
    stateMerkleRoot: '0x7a2f44c9b109e4d00891ac41098bf12908a8f10b2308c109fa7129c9bb8812c4',
    dataFingerprint: 'SHA-256: 4fa91c80b2c140924e09d18ac93019fba849102488a092147bf0912cb4019a28',
    gdeltFirstNewsTimestamp: '2026-10-26 15:45:00 UTC',
    verifiedLeadTimeHours: 11.45,
  },
  mahanadi: {
    alertId: 'ALERT-MAHANADI-2026-03',
    basinName: 'Mahanadi Basin Sector #14-Hirakud',
    alertLevel: 'WATCH',
    detectionTimestamp: '2026-10-26 02:44:10 UTC',
    detectionBlockNumber: 19481720,
    detectionTxHash: '0x4ca18e2098bb2710dfa4109b83f6511a2209148b301cd23b890ef14892cfa89',
    stateMerkleRoot: '0x3b1c55e9b109e4d00891ac41098bf12908a8f10b2308c109fa7129c9bb8844f2',
    dataFingerprint: 'SHA-256: 9bc23d11b2c140924e09d18ac93019fba849102488a092147bf0912cb40188ef',
    gdeltFirstNewsTimestamp: '2026-10-26 21:00:00 UTC',
    verifiedLeadTimeHours: 18.26,
  },
  godavari: {
    alertId: 'REGISTRY-GODAVARI-2026-NOMINAL',
    basinName: 'Godavari Delta Reach Grid #07-South',
    alertLevel: 'NOMINAL',
    detectionTimestamp: '2026-10-25 22:15:40 UTC',
    detectionBlockNumber: 19482410,
    detectionTxHash: '0x81ef93c48209bb74a10df5419b48f657a2209148b301cd23b890ef14892cf51a',
    stateMerkleRoot: '0x12a09dc9b109e4d00891ac41098bf12908a8f10b2308c109fa7129c9bb8877bc',
    dataFingerprint: 'SHA-256: 2de81940b2c140924e09d18ac93019fba849102488a092147bf0912cb40123cd',
    gdeltFirstNewsTimestamp: 'None (Nominal condition)',
    verifiedLeadTimeHours: 0.0,
  },
}

export const CRYPTOGRAPHIC_PROOF: CryptographicProof = BASIN_CRYPTOGRAPHIC_PROOFS.brahmaputra

export function getBasinById(basinId: string): MonitoredBasin {
  return MONITORED_BASINS.find((b) => b.id === basinId) || MONITORED_BASINS[0]
}

export function getGaugesForBasin(basinId: string): RiverGauge[] {
  return BASIN_GAUGES[basinId] || BASIN_GAUGES.brahmaputra
}

export function getSignalsForBasin(basinId: string): FusionSignal[] {
  return BASIN_FUSION_SIGNALS[basinId] || BASIN_FUSION_SIGNALS.brahmaputra
}

export function getSarMetricsForBasin(basinId: string): SarPassData {
  return BASIN_SAR_METRICS[basinId] || BASIN_SAR_METRICS.brahmaputra
}

export function getCryptoProofForBasin(basinId: string): CryptographicProof {
  return BASIN_CRYPTOGRAPHIC_PROOFS[basinId] || BASIN_CRYPTOGRAPHIC_PROOFS.brahmaputra
}

export interface WhyItFiredComponent {
  factor: string
  source: string
  rawReading: string
  weight: number
  contribution: number // w_i * x_i
  percentage: number
  status: 'CRITICAL' | 'ELEVATED' | 'NOMINAL'
  description: string
}

export interface HysteresisEvent {
  timestamp: string
  hoursAgo: string
  level: 'CLEAR' | 'WATCH' | 'WARNING' | 'CONFIRMED'
  trigger: string
}

export interface SubBasinAlert {
  id: string
  basinId: string
  blockName: string
  district: string
  level: 'CONFIRMED' | 'WARNING' | 'WATCH' | 'CLEAR'
  probability: number
  expectedPeak: string
  inundationExtentSqKm: number
  populationAtRisk: number
  primaryGaugeName: string
  gaugeStageMeters: number
  gaugeWarningLevelMeters: number
  gaugeDangerLevelMeters: number
  rain72hMm: number
  glofasDischargeCumecs: number
  whyItFired: WhyItFiredComponent[]
  hysteresis: HysteresisEvent[]
  satelliteConfirmed: boolean
  satellitePassTime: string
  waterMaskSqKm: number
  detectionHash: string
  polygonTxHash: string
  blockNumber: number
  timestamp: string
}

export const SUB_BASIN_ALERTS: Record<string, SubBasinAlert[]> = {
  brahmaputra: [
    {
      id: 'alt-majuli-01',
      basinId: 'brahmaputra',
      blockName: 'Majuli Sub-basin & Island Embankment',
      district: 'Majuli & Jorhat',
      level: 'CONFIRMED',
      probability: 0.94,
      expectedPeak: '+11h 25m (27 Oct, 04:00 UTC)',
      inundationExtentSqKm: 142.8,
      populationAtRisk: 48200,
      primaryGaugeName: 'Gormur / Kherkutia Gauge',
      gaugeStageMeters: 87.4,
      gaugeWarningLevelMeters: 86.4,
      gaugeDangerLevelMeters: 86.9,
      rain72hMm: 184.2,
      glofasDischargeCumecs: 14280,
      whyItFired: [
        {
          factor: 'Upstream Catchment Rain',
          source: 'NASA GPM IMERG Early Run (0.1°)',
          rawReading: '184.2 mm (72h accumulation)',
          weight: 0.35,
          contribution: 0.32,
          percentage: 34,
          status: 'CRITICAL',
          description: 'Intense orographic precipitation in upper Arunachal foothills exceeding 95th percentile.',
        },
        {
          factor: 'CWC River Stage Anomaly',
          source: 'India-WRIS Gormur Station',
          rawReading: '+0.50m above Danger Level (87.40m)',
          weight: 0.30,
          contribution: 0.28,
          percentage: 30,
          status: 'CRITICAL',
          description: 'Sustained rate of rise +22 cm/hr breaching high-water structural marks.',
        },
        {
          factor: 'GloFAS Discharge Forecast',
          source: 'Open-Meteo GloFAS v4 (5km)',
          rawReading: '14,280 m³/s (Exceeds 10-yr return)',
          weight: 0.20,
          contribution: 0.18,
          percentage: 19,
          status: 'ELEVATED',
          description: 'Ensemble 90th percentile signals surge crest within 12 hours.',
        },
        {
          factor: 'Antecedent Soil Saturation',
          source: 'SMAP / Hydro-catchment model',
          rawReading: '88.4% Root-zone water content',
          weight: 0.10,
          contribution: 0.10,
          percentage: 11,
          status: 'ELEVATED',
          description: 'Pre-existing monsoon saturation prevents ground infiltration.',
        },
        {
          factor: 'Ground Citizen Reports',
          source: 'Crowdsourced Telemetry Feed',
          rawReading: '14 verified riverbank seepage reports',
          weight: 0.05,
          contribution: 0.06,
          percentage: 6,
          status: 'ELEVATED',
          description: 'Civic verification matching satellite water polygon edge.',
        },
      ],
      hysteresis: [
        { timestamp: '25 Oct 14:00 UTC', hoursAgo: '32h ago', level: 'CLEAR', trigger: 'Catchment rainfall baseline nominal' },
        { timestamp: '25 Oct 22:30 UTC', hoursAgo: '24h ago', level: 'WATCH', trigger: 'NASA GPM early run signals > 100mm cloudburst upstream' },
        { timestamp: '26 Oct 04:15 UTC', hoursAgo: '18h ago', level: 'WARNING', trigger: 'CWC Gormur gauge breaches Warning Level (86.40m)' },
        { timestamp: '26 Oct 10:40 UTC', hoursAgo: '12h ago', level: 'CONFIRMED', trigger: 'Sentinel-1 SAR radar pass verifies 142.8 km² ground inundation' },
      ],
      satelliteConfirmed: true,
      satellitePassTime: '26 Oct 10:40 UTC (Pass #148)',
      waterMaskSqKm: 142.8,
      detectionHash: '0x3f9e8a7b11c9d48203f7e1b8c6a5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7',
      polygonTxHash: '0x7a29e1c409b88e109df4421b990184b901a8f9024c8b919d883910cbe77a1928',
      blockNumber: 19482850,
      timestamp: '26 Oct 2026, 10:40 UTC',
    },
    {
      id: 'alt-dibrugarh-02',
      basinId: 'brahmaputra',
      blockName: 'Dibrugarh Urban Embankment & Reach',
      district: 'Dibrugarh',
      level: 'WARNING',
      probability: 0.74,
      expectedPeak: '+08h 15m (26 Oct, 23:00 UTC)',
      inundationExtentSqKm: 86.4,
      populationAtRisk: 29500,
      primaryGaugeName: 'Dibrugarh Water Gate',
      gaugeStageMeters: 106.1,
      gaugeWarningLevelMeters: 105.1,
      gaugeDangerLevelMeters: 105.7,
      rain72hMm: 142.0,
      glofasDischargeCumecs: 11200,
      whyItFired: [
        {
          factor: 'CWC River Stage Anomaly',
          source: 'India-WRIS Dibrugarh Gate',
          rawReading: '+0.40m above Danger Level (106.10m)',
          weight: 0.35,
          contribution: 0.30,
          percentage: 41,
          status: 'CRITICAL',
          description: 'Water level surging above municipal sluice gate clearance.',
        },
        {
          factor: 'Upstream Catchment Rain',
          source: 'NASA GPM IMERG Early Run (0.1°)',
          rawReading: '142.0 mm (72h accumulation)',
          weight: 0.30,
          contribution: 0.24,
          percentage: 32,
          status: 'ELEVATED',
          description: 'Upper basin run-off reaching main channel.',
        },
        {
          factor: 'GloFAS Discharge Forecast',
          source: 'Open-Meteo GloFAS v4 (5km)',
          rawReading: '11,200 m³/s (Exceeds 5-yr return)',
          weight: 0.20,
          contribution: 0.14,
          percentage: 19,
          status: 'ELEVATED',
          description: 'Inflow peak projected in next 8 hours.',
        },
        {
          factor: 'Antecedent Soil Saturation',
          source: 'SMAP Soil Index',
          rawReading: '81.2% Moisture',
          weight: 0.15,
          contribution: 0.06,
          percentage: 8,
          status: 'NOMINAL',
          description: 'Urban drainage capacity constrained.',
        },
      ],
      hysteresis: [
        { timestamp: '25 Oct 18:00 UTC', hoursAgo: '28h ago', level: 'CLEAR', trigger: 'Channel gauge within seasonal average' },
        { timestamp: '26 Oct 02:00 UTC', hoursAgo: '20h ago', level: 'WATCH', trigger: 'Rising stage +14 cm/hr triggers advisory' },
        { timestamp: '26 Oct 07:15 UTC', hoursAgo: '15h ago', level: 'WARNING', trigger: 'Stage reaches 106.10m (Danger Level breached)' },
      ],
      satelliteConfirmed: false,
      satellitePassTime: 'Pending (Next Sentinel-1 pass in ~5h 20m)',
      waterMaskSqKm: 86.4,
      detectionHash: '0x4fa91c80b2c140924e09d18ac93019fba849102488a092147bf0912cb4019a28',
      polygonTxHash: '0x992b4109ca88172df0019a28c41982b8901a88cf10928374bb8192019ab921c4',
      blockNumber: 19482790,
      timestamp: '26 Oct 2026, 07:15 UTC',
    },
    {
      id: 'alt-pasighat-03',
      basinId: 'brahmaputra',
      blockName: 'Pasighat Siang Confluence Reach',
      district: 'East Siang',
      level: 'WATCH',
      probability: 0.52,
      expectedPeak: '+16h 00m (27 Oct, 08:30 UTC)',
      inundationExtentSqKm: 32.1,
      populationAtRisk: 12000,
      primaryGaugeName: 'Pasighat Siang Station',
      gaugeStageMeters: 154.2,
      gaugeWarningLevelMeters: 153.5,
      gaugeDangerLevelMeters: 153.96,
      rain72hMm: 98.4,
      glofasDischargeCumecs: 8400,
      whyItFired: [
        {
          factor: 'Upstream Catchment Rain',
          source: 'NASA GPM IMERG Early Run',
          rawReading: '98.4 mm in 72h',
          weight: 0.40,
          contribution: 0.22,
          percentage: 42,
          status: 'ELEVATED',
          description: 'Himalayan headwaters inflow building.',
        },
        {
          factor: 'CWC River Stage Anomaly',
          source: 'India-WRIS Pasighat Gauge',
          rawReading: '+0.24m above Danger (154.20m)',
          weight: 0.35,
          contribution: 0.18,
          percentage: 35,
          status: 'ELEVATED',
          description: 'High velocity mountainous discharge.',
        },
        {
          factor: 'GloFAS Discharge Forecast',
          source: 'Open-Meteo GloFAS v4',
          rawReading: '8,400 m³/s',
          weight: 0.25,
          contribution: 0.12,
          percentage: 23,
          status: 'NOMINAL',
          description: 'Approaching 2-year flood recurrence threshold.',
        },
      ],
      hysteresis: [
        { timestamp: '26 Oct 01:00 UTC', hoursAgo: '21h ago', level: 'CLEAR', trigger: 'Discharge nominal' },
        { timestamp: '26 Oct 09:30 UTC', hoursAgo: '13h ago', level: 'WATCH', trigger: 'Mountain rainfall pulse detected' },
      ],
      satelliteConfirmed: false,
      satellitePassTime: 'Pending (SAR pass in ~8h 40m)',
      waterMaskSqKm: 32.1,
      detectionHash: '0x19a28f98fc4892cfa7129c94819a820491820938491820491820491820491820',
      polygonTxHash: '0x82b410ca19f88492011b9c924019a84920491820491820194819a84920184910',
      blockNumber: 19482610,
      timestamp: '26 Oct 2026, 09:30 UTC',
    },
    {
      id: 'alt-guwahati-04',
      basinId: 'brahmaputra',
      blockName: 'Guwahati Pandu Port & Kamrup',
      district: 'Kamrup Metropolitan',
      level: 'CLEAR',
      probability: 0.18,
      expectedPeak: '+36h 00m (Nominal)',
      inundationExtentSqKm: 0,
      populationAtRisk: 0,
      primaryGaugeName: 'Pandu Gauge Station',
      gaugeStageMeters: 47.8,
      gaugeWarningLevelMeters: 49.6,
      gaugeDangerLevelMeters: 50.1,
      rain72hMm: 22.4,
      glofasDischargeCumecs: 6100,
      whyItFired: [
        {
          factor: 'CWC River Stage Anomaly',
          source: 'India-WRIS Pandu Station',
          rawReading: '1.80m below Warning Mark (47.80m)',
          weight: 0.40,
          contribution: 0.05,
          percentage: 28,
          status: 'NOMINAL',
          description: 'Downstream channel currently has adequate freeboard cushion.',
        },
        {
          factor: 'Upstream Catchment Rain',
          source: 'NASA GPM IMERG',
          rawReading: '22.4 mm (Below threshold)',
          weight: 0.35,
          contribution: 0.08,
          percentage: 44,
          status: 'NOMINAL',
          description: 'No local cloudburst in urban catchment.',
        },
        {
          factor: 'GloFAS Discharge Forecast',
          source: 'Open-Meteo GloFAS v4',
          rawReading: '6,100 m³/s',
          weight: 0.25,
          contribution: 0.05,
          percentage: 28,
          status: 'NOMINAL',
          description: 'Normal seasonal flow rate.',
        },
      ],
      hysteresis: [
        { timestamp: '26 Oct 00:00 UTC', hoursAgo: '22h ago', level: 'CLEAR', trigger: 'Operating within safe parameters' },
      ],
      satelliteConfirmed: false,
      satellitePassTime: 'Not required (Baseline nominal)',
      waterMaskSqKm: 0,
      detectionHash: '0x884920DbC910eF4892cfa7129c9bb8812c4019a2884920DbC910eF4892cfa712',
      polygonTxHash: '0x12a09dc9b109e4d00891ac41098bf12908a8f10b2308c109fa7129c9bb8812c4',
      blockNumber: 19482400,
      timestamp: '26 Oct 2026, 00:00 UTC',
    },
  ],
  mahanadi: [
    {
      id: 'alt-cuttack-01',
      basinId: 'mahanadi',
      blockName: 'Mahanadi Delta Plain & Cuttack Reach',
      district: 'Cuttack & Kendrapara',
      level: 'WARNING',
      probability: 0.82,
      expectedPeak: '+18h 00m (27 Oct, 10:00 UTC)',
      inundationExtentSqKm: 86.4,
      populationAtRisk: 29500,
      primaryGaugeName: 'Naraj Weir Delta Gauge',
      gaugeStageMeters: 26.8,
      gaugeWarningLevelMeters: 25.4,
      gaugeDangerLevelMeters: 26.4,
      rain72hMm: 168.0,
      glofasDischargeCumecs: 9800,
      whyItFired: [
        {
          factor: 'Upstream Catchment Rain',
          source: 'NASA GPM IMERG Early Run',
          rawReading: '168.0 mm in 72h',
          weight: 0.35,
          contribution: 0.31,
          percentage: 38,
          status: 'CRITICAL',
          description: 'Bay of Bengal depression induced heavy catchment deluge.',
        },
        {
          factor: 'CWC River Stage Anomaly',
          source: 'India-WRIS Naraj Station',
          rawReading: '+0.40m above Danger (26.80m)',
          weight: 0.35,
          contribution: 0.29,
          percentage: 35,
          status: 'CRITICAL',
          description: 'Discharge from Hirakud dam gates reaching delta head.',
        },
        {
          factor: 'GloFAS Discharge Forecast',
          source: 'Open-Meteo GloFAS v4',
          rawReading: '9,800 m³/s',
          weight: 0.20,
          contribution: 0.16,
          percentage: 20,
          status: 'ELEVATED',
          description: 'Approaching 8-year flood recurrence threshold.',
        },
        {
          factor: 'Soil Saturation',
          source: 'SMAP Soil Moisture',
          rawReading: '84.0% Saturation',
          weight: 0.10,
          contribution: 0.06,
          percentage: 7,
          status: 'ELEVATED',
          description: 'Coastal agricultural plains saturated.',
        },
      ],
      hysteresis: [
        { timestamp: '25 Oct 20:00 UTC', hoursAgo: '26h ago', level: 'CLEAR', trigger: 'Channel flow steady' },
        { timestamp: '26 Oct 02:40 UTC', hoursAgo: '19h ago', level: 'WATCH', trigger: 'Hirakud dam discharges 12 sluice gates' },
        { timestamp: '26 Oct 08:15 UTC', hoursAgo: '14h ago', level: 'WARNING', trigger: 'Naraj gauge exceeds danger mark (26.40m)' },
      ],
      satelliteConfirmed: false,
      satellitePassTime: 'Pending (Sentinel-1 pass in ~7h 15m)',
      waterMaskSqKm: 86.4,
      detectionHash: '0x4b81c19f09d88201a4f009e4198c0b24019a820c4b901a8920194819a8401928',
      polygonTxHash: '0x4ca18e2098bb2710dfa4109b83f6511a2209148b301cd23b890ef14892cfa89',
      blockNumber: 19482110,
      timestamp: '26 Oct 2026, 08:15 UTC',
    },
  ],
}

export interface DataFeedFreshness {
  source: string
  name: string
  latency: string
  status: 'FRESH' | 'STALE' | 'NOMINAL'
  resolution: string
  lastIngestTime: string
}

export const DATA_FRESHNESS_FEEDS: Record<string, DataFeedFreshness> = {
  rain: {
    source: 'NASA GPM IMERG Early Run',
    name: 'Rainfall Early Run',
    latency: '1h 48m ago',
    status: 'FRESH',
    resolution: '0.1° (~10 km) grid',
    lastIngestTime: '17:28 UTC',
  },
  gauges: {
    source: 'CWC India-WRIS',
    name: 'River Gauges Telemetry',
    latency: '14m ago',
    status: 'FRESH',
    resolution: 'Station Real-time',
    lastIngestTime: '19:02 UTC',
  },
  glofas: {
    source: 'Open-Meteo GloFAS v4',
    name: 'GloFAS Discharge Forecast',
    latency: '3h 50m ago',
    status: 'FRESH',
    resolution: '5 km Daily Ensemble',
    lastIngestTime: '15:26 UTC',
  },
  satellite: {
    source: 'Sentinel-1 C-SAR (GEE)',
    name: 'Sentinel-1 SAR Radar',
    latency: 'Pass at 10:40 UTC',
    status: 'FRESH',
    resolution: '10m Dual-Pol (VV+VH)',
    lastIngestTime: '10:40 UTC',
  },
}

export interface ReplayArchiveEvent {
  id: string
  label: string
  basinName: string
  dateString: string
  provenLeadTime: string
  inundationSqKm: number
  summary: string
}

export const REPLAY_ARCHIVE_EVENTS: ReplayArchiveEvent[] = [
  {
    id: 'assam-2026-oct',
    label: 'Assam Brahmaputra Surge (Oct 2026 Live Replay)',
    basinName: 'Brahmaputra Basin',
    dateString: '25-27 Oct 2026',
    provenLeadTime: '11.4 hours before news',
    inundationSqKm: 142.8,
    summary: 'Cloudburst over Arunachal foothills triggered flash inundation in Majuli and Dibrugarh.',
  },
  {
    id: 'assam-2022-jul',
    label: 'Assam Flood Benchmark Archive (July 2022)',
    basinName: 'Brahmaputra Basin',
    dateString: '14-19 Jul 2022',
    provenLeadTime: '14.2 hours before news',
    inundationSqKm: 210.5,
    summary: 'Historic Kopili and Brahmaputra breach dataset with Sentinel-1 SAR Ground Truth.',
  },
  {
    id: 'odisha-2026-oct',
    label: 'Mahanadi Delta Cyclone Flood (Oct 2026 Archive)',
    basinName: 'Mahanadi Basin',
    dateString: '24-26 Oct 2026',
    provenLeadTime: '18.2 hours before news',
    inundationSqKm: 86.4,
    summary: 'Heavy cyclone depression over Bay of Bengal leading to Hirakud gate release.',
  },
]

export function getAlertsForBasin(basinId: string): SubBasinAlert[] {
  return SUB_BASIN_ALERTS[basinId] || SUB_BASIN_ALERTS.brahmaputra
}
