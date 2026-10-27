import { StageBriefingData } from '@/components/layout/stage-briefing-card'

export const STAGE_BRIEFINGS: Record<number, StageBriefingData> = {
  1: {
    stageNumber: 1,
    stageName: 'Detect',
    plainLanguageSummary: 'We watch the river before it breaches.',
    problemStatement:
      'Conventional relief starts only after flood footage appears on television news, causing 2–3 weeks of bureaucratic delay while affected families receive zero assistance.',
    solutionStatement:
      'Continuously fuses Sentinel-1 SAR satellite radar, Open-Meteo GloFAS river discharge, and CWC acoustic river gauges to detect flood surges 36+ hours before news media reports.',
    designatedActor: {
      role: 'Hydrological Early Warning Directorate',
      title: 'Hydrologist & Early Warning Station',
      cadre: 'Central Water Commission (CWC) & State Disaster Management Authority',
      description:
        'Continuous orbital radar observation and telemetry ingestion across 18 telemetry gauging stations.',
    },
    statutoryMandate: {
      code: 'NDMA Act 2005 (Sec 30)',
      law: 'Disaster Management Act 2005 Early Warning & Inundation Preparedness Mandate',
      citation: 'CWC Flood Forecasting & Warning Operational Guidelines, Chapter 4',
    },
    coreSafeguard: {
      title: 'Tamper-Proof Signal Fusion',
      description:
        'Raw satellite radar reflections and sensor readings cannot be retroactively tampered with; every anomaly generates a SHA-256 fingerprint anchored on Polygon PoS.',
      verificationMechanism: 'Client-side SHA-256 hash & Polygon Amoy Anchor',
    },
    nextMilestone: {
      targetStage: 'Stage 02',
      targetName: 'Estimate',
      actionText:
        'Feeds observed water depth (m) and flooded hectares into the statutory SDRF formulation engine.',
    },
    quickGuideSteps: [
      {
        stepNumber: 1,
        title: 'Select River Basin',
        description: 'Toggle between Brahmaputra (Assam) or Mahanadi (Odisha) river catchments.',
      },
      {
        stepNumber: 2,
        title: 'Inspect Multi-Feed Fusion',
        description: 'Observe acoustic gauge telemetry, Sentinel-1 radar cross-sections, and GloFAS discharge.',
      },
      {
        stepNumber: 3,
        title: 'Verify Lead Time Over News',
        description: 'Check the +36.4h lead time metric demonstrating early detection before media reports.',
      },
      {
        stepNumber: 4,
        title: 'Advance to Budget Estimate',
        description: 'Click "Advance to Stage 02: Estimate Budget" to calculate mathematical relief requirements.',
      },
    ],
  },

  2: {
    stageNumber: 2,
    stageName: 'Estimate',
    plainLanguageSummary: 'Math decides the budget, not political discretion.',
    problemStatement:
      'Conventional disaster budgets are vulnerable to arbitrary political estimates, inflated damage claims, or bureaucratic guesswork that lead to audit objections and siphoned funds.',
    solutionStatement:
      'Maps satellite flood inundation against population density to compute deterministic relief budgets based strictly on statutory MHA SDRF Order No. 33-04/2020 legal schedules.',
    designatedActor: {
      role: 'Planning & Relief Directorate',
      title: 'Disaster Planning Authority & Relief Commissioner',
      cadre: 'State Disaster Management Authority (SDMA) & Revenue Department',
      description:
        'Converts spatial flood depth into itemized financial allocations using gazetted government rates.',
    },
    statutoryMandate: {
      code: 'MHA Order No. 33-04/2020',
      law: 'Ministry of Home Affairs Revised SDRF/NDRF Assistance Norms Schedule',
      citation: 'Govt. of India Gazette Notification SDRF-01.A through SDRF-09.B',
    },
    coreSafeguard: {
      title: 'Deterministic Norm Application',
      description:
        'Zero human or AI rate alteration. Every line item is calculated strictly as Exposure × Gazetted Schedule Rates with zero hallucinated padding.',
      verificationMechanism: 'Strict TypeScript SDRF Rule Engine & Semantic Vector Grounding',
    },
    nextMilestone: {
      targetStage: 'Stage 03',
      targetName: 'Review',
      actionText:
        'Submits itemized draft budget package to the 3-of-3 constitutional officer multi-signature quorum.',
    },
    quickGuideSteps: [
      {
        stepNumber: 1,
        title: 'Adjust Inundation Parameters',
        description: 'Tune water depth slider or select confidence percentile (P10 conservative, P50 balanced, P90 severe).',
      },
      {
        stepNumber: 2,
        title: 'Review 9 Statutory Line Items',
        description: 'Inspect calculated allocations for Gratuitous Relief, Tarpaulins, Agriculture Subsidies, etc.',
      },
      {
        stepNumber: 3,
        title: 'Semantic Vector Norm Verification',
        description: 'Search official legal schedule codes to inspect exact MHA statutory rules and unit prices.',
      },
      {
        stepNumber: 4,
        title: 'Commit Draft to Multi-Sig',
        description: 'Click "Commit Draft to Multi-Sig Quorum" to freeze the budget and notify reviewing officers.',
      },
    ],
  },

  3: {
    stageNumber: 3,
    stageName: 'Review',
    plainLanguageSummary: 'Three constitutional officers must agree before a single rupee can move.',
    problemStatement:
      'Unilateral executive authority allows corrupt or compromised officers to approve favored contractor allocations or divert funds without independent cross-departmental oversight.',
    solutionStatement:
      'Enforces 3-of-3 cryptographic multi-signature consensus across three distinct constitutional cadres (Civil, Technical, and Financial). Officers can also issue plain-language feedback to auto-recalibrate the budget.',
    designatedActor: {
      role: 'Constitutional Tri-Partite Quorum',
      title: 'District Magistrate, NDMA Advisor & Finance Secretary',
      cadre: 'IAS (Civil Authority) · NDMA (Technical Authority) · IDAS (Financial Authority)',
      description:
        'Tri-partite constitutional consensus: Shri Bikram Kairi (DM), Dr. Sanjeev Kakoty (NDMA), and Smt. Mridula Baruah (Finance).',
    },
    statutoryMandate: {
      code: 'CAG Financial Regs (Art 151)',
      law: 'Comptroller and Auditor General Multi-Officer Sanction & Disbursal Regulations',
      citation: 'Constitution of India, Article 151 & General Financial Rules (GFR) 2017',
    },
    coreSafeguard: {
      title: 'Cryptographic 3-of-3 Multi-Sig',
      description:
        'The treasury escrow vault remains locked until all three distinct officer private keys register verifiable cryptographic signatures on-chain.',
      verificationMechanism: 'BudgetQuorum.sol Smart Contract Consensus on Polygon PoS',
    },
    nextMilestone: {
      targetStage: 'Stage 04',
      targetName: 'Release',
      actionText:
        'Unlocks state treasury contract and initializes ring-fenced departmental escrow sub-vaults.',
    },
    quickGuideSteps: [
      {
        stepNumber: 1,
        title: 'Inspect Budget Package',
        description: 'Examine exposure totals, line item disbursements, and statutory schedule citations.',
      },
      {
        stepNumber: 2,
        title: 'Optional AI Recalibration',
        description: 'Type plain-language feedback (e.g. "Increase camp feeding from 7 to 10 days") to generate Budget v2 diff.',
      },
      {
        stepNumber: 3,
        title: 'Submit Officer Multi-Sigs',
        description: 'Sign as District Magistrate (IAS), Technical Advisor (NDMA), and Finance Secretary (IDAS).',
      },
      {
        stepNumber: 4,
        title: 'Finalize Quorum',
        description: 'When all 3 officers sign, cryptographic quorum is achieved and funds advance to Escrow Release.',
      },
    ],
  },

  4: {
    stageNumber: 4,
    stageName: 'Release',
    plainLanguageSummary: 'Ring-fenced accounts that release funds only on proof.',
    problemStatement:
      'Relief lump sums transferred into departmental general bank accounts are commingled, diverted, or siphoned into unrelated government expenses.',
    solutionStatement:
      'Locks approved budget allocations into 6 individual smart contract escrow vaults on Polygon PoS. Vaults release drawdowns strictly in tranches as field deliveries are proven.',
    designatedActor: {
      role: 'Treasury & Public Accounts Directorate',
      title: 'State Treasury Officer & Finance Controller',
      cadre: 'Finance Department & Principal Accountant General (PAG)',
      description:
        'Monitors non-transferable on-chain escrow allocations and authorizes cryptographic drawdowns.',
    },
    statutoryMandate: {
      code: 'Constitution of India (Art 283)',
      law: 'Custody & Operation of Consolidated and Public Funds of the State',
      citation: 'Assam / Odisha Treasury Rules & Contingency Fund Regulations',
    },
    coreSafeguard: {
      title: 'On-Chain Departmental Ring-Fencing',
      description:
        'Allocations are non-transferable on-chain accounting entries in paise. Department sub-vaults cannot be raided for general expenditure or personal accounts.',
      verificationMechanism: 'FundEscrowLedger.sol Smart Contract on Polygon PoS',
    },
    nextMilestone: {
      targetStage: 'Stage 05',
      targetName: 'Deliver',
      actionText:
        'Enables field vendors and magistrates to draw down funds by submitting geotagged delivery manifests.',
    },
    quickGuideSteps: [
      {
        stepNumber: 1,
        title: 'Inspect Department Vaults',
        description: 'View the 6 ring-fenced vaults: Revenue, Food & Supplies, Agriculture, Animal Husbandry, Health, PWD.',
      },
      {
        stepNumber: 2,
        title: 'Verify Polygon PoS Settlement',
        description: 'Inspect transaction hash, block number, gas used, and on-chain timestamp.',
      },
      {
        stepNumber: 3,
        title: 'Monitor Drawdown Ratio',
        description: 'Review allocated paise vs. locked reserves vs. disbursed tranche percentages.',
      },
      {
        stepNumber: 4,
        title: 'Advance to Deliveries',
        description: 'Proceed to Stage 05 to inspect or submit field delivery attestation manifests.',
      },
    ],
  },

  5: {
    stageNumber: 5,
    stageName: 'Deliver',
    plainLanguageSummary: 'No proof, no payout.',
    problemStatement:
      'Fake paper vouchers claim food, water, and tents were distributed to flood victims when supplies were siphoned and never reached the affected community.',
    solutionStatement:
      'Field logistics vendors and block magistrates upload distribution manifests; the browser computes client-side SHA-256 hashes, IPFS CIDs, and GPS geofence verification before payment unlocks.',
    designatedActor: {
      role: 'Field Logistics & Attestation Directorate',
      title: 'Executive Circle Magistrate & Logistics Vendors',
      cadre: 'Revenue Circle Officers & Empaneled Relief Supply Vendors',
      description:
        'On-the-ground distribution verification and cryptographic field attestation.',
    },
    statutoryMandate: {
      code: 'SDRF Operational Manual (Sec 7)',
      law: 'Mandatory Geotagged Physical Verification of Relief Distribution',
      citation: 'MHA National Disaster Management Guidelines on Logistics & Supply Chain',
    },
    coreSafeguard: {
      title: 'Client-Side SHA-256 + IPFS + GPS Geofence',
      description:
        'Delivery evidence is hashed in-browser via Web Crypto API and pinned to IPFS. Payment unlocks only if coordinates match the inundated zone.',
      verificationMechanism: 'DeliveryEvidence.sol & Web Crypto SHA-256 Hashing',
    },
    nextMilestone: {
      targetStage: 'Stage 06',
      targetName: 'Report',
      actionText:
        'Publishes verified delivery ledger to citizen grievance consoles so affected residents can corroborate or dispute.',
    },
    quickGuideSteps: [
      {
        stepNumber: 1,
        title: 'Select Delivery Line Item',
        description: 'Choose a line item (e.g. Gratuitous Relief Camp Feeding, Emergency Tarpaulins).',
      },
      {
        stepNumber: 2,
        title: 'Attach Field Proof',
        description: 'Click "Attach Field Proof" to upload delivery receipts, photos, or GPS truck coordinates.',
      },
      {
        stepNumber: 3,
        title: 'Verify Cryptographic Hash',
        description: 'Observe real-time SHA-256 hash calculation and IPFS content identifier (CID) generation.',
      },
      {
        stepNumber: 4,
        title: 'Anchor Proof to Ledger',
        description: 'Submit proof to trigger smart contract escrow tranche release and update proven percentage.',
      },
    ],
  },

  6: {
    stageNumber: 6,
    stageName: 'Report',
    plainLanguageSummary: 'Every citizen has a ticking clock behind their complaint.',
    problemStatement:
      'Citizen complaints are buried in paper registers at block offices and ignored for months, allowing ghost deliveries and neglected villages to remain invisible.',
    solutionStatement:
      'Multilingual citizen intake in Hindi, Bengali, Assamese, and English. Every complaint starts an immutable 48-Hour Statutory SLA Countdown on Polygon PoS that auto-escalates to the District Magistrate if unaddressed.',
    designatedActor: {
      role: 'Public Grievance Redressal Cell',
      title: 'Affected Citizens & District Grievance Officer',
      cadre: 'Disaster Affected Public & DDMA Grievance Officer',
      description:
        'Citizen-initiated audits, grievance logging, and automated statutory escalation monitoring.',
    },
    statutoryMandate: {
      code: 'Right to Public Services Act',
      law: 'Statutory 48-Hour Emergency Grievance Redressal Guarantee',
      citation: 'Assam / Odisha Right to Public Services Act & Disaster Citizen Charter',
    },
    coreSafeguard: {
      title: 'On-Chain 48-Hour SLA Auto-Escalation',
      description:
        'Grievances are hashed and registered on-chain with block timestamps. The administration cannot reset the clock or delete records without public proof.',
      verificationMechanism: 'GrievanceRegistry.sol SLA Countdown on Polygon PoS',
    },
    nextMilestone: {
      targetStage: 'Notebook',
      targetName: 'Public Ledger & CAG Audit',
      actionText:
        'All complaints, deliveries, and disbursals are immortalized in the public notebook for CAG audit under Article 151.',
    },
    quickGuideSteps: [
      {
        stepNumber: 1,
        title: 'Inspect Live Grievance Feed',
        description: 'Review citizen complaints from flood-affected villages with real-time SLA countdowns.',
      },
      {
        stepNumber: 2,
        title: 'File Sample Citizen Grievance',
        description: 'Click "File Citizen Report" to submit a test complaint in Hindi, Assamese, Bengali, or English.',
      },
      {
        stepNumber: 3,
        title: 'Monitor 48h SLA Countdown',
        description: 'Observe active time remaining before statutory escalation to the District Magistrate occurs.',
      },
      {
        stepNumber: 4,
        title: 'Inspect CAG Audit Notebook',
        description: 'Click "View Public Notebook" or "Export Audit Dossier" to verify complete institutional transparency.',
      },
    ],
  },
}
