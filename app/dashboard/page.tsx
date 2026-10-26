import { auth, currentUser } from '@clerk/nextjs/server'
import { UserButton } from '@clerk/nextjs'
import {
  ArrowUpRight,
  Droplets,
  Radio,
  ShieldCheck,
  Truck,
} from 'lucide-react'
import { FlashMark } from '@/components/layout/flash-mark'

const stationSignals = [
  { id: 'KSR-04', zone: 'Koshi Basin', magnitude: '8.4 m', state: 'Rising' },
  { id: 'GNG-11', zone: 'Ganga Plains', magnitude: '6.1 m', state: 'Surge' },
  { id: 'BHM-02', zone: 'Brahmaputra Belt', magnitude: '4.7 m', state: 'Stable' },
]

const ledgerRows = [
  { batch: 'B-2291', item: 'Water purification kits', qty: '2,400', status: 'Delivered' },
  { batch: 'B-2290', item: 'Dry ration packs', qty: '5,120', status: 'In transit' },
  { batch: 'B-2289', item: 'Emergency tarps', qty: '1,800', status: 'Awaiting officer release' },
]

export default async function DashboardPage() {
  // Server-side protection: unauthenticated requests are bounced to /sign-in
  await auth.protect()

  const user = await currentUser()
  const firstName = user?.firstName || 'Operator'

  return (
    <main className="dash-shell">
      <header className="dash-header">
        <a className="brand" href="/">
          <FlashMark />
          <span>
            flash<span>relief</span>
          </span>
        </a>
        <div className="dash-header-right">
          <span className="dash-user-label">Signed in as {firstName}</span>
          <UserButton />
        </div>
      </header>

      <section className="dash-hero">
        <p className="dash-eyebrow">Operations console</p>
        <h1 className="dash-title">
          Good to see you, {firstName}.<br />
          The basins are <em>watched</em>.
        </h1>
        <div className="dash-hero-actions">
          <a className="dash-primary-action" href="#signals">
            <Radio size={16} /> Live signals
          </a>
          <a className="dash-ghost-action" href="#ledger">
            <ShieldCheck size={16} /> Delivery ledger
          </a>
        </div>
      </section>

      <section className="dash-metrics">
        <div className="dash-metric">
          <p className="dash-metric-label">Active flood signals</p>
          <p className="dash-metric-value">12</p>
          <p className="dash-metric-note">3 escalated in the last hour</p>
        </div>
        <div className="dash-metric">
          <p className="dash-metric-label">Relief allocated</p>
          <p className="dash-metric-value">9,320</p>
          <p className="dash-metric-note">units released this week</p>
        </div>
        <div className="dash-metric">
          <p className="dash-metric-label">Deliveries verified</p>
          <p className="dash-metric-value">87%</p>
          <p className="dash-metric-note">confirmed against ground reports</p>
        </div>
        <div className="dash-metric">
          <p className="dash-metric-label">Open officer approvals</p>
          <p className="dash-metric-value">4</p>
          <p className="dash-metric-note">awaiting human authorization</p>
        </div>
      </section>

      <section id="signals" className="dash-panel-grid">
        <div className="dash-panel">
          <div className="dash-panel-head">
            <h2>
              <Droplets size={16} /> Station signals
            </h2>
            <a className="dash-view-all" href="#">
              View all <ArrowUpRight size={13} />
            </a>
          </div>
          <ul className="dash-signal-list">
            {stationSignals.map((s) => (
              <li key={s.id} className="dash-signal-row">
                <span className="dash-signal-id">{s.id}</span>
                <span className="dash-signal-zone">{s.zone}</span>
                <span className="dash-signal-mag">{s.magnitude}</span>
                <span className={`dash-signal-state ${s.state === 'Stable' ? 'quiet' : 'alert'}`}>
                  {s.state}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div id="ledger" className="dash-panel">
          <div className="dash-panel-head">
            <h2>
              <Truck size={16} /> Delivery ledger
            </h2>
            <a className="dash-view-all" href="#">
              Full ledger <ArrowUpRight size={13} />
            </a>
          </div>
          <ul className="dash-ledger-list">
            {ledgerRows.map((r) => (
              <li key={r.batch} className="dash-ledger-row">
                <span className="dash-ledger-batch">{r.batch}</span>
                <div className="dash-ledger-item">
                  <span>{r.item}</span>
                  <small>{r.qty} units</small>
                </div>
                <span className="dash-ledger-status">{r.status}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  )
}
