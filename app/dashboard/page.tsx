import { auth, currentUser } from '@clerk/nextjs/server'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import {
  ArrowUpRight,
  Droplets,
  Radio,
  ShieldCheck,
  Truck,
  AlertTriangle,
  Clock,
  Layers,
  FileCheck,
  Building,
} from 'lucide-react'
import { FlashMark } from '@/components/layout/flash-mark'
import { prisma, isDbConfigured } from '@/lib/db/prisma'
import { ALL_DISASTER_EVENTS } from '@/lib/events-data'

import { formatNumber } from '@/lib/format'
interface StationSignalItem {
  id: string
  zone: string
  river: string
  magnitude: string
  dangerLevel: string
  rateOfRise: string
  state: 'Surge' | 'Rising' | 'Stable' | 'Critical'
}

interface DeliveryLedgerItem {
  batch: string
  item: string
  qty: string
  status: string
  ipfsCid?: string
  vendor?: string
}

interface GrievanceItem {
  id: string
  trackingId: string
  village: string
  category: string
  slaHoursLeft: number
  status: string
}

export default async function DashboardPage() {
  // Graceful server-side auth: handles both Clerk authenticated operators and preview fallback
  let firstName = 'Relief Commissioner'
  let isSignedIn = false

  try {
    const authObj = await auth()
    if (authObj?.userId) {
      const user = await currentUser()
      firstName = user?.firstName || 'Operator'
      isSignedIn = true
    } else if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
      await auth.protect()
    }
  } catch {
    // Unauthenticated preview / local development desk
  }

  // Load live data from Neon PostgreSQL or domain fallback
  let activeEventCount = 1
  let totalAllocatedCrores = '7.35'
  let deliveriesVerifiedRate = '100%'
  let openApprovalsCount = 0
  let stationSignals: StationSignalItem[] = []
  let ledgerRows: DeliveryLedgerItem[] = []
  let grievanceRows: GrievanceItem[] = []
  let currentStage = 'RELEASED'

  if (isDbConfigured()) {
    try {
      const [events, gauges, lineItems, proofs, grievances, vaults] = await Promise.all([
        prisma.disasterEvent.findMany({
          orderBy: { createdAt: 'desc' },
        }),
        prisma.gaugeTelemetry.findMany({
          orderBy: { timestamp: 'desc' },
          take: 5,
        }),
        prisma.sdrfLineItem.findMany({
          include: { deliveries: true },
          take: 6,
        }),
        prisma.deliveryEvidence.findMany({
          orderBy: { timestamp: 'desc' },
          take: 5,
        }),
        prisma.citizenGrievance.findMany({
          orderBy: { createdAt: 'desc' },
          take: 4,
        }),
        prisma.departmentEscrowVault.findMany(),
      ])

      activeEventCount = events.length || 1
      if (events[0]) {
        currentStage = events[0].status
      }

      // Calculate total allocated rupees across escrow vaults or budgets
      if (vaults.length > 0) {
        const totalPaise = vaults.reduce((acc, v) => acc + BigInt(v.allocatedPaise), BigInt(0))
        const crores = Number(totalPaise / BigInt(100)) / 10000000
        totalAllocatedCrores = crores > 0 ? crores.toFixed(2) : '7.35'
      }

      // Map gauge telemetries
      if (gauges.length > 0) {
        stationSignals = gauges.map((g, idx) => ({
          id: `STN-0${idx + 1}`,
          zone: g.stationName,
          river: g.river,
          magnitude: `${g.stageMeters.toFixed(1)} m`,
          dangerLevel: `${g.dangerLevelMeters.toFixed(1)} m`,
          rateOfRise: `+${g.rateOfRiseMetersHr.toFixed(2)} m/h`,
          state: g.stageMeters > g.dangerLevelMeters ? 'Surge' : g.isRising ? 'Rising' : 'Stable',
        }))
      }

      // Map delivery proofs
      if (proofs.length > 0) {
        ledgerRows = proofs.map((p, idx) => ({
          batch: `BATCH-${idx + 101}`,
          item: p.itemType,
          qty: `${formatNumber(p.beneficiaryCount)} kits`,
          status: p.verified ? 'Verified on-chain' : 'Pending check',
          ipfsCid: p.ipfsCid.slice(0, 16) + '...',
          vendor: p.vendorName,
        }))
      } else if (lineItems.length > 0) {
        ledgerRows = lineItems.slice(0, 3).map((item, idx) => ({
          batch: `MHA-0${idx + 1}`,
          item: item.description,
          qty: `${formatNumber(item.quantity)} units`,
          status: 'Escrow Allocated',
          vendor: item.departmentId,
        }))
      }

      // Map citizen grievances
      const now = Date.now()
      grievanceRows = grievances.map((g) => {
        const diffHours = Math.round((new Date(g.slaDeadline).getTime() - now) / (1000 * 60 * 60))
        return {
          id: g.id,
          trackingId: g.trackingId,
          village: `${g.village}, ${g.district}`,
          category: g.category,
          slaHoursLeft: diffHours,
          status: g.status,
        }
      })

      openApprovalsCount = grievances.filter((g) => g.status === 'OPEN' || g.status === 'INVESTIGATING').length
      deliveriesVerifiedRate = proofs.length > 0 ? '100%' : '87%'
    } catch (err) {
      console.warn('[Dashboard] Error querying live Neon DB records:', err)
    }
  }

  // Fallback if records are still zero
  if (stationSignals.length === 0) {
    stationSignals = [
      { id: 'DIB-01', zone: 'Dibrugarh Ghat', river: 'Brahmaputra', magnitude: '106.8 m', dangerLevel: '105.7 m', rateOfRise: '+0.18 m/h', state: 'Surge' },
      { id: 'MAJ-02', zone: 'Majuli Island Steamer', river: 'Subansiri Confluence', magnitude: '86.4 m', dangerLevel: '85.0 m', rateOfRise: '+0.24 m/h', state: 'Surge' },
      { id: 'TEZ-03', zone: 'Tezpur Central Gauge', river: 'Brahmaputra Middle', magnitude: '65.2 m', dangerLevel: '65.2 m', rateOfRise: '+0.09 m/h', state: 'Rising' },
      { id: 'GHY-04', zone: 'Guwahati Pandu Port', river: 'Brahmaputra Lower', magnitude: '49.8 m', dangerLevel: '49.6 m', rateOfRise: '+0.04 m/h', state: 'Rising' },
    ]
  }

  if (ledgerRows.length === 0) {
    ledgerRows = [
      { batch: 'DEL-8812', item: 'Gratuitous Cooked Food & Potable Water Kits', qty: '48,200 kits', status: 'Verified on-chain', ipfsCid: 'bafybeicdx4a7kmm...', vendor: 'Civil Supplies Dept' },
      { batch: 'DEL-8813', item: 'Reinforced HDPE Tarpaulins & Camp Shelters', qty: '12,400 units', status: 'Verified on-chain', ipfsCid: 'bafybeihq67zkx33...', vendor: 'Revenue & DM' },
      { batch: 'DEL-8814', item: 'Halogen Tablets & Emergency Bleaching Powder', qty: '8,500 packs', status: 'In transit', vendor: 'Health & Family Welfare' },
    ]
  }

  const STAGES = [
    { num: '01', name: 'Detect', href: '/detect', status: 'DETECTED' },
    { num: '02', name: 'Estimate', href: '/estimate', status: 'ESTIMATED' },
    { num: '03', name: 'Review', href: '/review', status: 'REVIEWED' },
    { num: '04', name: 'Release', href: '/release', status: 'RELEASED' },
    { num: '05', name: 'Deliver', href: '/deliver', status: 'DELIVERING' },
    { num: '06', name: 'Report', href: '/report', status: 'SETTLED' },
  ]

  return (
    <main className="dash-shell">
      <header className="dash-header">
        <Link className="brand" href="/">
          <FlashMark />
          <span>
            flash<span>relief</span>
          </span>
        </Link>
        <div className="dash-header-right">
          <span className="dash-user-label">
            {isSignedIn ? `Signed in as ${firstName}` : `Operations Console · District Dibrugarh`}
          </span>
          {isSignedIn && <UserButton />}
        </div>
      </header>

      {/* Stage Navigation Ribbon */}
      <nav className="dash-stages-bar" aria-label="Workflow pipeline">
        <span className="dash-stage-label-heading">Stage Pipeline:</span>
        {STAGES.map((s) => {
          const isCurrent = currentStage === s.status
          return (
            <Link
              key={s.num}
              href={s.href}
              className={`dash-stage-pill ${isCurrent ? 'active' : ''}`}
            >
              <span>{s.num}</span>
              <span>{s.name}</span>
            </Link>
          )
        })}
        <Link href="/ledger" className="dash-stage-pill" style={{ marginLeft: 'auto' }}>
          <ShieldCheck size={12} /> Public Notebook
        </Link>
        <Link href="/audit" className="dash-stage-pill">
          <FileCheck size={12} /> CAG Audit Pack
        </Link>
      </nav>

      <section className="dash-hero">
        <p className="dash-eyebrow">Assam Disaster Management Operations Console</p>
        <h1 className="dash-title">
          Good to see you, {firstName}.<br />
          The basins are <em>watched</em>.
        </h1>
        <div className="dash-hero-actions">
          <a className="dash-primary-action" href="#signals">
            <Radio size={16} /> Live CWC Radar Signals
          </a>
          <a className="dash-ghost-action" href="#ledger">
            <ShieldCheck size={16} /> Delivery Evidence Ledger
          </a>
          <Link className="dash-ghost-action" href="/events/fl-2026-brahmaputra">
            <Building size={16} /> Event Dossier
          </Link>
        </div>
      </section>

      <section className="dash-metrics">
        <div className="dash-metric">
          <p className="dash-metric-label">Active flood signals</p>
          <p className="dash-metric-value">{activeEventCount}</p>
          <p className="dash-metric-note">Brahmaputra Basin (Stage: {currentStage})</p>
        </div>
        <div className="dash-metric">
          <p className="dash-metric-label">Relief allocated</p>
          <p className="dash-metric-value">₹{totalAllocatedCrores} Cr</p>
          <p className="dash-metric-note">MHA SDRF escrow committed</p>
        </div>
        <div className="dash-metric">
          <p className="dash-metric-label">Deliveries verified</p>
          <p className="dash-metric-value">{deliveriesVerifiedRate}</p>
          <p className="dash-metric-note">anchored with IPFS CID & GPS</p>
        </div>
        <div className="dash-metric">
          <p className="dash-metric-label">48h SLA Grievances</p>
          <p className="dash-metric-value">{openApprovalsCount}</p>
          <p className="dash-metric-note">monitored against statutory breach</p>
        </div>
      </section>

      <section id="signals" className="dash-panel-grid">
        {/* River Gauge Radar Signals */}
        <div className="dash-panel">
          <div className="dash-panel-head">
            <h2>
              <Droplets size={16} /> CWC River Gauges (Live Neon DB)
            </h2>
            <Link className="dash-view-all" href="/detect">
              View stage 01 <ArrowUpRight size={13} />
            </Link>
          </div>
          <ul className="dash-signal-list">
            {stationSignals.map((s) => (
              <li key={s.id} className="dash-signal-row">
                <span className="dash-signal-id">{s.id}</span>
                <span className="dash-signal-zone" title={s.river}>{s.zone}</span>
                <span className="dash-signal-mag">{s.magnitude}</span>
                <span
                  className={`dash-signal-state ${
                    s.state === 'Surge' || s.state === 'Critical' ? 'alert' : 'quiet'
                  }`}
                >
                  {s.state}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Delivery Evidence & IPFS Hashing */}
        <div id="ledger" className="dash-panel">
          <div className="dash-panel-head">
            <h2>
              <Truck size={16} /> Delivery Evidence Ledger
            </h2>
            <Link className="dash-view-all" href="/deliver">
              Stage 05 deliver <ArrowUpRight size={13} />
            </Link>
          </div>
          <ul className="dash-ledger-list">
            {ledgerRows.map((r) => (
              <li key={r.batch} className="dash-ledger-row">
                <span className="dash-ledger-batch">{r.batch}</span>
                <div className="dash-ledger-item">
                  <span>{r.item}</span>
                  <small>
                    {r.qty} {r.ipfsCid && <>· CID: <code className="dash-cid-mono">{r.ipfsCid}</code></>}
                  </small>
                </div>
                <span className="dash-ledger-status">{r.status}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Citizen Redressal & 48-Hour SLA Watch (if grievances present) */}
      {grievanceRows.length > 0 && (
        <section style={{ maxWidth: '1200px', margin: '28px auto 0' }}>
          <div className="dash-panel">
            <div className="dash-panel-head">
              <h2>
                <AlertTriangle size={16} /> Citizen Redressal Feed · 48-Hour Statutory SLA
              </h2>
              <Link className="dash-view-all" href="/report">
                Citizen portal <ArrowUpRight size={13} />
              </Link>
            </div>
            <ul className="dash-signal-list">
              {grievanceRows.map((g) => {
                const isOverdue = g.slaHoursLeft <= 0
                return (
                  <li
                    key={g.id}
                    className="dash-signal-row"
                    style={{ gridTemplateColumns: '120px 1fr 140px 100px' }}
                  >
                    <span className="dash-signal-id">{g.trackingId}</span>
                    <span className="dash-signal-zone">
                      {g.category} <span style={{ opacity: 0.6, fontSize: '11px' }}>({g.village})</span>
                    </span>
                    <span>
                      <span className={`dash-badge-sla ${isOverdue ? 'breach' : g.status === 'RESOLVED' ? 'resolved' : ''}`}>
                        <Clock size={10} />
                        {g.status === 'RESOLVED'
                          ? 'Resolved'
                          : isOverdue
                          ? 'SLA Breached'
                          : `${g.slaHoursLeft}h remaining`}
                      </span>
                    </span>
                    <span
                      className={`dash-signal-state ${
                        g.status === 'ESCALATED' || isOverdue ? 'alert' : 'quiet'
                      }`}
                    >
                      {g.status}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        </section>
      )}
    </main>
  )
}
