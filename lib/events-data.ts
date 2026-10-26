// FlashRelief — Unified Event Lifecycle & Audit Passport Data
// Reference: MHA SDRF Norms & Polygon PoS Event Ledger

export interface EventMilestone {
  stageNumber: string
  stageName: string
  hourOffset: string // e.g. "00:00", "+04h 15m"
  timestamp: string
  title: string
  actor: string
  actorType: 'AI_SWARM' | 'SATELLITE' | 'OFFICERS' | 'BLOCKCHAIN' | 'FIELD_TEAMS' | 'CITIZENS'
  status: 'COMPLETED' | 'ACTIVE' | 'PENDING'
  summary: string
  telemetrySnippet: {
    label: string
    value: string
    badgeColor: 'blue' | 'yellow' | 'coral' | 'green'
  }
  hashProof?: {
    type: 'SHA256' | 'KECCAK256' | 'IPFS_CID' | 'TX_HASH'
    label: string
    hash: string
  }
  details: string[]
}

export interface MoneyFlowNode {
  id: string
  label: string
  category: 'treasury' | 'department' | 'circle' | 'citizens'
  amountCrores: number
  color: string
}

export interface MoneyFlowLink {
  source: string
  target: string
  amountCrores: number
}

export interface DisasterEventDossier {
  id: string
  eventCode: string
  name: string
  basinName: string
  state: string
  district: string
  startDate: string
  peakDate: string
  status: 'ACTIVE_RELIEF' | 'DELIVERY_PROVEN' | 'AUDITED'
  leadTimeHours: number
  totalAllocatedCrores: number
  totalDisbursedCrores: number
  totalProvenCrores: number
  beneficiariesTargeted: number
  beneficiariesProven: number
  polygonBlockNumber: number
  polygonTxHash: string
  detectionHash: string
  evidenceCid: string
  officerSigners: {
    role: string
    name: string
    publicKey: string
    timestamp: string
    txHash: string
  }[]
  milestones: EventMilestone[]
  moneyFlow: {
    nodes: MoneyFlowNode[]
    links: MoneyFlowLink[]
  }
}

