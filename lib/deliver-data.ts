export interface DeliveryProofItem {
  id: string
  lineItemId: string
  normCode: string
  description: string
  departmentId: string
  departmentName: string
  locationName: string
  gpsCoords: { lat: number; lng: number }
  quantityDelivered: number
  totalTargetQuantity: number
  unitLabel: string
  disbursedRupees: number
  provenRupees: number
  status: 'PROVEN' | 'IN_TRANSIT' | 'PENDING_ATTESTATION'
  ipfsHash: string
  evidenceTxHash?: string
  evidenceType: 'GPS_PHOTO' | 'BIOMETRIC_RECEIPT' | 'WEIGHBRIDGE_SLIP' | 'CONTRACTOR_INSPECTION'
  attestedBy: string
  attestationTimestamp: string
}

export interface DeliveryScoreboardData {
  totalAllocatedCrores: number
  totalDisbursedCrores: number
  totalProvenCrores: number
  disbursedPercentage: number
  provenPercentage: number
  departmentMetrics: {
    departmentId: string
    shortName: string
    color: string
    allocatedCrores: number
    disbursedCrores: number
    provenCrores: number
    provenPct: number
  }[]
}

export const DELIVERY_SCOREBOARD: DeliveryScoreboardData = {
  totalAllocatedCrores: 29.67,
  totalDisbursedCrores: 18.42,
  totalProvenCrores: 14.85,
  disbursedPercentage: 62.1,
  provenPercentage: 50.1,
  departmentMetrics: [
    {
      departmentId: 'food_supplies',
      shortName: 'Food & Supplies',
      color: '#ff785f',
      allocatedCrores: 6.84,
      disbursedCrores: 5.80,
      provenCrores: 5.12,
      provenPct: 74.8,
    },
    {
      departmentId: 'health_family',
      shortName: 'Health & FW',
      color: '#a78bfa',
      allocatedCrores: 1.88,
      disbursedCrores: 1.62,
      provenCrores: 1.45,
      provenPct: 77.1,
    },
    {
      departmentId: 'revenue_dm',
      shortName: 'Revenue & DM',
      color: '#00e5ff',
      allocatedCrores: 12.85,
      disbursedCrores: 6.50,
      provenCrores: 4.80,
      provenPct: 37.4,
    },
    {
      departmentId: 'animal_husbandry',
      shortName: 'Animal Husbandry',
      color: '#f4c969',
      allocatedCrores: 1.76,
      disbursedCrores: 1.50,
      provenCrores: 1.32,
      provenPct: 75.0,
    },
    {
      departmentId: 'public_works',
      shortName: 'PWD & WRD',
      color: '#72d9e8',
      allocatedCrores: 1.72,
      disbursedCrores: 1.40,
      provenCrores: 1.16,
      provenPct: 67.4,
    },
    {
      departmentId: 'agriculture',
      shortName: 'Agriculture',
      color: '#10b981',
      allocatedCrores: 4.62,
      disbursedCrores: 1.60,
      provenCrores: 1.00,
      provenPct: 21.6,
    },
  ],
}

