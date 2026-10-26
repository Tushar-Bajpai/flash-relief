// Stage 04: Web3 Public Ledger & Departmental Allocation Data Models
// Network: Polygon PoS / Amoy Testnet (EVM)

export interface ContractAddressInfo {
  name: string
  address: string
  description: string
  explorerUrl: string
}

export const SMART_CONTRACTS: Record<string, ContractAddressInfo> = {
  DetectionRegistry: {
    name: 'DetectionRegistry.sol',
    address: '0x384c9b109e4d00891ac41098bf12908a8f10b230',
    description: 'Timestamped hash of early sensor alerts, CWC gauges, and Sentinel-1 SAR inputs.',
    explorerUrl: 'https://amoy.polygonscan.com/address/0x384c9b109e4d00891ac41098bf12908a8f10b230',
  },
  BudgetRegistry: {
    name: 'BudgetRegistry.sol',
    address: '0x7a2f44c9b109e4d00891ac41098bf12908a8f12c',
    description: '3-of-3 officer consensus authorization and approved SDRF budget document Merkle roots.',
    explorerUrl: 'https://amoy.polygonscan.com/address/0x7a2f44c9b109e4d00891ac41098bf12908a8f12c',
  },
  FundLedger: {
    name: 'FundLedger.sol',
    address: '0x9e3f71c48209bb74a10df5419b48f657a2209148',
    description: 'Non-transferable accounting entries in paise per department, event, and line item.',
    explorerUrl: 'https://amoy.polygonscan.com/address/0x9e3f71c48209bb74a10df5419b48f657a2209148',
  },
  EvidenceRegistry: {
    name: 'EvidenceRegistry.sol',
    address: '0x5b19ac8209b109e4d00891ac41098bf12908a8f44',
    description: 'Tamper-proof IPFS content hashes of delivery geotags, receipts, and biometric proofs.',
    explorerUrl: 'https://amoy.polygonscan.com/address/0x5b19ac8209b109e4d00891ac41098bf12908a8f44',
  },
}

export interface DepartmentVaultAllocation {
  departmentId: string
  departmentName: string
  shortName: string
  subVaultAddress: string
  amountCrores: number
  amountRupees: number
  amountPaise: bigint
  percentage: number
  color: string
  earmarkRestriction: string
  status: 'ACTIVE_LOCKED' | 'DISBURSING' | 'COMPLETED'
}

export const INITIAL_DEPARTMENT_VAULTS: DepartmentVaultAllocation[] = [
  {
    departmentId: 'revenue_dm',
    departmentName: 'Revenue & Disaster Management',
    shortName: 'Revenue & DM',
    subVaultAddress: '0x71cA...48E2',
    amountCrores: 12.85,
    amountRupees: 128500000,
    amountPaise: BigInt('12850000000'),
    percentage: 43.3,
    color: '#00e5ff',
    earmarkRestriction: 'Restricted strictly to destroyed dwellings reconstruction & family clothing grants.',
    status: 'ACTIVE_LOCKED',
  },
  {
    departmentId: 'food_supplies',
    departmentName: 'Food, Civil Supplies & Consumer Affairs',
    shortName: 'Food & Supplies',
    subVaultAddress: '0x82bF...91A0',
    amountCrores: 6.84,
    amountRupees: 68400000,
    amountPaise: BigInt('6840000000'),
    percentage: 23.0,
    color: '#ff785f',
    earmarkRestriction: 'Restricted strictly to relief camp rations, dry food packets, and drinking water tankers.',
    status: 'ACTIVE_LOCKED',
  },
  {
    departmentId: 'agriculture',
    departmentName: 'Agriculture & Farmers Empowerment',
    shortName: 'Agriculture',
    subVaultAddress: '0x39cD...18B5',
    amountCrores: 4.62,
    amountRupees: 46200000,
    amountPaise: BigInt('4620000000'),
    percentage: 15.6,
    color: '#10b981',
    earmarkRestriction: 'Direct DBT subsidy for standing crop loss & agricultural land sand desilting.',
    status: 'ACTIVE_LOCKED',
  },
  {
    departmentId: 'health_family',
    departmentName: 'Health & Family Welfare',
    shortName: 'Health & FW',
    subVaultAddress: '0x14aE...77C9',
    amountCrores: 1.88,
    amountRupees: 18800000,
    amountPaise: BigInt('1880000000'),
    percentage: 6.3,
    color: '#a78bfa',
    earmarkRestriction: 'Mobile boat clinics, water purification tablets, and medical prophylaxis kits.',
    status: 'ACTIVE_LOCKED',
  },
  {
    departmentId: 'animal_husbandry',
    departmentName: 'Animal Husbandry & Veterinary',
    shortName: 'Animal Husbandry',
    subVaultAddress: '0x62dB...41F8',
    amountCrores: 1.76,
    amountRupees: 17600000,
    amountPaise: BigInt('1760000000'),
    percentage: 5.9,
    color: '#f4c969',
    earmarkRestriction: 'Elevated cattle camp shelter, dry fodder packets, and livestock vaccine doses.',
    status: 'ACTIVE_LOCKED',
  },
  {
    departmentId: 'public_works',
    departmentName: 'Public Works & Water Resources',
    shortName: 'PWD & WRD',
    subVaultAddress: '0x99cA...33D1',
    amountCrores: 1.72,
    amountRupees: 17200000,
    amountPaise: BigInt('1720000000'),
    percentage: 5.8,
    color: '#72d9e8',
    earmarkRestriction: 'Immediate temporary boulder/geo-bag breach sealing and emergency road access restoration.',
    status: 'ACTIVE_LOCKED',
  },
]

export interface ReleaseTxDetails {
  network: string
  chainId: number
  txHash: string
  blockNumber: number
  blockTimestamp: string
  gasUsed: string
  gasCostUsd: string
  stateMerkleRoot: string
  budgetDocumentHash: string
  approversQuorum: string[]
  totalAllocatedCrores: number
  totalAllocatedPaise: string
}

export const SAMPLE_RELEASE_TX: ReleaseTxDetails = {
  network: 'Polygon PoS Mainnet / Amoy Testnet',
  chainId: 80002,
  txHash: '0x5c8e41a0982bb710ef39b48f657a2209148b301cd23b890ef14892cfa7129c9b',
  blockNumber: 19482850,
  blockTimestamp: '2026-10-26T06:30:15Z',
  gasUsed: '142,850 gas (0.0018 MATIC / $0.001)',
  gasCostUsd: '$0.0012',
  stateMerkleRoot: '0x7a2f44c9b109e4d00891ac41098bf12908a8f10b2308c109fa7129c9bb8812c4',
  budgetDocumentHash: 'SHA-256: 8f029c11a0928b14e09d18ac93019fba849102488a092147bf0912cb4019a28',
  approversQuorum: [
    '0x884920DbC910eF4892cfa7129c9bb8812c4019a2 (District Magistrate)',
    '0x4fa91c80b2c140924e09d18ac93019fba8491024 (SDMA Technical Advisor)',
    '0x12a09dc9b109e4d00891ac41098bf12908a8f10b (Finance Secretary)',
  ],
  totalAllocatedCrores: 29.67,
  totalAllocatedPaise: '29,670,000,000 paise',
}
