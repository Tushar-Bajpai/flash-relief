/**
 * Official Ministry of Home Affairs (MHA) State Disaster Response Fund (SDRF)
 * Norms of Assistance (2021-2026) and National Disaster Management Authority (NDMA)
 * Standard Operating Procedures for Inundation Relief.
 */

export interface SdrfNormDocument {
  id: string;
  normCode: string;
  category: string;
  title: string;
  rateDescription: string;
  unitRateRupees: number;
  statutoryReference: string;
  department: string;
  disbursalTrigger: string;
  verificationEvidence: string;
  content: string;
}

export const SDRF_LEGAL_NORMS: SdrfNormDocument[] = [
  {
    id: "norm_sdrf_01_gr",
    normCode: "SDRF-01-GR",
    category: "Gratuitous Relief",
    title: "Ex-gratia payment to families of deceased persons",
    rateDescription: "₹4,00,000 per deceased person (subject to certified autopsy/panchnama)",
    unitRateRupees: 400000,
    statutoryReference: "MHA Order No. 33-04/2020-NDM-I Item 1(a)",
    department: "Revenue & Disaster Management",
    disbursalTrigger: "Confirmed loss of life due to flood surge or riverbank collapse.",
    verificationEvidence: "Death certificate, FIR / Police panchnama, District Magistrate inquiry report.",
    content: `Item 1(a) Ex-gratia payment to families of deceased persons:
₹4,00,000 per deceased person through direct electronic DBT into the verified bank account of the legal heir.
Mandatory documentation includes: (1) Post-mortem/Inquest report, (2) Legal heir succession verification by Tehsildar, (3) District Collector certification.
Disbursal timeline: Immediate release within 48 hours of death verification on the public portal.`
  },
  {
    id: "norm_sdrf_02_inj",
    normCode: "SDRF-02-INJ",
    category: "Medical & Disability Relief",
    title: "Grievous injury requiring hospitalization > 1 week",
    rateDescription: "₹74,000 per person for grievous injury with >1 week hospitalization",
    unitRateRupees: 74000,
    statutoryReference: "MHA Order No. 33-04/2020-NDM-I Item 1(c)",
    department: "Health & Family Welfare",
    disbursalTrigger: "Admitted to civil hospital or primary health center due to flood trauma.",
    verificationEvidence: "Hospital admission discharge summary signed by Chief Medical Officer (CMO).",
    content: `Item 1(c) Assistance for grievous injury requiring hospitalization:
(i) Hospitalization of more than one week: ₹74,000 per person.
(ii) Hospitalization of less than one week: ₹16,000 per person.
Includes medical supply support, anti-snake venom vials, and post-trauma orthopedic rehabilitation.
Verification: Government hospital bed occupancy timestamp and CMO sign-off.`
  },
  {
    id: "norm_sdrf_03_shelter",
    normCode: "SDRF-03-SHELTER",
    category: "Relief Camp Operations",
    title: "Provision of gratuitous relief in camps: food, water, sanitation",
    rateDescription: "₹80/adult/day and ₹60/child/day for maximum 30 days",
    unitRateRupees: 2400, // 30 days * 80
    statutoryReference: "MHA Order No. 33-04/2020-NDM-I Item 2(a)",
    department: "Food & Civil Supplies",
    disbursalTrigger: "Inundation depth exceeds 1.0 meter displacing households to designated camp.",
    verificationEvidence: "Relief camp roster, geo-tagged attendance biometric or muster roll signed by Camp In-charge.",
    content: `Item 2(a) Gratuitous relief for people evacuated and sheltered in relief camps:
Daily cooked food, safe drinking water, halogen tablets, child nutrition, and mobile sanitation.
Rates: Adults ₹80 per day; Children (below 12 years) ₹60 per day.
Permissible duration: Up to 30 days; extendable to 60 days on State Executive Committee (SEC) recommendation.
Camp accounts must log vendor ration invoices, LPG cylinders, and daily headcounts.`
  },
  {
    id: "norm_sdrf_04_cloth",
    normCode: "SDRF-04-CLOTH",
    category: "Essential Household Relief",
    title: "Clothing and household utensils for families with submerged houses",
    rateDescription: "₹2,500 clothing + ₹2,500 utensils = ₹5,000 per family",
    unitRateRupees: 5000,
    statutoryReference: "MHA Order No. 33-04/2020-NDM-I Item 2(b)",
    department: "Revenue & Disaster Management",
    disbursalTrigger: "Household belongings and utensils washed away by flood waters.",
    verificationEvidence: "Field patwari geo-tagged damage verification with Aadhaar/Ration Card linkage.",
    content: `Item 2(b) Assistance for clothing and utensils for families whose houses have been washed away or fully inundated:
(i) Clothing: ₹2,500 per family.
(ii) Utensils/household vessels: ₹2,500 per family.
Total entitlement: ₹5,000 per verified family unit.
Distribution must be verified via dual OTP confirmation and uploaded photograph with geotag.`
  },
  {
    id: "norm_sdrf_05_house",
    normCode: "SDRF-05-HOUSE",
    category: "Housing Reconstruction",
    title: "Assistance for fully destroyed or severely damaged houses",
    rateDescription: "₹1,20,000 per house in plain areas; ₹1,30,000 in hilly/difficult areas",
    unitRateRupees: 120000,
    statutoryReference: "MHA Order No. 33-04/2020-NDM-I Item 3(a)",
    department: "Public Works Department",
    disbursalTrigger: "Structural collapse or structural damage > 75% caused by flood water pressure.",
    verificationEvidence: "Assistant Engineer (PWD) technical damage assessment sheet with high-resolution coordinates.",
    content: `Item 3(a) Fully damaged / destroyed houses:
(i) Plain areas: ₹1,20,000 per house.
(ii) Hilly/difficult terrains and scheduled areas: ₹1,30,000 per house.
Severe damage (kutcha/pucca): ₹40,000 to ₹70,000.
Partially damaged (minor repair): ₹15,000.
Reconstruction assistance is released in 2 milestones: 50% upon plinth inspection, 50% upon roof completion.`
  },
  {
    id: "norm_sdrf_06_agri",
    normCode: "SDRF-06-AGRI",
    category: "Agricultural Land Rehabilitation",
    title: "De-silting of agricultural land & removal of sand deposits",
    rateDescription: "₹18,000 per hectare for small & marginal farmers (min deposit > 3 inches)",
    unitRateRupees: 18000,
    statutoryReference: "MHA Order No. 33-04/2020-NDM-I Item 4(a)",
    department: "Agriculture & Farmers Welfare",
    disbursalTrigger: "River silt or coarse sand deposit exceeding 3 inches depth on agricultural land.",
    verificationEvidence: "Revenue Circle Officer and Agriculture Extension Officer joint survey with drone orthomosaic.",
    content: `Item 4(a) Desilting of agricultural land and removal of debris/sand deposits:
Rate: ₹18,000 per hectare for small and marginal farmers (holding up to 2 hectares).
Subject to ground truthing that silt layer exceeds 7.5 cm (3 inches) impairing cultivation.
For other farmers: Assistance limited to 2 hectares per landholding entity.
Drone photogrammetry or satellite multispectral NDVI anomaly map accepted as primary evidence.`
  },
  {
    id: "norm_sdrf_07_cattle",
    normCode: "SDRF-07-CATTLE",
    category: "Livestock Replacement",
    title: "Replacement of lost milch and draught livestock",
    rateDescription: "₹37,500 per milch cow/buffalo; ₹4,000 per sheep/goat/pig",
    unitRateRupees: 37500,
    statutoryReference: "MHA Order No. 33-04/2020-NDM-I Item 5(a)",
    department: "Animal Husbandry & Veterinary",
    disbursalTrigger: "Loss of milch or draught animal due to drowning or flash flood current.",
    verificationEvidence: "Veterinary Officer post-mortem certificate or ear tag carcass registration.",
    content: `Item 5(a) Replacement of milch and draught livestock:
(i) Buffalo / Cow / Camel: ₹37,500 per animal (ceiling: 3 animals per family).
(ii) Sheep / Goat / Pig: ₹4,000 per animal (ceiling: 30 animals per family).
(iii) Draught animals (bullock/horse): ₹32,000 per animal.
Disbursed into dairy farmer's bank account via direct electronic transfer after vetting by District Veterinary Officer.`
  },
  {
    id: "norm_sdrf_08_infra",
    normCode: "SDRF-08-INFRA",
    category: "Critical Infrastructure Repair",
    title: "Immediate temporary restoration of breached embankments & connectivity",
    rateDescription: "Cost of emergency boulder pitching, sand-bag revetment, and temporary bailey bridge",
    unitRateRupees: 2500000,
    statutoryReference: "MHA Order No. 33-04/2020-NDM-I Item 6(b)",
    department: "Water Resources & Flood Control",
    disbursalTrigger: "Breach in flood embankment or washing away of culvert cutting off road access.",
    verificationEvidence: "Executive Engineer daily measurement book (MB), geo-tagged time-stamped video of breach closure.",
    content: `Item 6(b) Immediate temporary restoration of damaged infrastructure:
Permissible works include:
- Temporary breach closure with geo-bags, boulder wire crates, and bamboo porcupines.
- Emergency restoration of severed village access roads, culverts, and bailey bridges.
- Restoration of disrupted rural piped drinking water supply schemes.
Ceiling: Up to 25% of annual SDRF allocation may be utilized for immediate infrastructure restoration.`
  },
  {
    id: "norm_sdrf_09_med",
    normCode: "SDRF-09-MED",
    category: "Epidemic Prevention & Water Safety",
    title: "Mobile medical dispensaries, water purification tablets & disinfection",
    rateDescription: "₹150 per affected individual for prophylactic medicine and chlorine kits",
    unitRateRupees: 150,
    statutoryReference: "NDMA SOP Flood Response Section 4.3",
    department: "Health & Family Welfare",
    disbursalTrigger: "Water contamination detected in drinking wells or flood water stagnation > 48 hours.",
    verificationEvidence: "District Epidemiologist batch dispatch log and PHC distribution roster.",
    content: `Item 7 Emergency public health containment:
Deployment of mobile medical units (MMUs), distribution of chlorine/halogen tablets, ORS packets, and vector control fogging.
Rate: ₹150 per affected person in inundation zone.
Quality audit requires water testing report showing free residual chlorine > 0.5 mg/L at delivery point.`
  },
  {
    id: "norm_sdrf_10_fodder",
    normCode: "SDRF-10-FODDER",
    category: "Livestock Fodder & Camp Care",
    title: "Emergency cattle camps, silage distribution and animal medicine",
    rateDescription: "₹70 per large animal per day; ₹35 per small animal per day",
    unitRateRupees: 2100, // 30 days * 70
    statutoryReference: "MHA Order No. 33-04/2020-NDM-I Item 5(c)",
    department: "Animal Husbandry & Veterinary",
    disbursalTrigger: "Submergence of community grazing lands and livestock shelters.",
    verificationEvidence: "Veterinary cattle camp muster roll and green fodder procurement weighbridge receipt.",
    content: `Item 5(c) Supply of fodder and cattle camps:
Provision of dry/green fodder, silage, mineral mixture, and veterinary medicines in temporary cattle camps.
Rates: ₹70 per day for large animals (cattle, buffalo); ₹35 per day for small animals (sheep, goats).
Permissible duration: Up to 30 days; extendable during prolonged inundation.`
  }
];