export const DISASTER_EVENTS: Record<string, DisasterEventDossier> = {
  'fl-2026-brahmaputra': {
    id: 'fl-2026-brahmaputra',
    eventCode: 'EVT-BR-2026-08',
    name: 'Brahmaputra Upper Catchment Surge',
    basinName: 'Brahmaputra Basin',
    state: 'Assam',
    district: 'Dibrugarh & Majuli',
    startDate: '25 Oct 2026, 21:30 UTC',
    peakDate: '26 Oct 2026, 14:00 UTC',
    status: 'DELIVERY_PROVEN',
    leadTimeHours: 11.4,
    totalAllocatedCrores: 7.35,
    totalDisbursedCrores: 4.80,
    totalProvenCrores: 3.65,
    beneficiariesTargeted: 48200,
    beneficiariesProven: 36400,
    polygonBlockNumber: 19482850,
    polygonTxHash: '0x7a29e1c409b88e109df4421b990184b901a8f9024c8b919d883910cbe77a1928',
    detectionHash: '0x3f9e8a7b11c9d48203f7e1b8c6a5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7',
    evidenceCid: 'bafybeicdx4a7kmmj9z38vx99qqwlp3k99d81z099x418dka098mzk4119d',
    officerSigners: [
      {
        role: 'District Magistrate & DDMA Chairman',
        name: 'Shri Bikram Kairi, IAS',
        publicKey: '0x884920DbC910eF4892cfa7129c9bb8812c4019a2',
        timestamp: '26 Oct 2026, 05:42 UTC',
        txHash: '0x3f9a71bd92c10928419a4e...',
      },
      {
        role: 'Chief Technical Advisor, ASDMA',
        name: 'Dr. Anurag Sharma',
        publicKey: '0x4fa91c80b2c140924e09d18ac93019fba8491024',
        timestamp: '26 Oct 2026, 06:10 UTC',
        txHash: '0x82b410ca19f88492011b9c...',
      },
      {
        role: 'Joint Secretary (Finance), Govt. of Assam',
        name: 'Smt. Mridula Baruah, ACS',
        publicKey: '0x12a09dc9b109e4d00891ac41098bf12908a8f10b',
        timestamp: '26 Oct 2026, 06:34 UTC',
        txHash: '0x19a28f98fc4892cfa7129c...',
      },
    ],
    milestones: [
      {
        stageNumber: '01',
        stageName: 'Detect',
        hourOffset: '00:00',
        timestamp: '25 Oct 2026, 21:30 UTC',
        title: 'Geophysical Signal Ingest & Inundation Alert Trigger',
        actor: 'FlashRelief Sigmoid Fusion Swarm',
        actorType: 'AI_SWARM',
        status: 'COMPLETED',
        summary:
          'IMD radar recorded 88mm/hr localized cloudburst in upper catchment; CWC Dibrugarh acoustic gauge surged +1.4m over danger mark (+8cm/hr rate of rise). Warning threshold breached.',
        telemetrySnippet: {
          label: 'FUSION PROBABILITY',
          value: 'P = 0.946 (WARNING)',
          badgeColor: 'coral',
        },
        hashProof: {
          type: 'SHA256',
          label: 'SIGNAL FINGERPRINT ANCHORED',
          hash: '0x3f9e8a7b11c9d48203f7e1b8c6a5d4e3f2a1b0c9...',
        },
        details: [
          'IMD Doppler precipitation percentile: 99.4th climatology',
          'CWC Dibrugarh: 106.30m (Danger Level: 105.70m, +0.60m)',
          'GloFAS 5-year return hydro discharge crest: 16-hour horizon',
          'Cryptographic state anchored to DetectionRegistry on Polygon',
        ],
      },
      {
        stageNumber: '01b',
        stageName: 'Confirm',
        hourOffset: '+04h 15m',
        timestamp: '26 Oct 2026, 01:45 UTC',
        title: 'Sentinel-1 C-Band SAR Synthetic Aperture Radar Water Extent Pass',
        actor: 'ESA Sentinel-1 SAR Orbital Pipeline',
        actorType: 'SATELLITE',
        status: 'COMPLETED',
        summary:
          'Microwave radar swath penetrated 100% monsoon cloud cover. Specular reflection confirmed a 4.2 dB backscatter drop across 34.8 sq km of riverine plains.',
        telemetrySnippet: {
          label: 'RADAR ANOMALY',
          value: '-4.2 dB (CONFIRMED)',
          badgeColor: 'blue',
        },
        hashProof: {
          type: 'SHA256',
          label: 'SAR WATER MASK SHA-256',
          hash: '0x992b4109ca88172df0019a28c41982b8901a88cf...',
        },
        details: [
          'Orbital pass: Descending swath track #142 (VV / VH polarized)',
          'Otsu adaptive thresholding separated standing water from wet soil',
          '34.8 sq km verified inundation footprint across 3 revenue circles',
          'Media benchmark: 11.4 hours ahead of earliest GDELT mainstream press report',
        ],
      },
      {
        stageNumber: '02',
        stageName: 'Estimate',
        hourOffset: '+06h 00m',
        timestamp: '26 Oct 2026, 03:30 UTC',
        title: 'Spatial Exposure Intersection & SDRF Budget Formulation',
        actor: 'Deterministic SDRF Norms Engine',
        actorType: 'AI_SWARM',
        status: 'COMPLETED',
        summary:
          'Radar water polygons intersected with WorldPop 2026 grid and OSM building footprints. Deterministic calculator generated a ₹7.35 Cr draft relief package compliant with MHA norms.',
        telemetrySnippet: {
          label: 'DRAFT ESTIMATE (P50)',
          value: '₹7.35 Crores',
          badgeColor: 'yellow',
        },
        hashProof: {
          type: 'KECCAK256',
          label: 'PROPOSAL MERKLE ROOT',
          hash: '0x4fa9109cb1829e0998a12908bb194821a0984920...',
        },
        details: [
          '48,200 exposed residents across Dibrugarh East, Moran, and Rohmoria',
          '32,400 displaced citizens requiring 7 days gratuitous relief camps (₹95/day norm)',
          '1,600 ha submerged standing Sali paddy (>33% loss threshold)',
          'Zero LLM arithmetic: 100% deterministic calculation against sdrf_norms.yaml',
        ],
      },
      {
        stageNumber: '03',
        stageName: 'Review',
        hourOffset: '+08h 45m',
        timestamp: '26 Oct 2026, 06:15 UTC',
        title: 'Multi-Officer Consensus & LangGraph Feedback Reconciliation',
        actor: 'Statutory Review Committee (DM, SDMA, Finance)',
        actorType: 'OFFICERS',
        status: 'COMPLETED',
        summary:
          'DM approved shelter locations; Finance Secretary adjusted camp feeding duration (+3 days) and requested P90 buffer for livestock. 3-of-3 quorum signed with hardware keys.',
        telemetrySnippet: {
          label: 'COMMITTEE QUORUM',
          value: '3 of 3 Signatures Met',
          badgeColor: 'green',
        },
        hashProof: {
          type: 'KECCAK256',
          label: 'MULTISIG QUORUM CERTIFICATE',
          hash: '0x884920DbC910eF4892cfa7129c9bb8812c4019a2...',
        },
        details: [
          'DM Bikram Kairi signed at 05:42 UTC (Verified field ground reports)',
          'ASDMA Advisor Dr. Anurag Sharma signed at 06:10 UTC (Radar confirmation)',
          'Finance Secretary Mridula Baruah signed at 06:34 UTC (Allocation cleared)',
          'Revision diff: v1.0 (₹7.35 Cr) → v2.0 (₹7.35 Cr reallocated with camp buffer)',
        ],
      },
      {
        stageNumber: '04',
        stageName: 'Release',
        hourOffset: '+09h 10m',
        timestamp: '26 Oct 2026, 06:40 UTC',
        title: 'On-Chain Ledger Anchor & Departmental Escrow Sub-Vaults Locked',
        actor: 'Polygon PoS Network · BudgetRegistry.sol',
        actorType: 'BLOCKCHAIN',
        status: 'COMPLETED',
        summary:
          'Authorized package committed to Polygon PoS Block #19,482,850. Non-transferable accounting entries in paise provisioned 6 departmental escrow sub-vaults.',
        telemetrySnippet: {
          label: 'POLYGON POS BLOCK',
          value: '#19,482,850 (CONFIRMED)',
          badgeColor: 'green',
        },
        hashProof: {
          type: 'TX_HASH',
          label: 'ON-CHAIN TX HASH',
          hash: '0x7a29e1c409b88e109df4421b990184b901a8f902...',
        },
        details: [
          '29,670,000,000 non-transferable paise mapped across line departments',
          'Food & Civil Supplies Sub-Vault: ₹3.40 Cr (#FCS-01)',
          'Health & Family Welfare Sub-Vault: ₹1.20 Cr (#HLT-01)',
          'Real money transfers routed through Assam Treasury PFMS channels',
        ],
      },
      {
        stageNumber: '05',
        stageName: 'Deliver',
        hourOffset: '+18h 30m',
        timestamp: '26 Oct 2026, 16:00 UTC',
        title: 'Field Execution & Geotagged IPFS Evidence Attestations',
        actor: 'Executive Magistrates & Field Relief Teams',
        actorType: 'FIELD_TEAMS',
        status: 'COMPLETED',
        summary:
          '18,400 dry ration kits and 14 mobile medical units deployed to Moran relief shelters. Geotagged photos with embedded GPS coordinates uploaded to IPFS and anchored to EvidenceRegistry.',
        telemetrySnippet: {
          label: 'DELIVERY PROVEN VALUE',
          value: '₹3.65 Cr (49.7% of total)',
          badgeColor: 'green',
        },
        hashProof: {
          type: 'IPFS_CID',
          label: 'IPFS EVIDENCE CID',
          hash: 'bafybeicdx4a7kmmj9z38vx99qqwlp3k99d81z099x418dka098mzk4119d',
        },
        details: [
          'Moran Relief Camp #4: 2,400 families received ration kits + halogen tablets',
          'GPS Coordinates: 27.2849°N, 94.9214°E (Biometric roster verified)',
          'Executive Magistrate field endorsement anchored on-chain',
          '36,400 beneficiaries verified through decentralized evidence registry',
        ],
      },
      {
        stageNumber: '06',
        stageName: 'Report',
        hourOffset: '+36h 00m',
        timestamp: '27 Oct 2026, 09:30 UTC',
        title: 'Public Ledger Grievance Feed & 48-Hour SLA Accountability',
        actor: 'Citizens & District Grievance Cell',
        actorType: 'CITIZENS',
        status: 'ACTIVE',
        summary:
          'Citizens filed 3 line-item grievance reports. One grievance flagged delayed water purification packets; nodal officer responded with geotagged delivery proof within 14 hours.',
        telemetrySnippet: {
          label: 'SLA COMPLIANCE',
          value: '100% on-time resolution',
          badgeColor: 'green',
        },
        hashProof: {
          type: 'TX_HASH',
          label: 'GRIEVANCE RESOLUTION PROOF',
          hash: '0x44fa901bc992a0910dc8812c4019a28b8120019a...',
        },
        details: [
          'Zero-wallet intake: Citizens submitted via web/SMS OTP',
          'Every report tied to specific line item #FCS-01 or #HLT-01',
          'Automated 48-hour response countdown prevented administrative stagnation',
          'Independent civic audit open to all citizens without login',
        ],
      },
    ],
    moneyFlow: {
      nodes: [
        { id: 'treasury', label: 'Assam State SDRF Treasury', category: 'treasury', amountCrores: 7.35, color: '#00e5ff' },
        { id: 'food', label: 'Dept of Food & Civil Supplies', category: 'department', amountCrores: 3.40, color: '#ff785f' },
        { id: 'revenue', label: 'Revenue & Disaster Management', category: 'department', amountCrores: 1.45, color: '#00e5ff' },
        { id: 'health', label: 'Health & Family Welfare', category: 'department', amountCrores: 1.20, color: '#a78bfa' },
        { id: 'pwd', label: 'Public Works & Water Resources', category: 'department', amountCrores: 0.80, color: '#72d9e8' },
        { id: 'agri', label: 'Agriculture & Input Subsidy', category: 'department', amountCrores: 0.30, color: '#10b981' },
        { id: 'animal', label: 'Animal Husbandry & Fodder', category: 'department', amountCrores: 0.20, color: '#f4c969' },
        { id: 'moran', label: 'Moran Revenue Circle Shelters', category: 'circle', amountCrores: 3.10, color: '#ff785f' },
        { id: 'rohmoria', label: 'Rohmoria Embankment Reach', category: 'circle', amountCrores: 2.45, color: '#00e5ff' },
        { id: 'dibrugarh_east', label: 'Dibrugarh East Relief Camps', category: 'circle', amountCrores: 1.80, color: '#a78bfa' },
        { id: 'citizens', label: '48,200 Verified Citizens', category: 'citizens', amountCrores: 7.35, color: '#10b981' },
      ],
      links: [
        { source: 'treasury', target: 'food', amountCrores: 3.40 },
        { source: 'treasury', target: 'revenue', amountCrores: 1.45 },
        { source: 'treasury', target: 'health', amountCrores: 1.20 },
        { source: 'treasury', target: 'pwd', amountCrores: 0.80 },
        { source: 'treasury', target: 'agri', amountCrores: 0.30 },
        { source: 'treasury', target: 'animal', amountCrores: 0.20 },
        { source: 'food', target: 'moran', amountCrores: 1.80 },
        { source: 'food', target: 'rohmoria', amountCrores: 0.90 },
        { source: 'food', target: 'dibrugarh_east', amountCrores: 0.70 },
        { source: 'revenue', target: 'moran', amountCrores: 0.60 },
        { source: 'revenue', target: 'rohmoria', amountCrores: 0.55 },
        { source: 'revenue', target: 'dibrugarh_east', amountCrores: 0.30 },
        { source: 'health', target: 'moran', amountCrores: 0.45 },
        { source: 'health', target: 'rohmoria', amountCrores: 0.45 },
        { source: 'health', target: 'dibrugarh_east', amountCrores: 0.30 },
        { source: 'pwd', target: 'rohmoria', amountCrores: 0.55 },
        { source: 'pwd', target: 'moran', amountCrores: 0.25 },
        { source: 'agri', target: 'dibrugarh_east', amountCrores: 0.30 },
        { source: 'animal', target: 'rohmoria', amountCrores: 0.20 },
        { source: 'moran', target: 'citizens', amountCrores: 3.10 },
        { source: 'rohmoria', target: 'citizens', amountCrores: 2.45 },
        { source: 'dibrugarh_east', target: 'citizens', amountCrores: 1.80 },
      ],
    },
  },
  'fl-2026-mahanadi': {
    id: 'fl-2026-mahanadi',
    eventCode: 'EVT-MH-2026-05',
    name: 'Mahanadi Delta Plain Inundation',
    basinName: 'Mahanadi Basin',
    state: 'Odisha',
    district: 'Cuttack & Kendrapara',
    startDate: '26 Oct 2026, 04:15 UTC',
    peakDate: '27 Oct 2026, 18:00 UTC',
    status: 'ACTIVE_RELIEF',
    leadTimeHours: 8.6,
    totalAllocatedCrores: 4.85,
    totalDisbursedCrores: 3.10,
    totalProvenCrores: 1.95,
    beneficiariesTargeted: 31500,
    beneficiariesProven: 18200,
    polygonBlockNumber: 19482790,
    polygonTxHash: '0x992b4109ca88172df0019a28c41982b8901a88cf10928374bb8192019ab921c4',
    detectionHash: '0x884920DbC910eF4892cfa7129c9bb8812c4019a2c8b919d883910cbe77a1928',
    evidenceCid: 'bafybeifk49zla098x119dk2938vxa88172df0019a28c41982b8901a88c',
    officerSigners: [
      {
        role: 'Collector & District Magistrate',
        name: 'Shri Narahari Jena, IAS',
        publicKey: '0x7129c9bb8812c4019a20DbC910eF4892cfa88492',
        timestamp: '26 Oct 2026, 07:15 UTC',
        txHash: '0x44b910e98a12908bb19482...',
      },
      {
        role: 'OSDMA Executive Director',
        name: 'Dr. Pravat Mohapatra',
        publicKey: '0x3019fba84910244fa91c80b2c140924e09d18ac9',
        timestamp: '26 Oct 2026, 07:45 UTC',
        txHash: '0x19a28f98fc4892cfa7129c...',
      },
      {
        role: 'Special Secretary (Finance), Govt. of Odisha',
        name: 'Smt. Sailabala Das, OAS',
        publicKey: '0x8a8f10b12a09dc9b109e4d00891ac41098bf1290',
        timestamp: '26 Oct 2026, 08:20 UTC',
        txHash: '0x82b410ca19f88492011b9c...',
      },
    ],
    milestones: [
      {
        stageNumber: '01',
        stageName: 'Detect',
        hourOffset: '00:00',
        timestamp: '26 Oct 2026, 04:15 UTC',
        title: 'Mahanadi Delta Discharge Forecast Alert',
        actor: 'CWC Naraj & Hirakud Dam Gate Telemetry',
        actorType: 'AI_SWARM',
        status: 'COMPLETED',
        summary:
          'Hirakud dam discharged 6.2 lakh cusecs; Naraj gauge exceeded warning stage (26.41m vs warning 25.41m). Delta surge watch activated.',
        telemetrySnippet: {
          label: 'FUSION PROBABILITY',
          value: 'P = 0.742 (WATCH)',
          badgeColor: 'yellow',
        },
        hashProof: {
          type: 'SHA256',
          label: 'SIGNAL FINGERPRINT ANCHORED',
          hash: '0x884920DbC910eF4892cfa7129c9bb8812c4019a2...',
        },
        details: [
          'Hirakud Reservoir stage: 628.4 ft (FRL 630 ft)',
          'Mahanadi Naraj acoustic gauge: 26.41m (+1.0m over warning)',
          'Estimated crest arrival at Kendrapara: 18 hours',
        ],
      },
      {
        stageNumber: '04',
        stageName: 'Release',
        hourOffset: '+06h 30m',
        timestamp: '26 Oct 2026, 10:45 UTC',
        title: 'Polygon PoS Allocation Locked for Odisha SDRF',
        actor: 'Polygon PoS Network · BudgetRegistry.sol',
        actorType: 'BLOCKCHAIN',
        status: 'COMPLETED',
        summary:
          '₹4.85 Crores SDRF package locked into Cuttack and Kendrapara district sub-vaults with 3-of-3 OSDMA signatures.',
        telemetrySnippet: {
          label: 'POLYGON POS BLOCK',
          value: '#19,482,790',
          badgeColor: 'green',
        },
        hashProof: {
          type: 'TX_HASH',
          label: 'ON-CHAIN TX HASH',
          hash: '0x992b4109ca88172df0019a28c41982b8901a88cf...',
        },
        details: [
          'Emergency drinking water and halazone distribution provisioned',
          'Saline embankment temporary breach repair kits assigned to PWD',
        ],
      },
    ],
    moneyFlow: {
      nodes: [
        { id: 'treasury', label: 'Odisha State SDRF Treasury', category: 'treasury', amountCrores: 4.85, color: '#00e5ff' },
        { id: 'food', label: 'Food Supplies & Consumer Welfare', category: 'department', amountCrores: 2.10, color: '#ff785f' },
        { id: 'revenue', label: 'Revenue & Disaster Management', category: 'department', amountCrores: 1.15, color: '#00e5ff' },
        { id: 'health', label: 'Health & Family Welfare', category: 'department', amountCrores: 0.90, color: '#a78bfa' },
        { id: 'pwd', label: 'Water Resources (Embankments)', category: 'department', amountCrores: 0.70, color: '#72d9e8' },
        { id: 'cuttack', label: 'Cuttack Sadar & Athagarh', category: 'circle', amountCrores: 2.65, color: '#ff785f' },
        { id: 'kendrapara', label: 'Kendrapara Delta Reaches', category: 'circle', amountCrores: 2.20, color: '#00e5ff' },
        { id: 'citizens', label: '31,500 Verified Citizens', category: 'citizens', amountCrores: 4.85, color: '#10b981' },
      ],
      links: [
        { source: 'treasury', target: 'food', amountCrores: 2.10 },
        { source: 'treasury', target: 'revenue', amountCrores: 1.15 },
        { source: 'treasury', target: 'health', amountCrores: 0.90 },
        { source: 'treasury', target: 'pwd', amountCrores: 0.70 },
        { source: 'food', target: 'cuttack', amountCrores: 1.15 },
        { source: 'food', target: 'kendrapara', amountCrores: 0.95 },
        { source: 'revenue', target: 'cuttack', amountCrores: 0.65 },
        { source: 'revenue', target: 'kendrapara', amountCrores: 0.50 },
        { source: 'health', target: 'cuttack', amountCrores: 0.50 },
        { source: 'health', target: 'kendrapara', amountCrores: 0.40 },
        { source: 'pwd', target: 'kendrapara', amountCrores: 0.35 },
        { source: 'pwd', target: 'cuttack', amountCrores: 0.35 },
        { source: 'cuttack', target: 'citizens', amountCrores: 2.65 },
        { source: 'kendrapara', target: 'citizens', amountCrores: 2.20 },
      ],
    },
  },
}

export function getDisasterEventById(id: string): DisasterEventDossier {
  return DISASTER_EVENTS[id] || DISASTER_EVENTS['fl-2026-brahmaputra']
}

export const ALL_DISASTER_EVENTS = Object.values(DISASTER_EVENTS)
