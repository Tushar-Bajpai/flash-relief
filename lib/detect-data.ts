export interface RiverGauge {
  id: string
  name: string
  river: string
  reach: string
  stationCode: string
  coordinates: { lat: number; lng: number }
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
  alertLevel: 'WARNING' | 'CONFIRMED'
  detectionTimestamp: string
  detectionBlockNumber: number
  detectionTxHash: string
  stateMerkleRoot: string
  dataFingerprint: string
  gdeltFirstNewsTimestamp: string
  verifiedLeadTimeHours: number
}

export const MONITORED_BASINS = [
  {
    id: 'brahmaputra',
    name: 'Brahmaputra Upper Catchment',
    state: 'Assam & Arunachal Pradesh',
    alertStatus: 'WARNING',
    confidence: 94.6,
    leadTime: '+11.4h before news',
    dangerGaugesCount: '3 of 4',
  },
  {
    id: 'mahanadi',
    name: 'Mahanadi Basin',
    state: 'Odisha',
    alertStatus: 'WATCH',
    confidence: 62.1,
    leadTime: '+18.2h before news',
    dangerGaugesCount: '1 of 5',
  },
  {
    id: 'godavari',
    name: 'Godavari Delta Reach',
    state: 'Andhra Pradesh & Telangana',
    alertStatus: 'NORMAL',
    confidence: 18.5,
    leadTime: 'Nominal',
    dangerGaugesCount: '0 of 6',
  },
]

export const RIVER_GAUGES: RiverGauge[] = [
  {
    id: 'dibrugarh',
    name: 'Dibrugarh Station',
    river: 'Brahmaputra',
    reach: 'Upper Catchment (km 120)',
    stationCode: 'CWC-DBR-01',
    coordinates: { lat: 27.4728, lng: 94.912 },
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
    name: 'Tezpur Reach',
    river: 'Brahmaputra',
    reach: 'Central Valley (km 280)',
    stationCode: 'CWC-TZP-04',
    coordinates: { lat: 26.6528, lng: 92.7926 },
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
    name: 'Guwahati Pandu Port',
    river: 'Brahmaputra',
    reach: 'Lower Valley (km 410)',
    stationCode: 'CWC-GWH-09',
    coordinates: { lat: 26.1856, lng: 91.6916 },
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
    name: 'Dhubri Terminal',
    river: 'Brahmaputra',
    reach: 'Border Reach (km 590)',
    stationCode: 'CWC-DHB-12',
    coordinates: { lat: 26.02, lng: 89.97 },
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
]

export const FUSION_SIGNALS: FusionSignal[] = [
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
]

export const SAR_PASS_METRICS: SarPassData = {
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
}

export const CRYPTOGRAPHIC_PROOF: CryptographicProof = {
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
}