export const DELIVERY_LINE_ITEMS: DeliveryProofItem[] = [
  {
    id: 'proof-01',
    lineItemId: 'line-01',
    normCode: 'SDRF-01.A',
    description: 'Camp batch rations & clean tanker water supply (Moran Relief Camp #03)',
    departmentId: 'food_supplies',
    departmentName: 'Food, Civil Supplies & Consumer Affairs',
    locationName: 'Moran College Relief Shelter, Dibrugarh',
    gpsCoords: { lat: 27.185, lng: 94.928 },
    quantityDelivered: 18500,
    totalTargetQuantity: 24000,
    unitLabel: 'person-meals',
    disbursedRupees: 1757500,
    provenRupees: 1757500,
    status: 'PROVEN',
    ipfsHash: 'ipfs://bafybeihdwdcefgh4dq723nmlq1982bfa9102488a092147bf0912cb4019a',
    evidenceTxHash: '0x3a19bc8209bb74a10df5419b48f657a2209148b301cd23b890ef14892cfa12',
    evidenceType: 'BIOMETRIC_RECEIPT',
    attestedBy: 'Shri B. Gogoi, Area Supply Inspector (ID: FS-AS-491)',
    attestationTimestamp: '26 Oct 2026, 08:30 UTC',
  },
  {
    id: 'proof-02',
    lineItemId: 'line-08',
    normCode: 'SDRF-05.A',
    description: 'Mobile boat medical squad deployment & water purification halogen tablet packets',
    departmentId: 'health_family',
    departmentName: 'Health & Family Welfare',
    locationName: 'Rohmoria Island Reach (Riverine Sandbar)',
    gpsCoords: { lat: 27.521, lng: 95.042 },
    quantityDelivered: 6400,
    totalTargetQuantity: 8000,
    unitLabel: 'chlorine/ORS kits',
    disbursedRupees: 928000,
    provenRupees: 928000,
    status: 'PROVEN',
    ipfsHash: 'ipfs://bafybeicv9281ba48f657a2209148b301cd23b890ef14892cfa7129c9bb88',
    evidenceTxHash: '0x7b2f44c9b109e4d00891ac41098bf12908a8f10b2308c109fa7129c9bb8877e1',
    evidenceType: 'GPS_PHOTO',
    attestedBy: 'Dr. P. Sonowal, Medical Officer in Charge (ID: NHM-AS-102)',
    attestationTimestamp: '26 Oct 2026, 09:15 UTC',
  },
  {
    id: 'proof-03',
    lineItemId: 'line-07',
    normCode: 'SDRF-04.A',
    description: 'High-ground cattle fodder packets & anthelmintic livestock protection doses',
    departmentId: 'animal_husbandry',
    departmentName: 'Animal Husbandry & Veterinary',
    locationName: 'Bogibeel Embankment High-Ground Point #14',
    gpsCoords: { lat: 27.391, lng: 94.851 },
    quantityDelivered: 4200,
    totalTargetQuantity: 5500,
    unitLabel: 'cattle fodder packs',
    disbursedRupees: 294000,
    provenRupees: 294000,
    status: 'PROVEN',
    ipfsHash: 'ipfs://bafybeif4892cfa7129c9bb8812c4019a28b14e09d18ac93019fba8491024',
    evidenceTxHash: '0x99e3f71c48209bb74a10df5419b48f657a2209148b301cd23b890ef14892cf5b',
    evidenceType: 'WEIGHBRIDGE_SLIP',
    attestedBy: 'Dr. K. Das, Veterinary Officer (ID: AH-DIB-08)',
    attestationTimestamp: '26 Oct 2026, 09:40 UTC',
  },
  {
    id: 'proof-04',
    lineItemId: 'line-09',
    normCode: 'SDRF-06.A',
    description: 'Emergency boulder geo-bag placement along breached embankment spur #04',
    departmentId: 'public_works',
    departmentName: 'Public Works & Water Resources',
    locationName: 'Maijan Embankment Breach Point (km 14.2)',
    gpsCoords: { lat: 27.492, lng: 94.975 },
    quantityDelivered: 1,
    totalTargetQuantity: 2,
    unitLabel: 'embankment reaches',
    disbursedRupees: 450000,
    provenRupees: 450000,
    status: 'PROVEN',
    ipfsHash: 'ipfs://bafybeia2209148b301cd23b890ef14892cfa7129c9bb8812c4019a28b14e',
    evidenceTxHash: '0x4ca18e2098bb2710dfa4109b83f6511a2209148b301cd23b890ef14892cfa89',
    evidenceType: 'CONTRACTOR_INSPECTION',
    attestedBy: 'Er. T. Saikia, Executive Engineer WRD (ID: WRD-AS-044)',
    attestationTimestamp: '26 Oct 2026, 10:05 UTC',
  },
  {
    id: 'proof-05',
    lineItemId: 'line-02',
    normCode: 'SDRF-01.B',
    description: 'Emergency clothing kits and utensil assistance for washed-away families',
    departmentId: 'revenue_dm',
    departmentName: 'Revenue & Disaster Management',
    locationName: 'Chabua Revenue Circle, Dibrugarh',
    gpsCoords: { lat: 27.481, lng: 95.172 },
    quantityDelivered: 1200,
    totalTargetQuantity: 2500,
    unitLabel: 'family kits',
    disbursedRupees: 4560000,
    provenRupees: 3200000,
    status: 'PENDING_ATTESTATION',
    ipfsHash: 'ipfs://bafybeig9bb8812c4019a28b14e09d18ac93019fba849102488a092147bf09',
    evidenceType: 'BIOMETRIC_RECEIPT',
    attestedBy: 'Field verification in progress by Circle Officer',
    attestationTimestamp: 'Pending biometric upload',
  },
  {
    id: 'proof-06',
    lineItemId: 'line-05',
    normCode: 'SDRF-03.A',
    description: 'Crop input subsidy DBT disbursals to verified bank accounts of small/marginal farmers',
    departmentId: 'agriculture',
    departmentName: 'Agriculture & Farmers Empowerment',
    locationName: 'Tengakhat Agricultural Sub-Division',
    gpsCoords: { lat: 27.351, lng: 95.124 },
    quantityDelivered: 850,
    totalTargetQuantity: 3200,
    unitLabel: 'hectares verified',
    disbursedRupees: 7225000,
    provenRupees: 3500000,
    status: 'IN_TRANSIT',
    ipfsHash: 'ipfs://bafybeih7bf0912cb4019a28b14e09d18ac93019fba849102488a092147bf',
    evidenceType: 'CONTRACTOR_INSPECTION',
    attestedBy: 'PFMS batch pending bank acknowledgment',
    attestationTimestamp: 'In-transit DBT batch #2026-DIB-04',
  },
]
