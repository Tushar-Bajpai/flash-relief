import { prisma, isDbConfigured } from "./prisma";
import { SDRF_LEGAL_NORMS } from "../data/sdrf-corpus";
import { getEmbeddingsProvider } from "./vector-store";

export async function seedDatabase() {
  console.log("--------------------------------------------------");
  console.log("⚡ FlashRelief: Database & pgvector Seeder starting...");
  console.log("--------------------------------------------------");

  if (!isDbConfigured()) {
    console.warn("⚠️ Neon DATABASE_URL not set or points to default placeholder.");
    console.warn("Skipping live database insertion. Application will use built-in resilient mock store.");
    return { success: false, reason: "DATABASE_URL not configured" };
  }

  try {
    // 1. Ingest MHA SDRF Norms into DocumentChunks for LangChain Vector DB
    console.log("📦 Ingesting MHA SDRF legal norms into pgvector (document_chunks)...");
    const embeddings = getEmbeddingsProvider();

    for (const norm of SDRF_LEGAL_NORMS) {
      const fullDocText = `${norm.normCode}: ${norm.title}\nCategory: ${norm.category}\nRate: ${norm.rateDescription}\nStatute: ${norm.statutoryReference}\nTrigger: ${norm.disbursalTrigger}\nEvidence: ${norm.verificationEvidence}\nDetails: ${norm.content}`;
      const vec = await embeddings.embedQuery(fullDocText);
      const vecString = `[${vec.join(",")}]`;

      await prisma.$executeRaw`
        INSERT INTO document_chunks (id, content, metadata, embedding, "createdAt", "updatedAt")
        VALUES (
          ${norm.id},
          ${fullDocText},
          ${JSON.stringify({
            normCode: norm.normCode,
            category: norm.category,
            title: norm.title,
            statutoryReference: norm.statutoryReference,
            department: norm.department,
            rateDescription: norm.rateDescription,
            unitRateRupees: norm.unitRateRupees,
          })}::jsonb,
          ${vecString}::vector,
          NOW(),
          NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          content = EXCLUDED.content,
          metadata = EXCLUDED.metadata,
          embedding = EXCLUDED.embedding,
          "updatedAt" = NOW();
      `;
    }
    console.log(`✅ ${SDRF_LEGAL_NORMS.length} SDRF legal norms seeded into vector database.`);

    // 2. Seed Disaster Events
    console.log("🌊 Seeding Disaster Events...");
    await prisma.disasterEvent.upsert({
      where: { id: "fl-2026-brahmaputra" },
      update: {},
      create: {
        id: "fl-2026-brahmaputra",
        title: "Brahmaputra Upper Catchment Surge",
        basin: "Brahmaputra Basin",
        state: "Assam",
        district: "Dibrugarh & Majuli",
        alertLevel: "EMERGENCY",
        probability: 0.94,
        leadTimeHours: 11,
        inundationSqKm: 142.8,
        populationAtRisk: 48200,
        status: "DELIVERING",
        polygonTxHash: "0x7a29e1c409b88e109df4421b990184b901a8f9024c8b919d883910cbe77a1928",
        blockNumber: 19482850,
      },
    });

    await prisma.disasterEvent.upsert({
      where: { id: "fl-2026-mahanadi" },
      update: {},
      create: {
        id: "fl-2026-mahanadi",
        title: "Mahanadi Delta Inundation",
        basin: "Mahanadi Basin",
        state: "Odisha",
        district: "Cuttack & Puri",
        alertLevel: "WARNING",
        probability: 0.82,
        leadTimeHours: 18,
        inundationSqKm: 86.4,
        populationAtRisk: 29500,
        status: "REVIEWED",
        polygonTxHash: "0x4b81c19f09d88201a4f009e4198c0b24019a820c4b901a8920194819a8401928",
        blockNumber: 19482110,
      },
    });

    // 3. Seed Telemetry Gauges
    console.log("📡 Seeding Telemetry Gauges...");
    const gauges = [
      {
        eventId: "fl-2026-brahmaputra",
        stationName: "Pasighat Station",
        river: "Siang / Upper Brahmaputra",
        stageMeters: 154.2,
        dangerLevelMeters: 153.96,
        rateOfRiseMetersHr: 0.18,
        isRising: true,
      },
      {
        eventId: "fl-2026-brahmaputra",
        stationName: "Dibrugarh Water Gate",
        river: "Brahmaputra",
        stageMeters: 106.1,
        dangerLevelMeters: 105.7,
        rateOfRiseMetersHr: 0.12,
        isRising: true,
      },
      {
        eventId: "fl-2026-brahmaputra",
        stationName: "Majuli Gormur Gauge",
        river: "Kherkutia Xuti",
        stageMeters: 87.4,
        dangerLevelMeters: 86.9,
        rateOfRiseMetersHr: 0.22,
        isRising: true,
      },
    ];

    for (const g of gauges) {
      await prisma.gaugeTelemetry.create({
        data: g,
      });
    }

    // 4. Seed SDRF Budget Draft & Line Items
    console.log("💰 Seeding SDRF Budget & Line Items...");
    const budget = await prisma.sdrfBudgetDraft.create({
      data: {
        eventId: "fl-2026-brahmaputra",
        waterDepthMeters: 1.45,
        percentile: "P50",
        totalRupees: 73500000, // 7.35 Crores
        totalPaise: BigInt("7350000000"), // 73,500,000 * 100
        status: "APPROVED",
        notes: "Recommended by DDMA based on 142.8 sq km inundation and 48,200 at-risk residents.",
      },
    });

    const lineItems = [
      {
        budgetId: budget.id,
        normCode: "SDRF-03-SHELTER",
        category: "Camp Operations & Food",
        departmentId: "food_cs",
        description: "Cooked food rations & clean water for 24,000 camp residents (14 days)",
        quantity: 24000,
        unitRate: 1120,
        totalCost: 26880000,
        formula: "24,000 persons × ₹80/day × 14 days",
        provenCost: 19500000,
      },
      {
        budgetId: budget.id,
        normCode: "SDRF-04-CLOTH",
        category: "Essential Family Kits",
        departmentId: "revenue_dm",
        description: "Clothing and household utensil sets for washed out families",
        quantity: 4200,
        unitRate: 5000,
        totalCost: 21000000,
        formula: "4,200 families × ₹5,000 (₹2,500 clothing + ₹2,500 utensils)",
        provenCost: 11200000,
      },
      {
        budgetId: budget.id,
        normCode: "SDRF-09-MED",
        category: "Mobile Medical & Chlorine",
        departmentId: "health_fws",
        description: "Mobile medical dispensaries, water purification tablets & ORS kits",
        quantity: 48200,
        unitRate: 150,
        totalCost: 7230000,
        formula: "48,200 persons at risk × ₹150/person",
        provenCost: 5800000,
      },
      {
        budgetId: budget.id,
        normCode: "SDRF-08-INFRA",
        category: "Emergency Embankment Repair",
        departmentId: "pwd_bridges",
        description: "Immediate temporary geo-bag revetment at Matmora breached embankment",
        quantity: 1,
        unitRate: 18390000,
        totalCost: 18390000,
        formula: "Immediate breach closure (Ceiling: 25% of annual allocation)",
        provenCost: 0,
      },
    ];

    for (const item of lineItems) {
      await prisma.sdrfLineItem.create({
        data: item,
      });
    }

    // 5. Seed 3-of-3 Quorum Signatures
    console.log("✍️ Seeding 3-of-3 Quorum Signatures...");
    const signers = [
      {
        eventId: "fl-2026-brahmaputra",
        officerId: "off_ias_01",
        officerName: "Shri Bikram Kairi, IAS",
        role: "District Magistrate & DDMA Chairman",
        cadre: "IAS",
        action: "APPROVED",
        status: "SIGNED",
        publicKey: "0x884920DbC910eF4892cfa7129c9bb8812c4019a2",
        signatureHash: "0x3f9a71bd92c10928419a4e7492c1b9948201a098492019b88204910b849201f8",
        signedAt: new Date("2026-10-26T05:42:00Z"),
      },
      {
        eventId: "fl-2026-brahmaputra",
        officerId: "off_cta_02",
        officerName: "Dr. Anurag Sharma",
        role: "Chief Technical Advisor, ASDMA",
        cadre: "NDMA",
        action: "APPROVED",
        status: "SIGNED",
        publicKey: "0x4fa91c80b2c140924e09d18ac93019fba8491024",
        signatureHash: "0x82b410ca19f88492011b9c924019a84920491820491820194819a84920184910",
        signedAt: new Date("2026-10-26T06:10:00Z"),
      },
      {
        eventId: "fl-2026-brahmaputra",
        officerId: "off_fin_03",
        officerName: "Smt. Mridula Baruah, ACS",
        role: "Joint Secretary (Finance), Govt. of Assam",
        cadre: "IDAS",
        action: "APPROVED",
        status: "SIGNED",
        publicKey: "0x12a09dc9b109e4d00891ac41098bf12908a8f10b",
        signatureHash: "0x19a28f98fc4892cfa7129c94819a820491820938491820491820491820491820",
        signedAt: new Date("2026-10-26T06:34:00Z"),
      },
    ];

    for (const s of signers) {
      await prisma.officerReviewSignature.create({
        data: s,
      });
    }

    // 6. Seed Escrow Vaults
    console.log("🔒 Seeding Smart Escrow Vaults...");
    const vaults = [
      {
        eventId: "fl-2026-brahmaputra",
        departmentId: "food_cs",
        departmentName: "Food & Civil Supplies",
        contractAddress: "0x918a9B024C9F10dE4819A0194810294C01984201",
        allocatedPaise: BigInt("2688000000"),
        disbursedPaise: BigInt("2000000000"),
        provenPaise: BigInt("1950000000"),
        state: "RELEASING",
      },
      {
        eventId: "fl-2026-brahmaputra",
        departmentId: "revenue_dm",
        departmentName: "Revenue & Disaster Management",
        contractAddress: "0x38B901Ca4910Fe94810294182948102941829012",
        allocatedPaise: BigInt("2100000000"),
        disbursedPaise: BigInt("1400000000"),
        provenPaise: BigInt("1120000000"),
        state: "RELEASING",
      },
      {
        eventId: "fl-2026-brahmaputra",
        departmentId: "health_fws",
        departmentName: "Health & Family Welfare",
        contractAddress: "0x7F91024bC9104819201948102948102948102934",
        allocatedPaise: BigInt("723000000"),
        disbursedPaise: BigInt("600000000"),
        provenPaise: BigInt("580000000"),
        state: "RELEASING",
      },
      {
        eventId: "fl-2026-brahmaputra",
        departmentId: "pwd_bridges",
        departmentName: "Public Works (Bridges & Embankments)",
        contractAddress: "0x11B8920Ca9104819201948102948102948102956",
        allocatedPaise: BigInt("1839000000"),
        disbursedPaise: BigInt("800000000"),
        provenPaise: BigInt("0"),
        state: "LOCKED",
      },
    ];

    for (const v of vaults) {
      await prisma.departmentEscrowVault.create({
        data: v,
      });
    }

    // 7. Seed Citizen Grievance
    console.log("📢 Seeding Citizen Grievances...");
    await prisma.citizenGrievance.create({
      data: {
        eventId: "fl-2026-brahmaputra",
        trackingId: "GRV-2026-081",
        village: "Jengraimukh, Majuli",
        district: "Majuli",
        citizenHash: "0x918a...291a",
        category: "RATION_SHORTAGE",
        description: "Community shelter #4 did not receive infant milk supplement during morning airdrop.",
        amountInvolved: 24000,
        status: "INVESTIGATING",
        slaDeadline: new Date(Date.now() + 38 * 3600 * 1000), // 38 hours remaining
      },
    });

    console.log("--------------------------------------------------");
    console.log("✨ FlashRelief Database & Vector Store Seed complete!");
    console.log("--------------------------------------------------");
    return { success: true };
  } catch (err: any) {
    console.error("❌ Seeding encountered an error:", err);
    return { success: false, error: err.message };
  }
}

// Direct execution when invoked via ts-node / node
if (require.main === module) {
  seedDatabase()
    .then((res) => {
      console.log("Seed execution finished:", res);
      process.exit(0);
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
