export interface OfficerReviewer {
  id: string
  name: string
  role: string
  department: string
  districtOrState: string
  avatarInitial: string
  status: 'PENDING' | 'CHANGES_REQUESTED' | 'APPROVED' | 'REJECTED'
  comment?: string
  timestamp?: string
  signatureHash?: string
  publicKey: string
}

export interface ReviewState {
  threadId: string
  checkpointId: string
  checkpointTimestamp: string
  eventBasin: string
  baseBudgetRupees: number
  baseBudgetCrores: number
  adjustedBudgetRupees: number
  adjustedBudgetCrores: number
  revisedFeedingDays: number
  appliedPercentile: 'P10' | 'P50' | 'P90'
  officers: OfficerReviewer[]
  revisionLog: {
    timestamp: string
    officerName: string
    instruction: string
    deltaRupees: number
    deltaExplanation: string
  }[]
  committeeQuorumMet: boolean
}

export const INITIAL_OFFICERS: OfficerReviewer[] = [
  {
    id: 'officer-dm',
    name: 'Shri Bikram Kairi, IAS',
    role: 'District Magistrate & DDMA Chairman',
    department: 'Revenue & Disaster Management',
    districtOrState: 'Dibrugarh District, Assam',
    avatarInitial: 'BK',
    status: 'APPROVED',
    comment: 'Verified ground reports from Moran and Rohmoria revenue circles. Inundation extent matches local field distress.',
    timestamp: '26 Oct 2026, 05:42 UTC',
    signatureHash: '0x3f9a71b...d92c',
    publicKey: '0x884920DbC910eF4892cfa7129c9bb8812c4019a2',
  },
  {
    id: 'officer-sdma',
    name: 'Dr. Anurag Sharma',
    role: 'Chief Technical Advisor & Hydro-Informatics Specialist',
    department: 'Assam State Disaster Management Authority (ASDMA)',
    districtOrState: 'State HQ, Dispur',
    avatarInitial: 'AS',
    status: 'APPROVED',
    comment: 'Sentinel-1 C-Band SAR radar backscatter delta (-4.2 dB) and CWC Dibrugarh acoustic gauge rate of rise confirm genuine breach risk.',
    timestamp: '26 Oct 2026, 06:10 UTC',
    signatureHash: '0x82b410c...a19f',
    publicKey: '0x4fa91c80b2c140924e09d18ac93019fba8491024',
  },
  {
    id: 'officer-finance',
    name: 'Smt. Mridula Baruah, ACS',
    role: 'Joint Secretary (Finance) & SDRF Nodal Officer',
    department: 'Finance Department, Govt. of Assam',
    districtOrState: 'State Secretariat, Dispur',
    avatarInitial: 'MB',
    status: 'PENDING',
    comment: 'Awaiting review of camp feeding duration and cattle shelter unit calculations against annual SDRF allocation ceiling.',
    timestamp: 'Pending review',
    publicKey: '0x12a09dc9b109e4d00891ac41098bf12908a8f10b',
  },
]

export const QUICK_FEEDBACK_PRESETS = [
  {
    id: 'feed-days-10',
    label: '+3 Days Relief Camps',
    prompt: 'Extend gratuitous relief camp feeding from 7 days to 10 days due to delayed floodwater recession in low-lying Moran circles.',
    deltaDays: 3,
  },
  {
    id: 'buffer-p90',
    label: 'Switch to P90 (Worst-Case)',
    prompt: 'Shift housing reconstruction grant baseline from P50 to P90 uncertainty bound to absorb ongoing rainfall forecast.',
    deltaPercentile: 'P90' as const,
  },
  {
    id: 'cattle-boost',
    label: '+20% Cattle Fodder',
    prompt: 'Increase animal husbandry dry fodder supply by 20% to safeguard livestock stranded along elevated highway embankments.',
    deltaFodderPct: 20,
  },
]

export const INITIAL_REVIEW_STATE: ReviewState = {
  threadId: 'rahat-thread-assam-2026-08',
  checkpointId: 'chkpt_stage3_interrupt_9841',
  checkpointTimestamp: '26-Oct-2026 06:15:30 UTC',
  eventBasin: 'Brahmaputra Upper Catchment',
  baseBudgetRupees: 284520000, // ₹28.45 Cr
  baseBudgetCrores: 28.45,
  adjustedBudgetRupees: 284520000,
  adjustedBudgetCrores: 28.45,
  revisedFeedingDays: 7,
  appliedPercentile: 'P50',
  officers: INITIAL_OFFICERS,
  revisionLog: [],
  committeeQuorumMet: false, // 2 of 3 approved, 1 pending
}
