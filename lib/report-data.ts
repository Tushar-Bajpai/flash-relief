export type GrievanceCategory =
  | 'RELIEF_NOT_DELIVERED'
  | 'SHORT_QUANTITY'
  | 'SPOILED_SUPPLIES'
  | 'WRONGFUL_EXCLUSION'
  | 'OFFICER_ABSENT'
  | 'BRIBE_DEMANDED'

export type GrievanceStatus =
  | 'INVESTIGATING'
  | 'CORROBORATED'
  | 'OFFICER_RESPONDED'
  | 'AUTO_ESCALATED'
  | 'RESOLVED'

export interface GrievanceItem {
  id: string
  lineItemId: string
  lineItemDescription: string
  departmentName: string
  category: GrievanceCategory
  locationName: string
  reporterPhoneMasked: string
  originalText: string
  originalLanguage: 'Assamese' | 'Hindi' | 'Bengali' | 'English'
  translatedEnglishText: string
  status: GrievanceStatus
  submissionTimestamp: string
  responseDeadline: string
  hoursRemainingSla: number
  isEscalated: boolean
  escalationLevel: 'BLOCK' | 'DISTRICT_COLLECTOR' | 'STATE_SDMA'
  ipfsEvidenceHash?: string
  grievanceTxHash: string
  officerResponse?: {
    officerName: string
    responseText: string
    respondedAt: string
    evidenceCid?: string
  }
}

export const INITIAL_GRIEVANCES: GrievanceItem[] = [
  {
    id: 'grv-2026-081',
    lineItemId: 'line-01',
    lineItemDescription: 'SDRF-01.A — Gratuitous Relief Camp Feeding & Tanker Water',
    departmentName: 'Food, Civil Supplies & Consumer Affairs',
    category: 'RELIEF_NOT_DELIVERED',
    locationName: 'Moran Revenue Circle, Ward #04 (Dhekeri Gaon)',
    reporterPhoneMasked: '+91 98*** **412',
    originalText: 'আমাৰ গাঁৱৰ ৪০টা পৰিয়ালক খোৱা পানীৰ টেংকাৰ আৰু খাদ্যৰ পেকেট দিয়া নাই। পানীয়ে ঘেৰি ৰাখিছে।',
    originalLanguage: 'Assamese',
    translatedEnglishText: '40 families in our village have not received drinking water tankers or food packets. We are completely surrounded by water.',
    status: 'AUTO_ESCALATED',
    submissionTimestamp: '25 Oct 2026, 14:10 UTC',
    responseDeadline: '26 Oct 2026, 14:10 UTC (Expired)',
    hoursRemainingSla: 0,
    isEscalated: true,
    escalationLevel: 'DISTRICT_COLLECTOR',
    ipfsEvidenceHash: 'ipfs://bafybeicmorn4918ac93019fba849102488a092147bf0912cb4019a28b14e',
    grievanceTxHash: '0x9e3f71c48209bb74a10df5419b48f657a2209148b301cd23b890ef14892cfa71',
    officerResponse: {
      officerName: 'District Magistrate Office (Escalation Cell)',
      responseText: 'Emergency NDRF motor-boat dispatched with 120 food packets and 500L bottled water. Supply inspector issued show-cause notice.',
      respondedAt: '26 Oct 2026, 15:00 UTC',
      evidenceCid: 'ipfs://bafybeih4918ac93019fba849102488a092147bf0912cb4019a28b14e991',
    },
  },
  {
    id: 'grv-2026-082',
    lineItemId: 'line-07',
    lineItemDescription: 'SDRF-04.A — High-Ground Cattle Fodder & Veterinary Vaccines',
    departmentName: 'Animal Husbandry & Veterinary Services',
    category: 'SHORT_QUANTITY',
    locationName: 'Bogibeel Embankment Spur #09',
    reporterPhoneMasked: '+91 87*** **901',
    originalText: 'गायों के लिए केवल 10 बोरी चारा मिला है, जबकि यहाँ 150 से अधिक मवेशी भूखे हैं।',
    originalLanguage: 'Hindi',
    translatedEnglishText: 'Only 10 bags of fodder were delivered for cows, whereas over 150 cattle are starving here on the embankment.',
    status: 'INVESTIGATING',
    submissionTimestamp: '26 Oct 2026, 07:20 UTC',
    responseDeadline: '28 Oct 2026, 07:20 UTC',
    hoursRemainingSla: 38,
    isEscalated: false,
    escalationLevel: 'BLOCK',
    grievanceTxHash: '0x4ca18e2098bb2710dfa4109b83f6511a2209148b301cd23b890ef14892cfa89',
  },
  {
    id: 'grv-2026-083',
    lineItemId: 'line-02',
    lineItemDescription: 'SDRF-01.B — Emergency Family Clothing Kits & Utensils',
    departmentName: 'Revenue & Disaster Management Department',
    category: 'WRONGFUL_EXCLUSION',
    locationName: 'Chabua Circle, Balijan Embankment Shelter',
    reporterPhoneMasked: '+91 94*** **218',
    originalText: 'আমাৰ ঘৰ সম্পূৰ্ণ উটি গৈছে কিন্তু নাম তালিকাত অন্তৰ্ভুক্ত কৰা হোৱা নাই। সহায় বিচৰা হৈছে।',
    originalLanguage: 'Assamese',
    translatedEnglishText: 'Our house was completely washed away, but our family name was excluded from the circle relief distribution list.',
    status: 'CORROBORATED',
    submissionTimestamp: '26 Oct 2026, 05:40 UTC',
    responseDeadline: '27 Oct 2026, 05:40 UTC',
    hoursRemainingSla: 14,
    isEscalated: false,
    escalationLevel: 'BLOCK',
    ipfsEvidenceHash: 'ipfs://bafybeib74a10df5419b48f657a2209148b301cd23b890ef14892cfa8998',
    grievanceTxHash: '0x12a09dc9b109e4d00891ac41098bf12908a8f10b2308c109fa7129c9bb8877bc',
    officerResponse: {
      officerName: 'Circle Officer, Chabua',
      responseText: 'Field verification team dispatched. Household verified under destroyed category; clothing grant of ₹3,800 added to batch #02.',
      respondedAt: '26 Oct 2026, 11:20 UTC',
    },
  },
]
