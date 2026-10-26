<div align="center">

# ⚡ FlashRelief

### Autonomous Flood Intelligence & Civic Relief Protocol
**Move relief before the news.**

[![Next.js](https://img.shields.io/badge/Next.js-16.4.3-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-R3F-black?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![Neon Postgres](https://img.shields.io/badge/Neon-pgvector-00e5ff?style=for-the-badge&logo=postgresql&logoColor=black)](https://neon.tech/)
[![Polygon PoS](https://img.shields.io/badge/Polygon-Amoy_PoS-8247E5?style=for-the-badge&logo=polygon&logoColor=white)](https://polygon.technology/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)

<p align="center">
  A civic infrastructure protocol pairing multi-satellite radar confirmation with deterministic statutory MHA SDRF legal norms, 3-of-3 multi-sig officer quorum, and a timestamped public ledger to automate fast, tamper-proof disaster disbursals.
</p>

[Explore Stages](#-6-stage-workflow-pipeline) •
[Architecture](#-system-architecture) •
[Statutory Norms](#-statutory-sdrf-grounding) •
[Smart Contracts](#-polygon-pos-smart-escrows) •
[Getting Started](#-getting-started) •
[Audit Pack](#-cag-audit-pack)

---

</div>

## 📌 Executive Summary

Disaster relief disbursals in India typically face a **6 to 14-week bureaucratic latency**. Between field damage surveys, inter-departmental paper files, manual treasury allocations, and contractor reconciliations, vulnerable populations remain without critical resources during the acute 72-hour survival window. Post-event audits by the Comptroller and Auditor General (CAG) frequently reveal leakages, ghost beneficiaries, and unverified contractor invoices years after the water recedes.

**FlashRelief changes this paradigm** by operating in **anticipation** rather than reaction:
1. **Satellite Radar & Gauge Forecasting (T-72h to T-11h):** Detects flood surges using Sentinel-1 Synthetic Aperture Radar (SAR), NASA GPM IMERG rainfall, and GloFAS river discharge models.
2. **Deterministic SDRF Legal Formulations:** Binds predicted inundation extent and population density to statutory Ministry of Home Affairs (MHA) State Disaster Response Fund formulas with zero manual discretion.
3. **3-of-3 Multi-Sig Officer Consensus:** Cryptographically binds approval from the State Relief Commissioner (IAS), NDMA Hydro Specialist, and Finance Advisor (IDAS).
4. **Smart Escrow Drawdowns on Polygon:** Defines transparent departmental escrow vaults that can release funds against delivery proof. The current application models this flow; live Polygon writes are the next integration step.
5. **Decentralized Field Evidence:** Verifies delivery receipts through client-side Web Crypto SHA-256 fingerprinting, with IPFS and on-chain anchoring planned for the production integration.
6. **Statutory 48-Hour Citizen SLA:** Every ground grievance carries a 48-hour countdown in the application. Production deployment still needs scheduled execution and live on-chain escalation.

---

## 🏛 6-Stage Workflow Pipeline

```mermaid
graph LR
    S1["Stage 01<br/><b>DETECT</b><br/>Satellite SAR & CWC Gauges"] -->|Lead Time: 11h| S2["Stage 02<br/><b>ESTIMATE</b><br/>Deterministic SDRF Norms"]
    S2 -->|Itemized ₹ Draft| S3["Stage 03<br/><b>REVIEW</b><br/>3-of-3 Officer Quorum & HIL"]
    S3 -->|Cryptographic Multi-Sig| S4["Stage 04<br/><b>RELEASE</b><br/>Polygon PoS Escrow Vaults"]
    S4 -->|Milestone Drawdowns| S5["Stage 05<br/><b>DELIVER</b><br/>SHA-256 + IPFS Field Proofs"]
    S5 -->|Beneficiary Receipts| S6["Stage 06<br/><b>REPORT</b><br/>48h SLA Citizen Redressal"]
```

| Stage | Path | Function | Core Technical Grounding |
| :--- | :--- | :--- | :--- |
| **01 Detect** | [`/detect`](file:///Users/utsavsingh/code/flashrelief/app/detect/page.tsx) | Basin radar & predictive lead-time alert | NASA GPM IMERG Early Run + GloFAS 5km + CWC Gauge telemetry |
| **02 Estimate** | [`/estimate`](file:///Users/utsavsingh/code/flashrelief/app/estimate/page.tsx) | Inundation depth scan & SDRF norm pricing | MHA Order No. 33-04/2020 legal norms with P10/P50/P90 uncertainty |
| **03 Review** | [`/review`](file:///Users/utsavsingh/code/flashrelief/app/review/page.tsx) | 3-of-3 Officer Quorum & LangGraph HIL revision | Dual-layer cryptographic Schnorr/ECDSA signatures + natural language diffs |
| **04 Release** | [`/release`](file:///Users/utsavsingh/code/flashrelief/app/release/page.tsx) | Smart escrow vaults & gasless meta-transactions | ERC-2771 forwarder + department treasury sub-vault contracts on Polygon |
| **05 Deliver** | [`/deliver`](file:///Users/utsavsingh/code/flashrelief/app/deliver/page.tsx) | Ground delivery evidence & IPFS CID registry | In-browser Web Crypto API SHA-256 file hashing + GPS coordinates |
| **06 Report** | [`/report`](file:///Users/utsavsingh/code/flashrelief/app/report/page.tsx) | Citizen redressal feed & 48-Hour SLA engine | Automated cron escalator promoting overdue complaints to District Magistrate |

---

## 📐 System Architecture

```text
flashrelief/
├── app/
│   ├── api/
│   │   ├── blockchain/relay/       # Gasless meta-transaction ERC-2771 relayer
│   │   ├── cron/grievance-sla/     # Statutory 48-Hour SLA auto-escalator cron
│   │   ├── delivery/proof/         # IPFS CID & Web Crypto SHA-256 proof registrar
│   │   ├── detect/telemetry/       # Live CWC river gauge feed (Dibrugarh, Majuli)
│   │   ├── estimate/               # Deterministic SDRF formula generator
│   │   ├── events/[id]/            # Unified disaster event dossier API
│   │   ├── grievances/             # Public citizen complaints & status feed
│   │   ├── grievances/[id]/resolve/# Executive Magistrate resolution endpoint
│   │   ├── health/                 # Database latency & pgvector vector store check
│   │   ├── review/                 # 3-of-3 multi-sig quorum execution API
│   │   ├── review/revision/        # LangGraph HIL natural language parameter parser
│   │   └── vector-search/          # MHA SDRF legal guidelines semantic search
│   ├── dashboard/                  # Operations console for District Magistrates
│   ├── deliver/                    # Stage 05 field delivery evidence portal
│   ├── detect/                     # Stage 01 satellite radar & gauge telemetry
│   ├── estimate/                   # Stage 02 hydrodynamic depth allocation
│   ├── events/[id]/                # Single event multi-stage dossier explorer
│   ├── ledger/                     # 5-Page Polygon Public Notebook
│   ├── release/                    # Stage 04 smart escrow vault release
│   ├── report/                     # Stage 06 citizen grievance & SLA watch
│   ├── review/                     # Stage 03 3-of-3 officer quorum console
│   ├── globals.css                 # Structured Obsidian Void design tokens
│   ├── layout.tsx                  # Root layout with Clerk Auth & Font definitions
│   └── page.tsx                    # Interactive landing page with 3D digital twin
├── components/
│   ├── 3d/                         # Three.js digital twin terrain & river flows
│   ├── deliver/                    # Drag & drop Web Crypto file hasher & dropzone
│   ├── hero/                       # Seamless transparent WebGL Relief Orb canvas
│   ├── layout/                     # Brand header, navbar, and flash mark
│   ├── ledger/                     # Public notebook tab switcher & JSON exporter
│   ├── protocol/                   # 4 core civic architecture cards & workflow deck
│   └── review/                     # Human-in-the-Loop committee feedback console
├── contracts/
│   ├── DetectionRegistry.sol        # Page 1: alert and telemetry notarization
│   ├── BudgetQuorum.sol             # Page 2: 3-of-3 officer budget quorum
│   ├── FundEscrowLedger.sol         # Page 3: departmental allocation ledger
│   ├── DeliveryEvidence.sol         # Page 4: delivery proof registry
│   └── GrievanceSLA.sol             # Page 5: citizen SLA clock
├── lib/
│   ├── blockchain/                 # Viem clients, wallet utilities & notebook logic
│   ├── db/
│   │   ├── event-service.ts        # Central DB query & stage lifecycle coordinator
│   │   ├── prisma.ts               # Neon serverless pool & Prisma Client
│   │   └── seed.ts                 # Database seeder with MHA norms & Brahmaputra event
│   ├── sdrf-norms.ts               # Ministry of Home Affairs legal unit rates & formulas
│   └── utils.ts                    # Utility classes, formatting, and BigInt serializers
└── prisma/
    └── schema.prisma               # PostgreSQL schema with pgvector & 7 domain models
```

---

## ⚖️ Statutory SDRF Grounding

Unlike generic relief software, **FlashRelief does not allow discretionary budget generation**. Every calculation strictly adheres to the legal norms prescribed by the Ministry of Home Affairs (MHA), Government of India:

- **Norm 1(a) — Gratuitous Camp Relief:** Cooked food, drinking water, and milk allowance at ₹80/day per adult and ₹60/day per child for up to 30 days.
- **Norm 1(b) — Non-Camp Subsistence:** Cash allowance for families whose houses have been inundated but remain in informal high-ground clusters.
- **Norm 2 — Temporary Camp Shelters:** Reinforced HDPE tarpaulins, bamboo ballies, and GI sheets calculated per displaced family unit.
- **Norm 4(a) — Animal Husbandry & Cattle Preservation:** Fodder supply for large animals (₹70/day) and small animals (₹35/day) in riverine flood plains.
- **Norm 5(a) — Public Health & Water Purification:** Halogen water purification tablets, mobile boat dispensaries, and bleaching powder units per flood-affected village.
- **Norm 6(b) — De-silting of Agricultural Land:** Statutory subsidy for removing heavy sand siltation (>3 inches) on small and marginal farmer holdings.

---

## 🔒 Polygon PoS Smart Escrows

FlashRelief operates a zero-custody, decentralized treasury architecture deployed on **Polygon PoS** (or Polygon Amoy Testnet):

1. **`BudgetQuorum.sol`**:
   - Enforces strict 3-of-3 multi-signature consensus before any relief funds can transition from `ESTIMATED` to `RELEASED`.
   - Authorized signers represent the three constitutional pillars:
     - **Relief Commissioner** (Executive Administration / IAS)
     - **NDMA Hydrology Officer** (Scientific Validation)
     - **Financial Advisor** (Audit & Treasury / IDAS)

2. **`FundEscrowLedger.sol`**:
   - Separate, segregated sub-vaults for each state department:
     - `revenue_dm`: Gratuitous relief, ex-gratia, camp shelters.
     - `pwd_bridges`: Road breaches, temporary bailey bridges, culverts.
     - `health_fws`: Water purification kits, epidemic prevention.
     - `food_cs`: Dry rations, mobile kitchen supplies, infant nourishment.
   - Milestone drawdowns are triggered strictly upon valid `DeliveryEvidence` registration.

3. **Relayer integration (planned)**:
   - The application exposes a relayer route and models gasless receipts, but the current route does not yet submit an EIP-712/ERC-2771 transaction to Polygon. Government officers and field workers will receive gas sponsorship after the live relayer is implemented.

---

## 🛰 Predictive Flood Detection Engine

FlashRelief synthesizes three satellite and hydrodynamic data feeds:

```text
┌─────────────────────────┐     ┌─────────────────────────┐     ┌─────────────────────────┐
│     NASA GPM IMERG      │     │      GloFAS 5km         │     │     Sentinel-1 SAR      │
│   Early Run Rainfall    │     │ River Discharge Forecast│     │   Inundation Extent     │
│  Latency: ~4 hours      │     │  30-Day Ensemble Spread │     │ All-Weather C-Band Radar│
└────────────┬────────────┘     └────────────┬────────────┘     └────────────┬────────────┘
             │                               │                               │
             └───────────────────────┬───────┴───────────────────────────────┘
                                     ▼
                    ┌─────────────────────────────────┐
                    │  FlashRelief Hydrodynamic Model │
                    │   Gaussian Topographic Lathe    │
                    │      11-Hour Advance Surge      │
                    └─────────────────────────────────┘
```

1. **NASA GPM IMERG Early Run**: Multi-satellite precipitation radar at 0.1° (~10 km) resolution with 4-hour latency, detecting upstream cloudbursts.
2. **Copernicus GloFAS via Open-Meteo**: 5km river discharge forecast providing 30-day ensemble trends to anticipate river basin crest peaks.
3. **Sentinel-1 SAR Synthetic Aperture Radar**: Cloud-penetrating microwave radar mapping the exact geographic water boundary against the digital elevation model (DEM).

---

## 📋 Comptroller and Auditor General (CAG) Audit Model

To reduce post-disaster audit queries, FlashRelief models a statutory audit pack aligned with **Article 151 of the Constitution of India**. A dedicated `/audit` route is not yet implemented:

- **Cryptographic Event Hash**: Master SHA-256 fingerprint encompassing telemetry, quorum signatures, budget line items, and delivery receipts.
- **The "Third Number" Rule**: For every delivery line item, the system verifies that `Allocated Units = Delivered Units = Citizen Receipt CIDs`. Zero ghost disbursals.
- **Machine-Readable Export (planned)**: The complete audit ledger is intended to be exportable as a single verifiable JSON dossier for statutory legislative committee inspection.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v20.x or higher)
- pnpm or npm
- Neon PostgreSQL database (with `pgvector` extension)

### 1. Clone & Install
```bash
git clone https://github.com/Tushar-Bajpai/flash-relief.git
cd flashrelief
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the project root:
```env
# Neon PostgreSQL Database Connection
DATABASE_URL="postgresql://user:password@ep-sample-1234.us-east-2.aws.neon.tech/flashrelief?sslmode=require"
DIRECT_URL="postgresql://user:password@ep-sample-1234.us-east-2.aws.neon.tech/flashrelief?sslmode=require"

# Clerk Authentication (Optional for demo mode; required for officer auth)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# OpenAI API Key (For LangChain vector embeddings & MHA norm semantic search)
OPENAI_API_KEY="sk-..."

# Polygon Amoy Testnet (Required for live relayer transactions)
POLYGON_AMOY_RPC_URL="https://rpc-amoy.polygon.technology/"
BLOCKCHAIN_RELAYER_SECRET="generate-a-long-random-server-secret"
POLYGON_RELAYER_PRIVATE_KEY="0x..."
POLYGON_DETECTION_REGISTRY_ADDRESS="0x..."
POLYGON_BUDGET_QUORUM_ADDRESS="0x..."
POLYGON_ESCROW_LEDGER_ADDRESS="0x..."
POLYGON_DELIVERY_EVIDENCE_ADDRESS="0x..."
POLYGON_GRIEVANCE_SLA_ADDRESS="0x..."
PINATA_JWT="pinata-jwt-server-secret"
PINATA_NETWORK="public"
```

The relayer route returns an error rather than a synthetic transaction when these
Polygon variables are missing. Keep the relayer private key server-side and use
separate wallets and contract deployments for staging and production.
The delivery upload route requires `PINATA_JWT`; it does not generate synthetic
CIDs when IPFS is unavailable.
Delivery proof registration now requires a live Polygon relayer, a configured
database, and an explicit delivered amount in paise. The transaction hash and
confirmed block number are stored with the evidence record.

### 3. Setup Database Schema & Seed Data
```bash
# Generate Prisma Client
npm run db:generate

# Push schema directly to Neon DB
npm run db:push

# Seed statutory MHA norms, Brahmaputra event, and gauge telemetry
npm run db:seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:8000](http://localhost:8000)** in your browser.

---

## 🧪 Verification & Testing

Verify system health and database latency:
```bash
# Check full system health and pgvector connectivity
curl -s http://localhost:8000/api/health | jq .

# Trigger the 48-Hour Grievance SLA auto-escalator cron
curl -s -X POST http://localhost:8000/api/cron/grievance-sla | jq .

# Run static TypeScript compilation checks
npx tsc --noEmit

# Run Next.js production build verification
npm run build
```

---

## 🎨 Design System: The Obsidian Void

FlashRelief is designed to present serious civic emergency data with dignity, restraint, and extreme visual clarity:

- **`--paper` (`#07171d`)**: Obsidian void primary background.
- **`--ink` (`#eaf5f4`)**: High-contrast mint-white typography.
- **`--blue` (`#00e5ff`)**: Cyber cyan wireframe, telemetry data glow, and live water plane.
- **`--coral` (`#ff785f`)**: Brand signal bars, urgency highlights, and primary actions.
- **`--green` (`#10b981`)**: Verified cryptographic proof, active sensors, and ledger signals.
- **`--yellow` (`#f4c969`)**: Officer authorizations and 48-hour SLA status tags.
- **`--line` (`rgba(234, 245, 244, 0.2)`)**: Hairline civic dividers.

---

## 📄 License

This project is licensed under the **Apache-2.0 License**. See [LICENSE](LICENSE) for details.

Developed for rapid, accountable disaster relief in flood-prone river basins across India.
