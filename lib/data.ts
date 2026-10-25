export interface PillarItem {
  number: string
  title: string
  text: string
  accent: 'coral' | 'blue' | 'yellow' | 'green'
}

export interface SignalPin {
  x: number
  z: number
  color: string
  delay?: number
}

export interface WorkflowStep {
  number: string
  title: string
  actor: string
  actorType: 'ai' | 'officers' | 'citizens'
  description: string
  badge: string
  accent: 'coral' | 'blue' | 'yellow' | 'green'
  telemetry: {
    systemTitle: string
    statusBadge: string
    primaryMetric: { label: string; value: string; unit?: string }
    items: { label: string; detail: string; status: string }[]
    footerNote: string
  }
}

export const PILLARS: PillarItem[] = [
  {
    number: '01',
    title: 'See it sooner',
    text: 'Fuse rainfall, river gauges, terrain and satellite confirmation into one clear flood signal.',
    accent: 'coral',
  },
  {
    number: '02',
    title: 'Plan with proof',
    text: 'Turn predicted impact into explainable relief budgets, with ranges instead of guesses.',
    accent: 'blue',
  },
  {
    number: '03',
    title: 'Keep humans in control',
    text: 'Officers review, change and approve every release. AI proposes. People decide.',
    accent: 'yellow',
  },
  {
    number: '04',
    title: 'Make every rupee visible',
    text: 'A timestamped public ledger connects allocations, deliveries and citizen reports.',
    accent: 'green',
  },
]

export const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    number: '01',
    title: 'Detect',
    actor: 'AI workflow (LangGraph)',
    actorType: 'ai',
    badge: 'EARLY DETECTION & HYDROLOGY SYNTHESIS',
    description:
      'A flood alert for a place, with a confidence level, produced from rainfall, river gauges, hydrology forecasts and satellite imagery.',
    accent: 'blue',
    telemetry: {
      systemTitle: 'LANGGRAPH MULTI-AGENT SWARM // SYNTHESIS PIPELINE',
      statusBadge: 'PRECIPITATION SURGE CONFIRMED',
      primaryMetric: { label: 'CONFIDENCE LEVEL', value: '94.6%' },
      items: [
        { label: 'Rainfall Doppler (IMD)', detail: '+88mm/hr localized cloudburst upper catchment', status: 'ACTIVE' },
        { label: 'River Gauges (CWC)', detail: 'Brahmaputra gauge delta +1.4m over danger mark', status: 'SURGING' },
        { label: 'Hydrology Runoff', detail: 'GLOFAS flood crest estimated in 16 hours', status: 'ALERT' },
        { label: 'Sentinel-1 SAR Satellite', detail: 'Synthetic Aperture Radar water mask fused', status: 'CONFIRMED' },
      ],
      footerNote: 'Automated flood alert published with spatial confidence bounds before news outlets break.',
    },
  },
  {
    number: '02',
    title: 'Estimate and draft',
    actor: 'AI workflow',
    actorType: 'ai',
    badge: 'EXPOSURE MODELING & BUDGET FORMULATION',
    description:
      'Predicted flood extent and depth, people and assets exposed, expected damage, and a draft relief budget by department.',
    accent: 'yellow',
    telemetry: {
      systemTitle: 'HYDRODYNAMIC EXTENT MODEL // DAMAGE PREDICTOR',
      statusBadge: 'EXPOSURE MATRIX COMPUTED',
      primaryMetric: { label: 'DRAFT RELIEF BUDGET', value: '₹7.35 Cr' },
      items: [
        { label: 'Exposed Population', detail: '48,200 residents across 3 vulnerable tehsils', status: 'MAPPED' },
        { label: 'Predicted Flood Depth', detail: '1.2m – 2.4m inundation across 34 sq km', status: 'SIMULATED' },
        { label: 'Emergency Ration Line', detail: '₹3.40 Cr · Dept of Food & Civil Supplies', status: 'DRAFTED' },
        { label: 'Public Health & Shelters', detail: '₹3.95 Cr · Health Dept & State Disaster Mgmt', status: 'DRAFTED' },
      ],
      footerNote: 'Algorithmic line-item draft ready for administrative review with explainable rationale.',
    },
  },
  {
    number: '03',
    title: 'Release',
    actor: 'Officers sign, smart contracts record',
    actorType: 'officers',
    badge: 'MULTI-SIG QUORUM & ON-CHAIN RELEASE',
    description:
      'Approved budget and per-department allocations recorded on a public chain.',
    accent: 'coral',
    telemetry: {
      systemTitle: 'MULTI-SIGNATURE DISBURSAL // IMMUTABLE LEDGER',
      statusBadge: '3 OF 3 QUORUM SIGNED',
      primaryMetric: { label: 'LEDGER TRANSACTION', value: '#19,482,109' },
      items: [
        { label: 'District Magistrate', detail: 'Key: 0x89f...3a1c · Emergency release authorized', status: 'SIGNED ✓' },
        { label: 'Finance Secretary', detail: 'Key: 0x44b...910e · Treasury allocation cleared', status: 'SIGNED ✓' },
        { label: 'Disaster Mgmt Comm', detail: 'Key: 0x22c...e84d · Ground protocols verified', status: 'SIGNED ✓' },
        { label: 'Smart Contract Disbursal', detail: 'Tx: 0x7a2...b990 · Departmental escrows released', status: 'EXECUTED' },
      ],
      footerNote: 'Officers sign, smart contracts record. Disbursal becomes immutable and auditable in real time.',
    },
  },
  {
    number: '04',
    title: 'Report',
    actor: 'Citizens',
    actorType: 'citizens',
    badge: 'PUBLIC GRIEVANCE DASHBOARD & LINE-ITEM AUDIT',
    description:
      'Public grievance dashboard: "money allocated, food never came" reports tied to the exact line item.',
    accent: 'green',
    telemetry: {
      systemTitle: 'PUBLIC GRIEVANCE DASHBOARD // LINE-ITEM AUDIT',
      statusBadge: 'COMMUNITY VERIFICATION ACTIVE',
      primaryMetric: { label: 'LINE-ITEM MATCH', value: '100%' },
      items: [
        { label: 'Report #4029', detail: '"Money allocated, food never came to Ward 4 shelter"', status: 'FLAGGED' },
        { label: 'Linked Budget Item', detail: 'Dept of Food & Civil Supplies #FCS-01 (₹3.40 Cr)', status: 'AUDITING' },
        { label: 'Geotagged Photo Proof', detail: 'GPS: 26.14°N, 91.73°E · Verified Timestamp 14:22', status: 'ANCHORED' },
        { label: 'Escrow Accountability', detail: 'Automatic contractor hold initiated until resolved', status: 'HOLD' },
      ],
      footerNote: 'Citizens directly audit relief. Every complaint is tied to its specific expenditure line.',
    },
  },
]

export const SIGNAL_PINS: SignalPin[] = [
  { x: -2.2, z:  0.5,  color: '#ff785f', delay: 0.0 },
  { x: -1.2, z: -1.5,  color: '#72d9e8', delay: 0.6 },
  { x:  0.6, z: -2.4,  color: '#f4c969', delay: 1.1 },
  { x:  2.1, z:  0.9,  color: '#8bc7a1', delay: 1.6 },
  { x:  0.1, z:  1.7,  color: '#72d9e8', delay: 0.4 },
]

export const NETWORK_CONNECTIONS: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 0],
  [0, 2],
]
